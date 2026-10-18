// Tiny local server that mimics Vercel: serves public/ with clean URLs and runs api/*.js handlers.
// Run `npm run dev`. With no SUPABASE_* variables it uses an in-memory store (data is lost on restart).
import http from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const port = Number(process.env.PORT || 3000);

// Load .env for local development (Vercel injects real environment variables in production).
const envFile = join(root, '.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && m[2] && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.json': 'application/json',
};

http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname.startsWith('/api/')) {
    const name = pathname.slice(5).replace(/[^a-z-]/g, '');
    const file = join(root, 'api', `${name}.js`);
    if (!name || !existsSync(file)) { res.statusCode = 404; return res.end('Not found'); }
    try {
      const mod = await import(pathToFileURL(file).href);
      return await mod.default(req, res);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      return res.end('Server error');
    }
  }

  let file = normalize(join(pub, pathname));
  if (!file.startsWith(pub)) { res.statusCode = 403; return res.end(); }
  if (!existsSync(file) || statSync(file).isDirectory()) {
    const clean = join(pub, pathname === '/' ? 'index.html' : `${pathname}.html`);
    file = existsSync(clean) ? clean : join(pub, '404.html');
    if (file.endsWith('404.html')) res.statusCode = 404;
  }
  res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
  res.end(readFileSync(file));
}).listen(port, () => console.log(`Mang Kapi Ta running at http://localhost:${port}`));
