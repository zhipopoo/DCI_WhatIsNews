# CLAUDE.md — WhatIsNew

> Full-stack news & information platform. React 18 + Spring Boot 3.2 + PostgreSQL 16.

---

## Project Overview

**WhatIsNew** is a content-management and public-facing news platform. The frontend is a React 18 SPA (Vite + TailwindCSS + Zustand) and the backend is a Spring Boot 3.2 REST API (Java 21, Spring Security, JWT, JPA/Hibernate, Flyway).

The admin panel manages articles, categories, media uploads, and users. Public visitors browse articles through a responsive news UI with category filtering, search, and hero carousel.

### Quick Architecture

```
Browser ──→ Nginx (:3000) ──→ /api/* ──→ Spring Boot (:8080) ──→ PostgreSQL (:5432)
                                   └── /uploads/* (static files)
```

- **Frontend**: Vite dev server (`:5173`) proxies `/api` & `/uploads` → `localhost:8080`.
- **Docker**: Nginx serves built frontend and reverse-proxies API calls to the backend container.
- **Auth**: JWT stateless; public GET endpoints vs. admin-only mutations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 5, TailwindCSS 3, React Router v6, Zustand 4, Axios |
| Rich Editor | TipTap 3 (custom extensions for image, video, audio, table, link) |
| Backend | Spring Boot 3.2.5, Java 21, Spring Security, JWT (jjwt 0.12.5), JPA/Hibernate |
| Code Gen | Lombok, MapStruct 1.5.5 |
| Database | PostgreSQL 16, Flyway (versioned migrations) |
| Infra | Docker Compose, Nginx, k8s manifests (Helm charts available) |

---

## Project Structure

```
DCI_WhatIsNews/
├── CLAUDE.md                    ← this file
├── .env                         # env vars for Docker Compose
├── docker-compose.yml           # postgres + backend + frontend
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── pom.xml                  # Spring Boot 3.2.5, jjwt, MapStruct, Lombok
│   └── src/main/
│       ├── java/com/whatisnew/
│       │   ├── WhatIsNewApplication.java
│       │   ├── common/
│       │   │   ├── Result.java              # Unified response {code, message, data}
│       │   │   └── GlobalExceptionHandler.java
│       │   ├── config/
│       │   │   ├── SecurityConfig.java      # Spring Security + JWT filter setup
│       │   │   ├── WebConfig.java           # CORS, static resource mapping
│       │   │   └── DataInitializer.java     # Creates default admin on first run
│       │   ├── controller/
│       │   │   ├── AuthController.java      # POST /api/auth/login
│       │   │   ├── NewsController.java      # GET /api/news/**, admin CRUD
│       │   │   ├── CategoryController.java  # GET /api/categories/**, admin CRUD
│       │   │   ├── MediaController.java     # Upload, list, delete media
│       │   │   └── UserController.java      # Admin user management
│       │   ├── dto/                         # DTOs + PageResult<T>
│       │   ├── entity/                      # JPA entities: News, Category, AdminUser, MediaFile
│       │   ├── mapper/                      # MapStruct: NewsMapper, CategoryMapper
│       │   ├── repository/                  # Spring Data JPA repositories
│       │   ├── security/
│       │   │   ├── JwtTokenProvider.java
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   └── UserDetailsServiceImpl.java
│       │   └── service/                     # interfaces + impl/ subdirectories
│       └── resources/
│           ├── application.yml
│           └── db/migration/
│               ├── V1__Initial.sql          # base schema + seed data
│               └── V2__Update_Categories.sql
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts           # port 5173, proxy /api & /uploads → :8080
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── api/                 # request.ts (Axios instance) + auth/news/category/media/user API modules
│       ├── components/
│       │   ├── Layout.tsx       # Public layout (Header + Footer)
│       │   ├── AdminLayout.tsx  # Admin layout (sidebar + auth guard)
│       │   └── HeroCarousel.tsx # Top-story carousel on homepage
│       ├── pages/
│       │   ├── frontend/
│       │   │   ├── Home.tsx
│       │   │   ├── NewsList.tsx
│       │   │   ├── NewsDetail.tsx
│       │   │   └── CategoryPage.tsx
│       │   └── admin/
│       │       ├── Login.tsx
│       │       ├── Dashboard.tsx
│       │       ├── NewsManage.tsx
│       │       ├── NewsEdit.tsx          # TipTap rich-text editor
│       │       ├── CategoryManage.tsx
│       │       ├── MediaManage.tsx
│       │       └── UserManage.tsx
│       ├── store/
│       │   └── authStore.ts     # Zustand store (token, user, actions)
│       ├── router/
│       │   └── index.tsx        # React Router v6 config
│       └── types/
│           └── index.ts         # All TypeScript interfaces
│
├── k8s/                         # Kubernetes deployment manifests + Helm charts
│   ├── manifest.yaml
│   ├── backend/                 # Helm chart for backend
│   ├── frontend/                # Helm chart for frontend
│   └── postgres/                # StatefulSet + PVC + Service
│
└── docs/                        # Changelog / feature docs
    └── 2026-06-01.md
```

