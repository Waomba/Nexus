<?php
class AuthController {
    private UserModel $users;
    public function __construct() { $this->users = new UserModel(); }

    public function register(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) error('Invalid JSON');
        foreach (['name','username','email','password'] as $f) {
            if (empty($data[$f])) error("Field '$f' is required");
        }
        if (strlen($data['password']) < 6) error('Password must be at least 6 characters');
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) error('Invalid email address');
        if ($this->users->findByEmail($data['email']))    error('Email already registered');
        if ($this->users->findByUsername($data['username'])) error('Username already taken');

        $id = $this->users->create($data);

        // Save extended profile fields
        $db = getDB();
        $ext = [];
        $vals = [];
        foreach (['bio','location','avatar','website','date_of_birth','gender'] as $f) {
            if (!empty($data[$f])) { $ext[] = "$f=?"; $vals[] = $data[$f]; }
        }
        // Mark onboarding done if interests provided
        if (!empty($data['interests'])) { $ext[] = "onboarding_done=1"; }
        if ($ext) {
            $vals[] = $id;
            $db->prepare("UPDATE users SET ".implode(',',$ext)." WHERE id=?")->execute($vals);
        }

        // Save interests
        if (!empty($data['interests']) && is_array($data['interests'])) {
            foreach (array_slice($data['interests'], 0, 10) as $interest) {
                $db->prepare("INSERT IGNORE INTO user_interests (user_id,interest) VALUES (?,?)")->execute([$id, $interest]);
            }
        }

        $user = $this->users->findById($id);
        $tok  = generateJWT(['user_id' => $id, 'role' => 'user']);
        (new ActivityLogModel())->log($id, 'registered');
        success(['token' => $tok, 'user' => $user], 'Account created');
    }

    public function login(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['email']) || empty($data['password'])) error('Email and password required');
        $user = $this->users->findByEmail($data['email']);
        if (!$user || !password_verify($data['password'], $user['password'])) error('Invalid credentials', 401);
        if (!$user['is_active']) error('Account is deactivated', 403);
        if ($user['two_fa_enabled']) {
            $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            $this->users->save2FACode($user['id'], $code, 'login');
            respond(['two_fa_required' => true, 'user_id' => $user['id'], 'dev_code' => $code]);
        }
        $tok  = generateJWT(['user_id' => $user['id'], 'role' => $user['role']]);
        $safe = $this->users->findById($user['id']);
        (new ActivityLogModel())->log($user['id'], 'logged_in');
        success(['token' => $tok, 'user' => $safe]);
    }

    public function verify2FA(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['user_id']) || empty($data['code'])) error('user_id and code required');
        if (!$this->users->verify2FACode($data['user_id'], $data['code'], 'login')) error('Invalid or expired code', 401);
        $user = $this->users->findById($data['user_id']);
        if (!$user) error('User not found', 404);
        $tok = generateJWT(['user_id' => $user['id'], 'role' => $user['role']]);
        success(['token' => $tok, 'user' => $user]);
    }

    public function me(): void {
        $auth = requireAuth();
        $user = $this->users->findById($auth['user_id']);
        if (!$user) error('User not found', 404);
        // Attach interests
        $stmt = getDB()->prepare("SELECT interest FROM user_interests WHERE user_id=?");
        $stmt->execute([$auth['user_id']]);
        $user['interests'] = array_column($stmt->fetchAll(), 'interest');
        success($user);
    }

    public function adminLogin(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['email']) || empty($data['password'])) error('Email and password required');
        $user = $this->users->findByEmail($data['email']);
        if (!$user || !password_verify($data['password'], $user['password'])) error('Invalid credentials', 401);
        if ($user['role'] !== 'admin') error('Not an admin account', 403);
        $tok = generateJWT(['user_id' => $user['id'], 'role' => 'admin']);
        success(['token' => $tok, 'user' => $this->users->findById($user['id'])]);
    }

    public function changePassword(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['current_password']) || empty($data['new_password'])) error('Both passwords required');
        if (strlen($data['new_password']) < 6) error('New password must be at least 6 characters');
        $stmt = getDB()->prepare("SELECT password FROM users WHERE id=?");
        $stmt->execute([$auth['user_id']]);
        $row = $stmt->fetch();
        if (!$row || !password_verify($data['current_password'], $row['password'])) error('Current password is incorrect', 401);
        $hash = password_hash($data['new_password'], PASSWORD_BCRYPT);
        getDB()->prepare("UPDATE users SET password=? WHERE id=?")->execute([$hash, $auth['user_id']]);
        (new ActivityLogModel())->log($auth['user_id'], 'changed_password');
        success([], 'Password updated');
    }

    public function updateAvatar(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['avatar'])) error('avatar URL required');
        getDB()->prepare("UPDATE users SET avatar=? WHERE id=?")->execute([$data['avatar'], $auth['user_id']]);
        success(['avatar' => $data['avatar']], 'Avatar updated');
    }

    public function toggle2FA(): void {
        $auth = requireAuth();
        $db   = getDB();
        $stmt = $db->prepare("SELECT two_fa_enabled FROM users WHERE id=?");
        $stmt->execute([$auth['user_id']]);
        $current = (bool)$stmt->fetchColumn();
        $db->prepare("UPDATE users SET two_fa_enabled=? WHERE id=?")->execute([$current ? 0 : 1, $auth['user_id']]);
        success(['two_fa_enabled' => !$current], '2FA ' . ($current ? 'disabled' : 'enabled'));
    }
}
