# ⚔️ AlgoArena — Online Judge & Algorithmic Practice Platform

AlgoArena is an asynchronous coding practice platform inspired by LeetCode. It features a Monaco-powered online coding workspace, background job queues powered by Redis and BullMQ, isolated code execution via Judge0, real-time status updates via Socket.IO, comprehensive problem administration, and user progress metrics.

---

## 🌟 Key Features

- **Monaco Code Editor**: Multi-language syntax highlighting, themes (dark/light), font scaling, starter templates, and client-side draft auto-saving.
- **Asynchronous Online Judge**: Submissions are persisted immediately, queued in BullMQ, and processed by background workers without blocking HTTP connections.
- **Pluggable Execution Adapters**:
  - `MockAdapter`: Built-in deterministic mock for offline local development and automated testing without external dependencies.
  - `Judge0Adapter`: Production adapter integrating with Judge0 CE via RapidAPI or self-hosted instances with base64 encoding and resource limits.
- **Secure Evaluation Engine**: Line normalization, exact/JSON/float comparators, early failure termination, and strict output sanitization. Private test cases are never exposed over public APIs.
- **Rich Dashboard & Metrics**: Real-time stats on solved problems by difficulty, topic-wise progress bars, day streaks, and acceptance rates computed from persisted records.
- **Problem Administration**: Admin dashboard to create/edit problems, configure resource limits, manage test cases (public/private), and validate before publishing.
- **Security Protections**: Rate limiting, Helmet HTTP headers, password hashing with bcrypt (12 rounds), HttpOnly JWT authentication cookies, and input validation with Zod.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Monaco Editor, Zustand, Recharts, Lucide React, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO, Helmet, CORS, Morgan, Zod, Cookie Parser |
| **Database** | MongoDB with Mongoose |
| **Job Queue** | Redis with BullMQ |
| **Execution** | Judge0 CE (or deterministic MockAdapter) |
| **Testing** | Jest, Supertest, React Testing Library, Vitest |
| **Documentation** | Swagger / OpenAPI 3.0 (`/api-docs`) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally or via Docker
- Redis running locally or via Docker

### 2. Environment Configuration
Copy `.env.example` to `server/.env`:

```bash
cp .env.example server/.env
```

Key variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/algoarena
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CLIENT_URL=http://localhost:5173
EXECUTION_PROVIDER=mock
```

To use a real Judge0 instance:
```env
EXECUTION_PROVIDER=judge0
JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-rapidapi-key
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
```

### 3. Start Database & Redis (Optional Docker Compose)
```bash
docker-compose up -d
```

### 4. Seed the Database
Populate demo users, 18 curated problems across all categories, and test cases:
```bash
npm run seed
```

**Pre-seeded Demo Accounts:**
- **Admin**: `admin@algoarena.com` / `Admin@Password123`
- **User**: `john@example.com` / `User@Password123`

### 5. Start the Application

In terminal 1 (Express API Server):
```bash
npm run dev:server
```

In terminal 2 (Vite Frontend):
```bash
npm run dev:client
```

In terminal 3 (Optional standalone Worker process):
```bash
npm run dev:worker
```
*(Note: If worker process is not started separately, the main server automatically spawns worker threads).*

Visit **http://localhost:5173** to use the application!

---

## 📖 API Documentation

Interactive Swagger documentation is available at:
**http://localhost:5000/api-docs**

Key endpoints:
- `POST /api/v1/auth/register` — User registration
- `POST /api/v1/auth/login` — User login (sets HttpOnly cookie)
- `GET  /api/v1/problems` — List published problems (with search & filters)
- `GET  /api/v1/problems/:slug` — Problem statement & public test cases
- `POST /api/v1/problems/:id/run` — Run code against sample tests
- `POST /api/v1/problems/:id/submit` — Submit code for full evaluation
- `GET  /api/v1/submissions/:id/status` — Submission status polling
- `GET  /api/v1/users/me/progress` — Solved counts, difficulty breakdown, topics
- `GET  /api/v1/admin/problems` — Admin problem listing & management

---

## 🧪 Running Automated Tests

Run backend test suite:
```bash
npm run test:server
```

Run frontend build verification:
```bash
npm run build:client
```
