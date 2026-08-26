# Udyam Setu — Marginalised Entrepreneurs Portal
**SIH 2026 · Problem Statement 92 — MVP**

A working portal that helps marginalised and local entrepreneurs register, get discovered by nearby customers on a map, and connect to relevant government schemes. Built to be demoed end-to-end, not just a UI mockup.

---

## ⚠️ One important deviation from the brief — please read

The brief asked for a MERN stack (Express + MongoDB) with several npm packages (React, Vite, Tailwind, React Leaflet, etc.). **This environment had no network access to install any npm packages and no MongoDB instance available**, so a like-for-like MERN build could not actually be run or tested here.

To still deliver a genuinely *working, tested* MVP rather than untested boilerplate, this project uses:

- **Backend:** plain Node.js (`http`, `fs`, `crypto` — all built in). **Zero npm dependencies.** A small JSON-file store (`server/data/*.json`) stands in for MongoDB, with the exact same document shape as the Mongo schemas described in the brief (see "Migrating to MongoDB" below).
- **Frontend:** plain HTML/CSS/JavaScript (no build step). Tailwind CSS and Leaflet/OpenStreetMap are loaded via CDN `<script>`/`<link>` tags in the browser — this still satisfies "free/open mapping solution" and "Tailwind CSS" from the brief, it's just not bundled with Vite.

**Result:** the whole app runs with `node server/index.js` — no `npm install`, no database server to configure, nothing to fail during a live demo. Every flow below (registration → map → verification → schemes) has been tested end-to-end with a headless browser in this environment.

If your team prefers real Express + Mongoose + React, the code is organized (routes, models, REST endpoints) so it's a straightforward port — see "Migrating to MongoDB" at the bottom.

---

## Quick start

Requires only **Node.js 18+** (nothing else).

```bash
cd project/server
cp ../.env.example ../.env      # optional — sane defaults are built in
node seed.js                     # populates demo data (safe to re-run any time)
node index.js                    # starts the app on http://localhost:5000
```

Open **http://localhost:5000** in your browser. The same server serves the frontend and the `/api/*` REST API, so there's nothing else to run and no CORS to configure.

### Demo logins
| Role | Phone | Password |
|---|---|---|
| Admin | `9999999999` | `admin123` |
| Sample entrepreneur | `9820011122` (or any seeded phone, see `server/seed.js`) | `demo1234` |

---

## Demo flow (matches the brief's required flow)

1. Open the portal (`/`) → **Find Local Entrepreneurs**.
2. Go to `/map.html` → click **Use My Location — Find Near Me** (or search a place manually if geolocation is blocked).
3. Nearby entrepreneurs appear as markers + a ranked list on the left.
4. Filter by category using the dropdown.
5. Click an entrepreneur → opens their full profile (details, map, contact, schemes).
6. Register a new business at `/register.html` (two steps: account, then business details — GPS capture built in).
7. The new business immediately appears on the map/directory as **Pending verification**.
8. Its category-relevant schemes show on its profile and on the entrepreneur's `/dashboard.html`.
9. Log in as admin (`9999999999` / `admin123`) → `/admin.html` → **Entrepreneurs** tab → **Approve**.
10. The entrepreneur's badge flips to **Verified** everywhere.

---

## Project structure

```
project/
  server/
    index.js         # HTTP server: routing + static file serving
    db.js             # JSON-file "database" (users / entrepreneurs / schemes)
    seed.js            # populates demo/sample data
    routes/            # auth, entrepreneurs, schemes, admin
    utils/              # password hashing + signed tokens, helpers
    data/                # *.json data files (created by seed.js)
    package.json
  client/
    public/
      index.html, register.html, login.html, directory.html,
      map.html, profile.html, schemes.html, dashboard.html, admin.html
      css/style.css
      js/api.js, nav.js, geo.js
  .env.example
  README.md
```

## API endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/entrepreneurs            ?search=&category=&state=&district=&lat=&lng=&near=true&radius=&sort=
GET    /api/entrepreneurs/me         (auth) current user's own profile
GET    /api/entrepreneurs/:id
POST   /api/entrepreneurs            (auth)
PUT    /api/entrepreneurs/:id        (auth: owner or admin)
DELETE /api/entrepreneurs/:id        (auth: owner or admin)
PUT    /api/entrepreneurs/:id/verify (auth: admin) body: { status: 'verified'|'rejected'|'pending' }

GET    /api/schemes                  ?category=
GET    /api/schemes/:id
POST   /api/schemes                  (auth: admin)
PUT    /api/schemes/:id              (auth: admin)
DELETE /api/schemes/:id              (auth: admin)

GET    /api/admin/stats              (auth: admin)
```

Auth uses a signed bearer token (`Authorization: Bearer <token>`), functionally equivalent to a JWT, generated with Node's built-in `crypto` module — no external auth library needed.

## Government scheme data

Scheme entries in `server/seed.js` are real, currently-known Indian government schemes (PMEGP, PM Vishwakarma, PMMY/Mudra, Stand-Up India, PM FME, NRLM/Aajeevika) with their official portal URLs. As instructed, no scheme or URL was invented — verify current details on the official site before relying on them in a real deployment, since government portals do change over time.

## Known limitations (intentional, for a hackathon MVP)

- Images are stored as base64 data URLs directly in the JSON record (fine at demo scale; swap for real file/object storage in production).
- The JSON file store is not safe for concurrent writes at scale — perfectly fine for a single-demo/single-instance MVP, not for production traffic.
- "Near me" and distance sorting use the Haversine formula (straight-line distance), not road distance.

## Migrating to MongoDB + Express later

The data shapes already match the brief's Mongoose-style schemas (`User`, `Entrepreneur`, `Scheme`). To port:
1. `npm install express mongoose cors dotenv jsonwebtoken bcryptjs` in `server/`.
2. Replace `db.js`'s `collection()` calls with Mongoose models mirroring the same fields.
3. Replace the manual `http` routing in `index.js` with Express routers (the files in `routes/` already map 1:1 to Express route handlers, just swap `(req, res, ...)` signatures for `(req, res, next)`).
4. Swap `utils/auth.js`'s hand-rolled token functions for `jsonwebtoken` + `bcryptjs` if preferred (they're already API-compatible in spirit).

The frontend needs no changes either way — it only talks to the `/api/*` REST contract above.
