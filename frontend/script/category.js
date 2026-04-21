'use strict';

const API_BASE = 'http://localhost:3000';

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


/*  CATEGORY ICONS  */
const CAT_ICONS = {
  'History': 'fa-landmark',
  'Literature': 'fa-feather-alt',
  'Science': 'fa-microscope',
  'Philosophy': 'fa-lightbulb',
  'Religion': 'fa-hands-praying',
  'Politics': 'fa-scale-balanced',
  'Economics': 'fa-chart-line',
  'default': 'fa-book',
};
const getCatIcon = (name) => CAT_ICONS[name] ?? CAT_ICONS.default;


/*  CATEGORY MANAGER  */
class CategoryManager {
  constructor() {
    this.grid = document.getElementById('ct-dynamic-grid');
    this.title = document.getElementById('ct-display-title');
    this.subtitle = document.getElementById('ct-display-subtitle');
    this.nav = document.getElementById('ct-nav-box');
    this.backBtn = document.getElementById('ct-btn-back');

    this.backBtn.addEventListener('click', () => this.loadCategories());
    this.loadCategories();
  }

  async loadCategories() {
    this.nav.classList.add('ct-nav-hidden');
    this.title.textContent = 'Categories';
    this.title.style.textTransform = 'none';
    this.subtitle.textContent = 'Explore the library by subject. Pick a category to dive in.';
    this.grid.className = 'ct-base-grid ct-grid-cats';
    this.grid.innerHTML = '<div style="color:#64748b;">Loading categories…</div>';

    try {
      const res = await fetch(`${API_BASE}/books/get-all-categories`);

      if (res.status === 404) {
        this.grid.innerHTML = '<p style="color:#64748b;">No categories available yet.</p>';
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      this.grid.innerHTML = data.map(({ id, name, description }) => `
        <div class="ct-cat-card" data-id="${id}" data-name="${escapeHtml(name)}">
          <i class="fas ${getCatIcon(name)}"></i>
          <h3>${escapeHtml(name)}</h3>
          <span>${escapeHtml(description || 'Explore titles →')}</span>
        </div>
      `).join('');

      this.grid.querySelectorAll('.ct-cat-card').forEach(card => {
        card.addEventListener('click', () => {
          this.loadBooks(card.dataset.id, card.dataset.name);
        });
      });

    } catch (err) {
      console.error('[category.js] Categories error:', err);
      this.grid.innerHTML = '<p style="color:#64748b;">Error loading categories.</p>';
    }
  }

  async loadBooks(id, name) {
    this.nav.classList.remove('ct-nav-hidden');
    this.title.textContent = name;
    this.title.style.textTransform = 'lowercase';
    this.grid.className = 'ct-base-grid ct-grid-books';
    this.grid.innerHTML = '<div style="color:#64748b;">Loading books…</div>';

    try {
      const res = await fetch(`${API_BASE}/books/category/${id}`);

      if (res.status === 404) {
        this.subtitle.textContent = '0 titles in this category';
        this.grid.innerHTML = '<p style="color:#64748b;">No books found in this category yet.</p>';
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const books = await res.json();
      this.subtitle.textContent = `${books.length} title${books.length !== 1 ? 's' : ''} in this category`;

      this.grid.innerHTML = books.map(({ id: bookId, category, coverUrl, title, author }) => `
        <a href="download.html?id=${bookId}" class="br-book-card">
          <div class="br-img-box">
            <span class="br-cat-pill">${escapeHtml(category || '')}</span>
            <img src="${coverUrl || ''}" alt="${escapeHtml(title || '')}" loading="lazy">
          </div>
          <h3 class="br-book-name">${escapeHtml(title || '')}</h3>
          <p class="br-author-name">${escapeHtml(author || '')}</p>
        </a>
      `).join('');

    } catch (err) {
      console.error('[category.js] Books error:', err);
      this.grid.innerHTML = '<p style="color:#64748b;">Unable to load books for this category.</p>';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth(); // from auth.js
  new CategoryManager();
});