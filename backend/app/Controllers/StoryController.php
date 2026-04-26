<?php
class StoryController {
    private StoryModel $stories;
    public function __construct() { $this->stories = new StoryModel(); }

    public function feed(): void {
        $auth = requireAuth();
        success($this->stories->feedStories($auth['user_id']));
    }

    public function create(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['media'])) error('media URL required');
        $data['user_id'] = $auth['user_id'];
        $id = $this->stories->create($data);
        (new ActivityLogModel())->log($auth['user_id'], 'created_story', "Story #$id");
        success(['id'=>$id], 'Story posted');
    }

    public function view(int $id): void {
        $auth = requireAuth();
        $this->stories->view($id, $auth['user_id']);
        success([], 'Viewed');
    }

    public function mine(): void {
        $auth = requireAuth();
        success($this->stories->myStories($auth['user_id']));
    }

    public function delete(int $id): void {
        $auth = requireAuth();
        if (!$this->stories->delete($id, $auth['user_id'])) error('Not found', 404);
        success([], 'Deleted');
    }
}
