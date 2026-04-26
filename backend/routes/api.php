<?php
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/') ?: '/';
$uri    = preg_replace('#^/api#', '', $uri);
$uri    = ($uri === '' || $uri === null) ? '/' : $uri;

function route(string $m, string $pattern, callable $handler): void {
    global $method, $uri;
    $regex = '#^' . preg_replace('#\{(\w+)\}#', '(\d+)', $pattern) . '$#';
    if ($method === $m && preg_match($regex, $uri, $matches)) {
        array_shift($matches);
        $handler(...array_map('intval', $matches));
        exit();
    }
}

// Root — catches GET / from browsers
route('GET',  '/', fn() => respond(['platform'=>'NEXUS','version'=>'2.0','status'=>'ok','docs'=>'/api/health']));

// Health
route('GET',  '/health', fn() => respond(['status'=>'ok','platform'=>'NEXUS','version'=>'2.0.0','time'=>date('c')]));

// Auth
route('POST', '/auth/register',         fn() => (new AuthController())->register());
route('POST', '/auth/login',            fn() => (new AuthController())->login());
route('POST', '/auth/verify-2fa',       fn() => (new AuthController())->verify2FA());
route('POST', '/auth/admin-login',      fn() => (new AuthController())->adminLogin());
route('GET',  '/auth/me',               fn() => (new AuthController())->me());
route('POST', '/auth/change-password',  fn() => (new AuthController())->changePassword());
route('POST', '/auth/update-avatar',    fn() => (new AuthController())->updateAvatar());
route('POST', '/auth/toggle-2fa',       fn() => (new AuthController())->toggle2FA());

// Users — fixed before {id}
route('GET',  '/users/search',          fn() => (new UserController())->search());
route('PUT',  '/users/me',              fn() => (new UserController())->update());
route('GET',  '/users/{id}',            fn(int $id) => (new UserController())->profile($id));
route('POST', '/users/{id}/follow',     fn(int $id) => (new UserController())->follow($id));
route('POST', '/users/{id}/unfollow',   fn(int $id) => (new UserController())->unfollow($id));

// Posts — fixed before {id}
route('GET',  '/posts/feed',            fn() => (new PostController())->feed());
route('GET',  '/posts/explore',         fn() => (new PostController())->explore());
route('POST', '/posts',                 fn() => (new PostController())->create());
route('GET',  '/posts/{id}/comments',   fn(int $id) => (new PostController())->comments($id));
route('POST', '/posts/{id}/comments',   fn(int $id) => (new CommentController())->create($id));
route('POST', '/posts/{id}/like',       fn(int $id) => (new PostController())->like($id));
route('POST', '/posts/{id}/unlike',     fn(int $id) => (new PostController())->unlike($id));
route('DELETE','/posts/{id}',           fn(int $id) => (new PostController())->delete($id));
route('DELETE','/comments/{id}',        fn(int $id) => (new CommentController())->delete($id));

// Messages
route('GET',  '/messages',              fn() => (new MessageController())->conversations());
route('POST', '/messages',              fn() => (new MessageController())->send());
route('GET',  '/messages/{id}',         fn(int $id) => (new MessageController())->conversation($id));

// Videos
route('GET',  '/videos',               fn() => (new VideoController())->index());
route('POST', '/videos',               fn() => (new VideoController())->create());
route('GET',  '/videos/{id}',          fn(int $id) => (new VideoController())->show($id));

// Tasks — fixed before {id}
route('GET',  '/tasks/mine',           fn() => (new TaskController())->myTasks());
route('GET',  '/tasks',                fn() => (new TaskController())->index());
route('POST', '/tasks',                fn() => (new TaskController())->create());
route('GET',  '/tasks/{id}',           fn(int $id) => (new TaskController())->show($id));
route('PUT',  '/tasks/{id}/status',    fn(int $id) => (new TaskController())->updateStatus($id));

// Reports
route('POST', '/reports',              fn() => (new ReportController())->create());

