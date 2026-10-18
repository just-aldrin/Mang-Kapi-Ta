<?php
declare(strict_types=1);

/**
 * GCash payments.
 *
 * Live mode  : PayMongo (a licensed Philippine payment gateway) creates the GCash checkout.
 *              Enabled when PAYMONGO_SECRET_KEY is set in .env.
 * Sandbox    : With no key, a built-in simulator stands in for the GCash screens so the whole
 *              storefront flow can be tested end to end. It never moves real money.
 */

function payments_mode(): string
{
    return env('PAYMONGO_SECRET_KEY') ? 'live' : 'sandbox';
}

function paymongo(string $method, string $path, ?array $body = null): array
{
    $ch = curl_init('https://api.paymongo.com/v1' . $path);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 25,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode(env('PAYMONGO_SECRET_KEY', '') . ':'),
        ],
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['data' => ['attributes' => $body]]));
    }
    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($raw === false) {
        throw new RuntimeException('Payment gateway unreachable: ' . $err);
    }
    $json = json_decode($raw, true) ?: [];
    if ($status >= 400) {
        $detail = $json['errors'][0]['detail'] ?? 'Payment gateway error';
        throw new RuntimeException($detail);
    }
    return $json['data'] ?? [];
}

/** Starts a GCash payment and returns the URL the customer should be sent to. */
function gcash_start(array $order): string
{
    if (payments_mode() === 'sandbox') {
        $stmt = db()->prepare("UPDATE orders SET provider = 'sandbox' WHERE ref = ?");
        $stmt->execute([$order['ref']]);
        return url('payment/sandbox.php?ref=' . urlencode($order['ref']));
    }

    $intent = paymongo('POST', '/payment_intents', [
        'amount' => (int) $order['total'],
        'currency' => 'PHP',
        'payment_method_allowed' => ['gcash'],
        'capture_type' => 'automatic',
        'description' => 'Mang KAPI Ta order ' . $order['ref'],
        'statement_descriptor' => 'MANG KAPI TA',
        'metadata' => ['order_ref' => $order['ref']],
    ]);

    $method = paymongo('POST', '/payment_methods', [
        'type' => 'gcash',
        'billing' => [
            'name' => $order['name'],
            'email' => $order['email'],
            'phone' => $order['phone'],
        ],
    ]);

    $attached = paymongo('POST', '/payment_intents/' . $intent['id'] . '/attach', [
        'payment_method' => $method['id'],
        'client_key' => $intent['attributes']['client_key'],
        'return_url' => abs_url('payment/return.php?ref=' . urlencode($order['ref'])),
    ]);

    $redirect = $attached['attributes']['next_action']['redirect']['url'] ?? null;
    if (!$redirect) {
        throw new RuntimeException('GCash did not return a checkout link. Please try again.');
    }

    $stmt = db()->prepare("UPDATE orders SET provider = 'paymongo', provider_ref = ? WHERE ref = ?");
    $stmt->execute([$intent['id'], $order['ref']]);
    return $redirect;
}

/** Asks the gateway for the real payment status and updates the order. Returns the new status. */
function gcash_verify(array $order): string
{
    if ($order['status'] === 'paid' || $order['status'] === 'fulfilled') {
        return $order['status'];
    }
    if ($order['provider'] !== 'paymongo' || !$order['provider_ref']) {
        return $order['status'];
    }

    $intent = paymongo('GET', '/payment_intents/' . $order['provider_ref']);
    $status = $intent['attributes']['status'] ?? '';

    if ($status === 'succeeded') {
        order_mark_paid($order['ref']);
        return 'paid';
    }
    if ($status === 'awaiting_payment_method') {
        // The customer came back without authorizing the payment.
        order_set_status($order['ref'], 'failed');
        return 'failed';
    }
    return $order['status'];
}

function order_mark_paid(string $ref): void
{
    $stmt = db()->prepare(
        "UPDATE orders SET status = 'paid', paid_at = CURRENT_TIMESTAMP
         WHERE ref = ? AND status IN ('pending', 'failed')"
    );
    $stmt->execute([$ref]);
}

function order_set_status(string $ref, string $status): void
{
    $stmt = db()->prepare("UPDATE orders SET status = ? WHERE ref = ? AND status IN ('pending', 'failed')");
    $stmt->execute([$status, $ref]);
}

/** Verifies a PayMongo webhook signature (t=timestamp,te=test sig,li=live sig). */
function paymongo_signature_valid(string $payload, string $header, string $secret): bool
{
    $parts = [];
    foreach (explode(',', $header) as $piece) {
        [$k, $v] = array_pad(explode('=', trim($piece), 2), 2, '');
        $parts[$k] = $v;
    }
    if (empty($parts['t'])) {
        return false;
    }
    $expected = hash_hmac('sha256', $parts['t'] . '.' . $payload, $secret);
    foreach (['te', 'li'] as $key) {
        if (!empty($parts[$key]) && hash_equals($expected, $parts[$key])) {
            return true;
        }
    }
    return false;
}
