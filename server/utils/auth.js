const crypto = require('crypto');

// Secret is read at request time so .env changes (via dotenv-free simple loader) apply.
function getSecret() {
  return process.env.JWT_SECRET || 'sih92-dev-secret-change-me';
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
  } catch {
    return false;
  }
}

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(input) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4) input += '=';
  return Buffer.from(input, 'base64').toString('utf-8');
}

// Minimal signed-token implementation (HMAC-SHA256), same shape as a JWT but zero dependencies.
function signToken(payload, expiresInSeconds = 60 * 60 * 24 * 7) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + expiresInSeconds };
  const headerPart = base64url(JSON.stringify(header));
  const bodyPart = base64url(JSON.stringify(body));
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(`${headerPart}.${bodyPart}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${headerPart}.${bodyPart}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) return null;
  const [headerPart, bodyPart, signature] = token.split('.');
  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(`${headerPart}.${bodyPart}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  if (signature !== expected) return null;
  try {
    const body = JSON.parse(base64urlDecode(bodyPart));
    if (body.exp && Date.now() / 1000 > body.exp) return null;
    return body;
  } catch {
    return null;
  }
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
