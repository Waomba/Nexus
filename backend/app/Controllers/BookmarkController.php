<?php
class BookmarkController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function toggle(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['post_id'])) error('post_id required');
        $pid = (int)$data['post_id'];
        $uid = $auth['user_id'];
        $stmt = $this->db->prepare("SELECT 1 FROM bookmarks WHERE user_id=? AND post_id=?");
        $stmt->execute([$uid,$pid]);
        if ($stmt->fetch()) {
            $this->db->prepare("DELETE FROM bookmarks WHERE user_id=? AND post_id=?")->execute([$uid,$pid]);
            success(['bookmarked'=>false], 'Removed from bookmarks');
        } else {
            $this->db->prepare("INSERT IGNORE INTO bookmarks (user_id,post_id) VALUES (?,?)")->execute([$uid,$pid]);
            success(['bookmarked'=>true], 'Saved to bookmarks');
        }
    }

    public function list(): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("
            SELECT p.*,u.name,u.username,u.avatar,b.created_at as saved_at
            FROM bookmarks b
            JOIN posts p ON p.id=b.post_id
            JOIN users u ON u.id=p.user_id
            WHERE b.user_id=?
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([$auth['user_id']]);
        success($stmt->fetchAll());
    }
}
