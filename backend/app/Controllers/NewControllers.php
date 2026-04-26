<?php
// ── Privacy Controller ───────────────────────────────────────────
class PrivacyController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function get(): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("SELECT * FROM privacy_settings WHERE user_id=?");
        $stmt->execute([$auth['user_id']]);
        $row = $stmt->fetch();
        if (!$row) {
            $this->db->prepare("INSERT IGNORE INTO privacy_settings (user_id) VALUES (?)")->execute([$auth['user_id']]);
            $stmt->execute([$auth['user_id']]);
            $row = $stmt->fetch();
        }
        success($row ?: ['user_id'=>$auth['user_id'],'last_seen'=>'everyone','profile_photo'=>'everyone','phone_number'=>'nobody','who_can_call'=>'everyone','who_can_add_groups'=>'everyone']);
    }

    public function update(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $allowed = ['last_seen','profile_photo','phone_number','who_can_call','who_can_add_groups'];
        $vals = ['everyone','contacts','nobody'];
        $sets = []; $params = [];
        foreach ($allowed as $f) {
            if (isset($data[$f]) && in_array($data[$f], $vals)) { $sets[]=$f.'=?'; $params[]=$data[$f]; }
        }
        if (empty($sets)) error('Nothing to update');
        $this->db->prepare("INSERT INTO privacy_settings (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id=user_id")->execute([$auth['user_id']]);
        $params[] = $auth['user_id'];
        $this->db->prepare("UPDATE privacy_settings SET ".implode(',',$sets)." WHERE user_id=?")->execute($params);
        success([], 'Privacy updated');
    }

    public function block(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['user_id'])) error('user_id required');
        $this->db->prepare("INSERT IGNORE INTO blocked_users (blocker_id,blocked_id) VALUES (?,?)")->execute([$auth['user_id'], $data['user_id']]);
        success([], 'User blocked');
    }

    public function unblock(int $id): void {
        $auth = requireAuth();
        $this->db->prepare("DELETE FROM blocked_users WHERE blocker_id=? AND blocked_id=?")->execute([$auth['user_id'], $id]);
        success([], 'User unblocked');
    }

    public function blocked(): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("SELECT u.id,u.name,u.username,u.avatar,bu.created_at as blocked_at FROM blocked_users bu JOIN users u ON u.id=bu.blocked_id WHERE bu.blocker_id=?");
        $stmt->execute([$auth['user_id']]);
        success($stmt->fetchAll());
    }
}

// ── Session Controller ───────────────────────────────────────────
class SessionController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function list(): void {
        $auth = requireAuth();
        // Ensure current session exists
        $sid = substr(md5($auth['user_id'].date('Y-m-d')), 0, 16);
        $this->db->prepare("INSERT IGNORE INTO sessions (id,user_id,device_name,device_type,ip_address) VALUES (?,?,?,?,?)")
            ->execute([$sid, $auth['user_id'], 'Current Device', 'browser', $_SERVER['REMOTE_ADDR']??'0.0.0.0']);
        $stmt = $this->db->prepare("SELECT * FROM sessions WHERE user_id=? ORDER BY last_active DESC");
        $stmt->execute([$auth['user_id']]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) { $r['is_current'] = ($r['id'] === $sid); }
        success($rows);
    }

    public function revoke(int $id): void {
        $auth = requireAuth();
        $this->db->prepare("DELETE FROM sessions WHERE CAST(id AS UNSIGNED)=? AND user_id=?")->execute([$id, $auth['user_id']]);
        success([], 'Session revoked');
    }

    public function revokeAll(): void {
        $auth = requireAuth();
        $this->db->prepare("DELETE FROM sessions WHERE user_id=?")->execute([$auth['user_id']]);
        success([], 'All sessions revoked');
    }
}

