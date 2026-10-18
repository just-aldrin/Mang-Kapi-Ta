<?php
declare(strict_types=1);
require __DIR__ . '/../inc/bootstrap.php';

/** GCash sends the customer back here. We never trust the URL: we ask the gateway for the real status. */

$ref = (string) ($_GET['ref'] ?? '');
$order = $ref !== '' ? find_order($ref) : null;
if (!$order) {
    redirect(url(''));
}

try {
    gcash_verify($order);
} catch (Throwable $e) {
    // Fall through: the order page shows the stored status and the webhook may still confirm it.
}
redirect(url('order.php?ref=' . urlencode($order['ref'])));
