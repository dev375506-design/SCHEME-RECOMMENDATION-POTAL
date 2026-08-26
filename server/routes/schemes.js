const { collection } = require('../db');
const { sendJSON } = require('../utils/helpers');
const { getUserFromRequest } = require('./auth');

const Schemes = collection('schemes');

async function list(req, res, query) {
  let results = Schemes.all();
  if (query.category) {
    results = results.filter(
      (s) => s.categories.includes(query.category) || s.categories.includes('All')
    );
  }
  return sendJSON(res, 200, { count: results.length, schemes: results });
}

async function getOne(req, res, id) {
  const scheme = Schemes.findById(id);
  if (!scheme) return sendJSON(res, 404, { error: 'Scheme not found.' });
  return sendJSON(res, 200, { scheme });
}

function requireAdmin(req, res) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    sendJSON(res, 403, { error: 'Admin access required.' });
    return null;
  }
  return user;
}

async function create(req, res, body) {
  if (!requireAdmin(req, res)) return;
  const { name, description } = body;
  if (!name || !description) return sendJSON(res, 400, { error: 'Name and description are required.' });
  const scheme = Schemes.insert({
    name,
    description,
    eligibility: body.eligibility || '',
    benefits: body.benefits || '',
    documents: body.documents || '',
    categories: Array.isArray(body.categories) ? body.categories : ['All'],
    officialUrl: body.officialUrl || '',
  });
  return sendJSON(res, 201, { scheme });
}

async function update(req, res, id, body) {
  if (!requireAdmin(req, res)) return;
  const existing = Schemes.findById(id);
  if (!existing) return sendJSON(res, 404, { error: 'Scheme not found.' });
  const updated = Schemes.updateById(id, body);
  return sendJSON(res, 200, { scheme: updated });
}

async function remove(req, res, id) {
  if (!requireAdmin(req, res)) return;
  const existing = Schemes.findById(id);
  if (!existing) return sendJSON(res, 404, { error: 'Scheme not found.' });
  Schemes.deleteById(id);
  return sendJSON(res, 200, { success: true });
}

module.exports = { list, getOne, create, update, remove };
