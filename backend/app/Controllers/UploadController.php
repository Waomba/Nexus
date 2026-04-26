<?php
// NEXUS File Upload Handler
// Handles multipart form uploads for images and videos
// Called via POST /api/upload

class UploadController {
    private string $uploadBase;

    public function __construct() {
        $this->uploadBase = dirname(__DIR__, 2) . '/storage/uploads/';
    }

    public function upload(): void {
        $auth = requireAuth();

        if (empty($_FILES['file'])) {
            error('No file provided');
        }

        $file     = $_FILES['file'];
        $maxSize  = 50 * 1024 * 1024; // 50MB
        $type     = $file['type'];
        $size     = $file['size'];
        $tmpPath  = $file['tmp_name'];

        if ($size > $maxSize) {
            error('File too large. Maximum 50MB allowed.');
        }

        // Determine type
        $imageTypes = ['image/jpeg','image/png','image/gif','image/webp'];
        $videoTypes = ['video/mp4','video/webm','video/ogg','video/quicktime'];

        if (in_array($type, $imageTypes)) {
            $subDir   = 'images/';
            $mediaType = 'image';
        } elseif (in_array($type, $videoTypes)) {
            $subDir   = 'videos/';
            $mediaType = 'video';
        } else {
            error('Unsupported file type. Allowed: JPEG, PNG, GIF, WebP, MP4, WebM');
        }

        // Generate unique filename
        $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('nx_', true) . '_' . $auth['user_id'] . '.' . strtolower($ext);
        $destDir  = $this->uploadBase . $subDir;
        $destPath = $destDir . $filename;

        // Ensure directory exists
        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }

        if (!move_uploaded_file($tmpPath, $destPath)) {
            error('Upload failed — could not save file');
        }

        // Log activity
        (new ActivityLogModel())->log($auth['user_id'], 'uploaded_file', "$mediaType: $filename");

        $url = APP_URL . '/storage/' . $subDir . $filename;
        success([
            'url'        => $url,
            'filename'   => $filename,
            'media_type' => $mediaType,
            'size'       => $size,
        ], 'File uploaded successfully');
    }

    public function serveFile(string $subDir, string $filename): void {
        $path = $this->uploadBase . $subDir . '/' . $filename;

        if (!file_exists($path)) {
            http_response_code(404);
            echo json_encode(['error' => 'File not found']);
            exit();
        }

        // Guess MIME type
        $ext  = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
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
        header('Content-Length: ' . filesize($path));
        header('Cache-Control: public, max-age=2592000'); // 30 days
        header('Accept-Ranges: bytes');
        readfile($path);
        exit();
    }
}
