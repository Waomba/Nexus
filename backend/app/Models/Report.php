<?php
class ReportModel {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function create(array $data): int {
        $stmt = $this->db->prepare("INSERT INTO reports (reporter_id,content_type,content_id,reason) VALUES (?,?,?,?)");
        $stmt->execute([$data['reporter_id'],$data['content_type'],$data['content_id'],$data['reason']]);
        return (int)$this->db->lastInsertId();
    }

    public function all(string $status='pending'): array {
        $stmt = $this->db->prepare("SELECT r.*,u.name as reporter_name,u.username as reporter_username FROM reports r JOIN users u ON u.id=r.reporter_id WHERE r.status=? ORDER BY r.created_at DESC");
        $stmt->execute([$status]);
        return $stmt->fetchAll();
    }

    public function updateStatus(int $id, string $status): void {
        $this->db->prepare("UPDATE reports SET status=? WHERE id=?")->execute([$status,$id]);
    }

    public function count(): int { return (int)$this->db->query("SELECT COUNT(*) FROM reports WHERE status='pending'")->fetchColumn(); }
}
