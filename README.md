# 🌐 NEXUS Social Media Platform

A full-stack social media platform built with **PHP (vanilla)** backend and **React** frontend.

---

## Features

- 📝 Posts (text, image, video) with likes & comments
- 💬 Real-time messaging (polling)
- 🎬 Video upload & streaming
- 💼 Tasks / Gigs marketplace
- 🔔 Notifications system
- 👤 User profiles with follow system
- 🛡️ Kids Mode with screen time tracking
- 👮 Full Admin Panel (dashboard, moderation, reports, logs)
- 🔐 JWT Authentication + 2FA support
- 📊 Trust scores & reputation system

---

## Requirements

| Tool | Version |
|------|---------|
| PHP  | 8.2+    |
| MySQL | 8.0+   |
| Node.js | 18+  |
| npm  | 9+      |

---

## Quick Setup

### 1. Database

```bash
mysql -u root -p -e "CREATE DATABASE nexus_db;"
mysql -u root nexus_db < backend/database/schema.sql
```

### 2. Backend

```bash
cd backend

# Edit config/database.php with your MySQL credentials
# DB_HOST, DB_NAME, DB_USER, DB_PASS

# Start PHP dev server
php -S localhost:8000 -t public
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Default Admin

| Field    | Value             |
|----------|-------------------|
| Email    | admin@nexus.com   |
| Password | admin123          |
| URL      | /admin/login      |

> ⚠️ Change the password after first login!

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| POST | /api/auth/verify-2fa | Verify 2FA code |
| POST | /api/auth/admin-login | Admin login |
| GET  | /api/auth/me | Get current user |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/posts/feed | Personalized feed |
| GET  | /api/posts/explore | Trending posts |
| POST | /api/posts | Create post |
| POST | /api/posts/:id/like | Like post |
| POST | /api/posts/:id/unlike | Unlike post |
| GET  | /api/posts/:id/comments | Get comments |
| POST | /api/posts/:id/comments | Add comment |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/messages | List conversations |
| POST | /api/messages | Send message |
| GET  | /api/messages/:id | Get conversation |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/users/:id | User profile |
| PUT  | /api/users/me | Update profile |
| POST | /api/users/:id/follow | Follow |
| POST | /api/users/:id/unfollow | Unfollow |
| GET  | /api/users/search?q= | Search users |

### Videos, Tasks, Reports, Notifications
See `backend/routes/api.php` for the full list.

---

## Project Structure

```
nexus/
├── backend/              # PHP API
│   ├── public/           # Entry point (index.php)
│   ├── app/
│   │   ├── Controllers/  # Request handlers
│   │   ├── Models/       # Database models
│   │   ├── Helpers/      # JWT, Auth, Response
│   ├── config/           # DB config
│   ├── routes/           # API routes
│   └── database/         # SQL schema
│
└── frontend/             # React app
    ├── src/
    │   ├── pages/        # All pages
    │   ├── components/   # Reusable UI
    │   ├── context/      # Auth context
    │   └── utils/        # API client
    └── index.html
```

---

## Kids Mode Setup

1. Register a child account
2. Log in as the parent
3. Call `POST /api/parental/link` with `{ "child_id": <child_id> }`
4. Set screen time: `POST /api/parental/screen-time` with `{ "child_id": ..., "minutes": 120 }`
5. The child's account now shows the Kids Mode interface automatically

---

## Security Notes

- JWT tokens expire after **7 days**
- 2FA codes expire after **10 minutes**
- Passwords are hashed with **bcrypt**
- All admin routes require `role: admin` in JWT
- Content is auto-flagged on report

---

## Production Deployment

1. Set up Apache/Nginx to point to `backend/public/`
2. Update CORS origins in `backend/public/index.php`
3. Update `frontend/vite.config.js` proxy or set `VITE_API_URL`
4. Run `npm run build` and serve `frontend/dist/`
5. Change JWT_SECRET and admin password

---

Built with ❤️ — NEXUS Platform
