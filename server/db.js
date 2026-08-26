// Lightweight JSON-file "database". No external DB engine required —
// this keeps the MVP runnable instantly for a hackathon demo (just `node server/index.js`,
// no MongoDB install/connection string needed). Swap for Mongoose later if desired;
// the shape of each record already mirrors the Mongo schemas described in the spec.
//
// IMPORTANT: On Vercel serverless, the filesystem is read-only except for /tmp.
// For production deployments, migrate to MongoDB, PostgreSQL, Firebase, or Vercel KV storage.
const fs = require('fs');
const path = require('path');
const os = require('os');

let DATA_DIR = path.join(__dirname, 'data');
const ORIGINAL_DATA_DIR = DATA_DIR;

// On Vercel serverless, we can only write to /tmp
// Check if VERCEL env variable is set or if we're in a readonly environment
if (process.env.VERCEL === 'true' || process.env.VERCEL_ENV) {
  DATA_DIR = path.join(os.tmpdir(), 'vercel-db');
  
  // Initialize /tmp with seed data on startup
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      // Copy seed data files to /tmp so we can write to them
      for (const file of ['users.json', 'entrepreneurs.json', 'schemes.json']) {
        const src = path.join(ORIGINAL_DATA_DIR, file);
        const dst = path.join(DATA_DIR, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst);
        }
      }
      console.log('[DB] Initialized Vercel database from seed data');
    } catch (err) {
      console.error('[DB] Failed to initialize Vercel database:', err.message);
    }
  }
}

// Ensure the data directory exists
try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
} catch (err) {
  // Directory might already exist
}

console.log('[DB] Data directory:', DATA_DIR.includes('/tmp') ? '/tmp (Vercel ephemeral)' : DATA_DIR);

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readAll(name) {
  const p = filePath(name);
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, 'utf-8').trim();
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse ${name}.json`, e);
    return [];
  }
}

function writeAll(name, records) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  try {
    fs.writeFileSync(filePath(name), JSON.stringify(records, null, 2));
  } catch (err) {
    // If write fails (e.g., permission denied on Vercel), log the error
    console.error(`[DB Write Error] Failed to write ${name}.json:`, err.message);
    if (process.env.VERCEL) {
      console.error('[Vercel Warning] File-based database cannot persist data on Vercel serverless.');
      console.error('[Vercel Warning] For production: migrate to MongoDB, Firebase, PostgreSQL, or similar.');
    }
    throw err;
  }
}

function genId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}

const collection = (name) => ({
  all() {
    return readAll(name);
  },
  find(predicate) {
    return readAll(name).filter(predicate);
  },
  findOne(predicate) {
    return readAll(name).find(predicate) || null;
  },
  findById(id) {
    return readAll(name).find((r) => r.id === id) || null;
  },
  insert(record) {
    const records = readAll(name);
    const doc = { id: genId(), createdAt: new Date().toISOString(), ...record };
    records.push(doc);
    writeAll(name, records);
    return doc;
  },
  updateById(id, updates) {
    const records = readAll(name);
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    records[idx] = { ...records[idx], ...updates, id, updatedAt: new Date().toISOString() };
    writeAll(name, records);
    return records[idx];
  },
  deleteById(id) {
    const records = readAll(name);
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    records.splice(idx, 1);
    writeAll(name, records);
    return true;
  },
  replaceAll(records) {
    writeAll(name, records);
  },
});

module.exports = { collection, genId };
