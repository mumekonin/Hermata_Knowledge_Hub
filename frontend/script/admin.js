"use strict";

/* ============================================================
   CONFIG
============================================================ */
const API_BASE = "http://localhost:3000";

/* ============================================================
   AUTH GUARD
============================================================ */
const TOKEN = localStorage.getItem("access_token");
if (!TOKEN) {
  window.location.replace("login.html");
}

/* ============================================================
   API CALL
============================================================ */
async function apiCall(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
      }
    };

    if (body && !(body instanceof FormData)) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    if (body instanceof FormData) {
      options.body = body;
    }

    const res = await fetch(API_BASE + endpoint, options);

    if (res.status === 401) {
      localStorage.removeItem("access_token");
      window.location.replace("login.html");
      return null;
    }

    if (res.status === 204) return true;

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;

  } catch (err) {
    showToast(err.message, "error");
    return null;
  }
}

/* ============================================================
   TOAST
============================================================ */
function showToast(msg, type = "success") {
  const el = document.getElementById("toast");
  if (!el) return;
  const bg = { success: "#10b981", error: "#ef4444", info: "#4f46e5" };
  el.textContent      = msg;
  el.style.background = bg[type] || bg.success;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3500);
}

/* ============================================================
   HELPERS
============================================================ */
function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function setBtnLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.style.opacity = loading ? "0.6" : "1";
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el || isNaN(target)) return;
  let current = 0;
  const step  = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString();
    if (current >= target) clearInterval(timer);
  }, 35);
}

window.copyId = function (id) {
  if (!id) return;
  navigator.clipboard.writeText(id)
    .then(() => showToast("ID copied to clipboard", "info"));
};

/* re-render lucide icons after dynamic HTML insertion */
function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

/* ============================================================
   STATE TEMPLATES
============================================================ */
function loadingHTML(msg = "Loading…") {
  return `
    <div class="state-box">
      <div class="spinner"></div>
      <span>${msg}</span>
    </div>`;
}

function emptyHTML(msg = "No data found.") {
  return `<div class="state-box"><span>${msg}</span></div>`;
}

/* ============================================================
   MOBILE SIDEBAR TOGGLE
============================================================ */
const sidebar   = document.getElementById("sidebar");
const overlay   = document.getElementById("overlay");
const hamburger = document.getElementById("hamburger");

hamburger?.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("active");
});

overlay?.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
});

/* ============================================================
   VIEW ROUTER
============================================================ */
const PAGE_LABELS = {
  "dashboard":             "Dashboard",
  "users-view":            "User Directory",
  "books-view":            "Books",
  "add-book-view":         "Add / Edit Book",
  "categories-view":       "All Categories",
  "add-category-view":     "Add Category",
  "manage-category-view":  "Manage Category"
};

function switchView(viewId) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-link[data-view]").forEach(l => l.classList.remove("active"));

  const section = document.getElementById(viewId);
  if (section) section.classList.add("active");

  const link = document.querySelector(`.nav-link[data-view="${viewId}"]`);
  if (link) link.classList.add("active");

  document.getElementById("bread-label").textContent = PAGE_LABELS[viewId] || viewId;

  if (window.innerWidth <= 1024) {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  }

  if (viewId === "dashboard")       loadDashboard();
  if (viewId === "books-view")      loadBooks();
  if (viewId === "categories-view") loadCategories();
  if (viewId === "add-book-view")   loadCategoryDropdowns();
}

document.querySelectorAll(".nav-link[data-view]").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    switchView(link.dataset.view);
  });
});

/* ============================================================
   LOGOUT
============================================================ */
document.getElementById("btn-logout")?.addEventListener("click", async (e) => {
  e.preventDefault();
  await apiCall("/users/logout", "POST");
  localStorage.removeItem("access_token");
  window.location.replace("login.html");
});

