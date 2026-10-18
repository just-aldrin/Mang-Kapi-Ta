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
$email = trim((string) ($in['email'] ?? ''));
$phone = preg_replace('/[\s-]+/', '', (string) ($in['phone'] ?? ''));
$type = in_array($in['order_type'] ?? '', ['pickup', 'dine-in'], true) ? $in['order_type'] : 'pickup';
$notes = mb_substr(trim((string) ($in['notes'] ?? '')), 0, 300);

if ($name === '' || mb_strlen($name) > 100) {
    json_out(['error' => 'Please enter your name.'], 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_out(['error' => 'Please enter a valid email address.'], 422);
}
// Philippine mobile: 09XXXXXXXXX or +639XXXXXXXXX
if (!preg_match('/^(?:\+63|0)9\d{9}$/', $phone)) {
    json_out(['error' => 'Please enter a valid mobile number, e.g. 0917 123 4567.'], 422);
}

$lines = $in['items'] ?? [];
if (!is_array($lines) || $lines === [] || count($lines) > 30) {
    json_out(['error' => 'Your order is empty.'], 422);
}

// Prices always come from the database, never from the browser.
$pdo = db();
$lookup = $pdo->prepare('SELECT id, name, price FROM products WHERE slug = ? AND active = 1');
$resolved = [];
$total = 0;
foreach ($lines as $line) {
    $slug = (string) ($line['slug'] ?? '');
    $qty = (int) ($line['qty'] ?? 0);
    if ($qty < 1 || $qty > 20) {
        json_out(['error' => 'Invalid quantity.'], 422);
    }
    $lookup->execute([$slug]);
    $p = $lookup->fetch();
    if (!$p) {
        json_out(['error' => 'An item in your order is no longer available.'], 422);
    }
    $resolved[] = [$p, $qty];
    $total += (int) $p['price'] * $qty;
}
if ($total < 2000) { // PayMongo GCash minimum is PHP 20
    json_out(['error' => 'The minimum order is ' . peso(2000) . '.'], 422);
}

$ref = 'KTA-' . strtoupper(bin2hex(random_bytes(5)));

$pdo->beginTransaction();
try {
    $pdo->prepare(
        'INSERT INTO orders (ref, name, phone, email, order_type, notes, total) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )->execute([$ref, $name, $phone, $email, $type, $notes, $total]);
    $orderId = (int) $pdo->lastInsertId();
    $ins = $pdo->prepare('INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?, ?, ?, ?, ?)');
    foreach ($resolved as [$p, $qty]) {
        $ins->execute([$orderId, $p['id'], $p['name'], $p['price'], $qty]);
    }
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    json_out(['error' => 'We could not save your order. Please try again.'], 500);
}

$_SESSION['orders'][$ref] = true; // this browser may view the order
json_out(['ok' => true, 'redirect' => url('pay.php?ref=' . urlencode($ref))]);
