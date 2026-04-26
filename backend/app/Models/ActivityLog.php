<?php
class ActivityLogModel {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }
    public function log(int $userId, string $action, string $details=''): void {
        $this->db->prepare("INSERT INTO activity_logs (user_id,action,details) VALUES (?,?,?)")->execute([$userId,$action,$details]);
    }
    public function forUser(int $userId, int $limit=50): array {
        $stmt = $this->db->prepare("SELECT * FROM activity_logs WHERE user_id=? ORDER BY created_at DESC LIMIT ?");
        $stmt->execute([$userId,$limit]);
        return $stmt->fetchAll();
    }
    public function recent(int $limit=100): array {
        return $this->db->query("SELECT al.*,u.name,u.username FROM activity_logs al JOIN users u ON u.id=al.user_id ORDER BY al.created_at DESC LIMIT $limit")->fetchAll();
    }
}

class ParentChildModel {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }
    public function link(int $parentId, int $childId): void {
        $this->db->prepare("INSERT IGNORE INTO parent_child (parent_id,child_id) VALUES (?,?)")->execute([$parentId,$childId]);
        $this->db->prepare("UPDATE users SET is_kids=1 WHERE id=?")->execute([$childId]);
    }
    public function children(int $parentId): array {
        $stmt = $this->db->prepare("SELECT u.id,u.name,u.username,u.avatar,u.is_kids FROM users u JOIN parent_child pc ON pc.child_id=u.id WHERE pc.parent_id=?");
        $stmt->execute([$parentId]);
        return $stmt->fetchAll();
    }
    public function isChild(int $childId): bool {
        $stmt = $this->db->prepare("SELECT 1 FROM parent_child WHERE child_id=?");
        $stmt->execute([$childId]);
        return (bool)$stmt->fetch();
    }
    public function parentOf(int $childId): ?array {
        $stmt = $this->db->prepare("SELECT u.* FROM users u JOIN parent_child pc ON pc.parent_id=u.id WHERE pc.child_id=?");
        $stmt->execute([$childId]);
        return $stmt->fetch() ?: null;
    }
}

class ScreenTimeModel {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function setLimit(int $childId, int $minutes): void {
        $today = date('Y-m-d');
        $this->db->prepare("INSERT INTO screen_time (child_id,daily_limit,used_time,date) VALUES (?,?,0,?) ON DUPLICATE KEY UPDATE daily_limit=?")->execute([$childId,$minutes,$today,$minutes]);
    }

    public function addUsage(int $childId, int $minutes): void {
        $today = date('Y-m-d');
        $this->db->prepare("INSERT INTO screen_time (child_id,daily_limit,used_time,date) VALUES (?,120,?,?) ON DUPLICATE KEY UPDATE used_time=used_time+?")->execute([$childId,$minutes,$today,$minutes]);
    }

    public function getToday(int $childId): array {
        $today = date('Y-m-d');
        $stmt = $this->db->prepare("SELECT * FROM screen_time WHERE child_id=? AND date=?");
        $stmt->execute([$childId,$today]);
        return $stmt->fetch() ?: ['daily_limit'=>120,'used_time'=>0,'date'=>$today];
    }

    public function isLimitReached(int $childId): bool {
        $data = $this->getToday($childId);
        return $data['used_time'] >= $data['daily_limit'];
    }

    public function history(int $childId, int $days=7): array {
        $stmt = $this->db->prepare("SELECT * FROM screen_time WHERE child_id=? ORDER BY date DESC LIMIT ?");
        $stmt->execute([$childId,$days]);
        return $stmt->fetchAll();
    }
}
