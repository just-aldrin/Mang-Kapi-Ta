<?php
declare(strict_types=1);

const ROOT = __DIR__ . '/..';

// Minimal .env loader (KEY=value per line, # comments).
(function (): void {
    $file = ROOT . '/.env';
    if (!is_file($file)) {
        return;
    }
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) {
            continue;
        }
        [$k, $v] = explode('=', $line, 2);
        $_ENV[trim($k)] = trim($v, "\"' \t");
    }
})();

function env(string $key, ?string $default = null): ?string
{
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return $_ENV[$key];
    }
    $v = getenv($key);
    return ($v !== false && $v !== '') ? $v : $default;
}

session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
session_start();

function e(mixed $s): string
{
    return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
}

/** Path of the project relative to the web root, e.g. "/Mang-Kapi-Ta". */
function base_path(): string
{
    static $base = null;
    if ($base !== null) {
        return $base;
    }
    $docRoot = str_replace('\\', '/', (string) realpath($_SERVER['DOCUMENT_ROOT'] ?? ''));
    $root = str_replace('\\', '/', (string) realpath(ROOT));
    $base = ($docRoot !== '' && str_starts_with($root, $docRoot)) ? substr($root, strlen($docRoot)) : '';
    return $base;
}

function url(string $path = ''): string
{
    return base_path() . '/' . ltrim($path, '/');
}

/** Absolute URL, used for payment-provider return URLs. Set APP_URL in production. */
function abs_url(string $path = ''): string
{
    $configured = env('APP_URL');
    if ($configured) {
        return rtrim($configured, '/') . '/' . ltrim($path, '/');
    }
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    return $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . url($path);
}

function peso(int $centavos): string
{
    $pesos = $centavos / 100;
    return "\u{20B1}" . number_format($pesos, floor($pesos) === $pesos ? 0 : 2);
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(24));
    }
    return $_SESSION['csrf'];
}

function csrf_valid(?string $token): bool
{
    return is_string($token) && $token !== '' && hash_equals($_SESSION['csrf'] ?? '', $token);
}

function json_out(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function redirect(string $to): never
{
    header('Location: ' . $to);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/payments.php';
require_once __DIR__ . '/art.php';
require_once __DIR__ . '/layout.php';
