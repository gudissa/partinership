import DEFAULTS from '../config/defaults.js';

export function ensureNoTrailingSlash(url = '') {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/\/$/, '');
}

export function makeSetupLink({ token, forAdmin = true } = {}) {
  if (!token) {
    console.error('makeSetupLink: token is required');
    throw new Error('token is required to build setup link');
  }

  try {
    // Prefer explicit env vars; fall back to FRONTEND_BASE_URL, then to reasonable localhost defaults
    const { DEFAULT_ADMIN_FRONTEND, DEFAULT_USER_FRONTEND } = DEFAULTS;

    const adminUrl = process.env.ADMIN_APP_URL || process.env.FRONTEND_BASE_URL || DEFAULT_ADMIN_FRONTEND;
    const userUrl = process.env.USER_APP_URL || process.env.FRONTEND_BASE_URL || DEFAULT_USER_FRONTEND;

    const base = ensureNoTrailingSlash(forAdmin ? adminUrl : userUrl);

    if (!base) {
      console.error('makeSetupLink: No base URL found', { forAdmin, adminUrl, userUrl, env: process.env });
      throw new Error('No frontend URL configured. Please set ADMIN_APP_URL or FRONTEND_BASE_URL in environment variables.');
    }

    const path = forAdmin ? '/admin/setup-password' : '/setup-password';

    const setupLink = `${base}${path}?token=${encodeURIComponent(token)}`;
    console.log('makeSetupLink: Generated setup link', { forAdmin, base, path, link: setupLink });
    
    return setupLink;
  } catch (error) {
    console.error('makeSetupLink: Error generating link', error);
    throw error;
  }
}

export default makeSetupLink;
