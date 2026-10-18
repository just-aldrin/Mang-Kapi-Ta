<?php
declare(strict_types=1);
require __DIR__ . '/inc/bootstrap.php';

/** Payment portal: shows the order, then hands the customer to GCash. */

$ref = (string) ($_GET['ref'] ?? $_POST['ref'] ?? '');
$order = $ref !== '' ? find_order($ref) : null;
if (!$order || empty($_SESSION['orders'][$order['ref']])) {
    http_response_code(404);
    render_head('Order not found | Mang KAPI Ta');
    render_header();
    echo '<main id="main" class="page"><div class="wrap narrow"><div class="panel status-card"><h1>Order not found</h1><p>This payment link is invalid or has expired.</p><a class="btn btn-dark" href="' . e(url('')) . '">Back to the shop</a></div></div></main>';
    render_footer(false);
    exit;
}

if (in_array($order['status'], ['paid', 'fulfilled'], true)) {
    redirect(url('order.php?ref=' . urlencode($order['ref'])));
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_valid($_POST['csrf'] ?? null)) {
        $error = 'Your session expired. Please try again.';
    } else {
        try {
            redirect(gcash_start($order));
        } catch (Throwable $e) {
            $error = $e->getMessage();
        }
    }
}

$items = order_items((int) $order['id']);

render_head('Pay with GCash | Mang KAPI Ta', 'page-pay');
render_header();
?>
<main id="main" class="page">
  <div class="wrap">
    <ol class="steps"><li class="done">1. Your details</li><li class="on">2. Pay with GCash</li><li>3. Confirmation</li></ol>
    <h1>Pay with GCash</h1>
    <p class="page-sub">Order <strong><?= e($order['ref']) ?></strong> for <?= e($order['name']) ?>.</p>

    <div class="checkout-grid">
      <div class="panel">
        <h2>Order summary</h2>
        <?php foreach ($items as $it): ?>
          <div class="summary-line"><span><?= (int) $it['qty'] ?> &times; <?= e($it['name']) ?></span><strong><?= e(peso((int) $it['price'] * (int) $it['qty'])) ?></strong></div>
        <?php endforeach; ?>
        <div class="summary-total"><span>Total due</span><strong><?= e(peso((int) $order['total'])) ?></strong></div>
        <p class="fine" style="margin-top:14px">Collect at <?= e(brand('address1')) ?>, SM City Iloilo. Show your order reference at the bar.</p>
      </div>

      <div class="panel">
        <h2>Payment</h2>
        <div class="pay-methods">
          <div class="pay-method"><span class="gcash-badge">GCash</span><span>You will be redirected to GCash to approve <?= e(peso((int) $order['total'])) ?>.</span></div>
        </div>
        <?php if (payments_mode() === 'sandbox'): ?>
          <div class="notice"><strong>Test mode.</strong> No payment key is configured, so you will see a simulated GCash screen. No real money moves.</div>
        <?php endif; ?>
        <?php if ($error): ?><div class="notice err" role="alert"><?= e($error) ?></div><?php endif; ?>
        <form method="post">
          <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
          <input type="hidden" name="ref" value="<?= e($order['ref']) ?>">
          <button class="btn btn-dark btn-block" type="submit">Pay <?= e(peso((int) $order['total'])) ?> with GCash</button>
        </form>
        <p class="fine" style="margin-top:14px;text-align:center">Your card or wallet details are never stored on this site.</p>
      </div>
    </div>
  </div>
</main>
<?php render_footer(); ?>
