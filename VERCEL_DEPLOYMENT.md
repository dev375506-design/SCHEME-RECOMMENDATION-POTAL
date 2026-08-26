# Vercel Deployment Guide - PS-92 Marginalised Entrepreneurs Portal

## Overview
This guide documents the deployment configuration for the PS-92 Marginalised Entrepreneurs Portal on Vercel as a **single unified project** with both frontend and backend.

## Files Created/Modified

### New Files
1. **`api/index.js`** - Vercel serverless function handler
   - Routes all `/api/*` requests to the backend
   - Imports and reuses existing route modules from `server/routes/`
   - No duplication of backend logic

2. **`vercel.json`** - Vercel deployment configuration
   - Defines public directory as `client/public`
   - Configures rewrites for SPA routing
   - Sets up cache headers for static assets
   - Environment variables configuration

### Unmodified
- `server/` - All backend routes remain unchanged
- `client/public/` - Frontend unchanged
- `.env`, `.env.example` - Configuration unchanged

## Vercel Root Directory
```
. (project root)
```

The root directory remains at `.` (the repository root). Vercel will:
- Serve static files from `client/public/`
- Route `/api/*` to serverless functions in `api/`

## Frontend URL Structure

### Public URLs (served by Vercel from `client/public/`)
```
GET  /                    → client/public/index.html (SPA home)
GET  /login.html          → client/public/login.html
GET  /register.html       → client/public/register.html
GET  /dashboard.html      → client/public/dashboard.html
GET  /directory.html      → client/public/directory.html
GET  /profile.html        → client/public/profile.html
GET  /map.html            → client/public/map.html
GET  /admin.html          → client/public/admin.html
GET  /schemes.html        → client/public/schemes.html
GET  /css/*               → client/public/css/ (stylesheets, cached)
GET  /js/*                → client/public/js/ (scripts, cached)
GET  /img/*               → client/public/img/ (images, cached)
```

### SPA Fallback
- Any unknown route (e.g., `/some-page`) falls back to `/index.html` for SPA routing
- The frontend application handles routing with JavaScript

## Backend API URL Structure

### Authentication Endpoints
```
POST /api/auth/register
  Body: { name, phone, email, password, role }
  Response: { token, user }

POST /api/auth/login
  Body: { phone, password }
  Response: { token, user }

GET  /api/auth/me
  Headers: Authorization: Bearer <token>
  Response: { user }
```

### Entrepreneurs Endpoints
```
GET  /api/entrepreneurs
  Query: ?search=...&category=...&state=...&district=...&lat=...&lng=...&radius=...&sort=...
  Response: { count, entrepreneurs }

GET  /api/entrepreneurs/:id
  Response: { entrepreneur }

GET  /api/entrepreneurs/me
  Headers: Authorization: Bearer <token>
  Response: { entrepreneur } (current user's profile)

POST /api/entrepreneurs
  Headers: Authorization: Bearer <token>
  Body: { businessName, entrepreneurName, phone, category, description, ... }
  Response: { entrepreneur }

PUT  /api/entrepreneurs/:id
  Headers: Authorization: Bearer <token>
  Body: { updated fields }
  Response: { entrepreneur }

DELETE /api/entrepreneurs/:id
  Headers: Authorization: Bearer <token>
  Response: { success: true }

PUT  /api/entrepreneurs/:id/verify
  Headers: Authorization: Bearer <token> (admin)
  Body: { verificationStatus, notes }
  Response: { entrepreneur }
```

### Schemes Endpoints
```
GET  /api/schemes
  Query: ?category=...
  Response: { count, schemes }

GET  /api/schemes/:id
  Response: { scheme }

POST /api/schemes
  Headers: Authorization: Bearer <token> (admin)
  Body: { name, description, eligibility, benefits, ... }
  Response: { scheme }

PUT  /api/schemes/:id
  Headers: Authorization: Bearer <token> (admin)
  Body: { updated fields }
  Response: { scheme }

DELETE /api/schemes/:id
  Headers: Authorization: Bearer <token> (admin)
  Response: { success: true }
```

### Admin Endpoints
```
GET  /api/admin/stats
  Headers: Authorization: Bearer <token> (admin)
  Response: { totalEntrepreneurs, verifiedEntrepreneurs, pendingEntrepreneurs, ... }
```

## Vercel Deployment Settings

