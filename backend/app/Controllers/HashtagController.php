<?php
class HashtagController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function trending(): void {
        $tags = $this->db->query("SELECT tag, post_count FROM hashtags ORDER BY post_count DESC LIMIT 20")->fetchAll();
        success($tags);
    }

    public function posts(): void {
        $tag = trim($_GET['tag'] ?? '');
        if (!$tag) error('tag required');
        $tag = ltrim($tag, '#');
        $stmt = $this->db->prepare("
            SELECT p.*,u.name,u.username,u.avatar
            FROM post_hashtags ph
            JOIN hashtags h ON h.id=ph.hashtag_id
            JOIN posts p ON p.id=ph.post_id
            JOIN users u ON u.id=p.user_id
            WHERE h.tag=? AND p.is_flagged=0
            ORDER BY p.created_at DESC LIMIT 30
        ");
        $stmt->execute([$tag]);
        success($stmt->fetchAll());
    }
}
