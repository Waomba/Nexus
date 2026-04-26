<?php
class TaskController {
    private TaskModel $tasks;
    public function __construct() { $this->tasks = new TaskModel(); }

    public function index(): void {
        $page = max(1, (int)($_GET['page'] ?? 1));
        success($this->tasks->all(20, ($page - 1) * 20));
    }

    public function show(int $id): void {
        $task = $this->tasks->findById($id);
        if (!$task) error('Task not found', 404);
        success($task);
    }

    public function create(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['title']) || empty($data['description'])) error('title and description required');
        $data['user_id'] = $auth['user_id'];
        $id = $this->tasks->create($data);
        (new ActivityLogModel())->log($auth['user_id'], 'created_task', "Task #$id");
        success($this->tasks->findById($id), 'Task posted');
    }

    public function updateStatus(int $id): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['status'])) error('status required');
        if (!$this->tasks->updateStatus($id, $data['status'], $auth['user_id'])) error('Not found or unauthorized', 404);
        success([], 'Status updated');
    }

    public function myTasks(): void {
        $auth = requireAuth();
        success($this->tasks->userTasks($auth['user_id']));
    }
}
