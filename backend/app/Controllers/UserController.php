<?php
class UserController {
    private UserModel $users;
    public function __construct() { $this->users = new UserModel(); }

    public function profile(int $id): void {
        $user = $this->users->findById($id);
        if (!$user) error('User not found', 404);
        $posts = (new PostModel())->userPosts($id);
        $followers = $this->users->followers($id);
        $following = $this->users->following($id);

        $auth = getAuthUser();
        $isFollowing = $auth ? $this->users->isFollowing($auth['user_id'], $id) : false;

        success(compact('user','posts','followers','following','isFollowing'));
    }

    public function update(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $this->users->update($auth['user_id'], $data);
        success($this->users->findById($auth['user_id']), 'Profile updated');
    }

    public function follow(int $id): void {
        $auth = requireAuth();
        if ($auth['user_id'] === $id) error('Cannot follow yourself');
        $this->users->follow($auth['user_id'], $id);
        $target = $this->users->findById($id);
        (new NotificationModel())->create($id, 'follow', ['from_user' => $auth['user_id'], 'message' => 'started following you']);
        success([], 'Followed ' . ($target['username'] ?? ''));
    }

    public function unfollow(int $id): void {
        $auth = requireAuth();
        $this->users->unfollow($auth['user_id'], $id);
        success([], 'Unfollowed');
    }

    public function search(): void {
        $q = $_GET['q'] ?? '';
        if (strlen($q) < 2) error('Query too short');
        success($this->users->search($q));
    }
}

class PostController {
    private PostModel $posts;
    public function __construct() { $this->posts = new PostModel(); }

    public function feed(): void {
        $auth = requireAuth();
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = 20;
        $posts = $this->posts->feed($auth['user_id'], $limit, ($page-1)*$limit);
        success($posts);
    }

    public function explore(): void {
        $page = max(1, (int)($_GET['page'] ?? 1));
        success($this->posts->explore(20, ($page-1)*20));
    }

    public function create(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['content'])) error('Content is required');

        // Basic content moderation keywords
        $banned = ['spam','hate','violence'];
        foreach ($banned as $word) {
            if (stripos($data['content'], $word) !== false) {
                $data['is_flagged'] = 1;
            }
        }

        $data['user_id'] = $auth['user_id'];
        $id = $this->posts->create($data);
        (new ActivityLogModel())->log($auth['user_id'], 'created_post', "Post #$id");

        // Extract and save hashtags
        if (preg_match_all('/#([\w]+)/u', $data['content'], $matches)) {
            $db = getDB();
            foreach (array_unique($matches[1]) as $tag) {
                $tag = strtolower(substr($tag, 0, 80));
                $db->prepare("INSERT INTO hashtags (tag,post_count) VALUES (?,1) ON DUPLICATE KEY UPDATE post_count=post_count+1")->execute([$tag]);
                $hid = $db->query("SELECT id FROM hashtags WHERE tag=".json_encode($tag))->fetchColumn();
                if ($hid) $db->prepare("INSERT IGNORE INTO post_hashtags (post_id,hashtag_id) VALUES (?,?)")->execute([$id,$hid]);
            }
        }

        success($this->posts->findById($id), 'Post created');
    }

    public function like(int $id): void {
        $auth = requireAuth();
        $post = $this->posts->findById($id);
        if (!$post) error('Post not found', 404);
        $this->posts->like($id, $auth['user_id']);
        if ($post['user_id'] != $auth['user_id']) {
            (new NotificationModel())->create($post['user_id'], 'like', ['from_user' => $auth['user_id'], 'post_id' => $id]);
        }
        success([], 'Liked');
    }

    public function unlike(int $id): void {
        $auth = requireAuth();
        $this->posts->unlike($id, $auth['user_id']);
        success([], 'Unliked');
    }

    public function delete(int $id): void {
        $auth = requireAuth();
        if (!$this->posts->delete($id, $auth['user_id'])) error('Post not found or unauthorized', 404);
        success([], 'Deleted');
    }

    public function comments(int $id): void {
        success((new CommentModel())->forPost($id));
    }
}

class CommentController {
    private CommentModel $comments;
    public function __construct() { $this->comments = new CommentModel(); }

    public function create(int $postId): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['content'])) error('Content required');
        $id = $this->comments->create(['post_id'=>$postId,'user_id'=>$auth['user_id'],'content'=>$data['content']]);
        $post = (new PostModel())->findById($postId);
        if ($post && $post['user_id'] != $auth['user_id']) {
            (new NotificationModel())->create($post['user_id'], 'comment', ['from_user'=>$auth['user_id'],'post_id'=>$postId]);
        }
        success(['id'=>$id], 'Comment added');
    }

    public function delete(int $id): void {
        $auth = requireAuth();
        if (!$this->comments->delete($id, $auth['user_id'])) error('Not found', 404);
        success([], 'Deleted');
    }
}
