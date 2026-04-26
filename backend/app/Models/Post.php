<?php
class PostModel {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function create(array $data): int {
        $stmt = $this->db->prepare("INSERT INTO posts (user_id,content,media,media_type) VALUES (?,?,?,?)");
        $stmt->execute([$data['user_id'],$data['content'],$data['media'] ?? null,$data['media_type'] ?? 'none']);
        return (int)$this->db->lastInsertId();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT p.*,u.name,u.username,u.avatar FROM posts p JOIN users u ON u.id=p.user_id WHERE p.id=?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function feed(int $userId, int $limit=20, int $offset=0): array {
        $stmt = $this->db->prepare("
            SELECT p.*,u.name,u.username,u.avatar,
                   (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id) as comment_count,
                   (SELECT 1 FROM post_likes pl WHERE pl.post_id=p.id AND pl.user_id=?) as liked
            FROM posts p
            JOIN users u ON u.id=p.user_id
            WHERE (p.user_id=? OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id=?))
              AND p.is_flagged=0 AND u.is_active=1
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$userId,$userId,$userId,$limit,$offset]);
        return $stmt->fetchAll();
    }

    public function explore(int $limit=20, int $offset=0): array {
        $stmt = $this->db->prepare("
            SELECT p.*,u.name,u.username,u.avatar,
                   (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id) as comment_count
            FROM posts p JOIN users u ON u.id=p.user_id
            WHERE p.is_flagged=0 AND u.is_active=1
            ORDER BY p.likes DESC, p.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit,$offset]);
        return $stmt->fetchAll();
    }

    public function userPosts(int $userId): array {
        $stmt = $this->db->prepare("SELECT p.*,u.name,u.username,u.avatar FROM posts p JOIN users u ON u.id=p.user_id WHERE p.user_id=? ORDER BY p.created_at DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function like(int $postId, int $userId): void {
        try {
            $this->db->prepare("INSERT INTO post_likes (user_id,post_id) VALUES (?,?)")->execute([$userId,$postId]);
            $this->db->prepare("UPDATE posts SET likes=likes+1 WHERE id=?")->execute([$postId]);
        } catch(PDOException) {}
    }

    public function unlike(int $postId, int $userId): void {
        $stmt = $this->db->prepare("DELETE FROM post_likes WHERE user_id=? AND post_id=?");
        $stmt->execute([$userId,$postId]);
        if ($stmt->rowCount()) $this->db->prepare("UPDATE posts SET likes=GREATEST(0,likes-1) WHERE id=?")->execute([$postId]);
    }

    public function delete(int $id, int $userId): bool {
        $stmt = $this->db->prepare("DELETE FROM posts WHERE id=? AND user_id=?");
        $stmt->execute([$id,$userId]);
        return $stmt->rowCount() > 0;
    }

    public function flag(int $id): void {
        $this->db->prepare("UPDATE posts SET is_flagged=1 WHERE id=?")->execute([$id]);
    }

    public function flagged(int $limit=50): array {
        return $this->db->query("SELECT p.*,u.name,u.username FROM posts p JOIN users u ON u.id=p.user_id WHERE p.is_flagged=1 ORDER BY p.created_at DESC LIMIT $limit")->fetchAll();
    }

    public function count(): int {
        return (int)$this->db->query("SELECT COUNT(*) FROM posts")->fetchColumn();
    }

    public function adminDelete(int $id): void {
        $this->db->prepare("DELETE FROM posts WHERE id=?")->execute([$id]);
    }
}
