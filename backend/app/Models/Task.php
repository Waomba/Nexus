<?php
class TaskModel {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function create(array $data): int {
        $stmt = $this->db->prepare("INSERT INTO tasks (user_id,title,description,location,budget) VALUES (?,?,?,?,?)");
        $stmt->execute([$data['user_id'],$data['title'],$data['description'],$data['location'] ?? null,$data['budget'] ?? 0]);
        return (int)$this->db->lastInsertId();
    }

    public function all(int $limit=20, int $offset=0): array {
        $stmt = $this->db->prepare("SELECT t.*,u.name,u.username,u.avatar FROM tasks t JOIN users u ON u.id=t.user_id WHERE t.is_flagged=0 AND t.status='open' ORDER BY t.created_at DESC LIMIT ? OFFSET ?");
        $stmt->execute([$limit,$offset]);
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT t.*,u.name,u.username,u.avatar FROM tasks t JOIN users u ON u.id=t.user_id WHERE t.id=?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function userTasks(int $userId): array {
        $stmt = $this->db->prepare("SELECT * FROM tasks WHERE user_id=? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function updateStatus(int $id, string $status, int $userId): bool {
        $stmt = $this->db->prepare("UPDATE tasks SET status=? WHERE id=? AND user_id=?");
        $stmt->execute([$status,$id,$userId]);
        return $stmt->rowCount() > 0;
    }

    public function flag(int $id): void { $this->db->prepare("UPDATE tasks SET is_flagged=1 WHERE id=?")->execute([$id]); }
    public function count(): int { return (int)$this->db->query("SELECT COUNT(*) FROM tasks")->fetchColumn(); }
    public function flagged(): array { return $this->db->query("SELECT t.*,u.name,u.username FROM tasks t JOIN users u ON u.id=t.user_id WHERE t.is_flagged=1")->fetchAll(); }
    public function adminDelete(int $id): void { $this->db->prepare("DELETE FROM tasks WHERE id=?")->execute([$id]); }
}
