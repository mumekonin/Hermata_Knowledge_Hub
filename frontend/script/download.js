'use strict';

const API_BASE = 'http://localhost:3000';

/* MOBILE NAV TOGGLE  */
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

/* SEARCH ROUTING  */
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

/* MAIN  */
document.addEventListener('DOMContentLoaded', () => {
  // updateNavAuth() assumed to be in auth.js
  if (typeof updateNavAuth === 'function') updateNavAuth();

  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('id');

  if (!bookId) {
    window.location.replace('dashboard.html');
    return;
  }

  // FIX: Use 'access_token' to match login.js
  const token = localStorage.getItem('access_token');

  /* Fetch & render  */
  async function loadBookDetails() {
    try {
      const res = await fetch(`${API_BASE}/books/get-book/${bookId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const book = await res.json();

      const coverImg = document.getElementById('book-cover');
      if (coverImg) {
        coverImg.src = book.coverUrl || '';
        coverImg.alt = book.title || 'Book cover';
      }
      
      document.getElementById('book-title').textContent   = book.title      || '—';
      document.getElementById('book-author').textContent  = `by ${book.author || 'Unknown'}`;
      document.getElementById('book-category').textContent = book.category || '';
      document.getElementById('book-description').textContent = book.description || 'No description available.';
      document.getElementById('book-year').textContent    = 
        book.createdAt ? new Date(book.createdAt).getFullYear() : '—';

    } catch (err) {
      console.error('[download.js] Load error:', err);
      const content = document.getElementById('dl-content');
      if (content) {
        content.innerHTML = '<p style="padding:40px;color:#64748b;">Unable to load book details. Please try again.</p>';
      }
    }
  }

  /* Read Online  */
  document.getElementById('btn-read')?.addEventListener('click', async () => {
    try {
      const res = await fetch(`${API_BASE}/books/read/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}` // FIX: Consistent key
        }
      });

      if (!res.ok) throw new Error('Failed to fetch book stream');
      const blob = await res.blob();
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    } catch (err) {
      console.error('🔥 READ ERROR:', err);
      alert('Unable to open the book right now.');
    }
  });

  /* Download  */
  document.getElementById('btn-download')?.addEventListener('click', async () => {
    try {
      const res = await fetch(`${API_BASE}/books/download/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}` // FIX: Consistent key
        }
      });

      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `book_${bookId}.pdf`; 
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('🔥 DOWNLOAD ERROR:', err);
      alert('Unable to download the book right now.');
    }
  });

  /* Favorites */
  document.getElementById('btn-fav')?.addEventListener('click', async () => {
    if (!token) {
      window.location.href = `login.html?next=download.html%3Fid%3D${bookId}`;
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/books/add-to-favorites/${bookId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // token variable already uses access_token
          'Content-Type':  'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        document.getElementById('fav-text').textContent = 'Added to favorites ✓';
        const btn = document.getElementById('btn-fav');
        btn.style.color       = '#d97706';
        btn.style.borderColor = '#d97706';
        btn.disabled          = true;
      } else {
        const msg = data.message || '';
        if (msg.toLowerCase().includes('already')) {
          document.getElementById('fav-text').textContent = 'Already in favorites ✓';
          document.getElementById('btn-fav').disabled = true;
        } else {
          alert(msg || 'Could not add to favorites.');
        }
      }
    } catch (err) {
      console.error('[download.js] Favorites error:', err);
      alert('Unable to save favorite. Please try again.');
    }
  });

  loadBookDetails();
});