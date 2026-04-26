<?php
class VideoModel {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function create(array $data): int {
        $stmt = $this->db->prepare("INSERT INTO videos (user_id,title,description,media,thumbnail) VALUES (?,?,?,?,?)");
        $stmt->execute([$data['user_id'],$data['title'],$data['description'] ?? null,$data['media'],$data['thumbnail'] ?? null]);
        return (int)$this->db->lastInsertId();
    }

    public function all(int $limit=20, int $offset=0): array {
        $stmt = $this->db->prepare("SELECT v.*,u.name,u.username,u.avatar FROM videos v JOIN users u ON u.id=v.user_id WHERE v.is_flagged=0 ORDER BY v.created_at DESC LIMIT ? OFFSET ?");
        $stmt->execute([$limit,$offset]);
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT v.*,u.name,u.username,u.avatar FROM videos v JOIN users u ON u.id=v.user_id WHERE v.id=?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function incrementViews(int $id): void {
        $this->db->prepare("UPDATE videos SET views=views+1 WHERE id=?")->execute([$id]);
    }

    public function userVideos(int $userId): array {
        $stmt = $this->db->prepare("SELECT * FROM videos WHERE user_id=? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function flag(int $id): void { $this->db->prepare("UPDATE videos SET is_flagged=1 WHERE id=?")->execute([$id]); }
    public function count(): int { return (int)$this->db->query("SELECT COUNT(*) FROM videos")->fetchColumn(); }
    public function flagged(): array { return $this->db->query("SELECT v.*,u.name,u.username FROM videos v JOIN users u ON u.id=v.user_id WHERE v.is_flagged=1")->fetchAll(); }
    public function adminDelete(int $id): void { $this->db->prepare("DELETE FROM videos WHERE id=?")->execute([$id]); }
}
