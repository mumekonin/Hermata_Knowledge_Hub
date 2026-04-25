# Hermata Knowledge Hub 📚

A comprehensive digital learning infrastructure designed to provide the community of Hermata Merkato, Jimma, with centralized access to educational resources. This full-stack system replaces manual, informal resource sharing with a high-performance, secure, and AI-enhanced digital library.

---

## 🚀 Project Overview

The **Hermata Knowledge Hub** addresses the critical lack of physical library infrastructure in regional areas. By leveraging cloud technology and artificial intelligence, it provides students, distance learners, and researchers with 24/7 access to academic materials.

### Core Objectives
* **Centralization:** A unified repository for PDFs, notes, and e-books.
* **Accessibility:** Overcoming physical and logistical barriers to education.
* **Innovation:** Integrating AI to facilitate digital literacy and research assistance.

---

## 🛠️ Technical Stack

* **Backend:** NestJS (TypeScript)
* **Database:** MongoDB with Mongoose ODM
* **Media Storage:** Cloudinary CDN (for PDFs and Images)
* **AI Engine:** Groq AI API
* **Frontend:** Vanilla JavaScript, HTML5, CSS3
* **Security:** JWT Authentication & Role-Based Access Control (RBAC)

---

## 📊 Database Schema Specifications

The system is built on a structured MongoDB foundation with the following key fields:

### User Collection
* **name**: Full legal name of the community member.
* **email**: Unique identifier and login credential.
* **password**: Securely hashed user credentials.
* **role**: Access level (Default: 'user', Admin: 'admin').

### Category Collection
* **name**: The title of the academic subject or discipline.
* **description**: Contextual overview of the materials within the category.

### Book Collection
* **title**: Full name of the resource.
* **author**: Credited creator or publisher.
* **categoryId**: Reference link to the Category schema.
* **description**: Brief summary of the content.
* **fileUrl**: Secure Cloudinary link for the document resource.
* **coverUrl**: Secure Cloudinary link for the thumbnail image.

### Favorite Collection
* **userId**: Reference link to the authenticated member.
* **bookId**: Reference link to the specific library item.

---

## 🔌 API Reference

### 🔐 Authentication
* `POST /users/register` - Create a new community account.
* `POST /users/login` - Authenticate and receive a JWT session token.
* `GET /users/profile` - Retrieve authenticated account details.

### 🛠️ Administration (Admin Only)
* `POST /books/upload-book` - Upload resources and covers to Cloudinary.
* `POST /books/create-category` - Initialize a new subject category.
* `PUT /books/update-book/:id` - Modify resource metadata or files.
* `DELETE /books/delete-book/:id` - Remove a resource from the library.

### 📖 Library Access
* `GET /books/get-all-books` - View the entire digital catalog.
* `GET /books/search?key=...` - Keyword-based search for titles or authors.
* `GET /books/read/:id` - Stream PDF for online browser viewing (Proxy Stream).
* `GET /books/download/:id` - Secure file download with attachment headers.

### 🤖 Personalization & AI
* `POST /books/add-to-favorites/:bookId` - Save a resource to a personal list.
* `GET /books/my-favorites` - View all saved resources.
* `POST /ai/chat` - Interact with the Groq AI assistant for research help.

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/hermata-knowledge-hub.git](https://github.com/yourusername/hermata-knowledge-hub.git)
Install dependencies:
Bash

    npm install

Run the application:

Bash
# Development mode

    npm run start:dev
