'use strict';

const API_BASE = 'http://localhost:3000';

/*  MOBILE NAV TOGGLE  */
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


/*  CATEGORY ICONS  */
const CATEGORY_ICONS = {
  'History':    'fa-landmark',
  'Literature': 'fa-feather-alt',
  'Science':    'fa-microscope',
  'Philosophy': 'fa-lightbulb',
  'Religion':   'fa-hands-praying',
  'Politics':   'fa-scale-balanced',
  'Economics':  'fa-chart-line',
  'default':    'fa-book',
};
const getCategoryIcon = (name) => CATEGORY_ICONS[name] ?? CATEGORY_ICONS.default;


/*  LOAD TOP CATEGORIES  */
async function loadTopCategories() {
  const grid = document.getElementById('category-display-grid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/books/get-all-categories`);
    if (res.status === 404) {
      grid.innerHTML = '<p class="loader">No categories available yet.</p>';
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const categories = await res.json();
    const top4 = categories.slice(0, 4);

    grid.innerHTML = top4.map(({ id, name, description }) => `
      <a href="category.html?id=${id}" class="category-card">
        <i class="fas ${getCategoryIcon(name)}" aria-hidden="true"></i>
        <span class="cat-name">${escapeHtml(name)}</span>
        <p class="cat-desc">${escapeHtml(description || `Explore our ${name} collection.`)}</p>
      </a>
    `).join('');

  } catch (err) {
    console.error('[dashboard] Categories error:', err);
    grid.innerHTML = '<p class="loader">Unable to load categories.</p>';
  }
}


/*  LOAD FEATURED BOOKS  */
async function loadFeaturedBooks() {
  const grid = document.getElementById('featured-books-grid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/books/get-all-books`);

    if (res.status === 404) {
      grid.innerHTML = '<p>No books in the collection yet.</p>';
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const books = await res.json();
    const top8  = books.slice(0, 8);

    grid.innerHTML = top8.map(({ id, category, coverUrl, title, author }) => `
      <a href="download.html?id=${id}" class="book-card">
        <div class="book-cover-wrapper">
          <span class="category-badge">${escapeHtml(category || '')}</span>
          <img src="${coverUrl || ''}" alt="${escapeHtml(title || '')}" class="book-cover-img" loading="lazy">
        </div>
        <h3 class="book-title">${escapeHtml(title || '')}</h3>
        <p class="book-author">${escapeHtml(author || '')}</p>
      </a>
    `).join('');

  } catch (err) {
    console.error('[dashboard] Featured books error:', err);
    grid.innerHTML = '<p>Unable to load featured titles.</p>';
  }
}


/*  LOAD NEW ARRIVALS  */
async function loadNewArrivals() {
  const grid = document.getElementById('na-grid-display');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/books/new-arrivals`);

    if (res.status === 404) {
      grid.innerHTML = '<p class="na-loader">No new arrivals yet.</p>';
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const books = await res.json();
    const top6  = books.slice(0, 6);

    grid.innerHTML = top6.map(({ id, category, coverUrl, title, author }) => `
      <div class="na-item-card">
        <a href="download.html?id=${id}" class="na-link-wrapper">
          <span class="na-pill">${escapeHtml(category || '')}</span>
          <img src="${coverUrl || ''}" alt="${escapeHtml(title || '')}" class="na-cover-img" loading="lazy">
        </a>
        <div class="na-info">
          <h3 class="na-book-name">${escapeHtml(title || '')}</h3>
          <p class="na-book-author">${escapeHtml(author || '')}</p>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('[dashboard] New arrivals error:', err);
    grid.innerHTML = '<p class="na-loader">Service unavailable.</p>';
  }
}


/*  BOOT  */
document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth();
  loadTopCategories();
  loadFeaturedBooks();
  loadNewArrivals();
});