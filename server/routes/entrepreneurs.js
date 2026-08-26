const { collection } = require('../db');
const { sendJSON, distanceKm } = require('../utils/helpers');
const { getUserFromRequest } = require('./auth');

const Entrepreneurs = collection('entrepreneurs');

const REQUIRED_FIELDS = ['businessName', 'entrepreneurName', 'phone', 'category', 'description', 'address', 'district', 'state', 'pincode'];

function validate(body) {
  const missing = REQUIRED_FIELDS.filter((f) => !body[f] || String(body[f]).trim() === '');
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`;
  if (!/^\d{10}$/.test(String(body.phone))) return 'Phone number must be 10 digits.';
  if (!/^\d{6}$/.test(String(body.pincode))) return 'Pincode must be 6 digits.';
  if (body.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) return 'Email address looks invalid.';
  return null;
}

async function list(req, res, query) {
  let results = Entrepreneurs.all();

  if (query.status) {
    results = results.filter((e) => e.verificationStatus === query.status);
  } else {
    // Public directory only shows non-rejected profiles by default
    results = results.filter((e) => e.verificationStatus !== 'rejected');
  }

  if (query.search) {
    const q = query.search.toLowerCase();
    results = results.filter(
      (e) =>
        e.businessName.toLowerCase().includes(q) ||
        e.entrepreneurName.toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        (e.productsServices || '').toLowerCase().includes(q)
    );
  }
  if (query.category) {
    results = results.filter((e) => e.category === query.category);
  }
  if (query.state) {
    results = results.filter((e) => e.state.toLowerCase() === query.state.toLowerCase());
  }
  if (query.district) {
    results = results.filter((e) => e.district.toLowerCase() === query.district.toLowerCase());
  }

  const userLat = parseFloat(query.lat);
  const userLng = parseFloat(query.lng);
  const hasUserLocation = !Number.isNaN(userLat) && !Number.isNaN(userLng);

  results = results.map((e) => ({
    ...e,
    distanceKm: hasUserLocation ? distanceKm(userLat, userLng, e.latitude, e.longitude) : null,
  }));

  const sort = query.sort || (hasUserLocation ? 'distance' : 'newest');
  if (sort === 'distance' && hasUserLocation) {
    results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  } else if (sort === 'name') {
    results.sort((a, b) => a.businessName.localeCompare(b.businessName));
  } else {
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (query.near === 'true' && hasUserLocation) {
    results = results.filter((e) => e.distanceKm !== null && e.distanceKm <= (parseFloat(query.radius) || 50));
  }

  return sendJSON(res, 200, { count: results.length, entrepreneurs: results });
}

async function getOne(req, res, id) {
  const e = Entrepreneurs.findById(id);
  if (!e) return sendJSON(res, 404, { error: 'Entrepreneur not found.' });
  return sendJSON(res, 200, { entrepreneur: e });
}

async function create(req, res, body) {
  const user = getUserFromRequest(req);
  if (!user) return sendJSON(res, 401, { error: 'Please log in or register first.' });

  const err = validate(body);
  if (err) return sendJSON(res, 400, { error: err });

  const existing = Entrepreneurs.findOne((e) => e.userId === user.id);
  if (existing) return sendJSON(res, 409, { error: 'You already have a business profile. Use edit instead.' });

  const entrepreneur = Entrepreneurs.insert({
    userId: user.id,
    businessName: body.businessName,
    entrepreneurName: body.entrepreneurName,
    phone: body.phone,
    email: body.email || '',
    category: body.category,
    description: body.description,
    productsServices: body.productsServices || '',
    address: body.address,
    district: body.district,
    state: body.state,
    pincode: body.pincode,
    latitude: body.latitude ? parseFloat(body.latitude) : null,
    longitude: body.longitude ? parseFloat(body.longitude) : null,
    image: body.image || '',
    socialLink: body.socialLink || '',
    needsSupport: !!body.needsSupport,
    businessStatus: body.businessStatus || 'active',
    verificationStatus: 'pending',
  });
  return sendJSON(res, 201, { entrepreneur });
}

async function update(req, res, id, body) {
  const user = getUserFromRequest(req);
  if (!user) return sendJSON(res, 401, { error: 'Please log in first.' });
  const existing = Entrepreneurs.findById(id);
  if (!existing) return sendJSON(res, 404, { error: 'Entrepreneur not found.' });
  if (existing.userId !== user.id && user.role !== 'admin') {
    return sendJSON(res, 403, { error: 'You can only edit your own business profile.' });
  }

  const merged = { ...existing, ...body };
  const err = validate(merged);
  if (err) return sendJSON(res, 400, { error: err });

  const updates = { ...body };
  if (updates.latitude !== undefined) updates.latitude = parseFloat(updates.latitude);
  if (updates.longitude !== undefined) updates.longitude = parseFloat(updates.longitude);
  // Non-admins editing their profile go back to pending review
  if (user.role !== 'admin') updates.verificationStatus = 'pending';

  const updated = Entrepreneurs.updateById(id, updates);
  return sendJSON(res, 200, { entrepreneur: updated });
}

async function remove(req, res, id) {
  const user = getUserFromRequest(req);
  if (!user) return sendJSON(res, 401, { error: 'Please log in first.' });
  const existing = Entrepreneurs.findById(id);
  if (!existing) return sendJSON(res, 404, { error: 'Entrepreneur not found.' });
  if (existing.userId !== user.id && user.role !== 'admin') {
    return sendJSON(res, 403, { error: 'You can only delete your own business profile.' });
  }
  Entrepreneurs.deleteById(id);
  return sendJSON(res, 200, { success: true });
}

async function verify(req, res, id, body) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') return sendJSON(res, 403, { error: 'Admin access required.' });
  const existing = Entrepreneurs.findById(id);
  if (!existing) return sendJSON(res, 404, { error: 'Entrepreneur not found.' });
  const status = body.status;
  if (!['verified', 'rejected', 'pending'].includes(status)) {
    return sendJSON(res, 400, { error: 'Status must be verified, rejected or pending.' });
  }
  const updated = Entrepreneurs.updateById(id, { verificationStatus: status });
  return sendJSON(res, 200, { entrepreneur: updated });
}

async function myProfile(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return sendJSON(res, 401, { error: 'Please log in first.' });
  const profile = Entrepreneurs.findOne((e) => e.userId === user.id);
  return sendJSON(res, 200, { entrepreneur: profile });
}

module.exports = { list, getOne, create, update, remove, verify, myProfile };
