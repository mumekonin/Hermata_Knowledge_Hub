'use strict';
// const API_BASE="https://hermata-knowledge-hub.onrender.com"
const API_BASE = 'http://localhost:3000';

// ── Update nav based on login state ──────────────────
function updateNavAuth() {
  const token    = localStorage.getItem('access_token');
  const userName = localStorage.getItem('user_name');

  const loggedOut = document.getElementById('auth-logged-out');
  const loggedIn  = document.getElementById('auth-logged-in');
  const nameEl    = document.getElementById('user-display-name');
  const avatarEl  = document.getElementById('user-avatar');

  if (!loggedOut || !loggedIn) return;

  if (token && userName) {
    loggedOut.style.display = 'none';
    loggedIn.style.display  = 'flex';
    nameEl.textContent      = userName;
    avatarEl.textContent    = userName.charAt(0).toUpperCase();
  } else {
    loggedOut.style.display = 'flex';
    loggedIn.style.display  = 'none';
  }
}

// ── Helper: prevent XSS ───────────────────────────────
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── Mobile nav toggle ─────────────────────────────────
(function initNavToggle() {
  const toggle     = document.getElementById('menuToggle');
  const navWrapper = document.getElementById('navWrapper');
  const icon       = document.getElementById('toggleIcon');
  if (!toggle || !navWrapper || !icon) return;

  toggle.addEventListener('click', () => {
    const isOpen = navWrapper.classList.toggle('show');
    icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}());

// ── Search routing ────────────────────────────────────
function goToSearch(query) {
  const q = query.trim();
  if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
}

(function initSearch() {
  const navInput = document.querySelector('.search-bar input');
  navInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goToSearch(navInput.value);
    }
  });

  const heroInput = document.getElementById('hero-search-input');
  const heroBtn   = document.getElementById('hero-search-btn');

  heroBtn?.addEventListener('click', () => goToSearch(heroInput.value));
  heroInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') goToSearch(heroInput.value);
  });
}());

// ── Main ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Update nav — runs once here, nowhere else
  updateNavAuth();

  const grid      = document.getElementById('fav-grid');
  const token     = localStorage.getItem('access_token');
  const logoutBtn = document.getElementById('logout-btn');

  // Single logout handler — registered once here only
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    window.location.replace('login.html');
  });

  // Stop here if not on favorites page
  if (!grid) return;

  // Redirect if not logged in
  if (!token) {
    window.location.replace('login.html');
    return;
  }

  // ── Fetch favorites ───────────────────────────────
  async function fetchFavorites() {
    grid.innerHTML = '<p style="color:#64748b;grid-column:1/-1;padding:20px;">Loading your favorites…</p>';

    try {
      const res = await fetch(`${API_BASE}/books/my-favorites`, {
        method:  'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_name');
        window.location.replace('login.html');
        return;
      }

      if (res.status === 404) {
        renderFavorites([]);
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      renderFavorites(data);

    } catch (err) {
      console.error('[favorites.js] Fetch error:', err);
      grid.innerHTML = '<p style="color:#64748b;grid-column:1/-1;padding:20px;">Unable to connect. Please try again.</p>';
    }
  }

  // ── Render favorites ──────────────────────────────
  function renderFavorites(favorites) {
    if (!favorites || favorites.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#64748b;">
          <p style="font-size:1.1rem;margin-bottom:16px;">You haven't saved any books yet.</p>
          <a href="browse.html" style="color:#122341;font-weight:600;text-decoration:underline;">
            Browse the collection →
          </a>
        </div>`;
      return;
    }

    grid.innerHTML = favorites.map(({ book }) => `
      <a href="download.html?id=${book.id}" class="fav-card">
        <div class="fav-img-box">
          <span class="fav-badge">Saved</span>
          <img src="${book.coverUrl || ''}" alt="${escapeHtml(book.title)}" loading="lazy">
        </div>
        <div class="fav-info">
          <h3 class="fav-book-name">${escapeHtml(book.title)}</h3>
          <p class="fav-author-name">${escapeHtml(book.author)}</p>
        </div>
      </a>
    `).join('');
  }

  fetchFavorites();

});