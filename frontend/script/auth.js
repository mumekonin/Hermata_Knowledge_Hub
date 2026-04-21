/* ═══════════════════════════════════════════════════════════════════
   auth.js  —  Must be loaded BEFORE any page script
   Exposes globally: updateNavAuth(), requireAuth(), escapeHtml()
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ── Shared XSS helper — used by ALL page scripts ─────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── Show login/register OR username+signout in navbar ────────────── */
function updateNavAuth() {
  const authGroup = document.querySelector('.auth-group');
  if (!authGroup) return;

  const token = localStorage.getItem('token');

  if (token) {
    let displayName = 'My Account';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.name)        displayName = payload.name;
      else if (payload.email)  displayName = payload.email.split('@')[0];
    } catch (_) { /* malformed token — keep generic label */ }

    authGroup.innerHTML = `
      <span class="auth-user-name">${escapeHtml(displayName)}</span>
      <button class="auth-link auth-link--logout" id="nav-logout-btn">Sign out</button>
    `;

    document.getElementById('nav-logout-btn').addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.replace('login.html');
    });

  } else {
    authGroup.innerHTML = `
      <a href="login.html"        class="auth-link">Login</a>
      <a href="registration.html" class="auth-link auth-link--register">Register</a>
    `;
  }
}

/* ── Redirect to login if no token (favorites only) ───────────────── */
function requireAuth() {
  if (!localStorage.getItem('token')) {
    window.location.replace('login.html');
  }
}