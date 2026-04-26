<?php
class StoryModel {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function create(array $data): int {
        $stmt = $this->db->prepare("INSERT INTO stories (user_id,media,media_type,caption,expires_at) VALUES (?,?,?,?,DATE_ADD(NOW(), INTERVAL 24 HOUR))");
        $stmt->execute([$data['user_id'],$data['media'],$data['media_type'] ?? 'image',$data['caption'] ?? null]);
        return (int)$this->db->lastInsertId();
    }

    public function feedStories(int $userId): array {
        $stmt = $this->db->prepare("
            SELECT s.*, u.name, u.username, u.avatar,
                   (SELECT COUNT(*) FROM story_views sv WHERE sv.story_id=s.id) as view_count,
                   (SELECT 1 FROM story_views sv2 WHERE sv2.story_id=s.id AND sv2.user_id=?) as viewed
            FROM stories s
            JOIN users u ON u.id=s.user_id
            WHERE s.expires_at > NOW()
              AND (s.user_id=? OR s.user_id IN (SELECT following_id FROM follows WHERE follower_id=?))
            ORDER BY s.user_id, s.created_at DESC
        ");
        $stmt->execute([$userId,$userId,$userId]);
        $rows = $stmt->fetchAll();
        // Group by user
        $grouped = [];
        foreach ($rows as $r) {
            $uid = $r['user_id'];
            if (!isset($grouped[$uid])) {
                $grouped[$uid] = ['user_id'=>$uid,'name'=>$r['name'],'username'=>$r['username'],'avatar'=>$r['avatar'],'stories'=>[],'has_unseen'=>false];
            }
            $grouped[$uid]['stories'][] = $r;
            if (!$r['viewed']) $grouped[$uid]['has_unseen'] = true;
        }
        return array_values($grouped);
    }

    public function view(int $storyId, int $userId): void {
        $this->db->prepare("INSERT IGNORE INTO story_views (story_id,user_id) VALUES (?,?)")->execute([$storyId,$userId]);
        $this->db->prepare("UPDATE stories SET views=views+1 WHERE id=?")->execute([$storyId]);
    }

    public function myStories(int $userId): array {
        $stmt = $this->db->prepare("SELECT * FROM stories WHERE user_id=? AND expires_at>NOW() ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function delete(int $id, int $userId): bool {
        $stmt = $this->db->prepare("DELETE FROM stories WHERE id=? AND user_id=?");
        $stmt->execute([$id,$userId]);
        return $stmt->rowCount() > 0;
    }
}