// Notifications — fixed before bare route
route('GET',  '/notifications/count',  fn() => (new NotificationController())->unreadCount());
route('POST', '/notifications/read',   fn() => (new NotificationController())->markRead());
route('GET',  '/notifications',        fn() => (new NotificationController())->index());

// Upload & Search
route('POST', '/upload',               fn() => (new UploadController())->upload());
route('GET',  '/search',               fn() => (new SearchController())->search());

// Reputation
route('GET',  '/reputation/leaderboard', fn() => (new ReputationController())->leaderboard());
route('GET',  '/reputation/me',          fn() => (new ReputationController())->myScore());

// Stories — fixed before {id}
route('GET',  '/stories/feed',         fn() => (new StoryController())->feed());
route('GET',  '/stories/mine',         fn() => (new StoryController())->mine());
route('POST', '/stories',              fn() => (new StoryController())->create());
route('POST', '/stories/{id}/view',    fn(int $id) => (new StoryController())->view($id));
route('DELETE','/stories/{id}',        fn(int $id) => (new StoryController())->delete($id));

// Bookmarks
route('POST', '/bookmarks/toggle',     fn() => (new BookmarkController())->toggle());
route('GET',  '/bookmarks',            fn() => (new BookmarkController())->list());

// Hashtags
route('GET',  '/hashtags/trending',    fn() => (new HashtagController())->trending());
route('GET',  '/hashtags/posts',       fn() => (new HashtagController())->posts());

// Events — fixed before {id}
route('GET',  '/events',               fn() => (new EventController())->index());
route('POST', '/events',               fn() => (new EventController())->create());
route('GET',  '/events/{id}',          fn(int $id) => (new EventController())->show($id));
route('POST', '/events/{id}/rsvp',     fn(int $id) => (new EventController())->rsvp($id));

// Parental — fixed before {id}
route('GET',  '/parental/screen-time/status',     fn() => (new ParentalController())->screenTimeStatus());
route('POST', '/parental/screen-time/track',      fn() => (new ParentalController())->trackUsage());
route('POST', '/parental/screen-time',            fn() => (new ParentalController())->setScreenTime());
route('GET',  '/parental/children',               fn() => (new ParentalController())->children());
route('GET',  '/parental/children/{id}/activity', fn(int $id) => (new ParentalController())->childActivity($id));
route('POST', '/parental/link',                   fn() => (new ParentalController())->linkChild());

// Admin — fixed before {id}
route('GET',  '/admin/dashboard',          fn() => (new AdminController())->dashboard());
route('GET',  '/admin/flagged/posts',      fn() => (new AdminController())->flaggedPosts());
route('GET',  '/admin/flagged/videos',     fn() => (new AdminController())->flaggedVideos());
route('GET',  '/admin/flagged/tasks',      fn() => (new AdminController())->flaggedTasks());
route('GET',  '/admin/logs',               fn() => (new AdminController())->activityLogs());
route('GET',  '/admin/users',              fn() => (new AdminController())->users());
route('GET',  '/admin/reports',            fn() => (new AdminController())->reports());
route('POST', '/admin/users/{id}/ban',     fn(int $id) => (new AdminController())->banUser($id));
route('POST', '/admin/users/{id}/unban',   fn(int $id) => (new AdminController())->unbanUser($id));
route('PUT',  '/admin/reports/{id}',       fn(int $id) => (new AdminController())->resolveReport($id));
route('DELETE','/admin/posts/{id}',        fn(int $id) => (new AdminController())->deletePost($id));
route('DELETE','/admin/videos/{id}',       fn(int $id) => (new AdminController())->deleteVideo($id));
route('DELETE','/admin/tasks/{id}',        fn(int $id) => (new AdminController())->deleteTask($id));

// 404
error("Route not found: $method $uri", 404);

// ── Polls ──────────────────────────────────────────────────────
route('POST', '/polls',                  fn() => (new PollController())->create());
route('POST', '/polls/{id}/vote',        fn(int $id) => (new PollController())->vote($id));
route('GET',  '/polls/{id}',             fn(int $id) => (new PollController())->results($id));

