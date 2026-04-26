<?php
function respond(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

function error(string $message, int $code = 400): void {
    respond(['error' => $message], $code);
}

function success(mixed $data = [], string $message = 'Success'): void {
    respond(['message' => $message, 'data' => $data]);
}
