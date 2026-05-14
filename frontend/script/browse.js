'use strict';
// const API_BASE="https://hermata-knowledge-hub.onrender.com"
const API_BASE = 'https://hermata-knowledge-hub.onrender.com';
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

document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth();

  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    window.location.replace('login.html');
  });
});
/*  MOBILE NAV TOGGLE  */
(function initNavToggle() {
  const toggle = document.getElementById('menuToggle');
  const navWrapper = document.getElementById('navWrapper');
  const icon = document.getElementById('toggleIcon');
  if (!toggle || !navWrapper || !icon) return;

  toggle.addEventListener('click', () => {
    const isOpen = navWrapper.classList.toggle('show');
    icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}());

/*  SEARCH ROUTING  */
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
  const heroBtn = document.getElementById('hero-search-btn');
  heroBtn?.addEventListener('click', () => goToSearch(heroInput.value));
  heroInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') goToSearch(heroInput.value);
  });
}());

/*  MAIN  */
document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth(); // from auth.js

  const booksGrid = document.getElementById('br-books-grid');
  const countLabel = document.getElementById('br-count-label');
  const categoryFilter = document.getElementById('br-category-filter');
  const sortFilter = document.getElementById('br-sort-filter');

  let allBooks = [];

  async function initBrowse() {
    booksGrid.innerHTML = '<p style="color:#64748b;grid-column:1/-1;padding:20px;">Loading collection…</p>';
    try {
      const res = await fetch(`${API_BASE}/books/get-all-books`);

      if (res.status === 404) {
        countLabel.textContent = '0 titles';
        booksGrid.innerHTML = '<p style="grid-column:1/-1;padding:20px;color:#64748b;">No books in the collection yet.</p>';
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      allBooks = await res.json();
      applyFilters();
    } catch (err) {
      console.error('[browse.js] Error:', err);
      booksGrid.innerHTML = '<p style="grid-column:1/-1;padding:20px;color:#64748b;">Unable to load the collection.</p>';
    }
  }

  function applyFilters() {
    let filtered = [...allBooks];

    const selectedCat = categoryFilter.value;
    if (selectedCat !== 'all') {
      filtered = filtered.filter(b => b.category === selectedCat);
    }

    const selectedSort = sortFilter.value;
    if (selectedSort === 'title-az') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === 'author-az') {
      filtered.sort((a, b) => a.author.localeCompare(b.author));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    renderGrid(filtered);
  }

  function renderGrid(books) {
    countLabel.textContent = `${books.length} title${books.length !== 1 ? 's' : ''}`;

    if (books.length === 0) {
      booksGrid.innerHTML = '<p style="grid-column:1/-1;padding:20px;color:#64748b;">No books found in this category.</p>';
      return;
    }


    booksGrid.innerHTML = books.map(({ id, category, coverUrl, title, author }) => `
      <a href="download.html?id=${id}" class="br-book-card">
        <div class="br-img-box">
          <span class="br-cat-pill">${escapeHtml(category || '')}</span>
          <img src="${coverUrl || ''}" alt="${escapeHtml(title || '')}" loading="lazy">
        </div>
        <h3 class="br-book-name">${escapeHtml(title || '')}</h3>
        <p class="br-author-name">${escapeHtml(author || '')}</p>
      </a>
    `).join('');
  }

  categoryFilter.addEventListener('change', applyFilters);
  sortFilter.addEventListener('change', applyFilters);

  initBrowse();
});