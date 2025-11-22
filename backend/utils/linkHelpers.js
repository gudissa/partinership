export function ensureNoTrailingSlash(url = '') {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/\/$/, '');
}

export function makeSetupLink({ token, forAdmin = true } = {}) {
  if (!token) throw new Error('token is required to build setup link');

  const defaultAdmin = 'http://localhost:5173';
  const defaultUser = 'http://localhost:5174';

  const adminUrl = process.env.ADMIN_APP_URL;
  const userUrl = process.env.USER_APP_URL || process.env.FRONTEND_BASE_URL;

  const base = ensureNoTrailingSlash(forAdmin ? (adminUrl || userUrl || defaultAdmin) : (userUrl || adminUrl || defaultUser));

  const path = forAdmin ? '/admin/setup-password' : '/setup-password';

  return `${base}${path}?token=${encodeURIComponent(token)}`;
}

export default makeSetupLink;
