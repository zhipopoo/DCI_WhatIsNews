# WhatIsNews — News Platform

A full-stack news and information platform built with React + Spring Boot.

---

## 1. Project Overview

### Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | React 18, TypeScript, Vite, TailwindCSS, React Router v6, Zustand, Axios |
| Backend  | Spring Boot 3.2, Java 21, Spring Security, JWT, JPA/Hibernate, MapStruct, Lombok |
| Database | PostgreSQL 16, Flyway                   |
| Infra    | Docker, Docker Compose, Nginx           |

### Project Structure

```
WhatIsNews/
├── docker-compose.yml          # One-command full-stack startup
├── .env                        # Environment variables
├── .gitignore
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/whatisnews/
│       │   ├── WhatIsNewsApplication.java
│       │   ├── common/              # Result, GlobalExceptionHandler
│       │   ├── config/              # SecurityConfig, WebConfig, DataInitializer
│       │   ├── controller/          # NewsController, CategoryController, AuthController, MediaController
│       │   ├── dto/                 # NewsDTO, CategoryDTO, LoginRequest/Response, PageResult
│       │   ├── entity/              # News, Category, AdminUser, MediaFile
│       │   ├── mapper/              # MapStruct mappers (NewsMapper, CategoryMapper)
│       │   ├── repository/          # Spring Data JPA repositories
│       │   ├── security/            # JwtTokenProvider, JwtAuthenticationFilter, UserDetailsServiceImpl
│       │   └── service/             # Service interfaces + impl
│       └── resources/
│           ├── application.yml
│           └── db/migration/
│               └── V1__Initial.sql  # Flyway schema + seed data
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── api/                    # Axios request + API modules
        ├── components/             # Layout, AdminLayout
        ├── pages/
        │   ├── frontend/           # Home, NewsList, NewsDetail, CategoryPage
        │   └── admin/              # Login, Dashboard, NewsManage, NewsEdit, CategoryManage, MediaManage
        ├── store/                  # Zustand auth store
        ├── router/                 # React Router v6 config
        └── types/                  # TypeScript interfaces
```

---

## 2. Quick Start with Docker (Recommended)

### Prerequisites

- Docker & Docker Compose v2+
- (No need to install Java, Node, or PostgreSQL locally)

### One-command startup

```bash
# Clone the project
cd WhatIsNews

# Build and start all services (PostgreSQL + Backend + Frontend)
docker compose up -d --build
```

### Access the application

| Service         | URL                           |
| --------------- | ----------------------------- |
| **Frontend**    | http://localhost:3000         |
| **Backend API** | http://localhost:8080         |
| **Admin Panel** | http://localhost:3000/admin/login |

### Default Admin Account

```
Username: admin
Password: admin123
```

The admin account is auto-created on first startup. You can change defaults via `.env`:

```env
ADMIN_DEFAULT_USERNAME=admin
ADMIN_DEFAULT_PASSWORD=admin123
```

### Stop services

```bash
docker compose down
```

### Stop and remove volumes (clean database)

```bash
docker compose down -v
```

---

## 3. Local Development

### 3.1 Backend Development

**Prerequisites:** Java 21, Maven 3.9+, PostgreSQL 16 running locally.

```bash
# 1. Start PostgreSQL (via Docker or local install)
docker run -d --name postgres-dev \
  -e POSTGRES_DB=whatisnews \
  -e POSTGRES_USER=whatisnews \
  -e POSTGRES_PASSWORD=whatisnews123 \
  -p 5432:5432 \
  postgres:16-alpine

# 2. Navigate to backend
cd backend

# 3. Run Spring Boot (Flyway auto-migrates on startup)
./mvnw spring-boot:run

# Or with Maven wrapper:
mvn spring-boot:run
```

The backend starts at `http://localhost:8080`.

API endpoints:

| Method | Path                                          | Auth     | Description              |
| ------ | --------------------------------------------- | -------- | ------------------------ |
| POST   | `/api/auth/login`                             | Public   | Admin login              |
| GET    | `/api/news`                                   | Public   | List published news      |
| GET    | `/api/news/{id}`                              | Public   | Get news detail          |
| GET    | `/api/news/search?keyword=`                   | Public   | Search news              |
| GET    | `/api/news/featured/top`                      | Public   | Get top/sticky news      |
| GET    | `/api/news/featured/latest`                   | Public   | Get latest news          |
| GET    | `/api/categories`                             | Public   | List all categories      |
| GET    | `/api/categories/{slug}`                      | Public   | Get category by slug     |
| GET    | `/api/admin/news`                             | Admin    | List all news            |
| POST   | `/api/admin/news`                             | Admin    | Create news              |
| PUT    | `/api/admin/news/{id}`                        | Admin    | Update news              |
| DELETE | `/api/admin/news/{id}`                        | Admin    | Soft delete news         |
| PATCH  | `/api/admin/news/{id}/publish`                | Admin    | Toggle publish status    |
| PATCH  | `/api/admin/news/{id}/top`                    | Admin    | Toggle top/sticky        |
| POST   | `/api/admin/categories`                       | Admin    | Create category          |
| PUT    | `/api/admin/categories/{id}`                  | Admin    | Update category          |
| DELETE | `/api/admin/categories/{id}`                  | Admin    | Delete category          |
| POST   | `/api/admin/media/upload`                     | Admin    | Upload file              |
| GET    | `/api/admin/media`                            | Admin    | List media files         |
| DELETE | `/api/admin/media/{id}`                       | Admin    | Delete media file        |

