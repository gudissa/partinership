# Backend (pms/backend)

This folder contains the Express API server.

## Important env vars for deployment / changing host

- ADMIN_APP_URL - (optional) The frontend URL for the admin app, used when the server generates setup links. Example: `http://192.168.1.10:5173`
- USER_APP_URL - (optional) The frontend URL for the user app. Example: `http://192.168.1.10:5174`
- CORS_ORIGINS - (optional) Comma-separated list of allowed origins for CORS. If set, these values are added to allowed origins.
- HOST - (optional) Host to bind the server to. Defaults to `0.0.0.0` so the server is reachable on the LAN.
- PORT - (optional) Port to run the server on (default 5000).
- MONGODB_URI, JWT_SECRET, etc. - the usual secrets.

Notes for scripts in `backend/scripts/`:
- Scripts that call the API directly (for testing/seed data) now respect `API_BASE_URL` environment variable. Example:

  API_BASE_URL=http://192.168.1.10:5000 node scripts/createInternalUser.js

## Running with PM2 (example)

A simple PM2 ecosystem file is included: `ecosystem.config.js`. To start in production with PM2:

  pm2 start ecosystem.config.js --env production

This will run the `server.js` script and read env vars from your environment.