/* ============================================================
   DASHBOARD
============================================================ */
async function loadDashboard() {
  const profile = await apiCall("/users/profile", "GET");
  if (profile) {
    const name = profile.name || "Admin";
    document.getElementById("admin-name").textContent      = name;
    document.getElementById("admin-greeting").textContent  = name.split(" ")[0];
    document.getElementById("admin-role").textContent      = (profile.role || "ADMIN").toUpperCase();
    document.getElementById("nav-avatar").textContent      = name.charAt(0).toUpperCase();
  }

  const [students, admins, books, cats] = await Promise.all([
    apiCall("/users/allUsersByRole/user",  "GET"),
    apiCall("/users/allUsersByRole/admin", "GET"),
    apiCall("/books/get-all-books",        "GET"),
    apiCall("/books/get-all-categories",   "GET")
  ]);

  animateCount("stat-students", students ? students.length : 0);
  animateCount("stat-admins",   admins   ? admins.length   : 0);
  animateCount("stat-books",    books    ? books.length    : 0);
  animateCount("stat-cats",     cats     ? cats.length     : 0);
}

/* ============================================================
   USER DIRECTORY
============================================================ */
document.getElementById("btn-fetch-users")?.addEventListener("click", async () => {
  const role      = document.getElementById("role-select").value;
  const container = document.getElementById("users-list");
  const btn       = document.getElementById("btn-fetch-users");

  container.innerHTML = loadingHTML("Fetching users…");
  setBtnLoading(btn, true);

  const users = await apiCall(`/users/allUsersByRole/${role}`, "GET");

  setBtnLoading(btn, false);

  if (!users || users.length === 0) {
    container.innerHTML = emptyHTML("No users found for this role.");
    return;
  }

  container.innerHTML = users.map(u => {
    const name    = esc(u.name || "Unknown");
    const initial = name.charAt(0).toUpperCase();
    const email   = esc(u.email || "");
    const id      = esc(u.id || u._id || "");
    return `
      <div class="user-item">
        <div class="user-item-left">
          <div class="user-avatar">${initial}</div>
          <div>
            <div class="user-name">${name}</div>
            <div class="user-email">${email}</div>
          </div>
        </div>
        <button class="btn-sm" onclick="copyId('${id}')">Copy ID</button>
      </div>`;
  }).join("");
});

/* ============================================================
   BOOKS — RENDER HELPER
============================================================ */
function renderBooks(books) {
  const grid = document.getElementById("books-grid");
  if (!books || books.length === 0) {
    grid.innerHTML = emptyHTML("No books found.");
    return;
  }

  grid.innerHTML = books.map(b => {
    const id     = esc(b.id || b._id || "");
    const title  = esc(b.title || "Untitled");
    const author = esc(b.author || "Unknown");
    const cat    = esc(b.category || "");

    const coverHTML = b.coverUrl
      ? `<img class="book-cover" src="${esc(b.coverUrl)}" alt="${title}" loading="lazy" />`
      : `<div class="book-cover-placeholder"><i data-lucide="book-open"></i></div>`;

    return `
      <div class="book-card">
        ${coverHTML}
        <div class="book-body">
          ${cat ? `<span class="book-cat">${cat}</span>` : ""}
          <div class="book-title">${title}</div>
          <div class="book-author">by ${author}</div>
        </div>
        <div class="book-footer">
          <span class="book-id" title="${id}">${id}</span>
          <button class="btn-sm" onclick="copyId('${id}')">Copy ID</button>
        </div>
      </div>`;
  }).join("");

  refreshIcons();
}

/* ============================================================
   BOOKS INVENTORY
============================================================ */
async function loadBooks() {
  const grid = document.getElementById("books-grid");
  grid.innerHTML = loadingHTML("Loading books…");
  const books = await apiCall("/books/get-all-books", "GET");
  renderBooks(books);
}

document.getElementById("btn-reload-books")?.addEventListener("click", () => {
  document.getElementById("search-key").value = "";
  loadBooks();
});