// ── Friend Controller ────────────────────────────────────────────
class FriendController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function list(): void {
        $auth = requireAuth();
        // Friends = mutual follows
        $stmt = $this->db->prepare("
            SELECT u.id,u.name,u.username,u.avatar,u.trust_score,
                   (SELECT COUNT(*) FROM posts WHERE user_id=u.id) as post_count
            FROM follows f1
            JOIN follows f2 ON f2.follower_id=f1.following_id AND f2.following_id=f1.follower_id
            JOIN users u ON u.id=f1.following_id
            WHERE f1.follower_id=?
            ORDER BY u.trust_score DESC
        ");
        $stmt->execute([$auth['user_id']]);
        success($stmt->fetchAll());
    }

    public function suggestions(): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("
            SELECT u.id,u.name,u.username,u.avatar,u.trust_score,
                   (SELECT COUNT(*) FROM follows WHERE following_id=u.id) as follower_count
            FROM users u
            WHERE u.id != ?
              AND u.is_active=1
              AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id=?)
            ORDER BY u.trust_score DESC, RAND()
            LIMIT 10
        ");
        $stmt->execute([$auth['user_id'], $auth['user_id']]);
        success($stmt->fetchAll());
    }
}

// ── Saved Messages Controller ────────────────────────────────────
class SavedMessageController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function list(): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("SELECT * FROM saved_messages WHERE user_id=? ORDER BY created_at DESC");
        $stmt->execute([$auth['user_id']]);
        success($stmt->fetchAll());
    }

    public function save(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['content'])) error('content required');
        $this->db->prepare("INSERT INTO saved_messages (user_id,content,media,media_type) VALUES (?,?,?,?)")
            ->execute([$auth['user_id'], $data['content'], $data['media']??null, $data['media_type']??null]);
        success(['id'=>(int)$this->db->lastInsertId()], 'Saved');
    }

    public function delete(int $id): void {
        $auth = requireAuth();
        $this->db->prepare("DELETE FROM saved_messages WHERE id=? AND user_id=?")->execute([$id, $auth['user_id']]);
        success([], 'Deleted');
    }
}

// ── Archive Controller ───────────────────────────────────────────
class ArchiveController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function list(): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("
            SELECT c.id as conversation_id, u.id as other_user_id, u.name, u.username, u.avatar,
                   m.content as last_message, m.created_at as last_time
            FROM archived_conversations ac
            JOIN conversations c ON c.id=ac.conversation_id
            JOIN conversation_participants cp ON cp.conversation_id=c.id AND cp.user_id!=?
            JOIN users u ON u.id=cp.user_id
            LEFT JOIN messages m ON m.conversation_id=c.id
            WHERE ac.user_id=?
            GROUP BY c.id
            ORDER BY m.created_at DESC
        ");
        $stmt->execute([$auth['user_id'], $auth['user_id']]);
        success($stmt->fetchAll());
    }

    public function toggle(int $convId): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("SELECT 1 FROM archived_conversations WHERE user_id=? AND conversation_id=?");
        $stmt->execute([$auth['user_id'], $convId]);
        if ($stmt->fetch()) {
            $this->db->prepare("DELETE FROM archived_conversations WHERE user_id=? AND conversation_id=?")->execute([$auth['user_id'], $convId]);
            success(['archived'=>false], 'Conversation unarchived');
        } else {
            $this->db->prepare("INSERT IGNORE INTO archived_conversations (user_id,conversation_id) VALUES (?,?)")->execute([$auth['user_id'], $convId]);
            success(['archived'=>true], 'Conversation archived');
        }
    }
}