---

## Common Commands

### Docker (full-stack quick start)

```bash
docker compose up -d --build    # start postgres + backend + frontend
docker compose down             # stop
docker compose down -v          # stop + wipe DB volume
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:8080
- Admin → http://localhost:3000/admin/login (admin / admin123)

### Backend (local dev)

```bash
cd backend
./mvnw spring-boot:run          # needs local postgres:5432
# or
mvn spring-boot:run
```

- Starts on `:8080`
- Flyway auto-runs migrations on startup
- `application.yml` sets `show-sql: false`, `ddl-auto: validate`

### Frontend (local dev)

```bash
cd frontend
npm install
npm run dev                     # Vite dev server on :5173
npm run build                   # tsc + vite build → dist/
```

- Vite proxies `/api` and `/uploads` to `http://localhost:8080`
- Path alias `@/` → `./src/`

---

## API Endpoints

### Public

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login, returns JWT |
| GET | `/api/news` | Paginated published news (`?page=&size=&categoryId=`) |
| GET | `/api/news/{id}` | News detail (with prev/next) |
| GET | `/api/news/search?keyword=` | Full-text search on title+tags |
| GET | `/api/news/featured/top` | Top/sticky articles |
| GET | `/api/news/featured/latest` | Latest articles |
| GET | `/api/categories` | All categories |
| GET | `/api/categories/{slug}` | Category by slug |

### Admin (Authorization: Bearer `<token>`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/news` | List all news (including unpublished) |
| POST | `/api/admin/news` | Create article |
| PUT | `/api/admin/news/{id}` | Update article |
| DELETE | `/api/admin/news/{id}` | Soft-delete (sets `is_deleted=true`) |
| PATCH | `/api/admin/news/{id}/publish` | Toggle publish |
| PATCH | `/api/admin/news/{id}/top` | Toggle sticky |
| GET | `/api/admin/media` | List media files (paginated) |
| POST | `/api/admin/media/upload` | Upload file (multipart, max 2GB) |
| DELETE | `/api/admin/media/{id}` | Delete media file + disk file |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/{id}` | Update category |
| DELETE | `/api/admin/categories/{id}` | Delete category |
| GET | `/api/admin/users` | List admin users |
| POST | `/api/admin/users` | Create admin user |
| PATCH | `/api/admin/users/{id}/password` | Change password |

### Unified Response Format

```json
{ "code": 200, "message": "success", "data": ... }
```

`Result<T>` class in `backend/src/main/java/com/whatisnew/common/Result.java` provides static factory methods: `Result.success(data)`, `Result.error(msg)`, `Result.notFound(...)`, etc.

Paginated endpoints return `PageResult<T>`:

```json
{ "content": [...], "page": 0, "size": 10, "totalElements": 42, "totalPages": 5, "first": true, "last": false }
```

---

## Database (PostgreSQL 16)

### Tables

| Table | Key columns | Notes |
|---|---|---|
| `category` | id, name, slug, description, sort_order, created_at, updated_at | 8 categories seeded |
| `news` | id, title, subtitle, summary, content (text), cover_image, category_id, tags, author, is_published, is_top, view_count, is_deleted, published_at, created_at, updated_at | GIN trigram index on title, GIN on tags to_tsvector |
| `admin_user` | id, username, password (BCrypt), display_name, email, is_active, last_login_at, created_at, updated_at | Default admin auto-created |
| `media_file` | id, original_name, stored_name, file_path, file_size, mime_type, file_type, width, height, created_at | Uploaded files reference |

### Key DB Decisions

- **Soft delete**: `news.is_deleted` flag — articles never physically removed.
- **GIN indexes**: trigram (`pg_trgm`) on `title`, full-text on `tags` for fast search.
- **Flyway**: schema versioned in `V1__Initial.sql`, `V2__Update_Categories.sql`.
- **BCrypt** for admin passwords via Spring Security.

---

## Backend Code Conventions

### Layered Architecture

```
controller → service (interface) → service/impl → repository → entity
                ↕
              mapper (MapStruct) → dto