### 3.2 Frontend Development

**Prerequisites:** Node.js 20+, npm.

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server (with API proxy to localhost:8080)
npm run dev
```

The frontend dev server starts at `http://localhost:5173`.

### 3.3 Database Management

Flyway runs migrations automatically on backend startup. To reset the database:

```bash
# Drop and recreate (via psql)
psql -U whatisnews -d postgres -c "DROP DATABASE whatisnews;"
psql -U whatisnews -d postgres -c "CREATE DATABASE whatisnews;"

# Or via Docker
docker compose down -v
docker compose up -d postgres
```

---

## 4. Environment Variables Reference

All variables are defined in `.env`. You can override defaults:

| Variable               | Default                                          | Description                |
| ---------------------- | ------------------------------------------------ | -------------------------- |
| `POSTGRES_DB`          | `whatisnews`                                     | Database name              |
| `POSTGRES_USER`        | `whatisnews`                                     | Database user              |
| `POSTGRES_PASSWORD`    | `whatisnews123`                                  | Database password          |
| `POSTGRES_PORT`        | `5432`                                           | Database port              |
| `BACKEND_PORT`         | `8080`                                           | Backend API port           |
| `FRONTEND_PORT`        | `3000`                                           | Frontend Nginx port        |
| `JWT_SECRET`           | `WhatIsNews-JWT-Secret-Key-2024-Production`      | JWT signing key            |
| `JWT_EXPIRATION`       | `86400000` (24h)                                 | JWT token expiration (ms)  |
| `FILE_UPLOAD_DIR`      | `/app/uploads`                                   | File upload directory      |
| `ADMIN_DEFAULT_USERNAME`| `admin`                                          | Default admin username     |
| `ADMIN_DEFAULT_PASSWORD`| `admin123`                                       | Default admin password     |

---

## 5. Database Schema

### Tables

- **category** — News categories (DCI Cloud Service, AI & AI Models, AI Tools, etc.)
- **news** — Articles with title, subtitle, summary, rich text content, cover image, tags, publish/top flags, soft delete
- **admin_user** — Backend admin accounts with BCrypt password hashing
- **media_file** — Uploaded media files metadata

### Key Design Decisions

- **Soft delete** on news (`is_deleted` flag) — articles are never physically removed
- **GIN indexes** on `title` (trigram) and `tags` (full-text) for search performance
- **Flyway versioned migrations** — database schema is version-controlled
- **BCrypt** password encoding for admin accounts

---

## 6. Architecture Notes

### Security

- **JWT-based authentication** — stateless, token in `Authorization: Bearer <token>` header
- **Public endpoints** — all GET `/api/news/**` and `/api/categories/**` are open
- **Admin endpoints** — `/api/admin/**` require valid JWT
- **File upload** — size limit 20MB, stored to disk, served via `/uploads/**`

### Frontend

- **Vite proxy** in dev mode proxies `/api` → `localhost:8080`
- **Nginx in Docker** proxies `/api/` → backend and serves static files
- **Zustand** manages auth state with localStorage persistence
- **Axios interceptors** attach JWT to admin requests and handle 401 redirects

---

## 7. Deploying to Production

For production deployment, update these settings:

1. **Change default passwords** in `.env` (especially `POSTGRES_PASSWORD`, `JWT_SECRET`, `ADMIN_DEFAULT_PASSWORD`)
2. **Use a strong JWT secret** (64+ character random string)
3. **Enable HTTPS** by adding an SSL certificate to the Nginx config
4. **Setup regular database backups** for the PostgreSQL volume
5. **Configure a reverse proxy** (Nginx/Traefik/Caddy) in front of the Docker setup if needed

```bash
# Generate a strong JWT secret
openssl rand -base64 64
```

---

## 8. Troubleshooting

| Issue                          | Solution                                               |
| ------------------------------ | ------------------------------------------------------ |
| Backend can't connect to DB    | Ensure PostgreSQL is healthy: `docker compose ps`      |
| Frontend can't reach API       | Check nginx.conf proxy settings; ensure backend is up   |
| Flyway migration fails         | Check DB credentials in `.env`; reset DB if needed      |
| Port already in use            | Change `BACKEND_PORT`/`FRONTEND_PORT` in `.env`         |
| Login fails                    | Admin account is created on first startup; check logs   |
| File upload fails              | Check `FILE_UPLOAD_DIR` exists and is writable          |
