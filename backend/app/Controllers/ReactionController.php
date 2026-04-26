<?php
// ── Reactions Controller ─────────────────────────────────────────
class ReactionController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function react(int $postId): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $emoji = $data['emoji'] ?? '❤️';
        $allowed = ['❤️','😂','😮','😢','😡','👍'];
        if (!in_array($emoji, $allowed)) error('Invalid emoji');

        // Check existing reaction
        $stmt = $this->db->prepare("SELECT emoji FROM post_reactions WHERE post_id=? AND user_id=?");
        $stmt->execute([$postId, $auth['user_id']]);
        $existing = $stmt->fetch();

        if ($existing) {
            if ($existing['emoji'] === $emoji) {
                // Remove reaction (toggle off)
                $this->db->prepare("DELETE FROM post_reactions WHERE post_id=? AND user_id=?")->execute([$postId, $auth['user_id']]);
                $this->db->prepare("UPDATE posts SET likes=GREATEST(0,likes-1) WHERE id=?")->execute([$postId]);
                success(['reacted' => false, 'emoji' => null], 'Reaction removed');
            } else {
                // Change reaction
                $this->db->prepare("UPDATE post_reactions SET emoji=? WHERE post_id=? AND user_id=?")->execute([$emoji, $postId, $auth['user_id']]);
                success(['reacted' => true, 'emoji' => $emoji], 'Reaction changed');
            }
        } else {
            // New reaction
            $this->db->prepare("INSERT INTO post_reactions (post_id,user_id,emoji) VALUES (?,?,?)")->execute([$postId, $auth['user_id'], $emoji]);
            $this->db->prepare("UPDATE posts SET likes=likes+1 WHERE id=?")->execute([$postId]);

            // Notify post owner
            $stmt = $this->db->prepare("SELECT user_id FROM posts WHERE id=?");
            $stmt->execute([$postId]);
            $ownerId = $stmt->fetchColumn();
            if ($ownerId && $ownerId != $auth['user_id']) {
                (new NotificationModel())->create($ownerId, 'reaction', ['from_user' => $auth['user_id'], 'post_id' => $postId, 'emoji' => $emoji]);
            }
            success(['reacted' => true, 'emoji' => $emoji], 'Reacted');
        }
    }

    public function forPost(int $postId): void {
        $stmt = $this->db->prepare("
            SELECT emoji, COUNT(*) as count
            FROM post_reactions WHERE post_id=?
            GROUP BY emoji ORDER BY count DESC
        ");
        $stmt->execute([$postId]);
        $auth = getAuthUser();
        $myEmoji = null;
        if ($auth) {
            $s2 = $this->db->prepare("SELECT emoji FROM post_reactions WHERE post_id=? AND user_id=?");
            $s2->execute([$postId, $auth['user_id']]);
            $myEmoji = $s2->fetchColumn() ?: null;
        }
        success(['reactions' => $stmt->fetchAll(), 'my_emoji' => $myEmoji]);
    }
}

// ── Repost Controller ────────────────────────────────────────────
class RepostController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function repost(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['post_id'])) error('post_id required');

        // Check already reposted
        $stmt = $this->db->prepare("SELECT id FROM reposts WHERE user_id=? AND post_id=? AND quote IS NULL");
        $stmt->execute([$auth['user_id'], $data['post_id']]);
        if ($stmt->fetch()) {
            $this->db->prepare("DELETE FROM reposts WHERE user_id=? AND post_id=? AND quote IS NULL")->execute([$auth['user_id'], $data['post_id']]);
            success(['reposted' => false], 'Repost removed');
            return;
        }

        $this->db->prepare("INSERT INTO reposts (user_id,post_id) VALUES (?,?)")->execute([$auth['user_id'], $data['post_id']]);
        (new ActivityLogModel())->log($auth['user_id'], 'reposted', "Post #{$data['post_id']}");
        success(['reposted' => true], 'Reposted');
    }

    public function quotePost(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['post_id']) || empty($data['quote'])) error('post_id and quote required');

        $this->db->prepare("INSERT INTO reposts (user_id,post_id,quote) VALUES (?,?,?)")->execute([$auth['user_id'], $data['post_id'], $data['quote']]);
        success([], 'Quote posted');
    }
}

