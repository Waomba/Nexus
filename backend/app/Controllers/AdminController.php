<?php
class AdminController {
    public function dashboard(): void {
        requireAdmin();
        $db = getDB();
        $stats = [
            'total_users'    => (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn(),
            'total_posts'    => (int)$db->query("SELECT COUNT(*) FROM posts")->fetchColumn(),
            'total_videos'   => (int)$db->query("SELECT COUNT(*) FROM videos")->fetchColumn(),
            'total_tasks'    => (int)$db->query("SELECT COUNT(*) FROM tasks")->fetchColumn(),
            'total_messages' => (int)$db->query("SELECT COUNT(*) FROM messages")->fetchColumn(),
            'pending_reports'=> (int)$db->query("SELECT COUNT(*) FROM reports WHERE status='pending'")->fetchColumn(),
            'flagged_posts'  => (int)$db->query("SELECT COUNT(*) FROM posts WHERE is_flagged=1")->fetchColumn(),
            'kids_accounts'  => (int)$db->query("SELECT COUNT(*) FROM users WHERE is_kids=1")->fetchColumn(),
            'new_users_today'=> (int)$db->query("SELECT COUNT(*) FROM users WHERE DATE(created_at)=CURDATE()")->fetchColumn(),
            'new_posts_today'=> (int)$db->query("SELECT COUNT(*) FROM posts WHERE DATE(created_at)=CURDATE()")->fetchColumn(),
        ];

        $recentUsers = $db->query("SELECT id,name,username,email,role,created_at FROM users ORDER BY created_at DESC LIMIT 10")->fetchAll();
        $recentLogs  = (new ActivityLogModel())->recent(20);

        success(compact('stats','recentUsers','recentLogs'));
    }

    public function users(): void {
        requireAdmin();
        $page  = max(1,(int)($_GET['page'] ?? 1));
        $users = (new UserModel())->all(50, ($page-1)*50);
        success($users);
    }

    public function banUser(int $id): void {
        requireAdmin();
        (new UserModel())->deactivate($id);
        (new ActivityLogModel())->log(requireAdmin()['user_id'], 'banned_user', "User #$id");
        success([], 'User banned');
    }

    public function unbanUser(int $id): void {
        requireAdmin();
        (new UserModel())->activate($id);
        success([], 'User unbanned');
    }

    public function reports(): void {
        requireAdmin();
        $status = $_GET['status'] ?? 'pending';
        success((new ReportModel())->all($status));
    }

    public function resolveReport(int $id): void {
        requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = $data['status'] ?? 'reviewed';
        (new ReportModel())->updateStatus($id, $status);
        success([], 'Report updated');
    }

    public function flaggedPosts(): void {
        requireAdmin();
        success((new PostModel())->flagged());
    }

    public function deletePost(int $id): void {
        requireAdmin();
        (new PostModel())->adminDelete($id);
        success([], 'Post deleted');
    }

    public function flaggedVideos(): void {
        requireAdmin();
        success((new VideoModel())->flagged());
    }

    public function deleteVideo(int $id): void {
        requireAdmin();
        (new VideoModel())->adminDelete($id);
        success([], 'Video deleted');
    }

    public function flaggedTasks(): void {
        requireAdmin();
        success((new TaskModel())->flagged());
    }

    public function deleteTask(int $id): void {
        requireAdmin();
        (new TaskModel())->adminDelete($id);
        success([], 'Task deleted');
    }

    public function activityLogs(): void {
        requireAdmin();
        success((new ActivityLogModel())->recent(100));
    }
}
