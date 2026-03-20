# CloudDrop — File Sharing Application

A full-stack application for **real-time room-based file sharing** and **chat**. Users create or join a room, upload files over HTTP, and receive notifications and messages over WebSockets. The backend follows **Domain-Driven Design (DDD)** with clear layers (domain, application, presentation, infrastructure).

---

## Features

- **Rooms** — Create ephemeral rooms; members tracked in Redis (`room:{roomId}`).
- **File upload** — Multipart uploads (up to 50 MB) stored on disk; download URLs shared with room members.
- **Real-time updates** — WebSocket events for `room-created`, `join-ack`, `file-ready`, and relayed chat `message`.
- **User accounts** — Register and login with bcrypt-hashed passwords persisted in PostgreSQL (Prisma).

---

## Tech Stack

| Layer        | Technologies |
|-------------|--------------|
| **Frontend** | React 19, TypeScript, Vite 6, React Router 7 |
| **Backend**  | Node.js, Express 5, TypeScript, `ws`, Multer |
| **Data**     | PostgreSQL (Prisma ORM), Redis |
| **Auth**     | bcrypt |

---

## Repository Structure

```
file_sharing_application/
├── client/                 # React SPA (Vite)
│   └── src/
├── server/                 # DDD-style API + WebSocket server
│   ├── src/
│   │   ├── domain/         # Interfaces, WS contracts
│   │   ├── application/    # Use cases
│   │   ├── presentation/   # HTTP controllers, WS gateway
│   │   ├── infrastructure/ # Prisma, Redis, disk, WS notifier
│   │   ├── ddd/            # Composition root (dependency wiring)
│   │   └── main.ts         # Entry point
│   ├── prisma/             # Prisma schema & migrations
│   ├── connection/         # Prisma client bootstrap
│   ├── redisClient/        # Redis client
│   ├── uploadedFiles/      # Uploaded file storage (runtime)
│   └── architecture.md     # DDD architecture & API contract
└── README.md               # This file
```

For detailed backend boundaries, layers, and HTTP/WebSocket contracts, see **[server/architecture.md](server/architecture.md)**.

---

## Prerequisites

- **Node.js** (LTS recommended, e.g. 20+)
- **PostgreSQL** — database for Prisma (`User` model)
- **Redis** — room membership and room registry

---

## Environment Variables

### Server (`server/`)

Create `server/.env` (or export variables in your shell):

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string for Prisma | `postgresql://user:pass@localhost:5432/filesharing` |
| `PORT` | HTTP + WebSocket listen port (optional) | `8080` |
| `PUBLIC_BASE_URL` | Base URL used in file download links (optional; defaults to `http://localhost:{PORT}`) | `http://localhost:8080` |

Redis is configured in `server/redisClient/redisClient.js` (default `redis://localhost:6379`). Adjust there or refactor to env if you deploy to another host.

---

## Getting Started

### 1. Install dependencies

From the repository root:

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Database (PostgreSQL + Prisma)

```bash
cd server
# Ensure DATABASE_URL is set in .env
npx prisma migrate dev
# or: npx prisma db push
npx prisma generate
```

### 3. Redis

Start Redis locally (e.g. `redis-server`) so it matches the URL in `server/redisClient/redisClient.js`.

### 4. Run the backend

```bash
cd server
npm run dev          # Development (TypeScript via ts-node + nodemon)
# or production-style:
npm run build && npm start
```

Default URL: **http://localhost:8080** (HTTP and WebSocket on the same port).

### 5. Run the frontend

```bash
cd client
npm run dev
```

Open the URL Vite prints (typically **http://localhost:5173**). The client is configured to call the API and WebSocket on **localhost:8080**; if you change `PORT` or host, update the client (e.g. `client/src/context/websocket.context.tsx` and upload URLs in the dashboard).

---

## Scripts

### Server (`server/package.json`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server with reload (`ts-node`, watches `src/`) |
| `npm run build` | Compile TypeScript to `server/dist/` |
| `npm start` | Runs `prestart` (build) then `node dist/main.js` |
| `npm run start:legacy` | Legacy monolithic entry (if present) |

### Client (`client/package.json`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

---

## API Overview (Stable Contract)

The backend intentionally keeps a **stable** HTTP and WebSocket contract for the existing UI. Summary:

**HTTP**

- `POST /register` — Register user  
- `POST /login` — Login  
- `POST /files/upload` — Multipart: `file`, `roomId`  
- `GET /files/:filename` — Download stored file  
- Static files under `/uploadedFiles/`

**WebSocket** (JSON messages)

- Client → server: `createRoom`, `join`, `message`  
- Server → client: `room-created`, `join-ack`, `message`, `file-ready`, `error`

Full request/response shapes are documented in **[server/architecture.md](server/architecture.md)**.

---

## Production Notes

- Set `PUBLIC_BASE_URL` (and `PORT`) so download links match your public URL.
- Run `npm run build` in `client/` and serve the `client/dist` assets behind a reverse proxy (e.g. nginx) alongside the Node server.
- Secure Redis and PostgreSQL; use strong secrets and TLS in production.
- Consider rate limiting, HTTPS/WSS, and authentication tokens for production hardening beyond this demo scope.

---

## License

ISC (see `server/package.json` / `client/package.json` as applicable). Add a root `LICENSE` file if you standardize on a single license for the whole repo.
