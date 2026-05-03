# ✦ NotesKeeper

A lightweight, mobile-first note-taking app with a clean dark UI. Built with Node.js, Express, and PostgreSQL on the backend, and plain HTML/CSS/JS on the frontend — no framework overhead, just fast and functional.

---

## Features

- **User Authentication** — Register and log in with JWT-based sessions (7-day expiry)
- **Create Notes** — Add a title, write content, and pick a card color
- **Edit Notes** — Tap any note to edit it in-place
- **Delete Notes** — Permanently remove notes with a confirm dialog
- **Pin Notes** — Keep important notes at the top of your list
- **Search** — Filter notes by title or content in real time
- **Responsive Design** — Works great on mobile, tablet, and desktop
- **Persistent Storage** — All data stored in PostgreSQL on Render

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js + Express |
| Database | PostgreSQL (Render hosted) |
| Auth | JWT + bcrypt |
| Frontend | HTML, CSS (modular), Vanilla JS |
| Icons | Lucide |
| Fonts | Syne + Plus Jakarta Sans |

---

## Project Structure

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
    │   ├── variables.css      # Design tokens
    │   ├── layout.css         # Page & sidebar structure
    │   ├── components.css     # Cards, modals, forms, buttons
    │   ├── animations.css     # Keyframe animations
    │   └── responsive.css     # Mobile breakpoints
    ├── js/
    │   ├── api.js             # All HTTP calls to backend
    │   ├── auth.js            # Login, register, logout logic
    │   ├── notes.js           # Note CRUD + rendering
    │   ├── ui.js              # Toasts, modals, sidebar
    │   └── app.js             # App entry, session check
    └── index.html             # Single HTML shell
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/noteskeeper.git
cd noteskeeper
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Set up environment variables

The `.env` file is already configured with the Render PostgreSQL connection string. If you need to change the database, update `DATABASE_URL` in `backend/.env`.

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key_here
PORT=3001
NODE_ENV=production
```

### 4. Run the app

```bash
# from the backend/ directory
npm start
```

The server starts on **http://localhost:3001** and serves the frontend statically from the `frontend/` folder.

For development with auto-restart:

```bash
npm run dev
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Log in, receive JWT |
| GET | `/api/auth/me` | Get current user (auth required) |

### Notes (all require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes (supports `?search=`) |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
| PATCH | `/api/notes/:id/pin` | Toggle pin status |

---

## Database

Tables are created automatically on first run:

- **users** — id, username, email, password_hash, avatar_color, created_at
- **notes** — id, user_id, title, content, color, pinned, created_at, updated_at

---

## Deployment

This app is designed to deploy easily on **Render**:

1. Push the project to GitHub
2. Create a new **Web Service** on Render
3. Set the root directory to `backend/`
4. Set the build command: `npm install`
5. Set the start command: `npm start`
6. Add your environment variables in the Render dashboard

The frontend is served statically by Express — no separate hosting needed.

---

## Design Choices

- **Dark amber theme** — Deep space background with warm amber accents, avoids the usual purple/blue AI-app look
- **Syne + Plus Jakarta Sans** — Display font with personality, readable body font
- **Mobile-first** — Sidebar becomes a slide-in drawer below 768px, modal becomes a bottom sheet
- **No framework** — Keeps things fast and dependency-free on the frontend

---

## License

MIT — do whatever you want with it.
