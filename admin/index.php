<?php
declare(strict_types=1);
require __DIR__ . '/../inc/bootstrap.php';

/** Small staff view of orders and event inquiries. Disabled until ADMIN_PASSWORD is set in .env. */

$password = env('ADMIN_PASSWORD');
if (!$password) {
    http_response_code(404);
    exit('Admin is disabled. Set ADMIN_PASSWORD in .env to enable it.');
}

$error = null;
if (isset($_POST['logout'])) {
    unset($_SESSION['admin']);
    redirect(url('admin/'));
}
if (isset($_POST['password'])) {
    if (csrf_valid($_POST['csrf'] ?? null) && hash_equals($password, (string) $_POST['password'])) {
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        redirect(url('admin/'));
    }
    $error = 'Incorrect password.';
}

if (empty($_SESSION['admin'])) {
    render_head('Staff sign in | Mang KAPI Ta');
    ?>
    <main id="main" class="page"><div class="wrap narrow"><div class="panel">
      <h1>Staff sign in</h1>
      <?php if ($error): ?><div class="notice err"><?= e($error) ?></div><?php endif; ?>
      <form method="post">
        <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
        <label>Password<input type="password" name="password" required autofocus></label>
        <button class="btn btn-dark" type="submit">Sign in</button>
      </form>
    </div></div></main>
    <?php
    render_footer(false);
    exit;
}

if (isset($_POST['fulfil']) && csrf_valid($_POST['csrf'] ?? null)) {
    db()->prepare("UPDATE orders SET status = 'fulfilled' WHERE ref = ? AND status = 'paid'")->execute([(string) $_POST['fulfil']]);
    redirect(url('admin/'));
}

$orders = db()->query('SELECT * FROM orders ORDER BY id DESC LIMIT 100')->fetchAll();
$inquiries = db()->query('SELECT * FROM inquiries ORDER BY id DESC LIMIT 100')->fetchAll();

render_head('Staff | Mang KAPI Ta');
?>
<main id="main" class="page">
  <div class="wrap">
    <form method="post" style="float:right"><button class="btn btn-ghost" style="color:var(--forest);border-color:var(--forest)" name="logout" value="1">Sign out</button></form>
    <h1>Orders</h1>
    <p class="page-sub">Payments mode: <strong><?= e(payments_mode()) ?></strong></p>
    <div class="table-wrap"><table class="data">
      <tr><th>Ref</th><th>Customer</th><th>Total</th><th>Status</th><th>Created</th><th></th></tr>
      <?php foreach ($orders as $o): ?>
        <tr>
          <td><?= e($o['ref']) ?></td>
          <td><?= e($o['name']) ?><br><small><?= e($o['phone']) ?> &middot; <?= e($o['email']) ?></small></td>
          <td><?= e(peso((int) $o['total'])) ?></td>
          <td><span class="pill <?= e($o['status']) ?>"><?= e($o['status']) ?></span></td>
          <td><?= e($o['created_at']) ?></td>
          <td><?php if ($o['status'] === 'paid'): ?>
            <form method="post"><input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>"><button class="btn btn-dark" style="padding:8px 14px" name="fulfil" value="<?= e($o['ref']) ?>">Mark ready</button></form>
          <?php endif; ?></td>
        </tr>
      <?php endforeach; ?>
    </table></div>

    <h1 style="margin-top:48px">Cart inquiries</h1>
    <div class="table-wrap"><table class="data">
      <tr><th>Host</th><th>Date</th><th>Guests</th><th>Contact</th><th>Venue</th><th>Received</th></tr>
      <?php foreach ($inquiries as $q): ?>
        <tr><td><?= e($q['name']) ?></td><td><?= e($q['event_date']) ?></td><td><?= e($q['guests']) ?></td><td><?= e($q['contact']) ?></td><td><?= e($q['venue']) ?></td><td><?= e($q['created_at']) ?></td></tr>
      <?php endforeach; ?>
    </table></div>
  </div>
</main>
<?php render_footer(false); ?>
