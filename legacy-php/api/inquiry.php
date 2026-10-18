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
if (!is_array($in)) {
    json_out(['error' => 'Invalid request.'], 400);
}

$name = trim((string) ($in['name'] ?? ''));
$date = trim((string) ($in['event_date'] ?? ''));
$guests = trim((string) ($in['guests'] ?? ''));
$contact = trim((string) ($in['contact'] ?? ''));
$venue = trim((string) ($in['venue'] ?? ''));

$d = DateTime::createFromFormat('Y-m-d', $date);
if ($name === '' || $contact === '' || $venue === '' || $guests === '') {
    json_out(['error' => 'Please complete every field.'], 422);
}
if (!$d || $d->format('Y-m-d') !== $date || $d < new DateTime('today')) {
    json_out(['error' => 'Please choose a valid upcoming date.'], 422);
}
$isEmail = filter_var($contact, FILTER_VALIDATE_EMAIL);
$isPhone = preg_match('/^(?:\+63|0)9\d{9}$/', preg_replace('/[\s-]+/', '', $contact));
if (!$isEmail && !$isPhone) {
    json_out(['error' => 'Enter a valid email or Philippine mobile number.'], 422);
}

db()->prepare('INSERT INTO inquiries (name, event_date, guests, contact, venue) VALUES (?, ?, ?, ?, ?)')
    ->execute([mb_substr($name, 0, 120), $date, mb_substr($guests, 0, 40), mb_substr($contact, 0, 120), mb_substr($venue, 0, 160)]);

json_out(['ok' => true, 'message' => 'Thank you. We have your date and will reach out within one business day.']);
