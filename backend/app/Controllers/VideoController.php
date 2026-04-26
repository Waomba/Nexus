<?php
class VideoController {
    private VideoModel $videos;
    public function __construct() { $this->videos = new VideoModel(); }

    public function index(): void {
        $page  = max(1, (int)($_GET['page'] ?? 1));
        success($this->videos->all(20, ($page - 1) * 20));
    }

    public function show(int $id): void {
        $video = $this->videos->findById($id);
        if (!$video) error('Video not found', 404);
        $this->videos->incrementViews($id);
        success($video);
    }

    public function create(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['title']) || empty($data['media'])) error('title and media URL required');
        $data['user_id'] = $auth['user_id'];
        $id = $this->videos->create($data);
        (new ActivityLogModel())->log($auth['user_id'], 'uploaded_video', "Video #$id");
        success($this->videos->findById($id), 'Video uploaded');
    }
}