### Configuration (vercel.json)
```json
{
  "version": 2,
  "buildCommand": "node server/seed.js",
  "public": "client/public",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }]
    },
    {
      "source": "/css/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/js/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/img/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

### Build & Runtime
- **Runtime:** Node.js 18+ (as specified in `server/package.json`)
- **Build Command:** `node server/seed.js` (initializes database with seed data)
- **Output Directory:** Auto-detected (Vercel serverless + public/)
- **Public Directory:** `client/public/`

### Environment Variables Required in Vercel Dashboard

Set these in your Vercel project settings:

1. **JWT_SECRET** (Required)
   - A long random string used to sign login tokens
   - Example: `your-very-long-random-jwt-secret-min-32-chars`
   - ⚠️ Change from the development default `sih92-dev-secret-change-me`

2. **PORT** (Optional)
   - Default: `5000` (Vercel handles this automatically)
   - This is only used when testing locally

## Deployment Steps on Vercel

### First Time Setup
1. Push the repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Framework: Select "Other" (zero-dependency Node.js)
6. Root Directory: `.` (default)
7. Build Command: `node server/seed.js`
8. Output Directory: Leave empty (auto-detected)
9. Click "Deploy"
10. After deployment, go to Project Settings
11. Add Environment Variable:
    - Name: `JWT_SECRET`
    - Value: A long random string

### Subsequent Deployments
- Push to GitHub → Vercel automatically redeploys
- Environment variables persist
- Database seed runs on each deployment (initializes/resets data)

## Testing Checklist

### Frontend Tests
- [ ] `GET /` → index.html loads (with SPA app)
- [ ] `GET /login.html` → login page loads
- [ ] `GET /register.html` → register page loads
- [ ] `GET /dashboard.html` → dashboard loads
- [ ] `GET /directory.html` → directory loads
- [ ] Navigation between pages works
- [ ] CSS/JS files load correctly

### Backend API Tests
- [ ] `POST /api/auth/register` → Creates user, returns token
- [ ] `POST /api/auth/login` → Authenticates user, returns token
- [ ] `GET /api/auth/me` → Returns current user (with valid token)
- [ ] `GET /api/schemes` → Lists schemes
- [ ] `GET /api/entrepreneurs` → Lists entrepreneurs
- [ ] `GET /api/entrepreneurs/me` → Returns user's profile
- [ ] `POST /api/entrepreneurs` → Creates entrepreneur profile
- [ ] `GET /api/admin/stats` → Returns stats (admin only)

### Frontend-to-Backend Integration
- [ ] Login form submits to `/api/auth/login` ✓
- [ ] Register form submits to `/api/auth/register` ✓
- [ ] Directory page fetches from `/api/entrepreneurs` ✓
- [ ] Schemes page fetches from `/api/schemes` ✓
- [ ] Profile pages load with proper auth headers ✓
- [ ] Tokens are stored in localStorage ✓
- [ ] Logout clears token and redirects ✓

## Local Testing (Before Deployment)

### Using the Original Server
```bash
cd server
node index.js
# Server runs on http://localhost:5000
# Serves frontend from client/public/ + API routes
```

### Testing Specific Endpoints
```bash
# Get all schemes
curl http://localhost:5000/api/schemes

# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","phone":"9999999999","password":"pass123","role":"entrepreneur"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9999999999","password":"pass123"}'
```

## Important Notes

### No Duplication
- The `api/index.js` file imports route handlers from `server/routes/`
- Backend code is NOT duplicated
- All routes defined in `server/routes/*.js` are reused

### No Changes to Frontend
- The frontend already uses `/api` as the base URL (see `client/public/js/api.js`)
- No frontend changes needed

### Data Persistence
- Data is stored in `server/data/*.json` files (in-memory database)
- Database is seeded on each Vercel deployment (see `server/seed.js`)
- For production, consider using an external database (MongoDB, PostgreSQL, etc.)

### CORS
- All API endpoints have CORS headers allowing requests from any origin
- This allows frontend to make requests to the API

## Common Issues & Solutions

### Issue: GET / returns 404 instead of index.html
**Solution:** Verify `public: "client/public"` is set in `vercel.json` and the rewrite rule exists.

### Issue: API endpoints return 404
**Solution:** 
- Verify `api/index.js` exists in the root
- Check URL structure: `/api/auth/login` (not `/api/auth/login/`)
- Verify route handler is exported in `server/routes/*.js`

### Issue: Authentication fails (401)
**Solution:**
- Check that `JWT_SECRET` environment variable is set in Vercel
- Verify token format: `Authorization: Bearer <token>`
- Check that tokens are valid (not expired)

### Issue: CORS errors in frontend
**Solution:** All API endpoints already have `Access-Control-Allow-Origin: *` header.

## Support & Maintenance

### Database
- Located in `server/data/` as JSON files
- Seeded by `server/seed.js` on each build
- Consider migrating to a proper database for production

### Logs
- View Vercel deployment logs: Project → Deployments → click deployment → Logs
- View runtime errors: Project → Functions → Select API function → Logs

### Updates
- Update backend routes in `server/routes/*.js`
- Update frontend in `client/public/`
- Push to GitHub → Vercel auto-deploys
