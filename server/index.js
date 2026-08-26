const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const { sendJSON, readBody } = require('./utils/helpers');
const authRoutes = require('./routes/auth');
const entrepreneurRoutes = require('./routes/entrepreneurs');
const schemeRoutes = require('./routes/schemes');
const adminRoutes = require('./routes/admin');

// --- minimal .env loader (no dotenv dependency) ---
(function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    });
})();

const PORT = process.env.PORT || 5000;
const CLIENT_DIR = path.join(__dirname, '..', 'client', 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res, pathname) {
  let filePath = path.join(CLIENT_DIR, pathname === '/' ? 'index.html' : pathname);

  // Prevent path traversal
  if (!filePath.startsWith(CLIENT_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // SPA-friendly fallback: unknown /something -> try /something.html, else 404
      const withHtml = `${filePath}.html`;
      if (fs.existsSync(withHtml)) {
        return streamFile(withHtml, res);
      }
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end('<h1>404 - Page not found</h1><a href="/">Go home</a>');
    }
    streamFile(filePath, res);
  });
}

function streamFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const { pathname, query } = parsed;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  if (!pathname.startsWith('/api/')) {
    return serveStatic(req, res, pathname);
  }

  try {
    const segments = pathname.split('/').filter(Boolean); // ['api', 'entrepreneurs', ':id']
    const body = ['POST', 'PUT'].includes(method) ? await readBody(req) : {};

    // /api/auth/*
    if (segments[1] === 'auth') {
      if (method === 'POST' && segments[2] === 'register') return authRoutes.register(req, res, body);
      if (method === 'POST' && segments[2] === 'login') return authRoutes.login(req, res, body);
      if (method === 'GET' && segments[2] === 'me') return authRoutes.me(req, res);
    }

    // /api/entrepreneurs*
    if (segments[1] === 'entrepreneurs') {
      if (method === 'GET' && segments.length === 2) return entrepreneurRoutes.list(req, res, query);
      if (method === 'GET' && segments[2] === 'me') return entrepreneurRoutes.myProfile(req, res);
      if (method === 'GET' && segments.length === 3) return entrepreneurRoutes.getOne(req, res, segments[2]);
      if (method === 'POST' && segments.length === 2) return entrepreneurRoutes.create(req, res, body);
      if (method === 'PUT' && segments.length === 3) return entrepreneurRoutes.update(req, res, segments[2], body);
      if (method === 'DELETE' && segments.length === 3) return entrepreneurRoutes.remove(req, res, segments[2]);
      if (method === 'PUT' && segments[3] === 'verify') return entrepreneurRoutes.verify(req, res, segments[2], body);
    }

    // /api/schemes*
    if (segments[1] === 'schemes') {
      if (method === 'GET' && segments.length === 2) return schemeRoutes.list(req, res, query);
      if (method === 'GET' && segments.length === 3) return schemeRoutes.getOne(req, res, segments[2]);
      if (method === 'POST' && segments.length === 2) return schemeRoutes.create(req, res, body);
      if (method === 'PUT' && segments.length === 3) return schemeRoutes.update(req, res, segments[2], body);
      if (method === 'DELETE' && segments.length === 3) return schemeRoutes.remove(req, res, segments[2]);
    }

    // /api/admin/stats
    if (segments[1] === 'admin' && segments[2] === 'stats' && method === 'GET') {
      return adminRoutes.stats(req, res);
    }

    return sendJSON(res, 404, { error: 'API route not found.' });
  } catch (e) {
    console.error(e);
    return sendJSON(res, 500, { error: 'Internal server error.' });
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Marginalised Entrepreneurs Portal API running at http://localhost:${PORT}`);
  console.log(`   Frontend served from the same server — open http://localhost:${PORT} in your browser.\n`);
});
