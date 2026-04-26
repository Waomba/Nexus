<?php
class SearchController {
    public function search(): void {
        $q = trim($_GET['q'] ?? '');
        if (strlen($q) < 2) {
            error('Query must be at least 2 characters');
        }

        $db    = getDB();
        $like  = "%$q%";

        // Users
        $stmt = $db->prepare("
            SELECT id, name, username, avatar, bio, trust_score, 'user' AS result_type
            FROM users
            WHERE (name LIKE ? OR username LIKE ? OR bio LIKE ?) AND is_active = 1
            LIMIT 8
        ");
        $stmt->execute([$like, $like, $like]);
        $users = $stmt->fetchAll();

        // Posts
        $stmt = $db->prepare("
            SELECT p.id, p.content, p.likes, p.created_at, u.name, u.username, u.avatar, 'post' AS result_type
            FROM posts p JOIN users u ON u.id = p.user_id
            WHERE p.content LIKE ? AND p.is_flagged = 0
            ORDER BY p.likes DESC
            LIMIT 8
        ");
        $stmt->execute([$like]);
        $posts = $stmt->fetchAll();

        // Tasks
        $stmt = $db->prepare("
            SELECT t.id, t.title, t.description, t.location, t.budget, t.status,
                   u.name, u.username, 'task' AS result_type
            FROM tasks t JOIN users u ON u.id = t.user_id
            WHERE (t.title LIKE ? OR t.description LIKE ? OR t.location LIKE ?)
              AND t.is_flagged = 0 AND t.status = 'open'
            LIMIT 6
        ");
        $stmt->execute([$like, $like, $like]);
        $tasks = $stmt->fetchAll();

        // Videos
        $stmt = $db->prepare("
            SELECT v.id, v.title, v.description, v.views, v.thumbnail,
                   u.name, u.username, 'video' AS result_type
            FROM videos v JOIN users u ON u.id = v.user_id
            WHERE (v.title LIKE ? OR v.description LIKE ?) AND v.is_flagged = 0
            ORDER BY v.views DESC
            LIMIT 6
        ");
        $stmt->execute([$like, $like]);
        $videos = $stmt->fetchAll();

        success(compact('users', 'posts', 'tasks', 'videos'));
    }
}
