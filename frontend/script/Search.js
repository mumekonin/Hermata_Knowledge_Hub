'use strict';

const API_BASE = 'http://localhost:3000';
// Utility: Escapes HTML to prevent XSS attacks
const escapeHtml = (text) => {
    if (!text) return "";
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

//mobile toggle
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

/*  MAIN SEARCH ENGINE  */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof updateNavAuth === 'function') {
        updateNavAuth();
    }
    const resultsGrid = document.getElementById('sr-results-grid');
    const resultsText = document.getElementById('sr-results-text');
    const pageInput = document.getElementById('sr-active-input'); // Main page search
    const pageBtn = document.getElementById('sr-active-btn');     // Main page button
    const navInput = document.querySelector('.search-bar input'); // Navbar search

    if (!resultsGrid || !resultsText) return;

    async function performSearch(keyword) {
        const q = keyword.trim();
        if (!q) return;
        if (pageInput) pageInput.value = q;
        if (navInput) navInput.value = q;

        const url = new URL(window.location);
        url.searchParams.set('q', q);
        window.history.replaceState({}, '', url);

        resultsGrid.innerHTML = '<div class="loader">Searching collection...</div>';
        resultsText.textContent = '';

        try {
            const res = await fetch(`${API_BASE}/books/search?key=${encodeURIComponent(q)}`);

            if (res.status === 404) {
                resultsText.innerHTML = `Results for "<strong>${escapeHtml(q)}</strong>" — 0 found`;
                resultsGrid.innerHTML = '<p class="empty-msg">No matching titles found in the library.</p>';
                return;
            }

            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

            const books = await res.json();

            // Update result count
            resultsText.innerHTML = `Results for "<strong>${escapeHtml(q)}</strong>" — ${books.length} found`;

            // Render Books
            resultsGrid.innerHTML = books.map(book => `
                <a href="download.html?id=${book.id}" class="sr-book-card">
                    <div class="sr-img-wrapper">
                        <span class="sr-category-tag">${escapeHtml(book.category || 'General')}</span>
                        <img src="${book.coverUrl || 'assets/placeholder.png'}" alt="${escapeHtml(book.title)}" loading="lazy">
                    </div>
                    <h3 class="sr-book-title">${escapeHtml(book.title)}</h3>
                    <p class="sr-book-author">${escapeHtml(book.author)}</p>
                </a>
            `).join('');

        } catch (err) {
            console.error('[search.js] Fetch Error:', err);
            resultsGrid.innerHTML = '<p class="error-msg">Service is temporarily unavailable. Please try again.</p>';
        }
    }
    /*  EVENT LISTENERS  */
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery) {
        performSearch(initialQuery);
    }
    pageBtn?.addEventListener('click', () => performSearch(pageInput.value));
    pageInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch(pageInput.value);
    });
    navInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(navInput.value);
        }
    });
});