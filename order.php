<?php
declare(strict_types=1);
require __DIR__ . '/inc/bootstrap.php';

$ref = (string) ($_GET['ref'] ?? '');
$order = $ref !== '' ? find_order($ref) : null;
if (!$order || empty($_SESSION['orders'][$order['ref']])) {
    http_response_code(404);
    render_head('Order not found | Mang KAPI Ta');
    render_header();
    echo '<main id="main" class="page"><div class="wrap narrow"><div class="panel status-card"><h1>Order not found</h1><p>This order link is invalid, or it was opened in a different browser.</p><a class="btn btn-dark" href="' . e(url('')) . '">Back to the shop</a></div></div></main>';
    render_footer(false);
    exit;
}

$paid = in_array($order['status'], ['paid', 'fulfilled'], true);
$failed = $order['status'] === 'failed';
$items = order_items((int) $order['id']);

render_head(($paid ? 'Order confirmed' : 'Order') . ' | Mang KAPI Ta', 'page-order', $paid ? 'data-clear-cart="1"' : '');
render_header();
?>
<main id="main" class="page">
  <div class="wrap">
    <ol class="steps"><li class="done">1. Your details</li><li class="done">2. Pay with GCash</li><li class="on">3. Confirmation</li></ol>
    <div class="panel status-card">
      <?php if ($paid): ?>
        <div class="status-mark ok" aria-hidden="true">&#10003;</div>
        <h1>Payment received</h1>
        <p class="page-sub">Thank you, <?= e($order['name']) ?>. Your order is being prepared.</p>
      <?php elseif ($failed): ?>
        <div class="status-mark bad" aria-hidden="true">!</div>
        <h1>Payment not completed</h1>
        <p class="page-sub">The GCash payment was cancelled or did not go through. Nothing was charged.</p>
      <?php else: ?>
        <div class="status-mark wait" aria-hidden="true">&hellip;</div>
        <h1>Waiting for payment</h1>
        <p class="page-sub">We have not received confirmation from GCash yet. This page does not refresh itself; reload it in a moment.</p>
      <?php endif; ?>

      <div class="ref"><?= e($order['ref']) ?></div>

      <div class="receipt">
        <?php foreach ($items as $it): ?>
          <div class="summary-line"><span><?= (int) $it['qty'] ?> &times; <?= e($it['name']) ?></span><strong><?= e(peso((int) $it['price'] * (int) $it['qty'])) ?></strong></div>
        <?php endforeach; ?>
        <div class="summary-total"><span><?= $paid ? 'Total paid' : 'Total due' ?></span><strong><?= e(peso((int) $order['total'])) ?></strong></div>
      </div>

      <?php if ($paid): ?>
        <p class="fine">Collect at <?= e(brand('address1')) ?>, SM City Iloilo. Show this reference at the bar.</p>
        <a class="btn btn-dark" href="<?= e(url('#menu')) ?>">Order something else</a>
      <?php else: ?>
        <a class="btn btn-dark" href="<?= e(url('pay.php?ref=' . urlencode($order['ref']))) ?>"><?= $failed ? 'Try GCash again' : 'Back to payment' ?></a>
      <?php endif; ?>
    </div>
  </div>
</main>
<?php render_footer(); ?>