/* ============================================================
   BOOKS SEARCH
   GET /books/search?key=...
============================================================ */
document.getElementById("form-search-books")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const key  = document.getElementById("search-key").value.trim();
  const grid = document.getElementById("books-grid");

  if (!key) { showToast("Enter a search keyword.", "error"); return; }

  grid.innerHTML = loadingHTML(`Searching "${esc(key)}"…`);

  const results = await apiCall(`/books/search?key=${encodeURIComponent(key)}`, "GET");
  if (!results) {
    grid.innerHTML = emptyHTML(`No results for "${esc(key)}".`);
    return;
  }
  renderBooks(results);
});

document.getElementById("btn-clear-search")?.addEventListener("click", () => {
  document.getElementById("search-key").value = "";
  loadBooks();
});

/* ============================================================
   CATEGORIES
============================================================ */
async function loadCategories() {
  const grid = document.getElementById("cats-grid");
  grid.innerHTML = loadingHTML("Loading categories…");

  const cats = await apiCall("/books/get-all-categories", "GET");

  if (!cats || cats.length === 0) {
    grid.innerHTML = emptyHTML("No categories found.");
    return;
  }

  grid.innerHTML = cats.map(c => {
    const id   = esc(c.id || c._id || "");
    const name = esc(c.name || "");
    const desc = esc(c.description || "No description.");
    return `
      <div class="cat-card">
        <div class="cat-name">${name}</div>
        <div class="cat-desc">${desc}</div>
        <div class="cat-id">${id}</div>
        <button class="btn-sm" onclick="copyId('${id}')">Copy ID</button>
      </div>`;
  }).join("");
}

document.getElementById("btn-reload-cats")?.addEventListener("click", loadCategories);

/* ============================================================
   POPULATE CATEGORY DROPDOWNS
============================================================ */
async function loadCategoryDropdowns() {
  const cats = await apiCall("/books/get-all-categories", "GET");
  if (!cats) return;

  const options = `<option value="">Select a category</option>` +
    cats.map(c => `<option value="${esc(c.id || c._id)}">${esc(c.name)}</option>`).join("");

  const keepCurrentOptions = `<option value="">Keep current</option>` +
    cats.map(c => `<option value="${esc(c.id || c._id)}">${esc(c.name)}</option>`).join("");

  const addSelect    = document.getElementById("b-category");
  const updateSelect = document.getElementById("ub-category");

  if (addSelect)    addSelect.innerHTML    = options;
  if (updateSelect) updateSelect.innerHTML = keepCurrentOptions;
}

/* ============================================================
   ADD BOOK
============================================================ */
document.getElementById("form-add-book")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");

  const title    = document.getElementById("b-title").value.trim();
  const author   = document.getElementById("b-author").value.trim();
  const catId    = document.getElementById("b-category").value;
  const bookFile = document.getElementById("b-file").files[0];
  const desc     = document.getElementById("b-desc").value.trim();
  const cover    = document.getElementById("b-cover").files[0];

  if (!title || !author || !catId || !bookFile) {
    showToast("Please fill all required fields.", "error");
    return;
  }

  const fd = new FormData();
  fd.append("title",       title);
  fd.append("author",      author);
  fd.append("categoryId",  catId);
  fd.append("bookFile",    bookFile);
  if (desc)  fd.append("description", desc);
  if (cover) fd.append("coverFile",   cover);

  setBtnLoading(btn, true);
  const result = await apiCall("/books/upload-book", "POST", fd);
  setBtnLoading(btn, false);

  if (result) {
    showToast("Book uploaded successfully!", "success");
    e.target.reset();
  }
});

