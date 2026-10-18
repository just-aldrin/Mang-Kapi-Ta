<?php
declare(strict_types=1);
require __DIR__ . '/../inc/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['error' => 'Method not allowed.'], 405);
}
if (!csrf_valid($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null)) {
    json_out(['error' => 'Your session expired. Please refresh the page.'], 419);
}

$in = json_decode(file_get_contents('php://input') ?: '', true);
$email = trim((string) ($in['email'] ?? ''));
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 160) {
    json_out(['error' => 'Please enter a valid email address.'], 422);
}

db()->prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)')->execute([strtolower($email)]);
json_out(['ok' => true, 'message' => 'You are on the list. Thank you.']);
