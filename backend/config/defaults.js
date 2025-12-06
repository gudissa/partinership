// Centralized default URLs used as dev fallbacks when env vars are not set.
// Keep all literal defaults here so we don't scatter 'http://localhost:*' around the repo.
const DEFAULTS = {
  DEFAULT_API_URL: process.env.DEFAULT_API_URL || 'http://localhost:5000',
  DEFAULT_ADMIN_FRONTEND: process.env.DEFAULT_ADMIN_FRONTEND || 'http://localhost:5173',
  DEFAULT_USER_FRONTEND: process.env.DEFAULT_USER_FRONTEND || 'http://localhost:5174',
  DEFAULT_DEV_FRONTEND: process.env.DEFAULT_DEV_FRONTEND || 'http://localhost:3000',
};

export default DEFAULTS;
