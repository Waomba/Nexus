<?php
class ReportController {
    private ReportModel $reports;
    public function __construct() { $this->reports = new ReportModel(); }

    public function create(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['content_type']) || empty($data['content_id']) || empty($data['reason'])) {
            error('content_type, content_id, reason required');
        }
        $allowedTypes = ['post','message','video','task','user'];
        if (!in_array($data['content_type'], $allowedTypes)) error('Invalid content_type');

        $data['reporter_id'] = $auth['user_id'];
        $id = $this->reports->create($data);

        // Auto-flag the content
        match($data['content_type']) {
            'post'  => (new PostModel())->flag((int)$data['content_id']),
            'video' => (new VideoModel())->flag((int)$data['content_id']),
            'task'  => (new TaskModel())->flag((int)$data['content_id']),
            default => null,
        };

        (new ActivityLogModel())->log($auth['user_id'], 'reported_content', "{$data['content_type']} #{$data['content_id']}");
        success(['id' => $id], 'Report submitted');
    }
}

class NotificationController {
    private NotificationModel $notifs;
    public function __construct() { $this->notifs = new NotificationModel(); }

    public function index(): void {
        $auth = requireAuth();
        success($this->notifs->forUser($auth['user_id']));
    }

    public function markRead(): void {
        $auth = requireAuth();
        $this->notifs->markRead($auth['user_id']);
        success([], 'Marked as read');
    }

    public function unreadCount(): void {
        $auth = requireAuth();
        success(['count' => $this->notifs->unreadCount($auth['user_id'])]);
    }
}
