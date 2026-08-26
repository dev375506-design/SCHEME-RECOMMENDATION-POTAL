/**
 * Vercel Serverless Function for PS-92 Marginalised Entrepreneurs Portal
 * This handler processes API requests and delegates to the existing route modules.
 * Static files are served by Vercel's public directory configuration.
 */

const url = require('url');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env if present
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

// Import route handlers (reuse existing backend modules)
const { sendJSON, readBody } = require('../server/utils/helpers');
const authRoutes = require('../server/routes/auth');
const entrepreneurRoutes = require('../server/routes/entrepreneurs');
const schemeRoutes = require('../server/routes/schemes');
const adminRoutes = require('../server/routes/admin');

/**
 * Vercel Serverless Handler
 * Handles all /api/* requests
 */
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  try {
    const parsed = url.parse(req.url, true);
    let { pathname, query } = parsed;
    const method = req.method;

    // Parse the request body for POST/PUT requests
    const body = ['POST', 'PUT'].includes(method) ? await readBody(req) : {};

    // Parse URL segments: /api/entrepreneurs/123 -> ['', 'api', 'entrepreneurs', '123']
    const segments = pathname.split('/').filter(Boolean); // ['api', 'entrepreneurs', '123']

    // Route handling (reuse existing route logic)

    // /api/auth/*
    if (segments[0] === 'auth') {
      if (method === 'POST' && segments[1] === 'register') return authRoutes.register(req, res, body);
      if (method === 'POST' && segments[1] === 'login') return authRoutes.login(req, res, body);
      if (method === 'GET' && segments[1] === 'me') return authRoutes.me(req, res);
    }

    // /api/entrepreneurs*
    if (segments[0] === 'entrepreneurs') {
      if (method === 'GET' && segments.length === 1) return entrepreneurRoutes.list(req, res, query);
      if (method === 'GET' && segments[1] === 'me') return entrepreneurRoutes.myProfile(req, res);
      if (method === 'GET' && segments.length === 2) return entrepreneurRoutes.getOne(req, res, segments[1]);
      if (method === 'POST' && segments.length === 1) return entrepreneurRoutes.create(req, res, body);
      if (method === 'PUT' && segments.length === 2) return entrepreneurRoutes.update(req, res, segments[1], body);
      if (method === 'DELETE' && segments.length === 2) return entrepreneurRoutes.remove(req, res, segments[1]);
      if (method === 'PUT' && segments[2] === 'verify') return entrepreneurRoutes.verify(req, res, segments[1], body);
    }

    // /api/schemes*
    if (segments[0] === 'schemes') {
      if (method === 'GET' && segments.length === 1) return schemeRoutes.list(req, res, query);
      if (method === 'GET' && segments.length === 2) return schemeRoutes.getOne(req, res, segments[1]);
      if (method === 'POST' && segments.length === 1) return schemeRoutes.create(req, res, body);
      if (method === 'PUT' && segments.length === 2) return schemeRoutes.update(req, res, segments[1], body);
      if (method === 'DELETE' && segments.length === 2) return schemeRoutes.remove(req, res, segments[1]);
    }

    // /api/admin/stats
    if (segments[0] === 'admin' && segments[1] === 'stats' && method === 'GET') {
      return adminRoutes.stats(req, res);
    }

    // No route matched
    return sendJSON(res, 404, { error: 'API route not found.' });

  } catch (e) {
    console.error('[API Error]', e);
    return sendJSON(res, 500, { error: 'Internal server error.' });
  }
};
