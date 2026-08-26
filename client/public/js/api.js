// Small fetch wrapper + auth helpers shared by every page.
const API_BASE = '/api';

const Auth = {
  getToken() { return localStorage.getItem('mep_token'); },
  setToken(token) { localStorage.setItem('mep_token', token); },
  getUser() {
    try { return JSON.parse(localStorage.getItem('mep_user') || 'null'); } catch { return null; }
  },
  setUser(user) { localStorage.setItem('mep_user', JSON.stringify(user)); },
  logout() {
    localStorage.removeItem('mep_token');
    localStorage.removeItem('mep_user');
    window.location.href = '/index.html';
  },
  isLoggedIn() { return !!this.getToken(); },
};

async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && Auth.getToken()) headers['Authorization'] = `Bearer ${Auth.getToken()}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

const CATEGORIES = [
  'Handicrafts',
  'Food',
  'Tailoring',
  'Agriculture',
  'Local Services',
  'Small Manufacturing',
  'Artisans',
  'Home-based Businesses',
];