// ── Groups Controller ────────────────────────────────────────────
class GroupController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function index(): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("
            SELECT g.*, u.name as owner_name,
                   (SELECT 1 FROM group_members gm WHERE gm.group_id=g.id AND gm.user_id=?) as is_member
            FROM groups_table g
            JOIN users u ON u.id=g.owner_id
            ORDER BY g.member_count DESC LIMIT 30
        ");
        $stmt->execute([$auth['user_id']]);
        success($stmt->fetchAll());
    }

    public function create(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['name'])) error('name required');

        $this->db->prepare("INSERT INTO groups_table (owner_id,name,description,is_private) VALUES (?,?,?,?)")
            ->execute([$auth['user_id'], $data['name'], $data['description'] ?? null, $data['is_private'] ?? 0]);
        $gid = (int)$this->db->lastInsertId();
        $this->db->prepare("INSERT INTO group_members (group_id,user_id,role) VALUES (?,?,'owner')")->execute([$gid, $auth['user_id']]);
        success(['id' => $gid], 'Group created');
    }

    public function show(int $id): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("SELECT g.*,u.name as owner_name,u.username as owner_username FROM groups_table g JOIN users u ON u.id=g.owner_id WHERE g.id=?");
        $stmt->execute([$id]);
        $group = $stmt->fetch();
        if (!$group) error('Group not found', 404);

        $members = $this->db->prepare("SELECT u.id,u.name,u.username,u.avatar,gm.role FROM group_members gm JOIN users u ON u.id=gm.user_id WHERE gm.group_id=? LIMIT 20");
        $members->execute([$id]);
        $group['members'] = $members->fetchAll();

        $stmt2 = $this->db->prepare("SELECT 1 FROM group_members WHERE group_id=? AND user_id=?");
        $stmt2->execute([$id, $auth['user_id']]);
        $group['is_member'] = (bool)$stmt2->fetch();
        success($group);
    }

    public function join(int $id): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("SELECT 1 FROM group_members WHERE group_id=? AND user_id=?");
        $stmt->execute([$id, $auth['user_id']]);
        if ($stmt->fetch()) {
            $this->db->prepare("DELETE FROM group_members WHERE group_id=? AND user_id=?")->execute([$id, $auth['user_id']]);
            $this->db->prepare("UPDATE groups_table SET member_count=GREATEST(0,member_count-1) WHERE id=?")->execute([$id]);
            success(['joined' => false], 'Left group');
        } else {
            $this->db->prepare("INSERT IGNORE INTO group_members (group_id,user_id) VALUES (?,?)")->execute([$id, $auth['user_id']]);
            $this->db->prepare("UPDATE groups_table SET member_count=member_count+1 WHERE id=?")->execute([$id]);
            success(['joined' => true], 'Joined group');
        }
    }

    public function myGroups(): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("
            SELECT g.*, gm.role
            FROM groups_table g JOIN group_members gm ON gm.group_id=g.id
            WHERE gm.user_id=? ORDER BY g.member_count DESC
        ");
        $stmt->execute([$auth['user_id']]);
        success($stmt->fetchAll());
    }
}

// ── Theme Controller ─────────────────────────────────────────────
class ThemeController {
    public function set(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $theme = in_array($data['theme'] ?? '', ['light','dark']) ? $data['theme'] : 'light';
        getDB()->prepare("UPDATE users SET theme=? WHERE id=?")->execute([$theme, $auth['user_id']]);
        success(['theme' => $theme], 'Theme updated');
    }

    public function get(): void {
        $auth = requireAuth();
        $stmt = getDB()->prepare("SELECT theme FROM users WHERE id=?");
        $stmt->execute([$auth['user_id']]);
        success(['theme' => $stmt->fetchColumn() ?: 'light']);
    }
}

// ── Profile Views Controller ─────────────────────────────────────
class ProfileViewController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function track(int $userId): void {
        $auth = getAuthUser();
        if (!$auth || $auth['user_id'] === $userId) { success([]); return; }
        $this->db->prepare("INSERT INTO profile_views (viewer_id,viewed_id) VALUES (?,?) ON DUPLICATE KEY UPDATE viewed_at=NOW()")
            ->execute([$auth['user_id'], $userId]);
        $this->db->prepare("UPDATE users SET profile_views_count=profile_views_count+1 WHERE id=?")->execute([$userId]);
        success([]);
    }

    public function viewers(int $userId): void {
        requireAuth();
        $stmt = $this->db->prepare("
            SELECT u.id,u.name,u.username,u.avatar,pv.viewed_at
            FROM profile_views pv JOIN users u ON u.id=pv.viewer_id
            WHERE pv.viewed_id=?
            ORDER BY pv.viewed_at DESC LIMIT 30
        ");
        $stmt->execute([$userId]);
        success($stmt->fetchAll());
    }
}

// ── SuperGroup extras (appended to GroupController class above) ──
// These are standalone functions called from routes

function groupSetRole(int $groupId, int $userId): void {
    $auth = requireAuth();
    $db = getDB();
    // Check requester is owner or admin
    $stmt = $db->prepare("SELECT role FROM group_members WHERE group_id=? AND user_id=?");
    $stmt->execute([$groupId, $auth['user_id']]);
    $myRole = $stmt->fetchColumn();
    if (!in_array($myRole, ['owner','admin'])) error('Forbidden', 403);

    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $role = $data['role'] ?? 'member';
    if (!in_array($role, ['member','moderator','admin'])) error('Invalid role');
    $db->prepare("UPDATE group_members SET role=? WHERE group_id=? AND user_id=?")->execute([$role, $groupId, $userId]);
    success([], 'Role updated');
}

function groupChannels(int $groupId): void {
    requireAuth();
    // Return mock channels for now - full implementation needs channels table
    success([
        ['id'=>1,'name'=>'general','type'=>'text','unread'=>0],
        ['id'=>2,'name'=>'announcements','type'=>'text','unread'=>2],
        ['id'=>3,'name'=>'media','type'=>'media','unread'=>0],
        ['id'=>4,'name'=>'voice-lounge','type'=>'voice','active'=>false],
    ]);
}

function groupCreateChannel(int $groupId): void {
    $auth = requireAuth();
    $db   = getDB();
    $stmt = $db->prepare("SELECT role FROM group_members WHERE group_id=? AND user_id=?");
    $stmt->execute([$groupId, $auth['user_id']]);
    $role = $stmt->fetchColumn();
    if (!in_array($role, ['owner','admin','moderator'])) error('Forbidden', 403);
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    success(['id'=>rand(100,999),'name'=>$data['name']??'new-channel','type'=>$data['type']??'text'], 'Channel created');
}

function groupVoice(int $groupId): void {
    $auth = requireAuth();
    success(['room_id'=>uniqid(),'group_id'=>$groupId,'status'=>'created','message'=>'Voice room started'], 'Voice room created');
}
