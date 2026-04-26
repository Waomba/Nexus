<?php
class CommentModel {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function create(array $data): int {
        $stmt = $this->db->prepare("INSERT INTO comments (post_id,user_id,content) VALUES (?,?,?)");
        $stmt->execute([$data['post_id'],$data['user_id'],$data['content']]);
        return (int)$this->db->lastInsertId();
    }

    public function forPost(int $postId): array {
        $stmt = $this->db->prepare("SELECT c.*,u.name,u.username,u.avatar FROM comments c JOIN users u ON u.id=c.user_id WHERE c.post_id=? ORDER BY c.created_at ASC");
        $stmt->execute([$postId]);
        return $stmt->fetchAll();
    }

    public function delete(int $id, int $userId): bool {
        $stmt = $this->db->prepare("DELETE FROM comments WHERE id=? AND user_id=?");
        $stmt->execute([$id,$userId]);
        return $stmt->rowCount() > 0;
    }
}