// ── Notification Prefs Controller ────────────────────────────────
class NotifPrefController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function get(): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("SELECT * FROM notification_prefs WHERE user_id=?");
        $stmt->execute([$auth['user_id']]);
        $row = $stmt->fetch();
        if (!$row) {
            $this->db->prepare("INSERT IGNORE INTO notification_prefs (user_id) VALUES (?)")->execute([$auth['user_id']]);
            $stmt->execute([$auth['user_id']]);
            $row = $stmt->fetch();
        }
        success($row ?: ['user_id'=>$auth['user_id'],'messages'=>1,'posts'=>1,'follows'=>1,'sounds'=>1,'vibration'=>1,'show_previews'=>1]);
    }

    public function update(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = ['messages','posts','follows','sounds','vibration','show_previews'];
        $sets=[]; $params=[];
        foreach ($fields as $f) {
            if (isset($data[$f])) { $sets[]=$f.'=?'; $params[]=(int)(bool)$data[$f]; }
        }
        if (empty($sets)) error('Nothing to update');
        $this->db->prepare("INSERT INTO notification_prefs (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id=user_id")->execute([$auth['user_id']]);
        $params[]=$auth['user_id'];
        $this->db->prepare("UPDATE notification_prefs SET ".implode(',',$sets)." WHERE user_id=?")->execute($params);
        success([], 'Notification preferences updated');
    }
}

// ── Appearance Controller ────────────────────────────────────────
class AppearanceController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function get(): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("SELECT * FROM appearance_prefs WHERE user_id=?");
        $stmt->execute([$auth['user_id']]);
        $row = $stmt->fetch();
        if (!$row) {
            $this->db->prepare("INSERT IGNORE INTO appearance_prefs (user_id) VALUES (?)")->execute([$auth['user_id']]);
            $stmt->execute([$auth['user_id']]);
            $row = $stmt->fetch();
        }
        success($row ?: ['user_id'=>$auth['user_id'],'font_size'=>'medium','accent_color'=>'cyan','bubble_style'=>'rounded','bg_wallpaper'=>null]);
    }

    public function update(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = ['font_size'=>['small','medium','large'], 'accent_color'=>['cyan','violet','green','orange','pink','red'], 'bubble_style'=>['rounded','sharp','minimal'], 'bg_wallpaper'=>null];
        $sets=[]; $params=[];
        foreach ($fields as $f=>$allowed) {
            if (!isset($data[$f])) continue;
            if ($allowed && !in_array($data[$f], $allowed)) continue;
            $sets[]=$f.'=?'; $params[]=$data[$f];
        }
        if (empty($sets)) error('Nothing to update');
        $this->db->prepare("INSERT INTO appearance_prefs (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id=user_id")->execute([$auth['user_id']]);
        $params[]=$auth['user_id'];
        $this->db->prepare("UPDATE appearance_prefs SET ".implode(',',$sets)." WHERE user_id=?")->execute($params);
        success([], 'Appearance updated');
    }
}

// ── Trust Controller ─────────────────────────────────────────────
class TrustController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function history(): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("SELECT * FROM trust_events WHERE user_id=? ORDER BY created_at DESC LIMIT 30");
        $stmt->execute([$auth['user_id']]);
        success($stmt->fetchAll());
    }

    public function stats(): void {
        $auth = requireAuth();
        $db = $this->db;
        $uid = $auth['user_id'];

        $score = $db->prepare("SELECT trust_score FROM users WHERE id=?"); $score->execute([$uid]);
        $posts = $db->prepare("SELECT COUNT(*) FROM posts WHERE user_id=? AND is_flagged=0"); $posts->execute([$uid]);
        $likes = $db->prepare("SELECT COALESCE(SUM(likes),0) FROM posts WHERE user_id=?"); $likes->execute([$uid]);
        $reports = $db->prepare("SELECT COUNT(*) FROM reports WHERE content_id IN (SELECT id FROM posts WHERE user_id=?) AND status='resolved'"); $reports->execute([$uid]);
        $tasks = $db->prepare("SELECT COUNT(*) FROM tasks WHERE creator_id=? AND status='completed'"); $tasks->execute([$uid]);
        $followers = $db->prepare("SELECT COUNT(*) FROM follows WHERE following_id=?"); $followers->execute([$uid]);

        success([
            'trust_score'   => (int)$score->fetchColumn(),
            'clean_posts'   => (int)$posts->fetchColumn(),
            'total_likes'   => (int)$likes->fetchColumn(),
            'reports_against'=> (int)$reports->fetchColumn(),
            'tasks_completed'=> (int)$tasks->fetchColumn(),
            'followers'     => (int)$followers->fetchColumn(),
        ]);
    }
}
