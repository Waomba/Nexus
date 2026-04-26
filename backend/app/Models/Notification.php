<?php
class NotificationModel {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function create(int $userId, string $type, array $data): void {
        $this->db->prepare("INSERT INTO notifications (user_id,type,data) VALUES (?,?,?)")->execute([$userId,$type,json_encode($data)]);
    }

    public function forUser(int $userId, int $limit=30): array {
        $stmt = $this->db->prepare("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT ?");
        $stmt->execute([$userId,$limit]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) $r['data'] = json_decode($r['data'], true);
        return $rows;
    }

    public function markRead(int $userId): void {
        $this->db->prepare("UPDATE notifications SET is_read=1 WHERE user_id=?")->execute([$userId]);
    }

    public function unreadCount(int $userId): int {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM notifications WHERE user_id=? AND is_read=0");
        $stmt->execute([$userId]);
        return (int)$stmt->fetchColumn();
    }
}
