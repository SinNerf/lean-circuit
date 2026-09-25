const ADMIN_EMAIL = 'nukelauncher7@gmail.com';

export function isAdmin(email) {
  return String(email || '').trim().toLowerCase() === ADMIN_EMAIL;
}
