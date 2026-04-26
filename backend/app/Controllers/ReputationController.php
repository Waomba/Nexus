<?php
// ReputationController — manages trust scores and leaderboard
class ReputationController {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function leaderboard(): void {
        $users = $this->db->query("
            SELECT u.id, u.name, u.username, u.avatar, u.trust_score,
                   (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS post_count,
                   (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS follower_count
            FROM users u
            WHERE u.is_active = 1 AND u.role = 'user'
            ORDER BY u.trust_score DESC
            LIMIT 20
        ")->fetchAll();

        success($users);
    }

    public function myScore(): void {
        $auth = requireAuth();
        $stmt = $this->db->prepare("
            SELECT u.trust_score,
                   (SELECT COUNT(*) FROM posts WHERE user_id = u.id AND is_flagged = 0) AS clean_posts,
                   (SELECT COUNT(*) FROM post_likes pl JOIN posts p ON p.id = pl.post_id WHERE p.user_id = u.id) AS total_likes,
                   (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers,
                   (SELECT COUNT(*) FROM reports WHERE reporter_id = u.id) AS reports_submitted,
                   (SELECT COUNT(*) FROM reports r2 
                     JOIN posts p2 ON p2.id = r2.content_id AND r2.content_type = 'post'
                     WHERE p2.user_id = u.id AND r2.status = 'reviewed') AS reports_received
            FROM users u WHERE u.id = ?
        ");
        $stmt->execute([$auth['user_id']]);
        $data = $stmt->fetch();
        success($data);
    }

    // Called internally when trust-worthy actions happen
    public static function adjust(int $userId, int $delta, string $reason): void {
        $db = getDB();
        $db->prepare("
            UPDATE users
            SET trust_score = GREATEST(0, LEAST(1000, trust_score + ?))
            WHERE id = ?
        ")->execute([$delta, $userId]);

        (new ActivityLogModel())->log($userId, 'trust_adjusted', "$reason ($delta)");
    }
}