// ── Reactions ─────────────────────────────────────────────────
route('POST', '/posts/{id}/react',       fn(int $id) => (new ReactionController())->react($id));
route('GET',  '/posts/{id}/reactions',   fn(int $id) => (new ReactionController())->forPost($id));

// ── Reposts ───────────────────────────────────────────────────
route('POST', '/reposts',                fn() => (new RepostController())->repost());
route('POST', '/reposts/quote',          fn() => (new RepostController())->quotePost());

// ── Groups ────────────────────────────────────────────────────
route('GET',  '/groups',                 fn() => (new GroupController())->index());
route('POST', '/groups',                 fn() => (new GroupController())->create());
route('GET',  '/groups/mine',            fn() => (new GroupController())->myGroups());
route('GET',  '/groups/{id}',            fn(int $id) => (new GroupController())->show($id));
route('POST', '/groups/{id}/join',       fn(int $id) => (new GroupController())->join($id));

// ── Theme ─────────────────────────────────────────────────────
route('POST', '/theme',                  fn() => (new ThemeController())->set());
route('GET',  '/theme',                  fn() => (new ThemeController())->get());

// ── Profile views ─────────────────────────────────────────────
route('POST', '/profile-views/{id}',     fn(int $id) => (new ProfileViewController())->track($id));
route('GET',  '/profile-views/{id}',     fn(int $id) => (new ProfileViewController())->viewers($id));

// ── Privacy settings ────────────────────────────────────────
route('GET',  '/privacy',                    fn() => (new PrivacyController())->get());
route('PUT',  '/privacy',                    fn() => (new PrivacyController())->update());
route('POST', '/block',                      fn() => (new PrivacyController())->block());
route('DELETE','/block/{id}',               fn(int $id) => (new PrivacyController())->unblock($id));
route('GET',  '/blocked',                    fn() => (new PrivacyController())->blocked());

// ── Sessions ────────────────────────────────────────────────
route('GET',  '/sessions',                   fn() => (new SessionController())->list());
route('DELETE','/sessions/{id}',            fn(int $id) => (new SessionController())->revoke($id));
route('DELETE','/sessions',                  fn() => (new SessionController())->revokeAll());

// ── Friends ─────────────────────────────────────────────────
route('GET',  '/friends',                    fn() => (new FriendController())->list());
route('GET',  '/friends/suggestions',        fn() => (new FriendController())->suggestions());

// ── Saved messages ──────────────────────────────────────────
route('GET',  '/saved-messages',             fn() => (new SavedMessageController())->list());
route('POST', '/saved-messages',             fn() => (new SavedMessageController())->save());
route('DELETE','/saved-messages/{id}',      fn(int $id) => (new SavedMessageController())->delete($id));

// ── Archived conversations ──────────────────────────────────
route('GET',  '/messages/archived',          fn() => (new ArchiveController())->list());
route('POST', '/messages/{id}/archive',      fn(int $id) => (new ArchiveController())->toggle($id));

// ── Notification prefs ──────────────────────────────────────
route('GET',  '/notification-prefs',         fn() => (new NotifPrefController())->get());
route('PUT',  '/notification-prefs',         fn() => (new NotifPrefController())->update());

// ── Appearance prefs ────────────────────────────────────────
route('GET',  '/appearance',                 fn() => (new AppearanceController())->get());
route('PUT',  '/appearance',                 fn() => (new AppearanceController())->update());

// ── Trust score history ─────────────────────────────────────
route('GET',  '/trust/history',              fn() => (new TrustController())->history());
route('GET',  '/trust/stats',                fn() => (new TrustController())->stats());

// ── SuperGroups ─────────────────────────────────────────────
route('PUT',  '/groups/{id}/members/{uid}/role', fn(int $id, int $uid) => groupSetRole($id, $uid));
route('GET',  '/groups/{id}/channels',       fn(int $id) => groupChannels($id));
route('POST', '/groups/{id}/channels',       fn(int $id) => groupCreateChannel($id));
route('POST', '/groups/{id}/voice',          fn(int $id) => groupVoice($id));
