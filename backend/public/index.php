<?php
// ══════════════════════════════════════════════
//  NEXUS Platform — Entry Point v2
// ══════════════════════════════════════════════

// ── Serve static storage files (uploaded media) ──────────────
$requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (str_starts_with($requestPath, '/storage/')) {
    $relativePath = substr($requestPath, strlen('/storage/'));
    $filePath = dirname(__DIR__) . '/storage/uploads/' . $relativePath;
    if (file_exists($filePath) && is_file($filePath)) {
        $ext  = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mime = match($ext) {
            'jpg','jpeg' => 'image/jpeg',
            'png'        => 'image/png',
            'gif'        => 'image/gif',
            'webp'       => 'image/webp',
            'mp4'        => 'video/mp4',
            'webm'       => 'video/webm',
            'ogg'        => 'video/ogg',
            'mov'        => 'video/quicktime',
            default      => 'application/octet-stream',
        };
        header("Content-Type: $mime");
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: public, max-age=2592000');
        header('Accept-Ranges: bytes');
        readfile($filePath);
        exit();
    }
    http_response_code(404);
    echo json_encode(['error' => 'File not found']);
    exit();
}

// ── CORS ──────────────────────────────────────────────────────
$allowedOrigins = ['http://localhost:5173','http://localhost:3000','http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowedOrigins) ? $origin : 'http://localhost:5173'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// ── Core ──────────────────────────────────────────────────────
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Helpers/Response.php';
require_once __DIR__ . '/../app/Helpers/Auth.php';

// ── Models ────────────────────────────────────────────────────
require_once __DIR__ . '/../app/Models/User.php';
require_once __DIR__ . '/../app/Models/Post.php';
require_once __DIR__ . '/../app/Models/Comment.php';
require_once __DIR__ . '/../app/Models/Message.php';
require_once __DIR__ . '/../app/Models/Video.php';
require_once __DIR__ . '/../app/Models/Task.php';
require_once __DIR__ . '/../app/Models/Report.php';
require_once __DIR__ . '/../app/Models/Notification.php';
require_once __DIR__ . '/../app/Models/ActivityLog.php'; // + ParentChildModel + ScreenTimeModel
require_once __DIR__ . '/../app/Models/Story.php';

// ── Controllers ───────────────────────────────────────────────
require_once __DIR__ . '/../app/Controllers/AuthController.php';
require_once __DIR__ . '/../app/Controllers/UserController.php';   // + PostController + CommentController
require_once __DIR__ . '/../app/Controllers/MessageController.php';
require_once __DIR__ . '/../app/Controllers/VideoController.php';
require_once __DIR__ . '/../app/Controllers/TaskController.php';
require_once __DIR__ . '/../app/Controllers/NotificationController.php'; // + ReportController
require_once __DIR__ . '/../app/Controllers/AdminController.php';
require_once __DIR__ . '/../app/Controllers/ParentalController.php';
require_once __DIR__ . '/../app/Controllers/UploadController.php';
require_once __DIR__ . '/../app/Controllers/SearchController.php';
require_once __DIR__ . '/../app/Controllers/ReputationController.php';
require_once __DIR__ . '/../app/Controllers/StoryController.php';
require_once __DIR__ . '/../app/Controllers/BookmarkController.php';
require_once __DIR__ . '/../app/Controllers/HashtagController.php';
require_once __DIR__ . '/../app/Controllers/EventController.php';
require_once __DIR__ . '/../app/Controllers/PollController.php';
require_once __DIR__ . '/../app/Controllers/ReactionController.php'; // + RepostController + GroupController + ThemeController + ProfileViewController

// ── Router ────────────────────────────────────────────────────
require_once __DIR__ . '/../app/Controllers/NewControllers.php'; // Privacy, Sessions, Friends, SavedMessages, Archive, NotifPrefs, Appearance, Trust
require_once __DIR__ . '/../routes/api.php';
