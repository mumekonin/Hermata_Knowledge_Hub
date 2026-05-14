# Hermata Knowledge Hub 📚

A comprehensive digital learning infrastructure designed to provide the community of Hermata Merkato, Jimma, with centralized access to educational resources. This full-stack system replaces manual, informal resource sharing with a high-performance, secure, and AI-enhanced digital library.

🌐 **Live App:** [hermata-knowledge-hub-ncfh.vercel.app](https://hermata-knowledge-hub-ncfh.vercel.app)
🔧 **Backend API:** [hermata-knowledge-hub.onrender.com](https://hermata-knowledge-hub.onrender.com)

---

## 🚀 Project Overview

The **Hermata Knowledge Hub** addresses the critical lack of physical library infrastructure in regional areas. By leveraging cloud technology and artificial intelligence, it provides students, distance learners, and researchers with 24/7 access to academic materials.

### Core Objectives

- **Centralization:** A unified repository for PDFs, notes, and e-books.
- **Accessibility:** Overcoming physical and logistical barriers to education.
- **Innovation:** Integrating AI to facilitate digital literacy and research assistance.

---

## 🛠️ Technical Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS (TypeScript) |
| Database | MongoDB with Mongoose ODM |
| Media Storage | Cloudinary CDN (PDFs & Images) |
| AI Engine | Groq AI API |
| Frontend | Vanilla JavaScript, HTML5, CSS3 |
| Security | JWT Authentication & RBAC |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## 📊 Database Schema Specifications

### User Collection
- **name** — Full legal name of the community member.
- **email** — Unique identifier and login credential.
- **password** — Securely hashed user credentials.
- **role** — Access level (`user` by default, `admin` for administrators).

### Category Collection
- **name** — The title of the academic subject or discipline.
- **description** — Contextual overview of the materials within the category.

### Book Collection
- **title** — Full name of the resource.
- **author** — Credited creator or publisher.
- **categoryId** — Reference link to the Category schema.
- **description** — Brief summary of the content.
- **fileUrl** — Secure Cloudinary link for the document resource.
- **coverUrl** — Secure Cloudinary link for the thumbnail image.

### Favorite Collection
- **userId** — Reference link to the authenticated member.
- **bookId** — Reference link to the specific library item.

---

## 🔌 API Reference

> Base URL: `https://hermata-knowledge-hub.onrender.com`

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | Create a new community account |
| POST | `/users/login` | Authenticate and receive a JWT token |
| GET | `/users/profile` | Retrieve authenticated account details |

### 🛠️ Administration (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/books/upload-book` | Upload resources and covers to Cloudinary |
| POST | `/books/create-category` | Initialize a new subject category |
| PUT | `/books/update-book/:id` | Modify resource metadata or files |
| DELETE | `/books/delete-book/:id` | Remove a resource from the library |

### 📖 Library Access

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/books/get-all-books` | View the entire digital catalog |
| GET | `/books/search?key=...` | Keyword search for titles or authors |
| GET | `/books/read/:id` | Stream PDF for online browser viewing |
| GET | `/books/download/:id` | Secure file download with attachment headers |

### 🤖 Personalization & AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/books/add-to-favorites/:bookId` | Save a resource to a personal list |
| GET | `/books/my-favorites` | View all saved resources |
| POST | `/ai/chat` | Interact with the Groq AI assistant |

---

## ⚙️ Installation & Setup

**1. Clone the repository:**
```bash
git clone https://github.com/yourusername/hermata-knowledge-hub.git
cd hermata-knowledge-hub
```

**2. Install backend dependencies:**
```bash
cd backend
npm install
```

**3. Configure environment variables** — create a `.env` file inside `/backend`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
```

**4. Run the backend:**
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

**5. Open the frontend:**

Open `frontend/index.html` in your browser, or deploy the `frontend/` folder to Vercel.

---

## 🌍 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [hermata-knowledge-hub-ncfh.vercel.app](https://hermata-knowledge-hub-ncfh.vercel.app) |
| Backend | Render | [hermata-knowledge-hub.onrender.com](https://hermata-knowledge-hub.onrender.com) |

---

## 📁 Project Structure

```
hermata-knowledge-hub/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── ai/               # Groq AI module
│   │   ├── books/            # Books, categories, favorites
│   │   ├── users/            # Auth & user management
│   │   └── common/           # Guards, strategies, utils
│   └── ...
├── frontend/                 # Static HTML/CSS/JS
│   ├── index.html            # Dashboard (home)
│   ├── login.html
│   ├── browse.html
│   ├── script/               # JS per page
│   └── style/                # CSS per page
└── README.md
```

---

## 🔒 Security

- All protected routes require a valid **JWT Bearer token**.
- Admin-only endpoints are enforced via **Role-Based Access Control (RBAC)**.
- Passwords are hashed before storage — never stored in plain text.

---

