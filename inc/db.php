<?php
declare(strict_types=1);

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dir = ROOT . '/data';
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }

    $pdo = new PDO('sqlite:' . $dir . '/kapi.sqlite', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA foreign_keys = ON');
    $pdo->exec('PRAGMA journal_mode = WAL');

    migrate($pdo);
    seed_menu($pdo);
    return $pdo;
}

function migrate(PDO $pdo): void
{
    $pdo->exec(<<<SQL
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price INTEGER NOT NULL,          -- centavos
            blurb TEXT NOT NULL,
            serve TEXT NOT NULL,
            tag TEXT,
            art TEXT NOT NULL,
            sort INTEGER NOT NULL DEFAULT 0,
            active INTEGER NOT NULL DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ref TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            order_type TEXT NOT NULL,
            notes TEXT,
            total INTEGER NOT NULL,          -- centavos
            status TEXT NOT NULL DEFAULT 'pending',   -- pending | paid | failed | fulfilled
            provider TEXT,
            provider_ref TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            paid_at TEXT
        );
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            qty INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            event_date TEXT NOT NULL,
            guests TEXT NOT NULL,
            contact TEXT NOT NULL,
            venue TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    SQL);
}

function seed_menu(PDO $pdo): void
{
    if ((int) $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn() > 0) {
        return;
    }

    $items = [
        ['kapi-migliore', 'Kapi Migliore', 'Specialty Drinks', 130, 'The house signature. Pulled espresso, velvety milk balance, and a sweet caramel and hazelnut warmth.', 'Hot or iced', 'Signature', 'latte'],
        ['kapi-alsaha', 'Kapi Alsaha', 'Specialty Drinks', 160, 'A tiramisu in a cup: Italian sponge, mascarpone velvet foam, and a dusting of cocoa over bold espresso.', 'Regular or large', 'Signature', 'tiramisu'],
        ['seasalt-matcha', 'Seasalt Matcha', 'Specialty Drinks', 155, 'Ceremonial-grade matcha crowned with a savory sea-salt cream cloud.', 'Iced', null, 'matcha'],
        ['honey-oat-latte', 'Honey Oat Latte', 'Specialty Drinks', 150, 'Smooth pulled espresso, pure golden honey, and micro-toasted oat milk.', 'Hot or iced', null, 'oat'],
        ['chef-paos-reuben', "Chef Pao's Reuben", 'Mahaw Bites', 220, 'Tender slow-cured beef brisket, melted Swiss, and tangy kraut, grilled on house sourdough.', 'Grilled to order', 'Signature', 'reuben'],
        ['pull-apart-melt', 'Pull-Apart Melt', 'Mahaw Bites', 180, 'A four-cheese blend toasted golden, with a crisp crust and our signature tomato relish.', 'Freshly griddled', null, 'melt'],
        ['blk-sandwich', 'BLK Sandwich', 'Mahaw Bites', 185, 'Smoked bacon, crisp lettuce, and ripe tomatoes on toasted brioche.', 'Toasted slices', null, 'blk'],
    ];

    $stmt = $pdo->prepare(
        'INSERT INTO products (slug, name, category, price, blurb, serve, tag, art, sort)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    foreach ($items as $i => $it) {
        $stmt->execute([$it[0], $it[1], $it[2], $it[3] * 100, $it[4], $it[5], $it[6], $it[7], $i]);
    }
}

function menu_items(): array
{
    return db()->query('SELECT * FROM products WHERE active = 1 ORDER BY sort')->fetchAll();
}

function find_order(string $ref): ?array
{
    $stmt = db()->prepare('SELECT * FROM orders WHERE ref = ?');
    $stmt->execute([$ref]);
    return $stmt->fetch() ?: null;
}

function order_items(int $orderId): array
{
    $stmt = db()->prepare('SELECT * FROM order_items WHERE order_id = ?');
    $stmt->execute([$orderId]);
    return $stmt->fetchAll();
}
