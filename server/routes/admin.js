const { collection } = require('../db');
const { sendJSON } = require('../utils/helpers');
const { getUserFromRequest } = require('./auth');

const Entrepreneurs = collection('entrepreneurs');

async function stats(req, res) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') return sendJSON(res, 403, { error: 'Admin access required.' });

  const all = Entrepreneurs.all();
  const categories = {};
  const districts = new Set();
  let verified = 0;
  let pending = 0;
  let rejected = 0;

  all.forEach((e) => {
    categories[e.category] = (categories[e.category] || 0) + 1;
    districts.add(e.district);
    if (e.verificationStatus === 'verified') verified++;
    else if (e.verificationStatus === 'rejected') rejected++;
    else pending++;
  });

  return sendJSON(res, 200, {
    totalEntrepreneurs: all.length,
    verifiedEntrepreneurs: verified,
    pendingEntrepreneurs: pending,
    rejectedEntrepreneurs: rejected,
    categoriesCount: Object.keys(categories).length,
    categoryBreakdown: categories,
    districtsCovered: districts.size,
  });
}

module.exports = { stats };
