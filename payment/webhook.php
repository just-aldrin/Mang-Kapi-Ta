<?php
declare(strict_types=1);
require __DIR__ . '/../inc/bootstrap.php';

/**
 * PayMongo webhook. Register https://YOUR-DOMAIN/payment/webhook.php for the "payment.paid"
 * event and put the webhook secret in .env as PAYMONGO_WEBHOOK_SECRET.
 */

$secret = env('PAYMONGO_WEBHOOK_SECRET');
if (!$secret) {
    http_response_code(503);
    exit('Webhook not configured');
}

$payload = file_get_contents('php://input') ?: '';
if (!paymongo_signature_valid($payload, $_SERVER['HTTP_PAYMONGO_SIGNATURE'] ?? '', $secret)) {
    http_response_code(400);
    exit('Invalid signature');
}

$event = json_decode($payload, true);
$type = $event['data']['attributes']['type'] ?? '';
if ($type === 'payment.paid') {
    $payment = $event['data']['attributes']['data']['attributes'] ?? [];
    $intentId = $payment['payment_intent_id'] ?? '';
    if ($intentId !== '') {
        $stmt = db()->prepare("SELECT ref, total FROM orders WHERE provider = 'paymongo' AND provider_ref = ?");
        $stmt->execute([$intentId]);
        $order = $stmt->fetch();
        // Only accept the payment if the paid amount matches the order total.
        if ($order && (int) ($payment['amount'] ?? 0) === (int) $order['total']) {
            order_mark_paid($order['ref']);
        }
    }
}

http_response_code(200);
echo 'ok';