/* ============================================================
   UPDATE BOOK
============================================================ */
document.getElementById("form-update-book")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");

  const id = document.getElementById("ub-id").value.trim();
  if (!id) { showToast("Book ID is required.", "error"); return; }

  const title    = document.getElementById("ub-title").value.trim();
  const author   = document.getElementById("ub-author").value.trim();
  const catId    = document.getElementById("ub-category").value;
  const desc     = document.getElementById("ub-desc").value.trim();
  const bookFile = document.getElementById("ub-file").files[0];
  const cover    = document.getElementById("ub-cover").files[0];

  if (!title && !author && !catId && !desc && !bookFile && !cover) {
    showToast("Provide at least one field to update.", "error");
    return;
  }

  const fd = new FormData();
  if (title)    fd.append("title",       title);
  if (author)   fd.append("author",      author);
  if (catId)    fd.append("categoryId",  catId);
  if (desc)     fd.append("description", desc);
  if (bookFile) fd.append("bookFile",    bookFile);
  if (cover)    fd.append("coverFile",   cover);

  setBtnLoading(btn, true);
  const result = await apiCall(`/books/update-book/${id}`, "PUT", fd);
  setBtnLoading(btn, false);

  if (result) {
    showToast("Book updated successfully!", "success");
    e.target.reset();
  }
});

/* ============================================================
   DELETE BOOK
============================================================ */
document.getElementById("btn-del-book")?.addEventListener("click", async () => {
  const id  = document.getElementById("del-book-id").value.trim();
  const btn = document.getElementById("btn-del-book");

  if (!id) { showToast("Enter a Book ID first.", "error"); return; }
  if (!confirm("Permanently delete this book? This cannot be undone.")) return;

  setBtnLoading(btn, true);
  const result = await apiCall(`/books/delete-book/${id}`, "DELETE");
  setBtnLoading(btn, false);

  if (result) {
    showToast("Book deleted.", "success");
    document.getElementById("del-book-id").value = "";
  }
});

/* ============================================================
   ADD CATEGORY
============================================================ */
document.getElementById("form-add-cat")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn  = e.target.querySelector("button[type=submit]");
  const name = document.getElementById("cat-name").value.trim();
  const desc = document.getElementById("cat-desc").value.trim();

  if (!name) { showToast("Category name is required.", "error"); return; }

  setBtnLoading(btn, true);
  const result = await apiCall("/books/create-category", "POST", {
    name,
    description: desc
  });
  setBtnLoading(btn, false);

  if (result) {
    showToast("Category created!", "success");
    e.target.reset();
  }
});

/* ============================================================
   UPDATE CATEGORY
============================================================ */
document.getElementById("form-update-cat")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn  = e.target.querySelector("button[type=submit]");
  const id   = document.getElementById("uc-id").value.trim();
  const name = document.getElementById("uc-name").value.trim();
  const desc = document.getElementById("uc-desc").value.trim();

  if (!id) { showToast("Category ID is required.", "error"); return; }
  if (!name && !desc) { showToast("Provide at least one field to update.", "error"); return; }

  const payload = {};
  if (name) payload.name        = name;
  if (desc) payload.description = desc;

  setBtnLoading(btn, true);
  const result = await apiCall(`/books/update-category/${id}`, "PUT", payload);
  setBtnLoading(btn, false);

  if (result) {
    showToast("Category updated!", "success");
    e.target.reset();
    loadCategories();
  }
});

/* ============================================================
   DELETE CATEGORY
============================================================ */
document.getElementById("btn-del-cat")?.addEventListener("click", async () => {
  const id  = document.getElementById("del-cat-id").value.trim();
  const btn = document.getElementById("btn-del-cat");

  if (!id) { showToast("Enter a Category ID first.", "error"); return; }
  if (!confirm("Permanently delete this category?")) return;

  setBtnLoading(btn, true);
  const result = await apiCall(`/books/delete-category/${id}`, "DELETE");
  setBtnLoading(btn, false);

  if (result) {
    showToast("Category deleted.", "success");
    document.getElementById("del-cat-id").value = "";
    loadCategories();
  }
});

/* ============================================================
   BOOT
============================================================ */
loadDashboard();
