const { collection } = require('../db');
const { hashPassword, verifyPassword, signToken, verifyToken } = require('../utils/auth');
const { sendJSON, sanitizeUser } = require('../utils/helpers');

const Users = collection('users');

function getUserFromRequest(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return Users.findById(payload.id);
}

async function register(req, res, body) {
  const { name, phone, email, password, role } = body;
  if (!name || !phone || !password) {
    return sendJSON(res, 400, { error: 'Name, phone and password are required.' });
  }
  if (password.length < 6) {
    return sendJSON(res, 400, { error: 'Password must be at least 6 characters.' });
  }
  const existing = Users.findOne((u) => u.phone === phone);
  if (existing) {
    return sendJSON(res, 409, { error: 'An account with this phone number already exists.' });
  }
  const allowedRoles = ['entrepreneur', 'user'];
  const finalRole = allowedRoles.includes(role) ? role : 'entrepreneur';
  const user = Users.insert({
    name,
    phone,
    email: email || '',
    passwordHash: hashPassword(password),
    role: finalRole,
  });
  const token = signToken({ id: user.id, role: user.role });
  return sendJSON(res, 201, { token, user: sanitizeUser(user) });
}

async function login(req, res, body) {
  const { phone, password } = body;
  if (!phone || !password) {
    return sendJSON(res, 400, { error: 'Phone and password are required.' });
  }
  const user = Users.findOne((u) => u.phone === phone);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return sendJSON(res, 401, { error: 'Invalid phone number or password.' });
  }
  const token = signToken({ id: user.id, role: user.role });
  return sendJSON(res, 200, { token, user: sanitizeUser(user) });
}

async function me(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return sendJSON(res, 401, { error: 'Not authenticated.' });
  return sendJSON(res, 200, { user: sanitizeUser(user) });
}

module.exports = { register, login, me, getUserFromRequest };