```

- **Controllers**: Only HTTP concerns (annotations, param binding, calling service). Return `Result<T>`.
- **Services**: Interfaces define contract; `impl/` contains implementations. Business logic lives here.
- **Repositories**: Spring Data JPA interfaces. Custom queries use `@Query` with JPQL.
- **Mappers**: MapStruct interfaces (`NewsMapper`, `CategoryMapper`) for entity ↔ DTO conversion.
- **Entities**: JPA `@Entity` with Lombok `@Data`, table names match DB exactly.
- **DTOs**: Plain Lombok `@Data` classes. `PageResult<T>` is the generic pagination container.

### Auth Flow

```
POST /api/auth/login {username, password}
  → AuthService validates credentials (BCrypt)
  → returns JWT token
  → Frontend stores in Zustand + localStorage
  → All admin requests include Authorization: Bearer <token>
  → JwtAuthenticationFilter extracts & validates on every request
```

- JWT secret & expiration read from `application.yml` (`jwt.secret`, `jwt.expiration`).
- Public endpoints under `/api/news/**` and `/api/categories/**` are permitAll.
- `/api/admin/**` requires authentication.

### Configuration

- `SecurityConfig.java`: Security filter chain, CORS, public/admin URL patterns.
- `WebConfig.java`: Static resource mappings for `/uploads/**`.
- `DataInitializer.java`: `ApplicationRunner` — creates default admin if `admin_user` table is empty.

---

## Frontend Code Conventions

### Directory Pattern

```
src/
├── api/           # API client modules (one file per resource: news.ts, auth.ts, etc.)
├── components/    # Shared/reusable components
├── pages/         # Route-level page components (frontend/ for public, admin/ for admin)
├── store/         # Zustand stores (currently authStore.ts)
├── router/        # React Router config
└── types/         # TypeScript interfaces
```

### State Management (Zustand)

`authStore.ts` manages:
- `token`, `username`, `displayName` — persisted to `localStorage`
- `login(username, password)` — calls API, sets state
- `logout()` — clears state + localStorage
- `isAuthenticated` computed flag

### API Layer (`frontend/src/api/request.ts`)

- Axios instance with `baseURL: '/api'`
- Request interceptor attaches `Authorization: Bearer <token>` for admin routes
- Response interceptor redirects to `/admin/login` on 401
- Each API module exports typed async functions returning `ApiResult<T>` or `PageResult<T>`

### Routing

| Path | Component | Layout |
|---|---|---|
| `/` | Home | Layout (public header/footer) |
| `/news` | NewsList | Layout |
| `/news/:id` | NewsDetail | Layout |
| `/category/:slug` | CategoryPage | Layout |
| `/admin/login` | AdminLogin | Standalone (no layout) |
| `/admin` | Dashboard | AdminLayout (sidebar + auth guard) |
| `/admin/news` | NewsManage | AdminLayout |
| `/admin/news/new` | NewsEdit | AdminLayout |
| `/admin/news/:id/edit` | NewsEdit | AdminLayout |
| `/admin/categories` | CategoryManage | AdminLayout |
| `/admin/media` | MediaManage | AdminLayout |
| `/admin/users` | UserManage | AdminLayout |

### Rich Text Editor (TipTap)

`NewsEdit.tsx` uses TipTap with extensions: StarterKit, Image, Link, Table (+ cell/header/row), Underline, Placeholder. Custom toolbar exposes bold, italic, heading, bullet list, ordered list, blockquote, image, link, table, underline, strikethrough, code, horizontal rule.

---

## Environment Variables

All in `.env` at project root:

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_DB` | `whatisnew` | Database name |
| `POSTGRES_USER` | `whatisnew` | DB user |
| `POSTGRES_PASSWORD` | `whatisnew123` | DB password |
| `POSTGRES_PORT` | `5432` | DB port |
| `BACKEND_PORT` | `8080` | API port |
| `FRONTEND_PORT` | `3000` | Nginx port |
| `JWT_SECRET` | (default key) | JWT signing secret |
| `JWT_EXPIRATION` | `86400000` (24h) | Token TTL in ms |
| `FILE_UPLOAD_DIR` | `/app/uploads` | Upload storage path |
| `ADMIN_DEFAULT_USERNAME` | `admin` | Seed admin username |
| `ADMIN_DEFAULT_PASSWORD` | `admin123` | Seed admin password |

---

## Deployment

### Docker Compose

```bash
docker compose up -d --build
```

Three services: `postgres:16-alpine` (health check before backend starts), `backend` (Spring Boot on `:8080`), `frontend` (Nginx on `:80` mapped to `:3000`). Two named volumes: `postgres_data`, `uploads_data`.

### Kubernetes

`k8s/` directory contains Helm charts per service (`backend/`, `frontend/`, `postgres/`) plus standalone YAML (`manifest.yaml`, `secrets.yaml`, `namespace.yaml`). GitLab CI in `.gitlab-ci.yml`. Deploy script: `deploy.sh`.

---

## Key Files for Common Changes

| What to change | Where to look |
|---|---|
| Add a news field | `News.java` entity → `NewsDTO.java` → `NewsMapper.java` → DB migration → `NewsFormData` in `types/index.ts` → `NewsEdit.tsx` |
| Add a category | DB migration → `Category.java` entity → `CategoryDTO.java` → admin page + public page |
| Change JWT expiry | `application.yml` (`jwt.expiration`) or `.env` (`JWT_EXPIRATION`) |
| Change upload size limit | `application.yml` (`spring.servlet.multipart.max-file-size`) |
| Add an admin API | New method in a `*Controller.java` → `SecurityConfig.java` if new URL pattern |
| Add a public page | New component in `pages/frontend/` → add route in `router/index.tsx` |
| Change sidebar nav | `AdminLayout.tsx` |
| Change footer/header | `Layout.tsx` |
| Modify search behavior | `NewsRepository.java` custom queries → `NewsService/impl` → `NewsController` |

---

## Recent Work (2026-06-01)

- Category restructuring: 8 categories across News, DCI Cloud Services, AI Models, Training Videos
- Hero carousel component (`HeroCarousel.tsx`) with top-article highlighting
- TipTap rich-text editor with custom extensions (video, audio, image, table, link)
- Media file lifecycle management (upload, list, delete with disk cleanup)
- Media library table view with file type icons
- Pagination component for admin news/media lists
- User management CRUD
- Footer redesign
- Upload size fix (max-file-size increased to 2048MB)
- CI image registry switch

---

## Notes for Claude

- This is a **production project** — always check `.env` for current config values before suggesting changes.
- The Spring Boot Maven wrapper (`mvnw`) is available in the `backend/` directory.
- Frontend uses **TailwindCSS** for all styling — never suggest CSS modules or styled-components.
- Backend uses **MapStruct** for entity/DTO mapping — don't hand-write mapping code in services.
- All API responses wrap in `Result<T>` — frontend always reads `response.data.code` and `response.data.data`.
- JWT token is stored in Zustand (persisted to localStorage) — the Axios interceptor in `request.ts` handles the header.
- File uploads go to `FILE_UPLOAD_DIR` and are served at `/uploads/` — the same path works in dev (Vite proxy) and production (Nginx).
- News soft-deletes — there is **no hard delete** for articles.
- The DB uses **trigram (pg_trgm)** and **full-text (tsvector)** indexes — search queries should use `LIKE` patterns or `to_tsvector`/`to_tsquery` for best performance.
- **Node.js**: Use the `node` alias (it auto-selects the right version). The frontend uses npm as the package manager.
