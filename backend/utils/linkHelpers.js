export function ensureNoTrailingSlash(url = '') {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/\/$/, '');
}

export function makeSetupLink({ token, forAdmin = true } = {}) {
  if (!token) throw new Error('token is required to build setup link');

  // Prefer explicit env vars; fall back to FRONTEND_BASE_URL, then to reasonable localhost defaults
  const { DEFAULT_ADMIN_FRONTEND, DEFAULT_USER_FRONTEND } = require('../config/defaults');

  const adminUrl = process.env.ADMIN_APP_URL || process.env.FRONTEND_BASE_URL || DEFAULT_ADMIN_FRONTEND;
  const userUrl = process.env.USER_APP_URL || process.env.FRONTEND_BASE_URL || DEFAULT_USER_FRONTEND;

  const base = ensureNoTrailingSlash(forAdmin ? adminUrl : userUrl);

  const path = forAdmin ? '/admin/setup-password' : '/setup-password';

  return `${base}${path}?token=${encodeURIComponent(token)}`;
}

export default makeSetupLink;
