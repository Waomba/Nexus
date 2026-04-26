<?php
class UserModel {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function create(array $data): int {
        $stmt = $this->db->prepare("INSERT INTO users (name,username,email,phone,password,role) VALUES (?,?,?,?,?,?)");
        $stmt->execute([$data['name'],$data['username'],$data['email'],$data['phone'] ?? null,password_hash($data['password'],PASSWORD_BCRYPT),$data['role'] ?? 'user']);
        return (int)$this->db->lastInsertId();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email=?");
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public function findByUsername(string $username): ?array {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE username=?");
        $stmt->execute([$username]);
        return $stmt->fetch() ?: null;
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT id,name,username,email,avatar,bio,role,trust_score,is_kids,location,created_at FROM users WHERE id=?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function update(int $id, array $data): void {
        $fields = []; $vals = [];
        foreach (['name','bio','location','avatar'] as $f) {
            if (isset($data[$f])) { $fields[] = "$f=?"; $vals[] = $data[$f]; }
        }
        if (!$fields) return;
        $vals[] = $id;
        $this->db->prepare("UPDATE users SET ".implode(',',$fields)." WHERE id=?")->execute($vals);
    }

    public function all(int $limit=50, int $offset=0): array {
        return $this->db->query("SELECT id,name,username,email,role,trust_score,is_active,created_at FROM users LIMIT $limit OFFSET $offset")->fetchAll();
    }

    public function count(): int {
        return (int)$this->db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    }

    public function search(string $q): array {
        $stmt = $this->db->prepare("SELECT id,name,username,avatar,bio FROM users WHERE (name LIKE ? OR username LIKE ?) AND is_active=1 LIMIT 20");
        $stmt->execute(["%$q%","%$q%"]);
        return $stmt->fetchAll();
    }

    public function follow(int $followerId, int $followingId): void {
        $this->db->prepare("INSERT IGNORE INTO follows (follower_id,following_id) VALUES (?,?)")->execute([$followerId,$followingId]);
    }

    public function unfollow(int $followerId, int $followingId): void {
        $this->db->prepare("DELETE FROM follows WHERE follower_id=? AND following_id=?")->execute([$followerId,$followingId]);
    }

    public function isFollowing(int $followerId, int $followingId): bool {
        $stmt = $this->db->prepare("SELECT 1 FROM follows WHERE follower_id=? AND following_id=?");
        $stmt->execute([$followerId,$followingId]);
        return (bool)$stmt->fetch();
    }

    public function followers(int $userId): array {
        $stmt = $this->db->prepare("SELECT u.id,u.name,u.username,u.avatar FROM users u JOIN follows f ON f.follower_id=u.id WHERE f.following_id=?");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function following(int $userId): array {
        $stmt = $this->db->prepare("SELECT u.id,u.name,u.username,u.avatar FROM users u JOIN follows f ON f.following_id=u.id WHERE f.follower_id=?");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function deactivate(int $id): void {
        $this->db->prepare("UPDATE users SET is_active=0 WHERE id=?")->execute([$id]);
    }

    public function activate(int $id): void {
        $this->db->prepare("UPDATE users SET is_active=1 WHERE id=?")->execute([$id]);
    }

    public function save2FACode(int $userId, string $code, string $purpose='login'): void {
        $this->db->prepare("INSERT INTO two_fa_codes (user_id,code,purpose,expires_at) VALUES (?,?,?,DATE_ADD(NOW(), INTERVAL 10 MINUTE))")->execute([$userId,$code,$purpose]);
    }

    public function verify2FACode(int $userId, string $code, string $purpose='login'): bool {
        $stmt = $this->db->prepare("SELECT id FROM two_fa_codes WHERE user_id=? AND code=? AND purpose=? AND expires_at>NOW() AND used=0");
        $stmt->execute([$userId,$code,$purpose]);
        $row = $stmt->fetch();
        if ($row) { $this->db->prepare("UPDATE two_fa_codes SET used=1 WHERE id=?")->execute([$row['id']]); return true; }
        return false;
    }
}
