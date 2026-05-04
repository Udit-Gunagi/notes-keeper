# ✦ NotesKeeper

A mobile-first, full-stack note-taking app with a clean dark UI. Write freely, organize effortlessly, and find anything instantly.

## 🌐 Live Demo

👉 [View Live Project](https://notes-keeper-92n6.onrender.com)

> ⚠️ **Note:** The backend is hosted on Render's free tier. If the site hasn't been visited in a while, it may take **10–20 seconds** to wake up on the first load. 

---

## 📸 Preview

> _Login, create notes, pin them, search — all from your phone or desktop._

---

## ✨ Features

- 🔐 **User Authentication** — Register and log in with JWT-based sessions
- 📝 **Create Notes** — Add a title, write content, and pick a card color
- ✏️ **Edit Notes** — Tap any note to update it instantly
- 🗑️ **Delete Notes** — Remove notes with a confirm dialog
- 📌 **Pin Notes** — Keep important notes at the top
- 🔍 **Search** — Filter notes by title or content in real time
- 📱 **Fully Responsive** — Works great on mobile, tablet, and desktop
- 🎨 **Unique Dark UI** — Deep space theme with warm amber accents

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js + Express |
| Database | PostgreSQL (Render hosted) |
| Auth | JWT + bcrypt |
| Frontend | HTML, CSS (modular), Vanilla JS |
| Icons | Lucide |
| Fonts | Syne + Plus Jakarta Sans |

---

## 📁 Project Structure

```
noteskeeper/
├── backend/
│   ├── config/
│   │   └── db.js              # PostgreSQL pool + table init
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js            # /api/auth/* endpoints
│   │   └── notes.js           # /api/notes/* endpoints
│   ├── server.js              # Express app entry point
│   ├── .env                   # Environment variables (not committed)
│   └── package.json
│
└── frontend/
    ├── css/
    │   ├── reset.css          # Browser normalization
    │   ├── variables.css      # Design tokens & colors
    │   ├── layout.css         # Page & sidebar structure
    │   ├── components.css     # Cards, modals, forms, buttons
    │   ├── animations.css     # Keyframe animations
    │   └── responsive.css     # Mobile breakpoints
    ├── js/
    │   ├── api.js             # All HTTP calls to backend
    │   ├── auth.js            # Login, register, logout logic
    │   ├── notes.js           # Note CRUD + rendering
    │   ├── ui.js              # Toasts, modals, sidebar
    │   └── app.js             # App entry point, session check
    └── index.html             # Single HTML shell
```

---

## 🚀 Getting Started (Local)

### Prerequisites

- Node.js v18+
- npm

### 1. Clone the repo

```bash
git clone https://github.com/Udit-Gunagi/notes-keeper.git
cd notes-keeper
```

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Set up environment variables

Create a `.env` file inside the `backend/` folder:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key_here
PORT=3001
NODE_ENV=production
```

### 4. Run the app

```bash
node server.js
```

Open **http://localhost:3001** in your browser.

---

## 🌍 Deploying to Render

1. Push the project to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect your repo
3. Set these in the Render dashboard:

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

4. Add environment variables in Render → Environment tab:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | your PostgreSQL URL |
| `JWT_SECRET` | your secret key |
| `NODE_ENV` | `production` |

5. Click **Deploy** — the frontend is served automatically by Express, no separate hosting needed.

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Log in, receive JWT |
| GET | `/api/auth/me` | Get current user (auth required) |

### Notes _(all require `Authorization: Bearer <token>`)_

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes (supports `?search=`) |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
| PATCH | `/api/notes/:id/pin` | Toggle pin status |

---

## 🗃️ Database

Tables are created automatically on first server start using the `nk_` prefix to avoid conflicts with other projects on the same database:

- **nk_users** — id, username, email, password_hash, avatar_color, created_at
- **nk_notes** — id, user_id, title, content, color, pinned, created_at, updated_at

---

## 🎨 Design Highlights

- Deep space dark background with warm **amber accents** — not the usual purple/blue AI-app look
- **Syne** display font for headings, **Plus Jakarta Sans** for body text
- Sidebar becomes a **slide-in drawer** on mobile
- Note modal becomes a **bottom sheet** on small screens
- Color-coded note cards with a built-in color picker
- Real-time **debounced search** so it doesn't spam the API on every keystroke

---

## 👤 Author

**Udit U Gunagi**
- GitHub: [@Udit-Gunagi](https://github.com/Udit-Gunagi)

