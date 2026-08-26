// Lightweight JSON-file "database". No external DB engine required —
// this keeps the MVP runnable instantly for a hackathon demo (just `node server/index.js`,
// no MongoDB install/connection string needed). Swap for Mongoose later if desired;
// the shape of each record already mirrors the Mongo schemas described in the spec.
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

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
  fs.writeFileSync(filePath(name), JSON.stringify(records, null, 2));
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
