# DCI_WhatIsNew Skill

> Complete specification for the DCI_WhatIsNew full-stack news and content management platform

---

## Project Identity

**Project Name**: DCI_WhatIsNew
**Type**: Full-stack news and content management platform
**Version**: Production-ready
**Architecture**: Three-tier (React SPA + Spring Boot REST API + PostgreSQL)

---

## 1. Project Overview

### Purpose
DCI_WhatIsNew is a production-grade content management and news publishing platform that provides:
- **Public-facing news website** with responsive UI, category filtering, search, and rich media support
- **Admin panel** for content management with JWT authentication
- **Media library** for file uploads with automatic lifecycle management
- **User management** for admin accounts

### Core Features

#### Public Features
- Browse news articles with responsive, mobile-friendly UI
- Category-based filtering (8 categories: News, DCI Cloud Service, AI Models, Training Videos, etc.)
- Full-text search on titles and tags
- Hero carousel for featured/top stories
- News detail view with rich media (images, videos, audio, tables)
- Pagination for news lists

#### Admin Panel Features
- JWT-based authentication (24-hour token expiration)
- Dashboard with statistics
- **News Management**: Create, edit, delete (soft), publish/unpublish, set sticky/top
- **Rich Text Editor**: TipTap with support for formatted text, images, videos, audio, tables, links, code blocks
- **Category Management**: CRUD operations
- **Media Library**: Upload files (max 2GB), view file references, delete unused files
- **User Management**: Create admin users, change passwords, enable/disable accounts
- **Automatic Media Cleanup**: Deletes orphaned files when articles are deleted or edited

---

## 2. Technology Stack

### Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| TypeScript | - | Type-safe JavaScript |
| Vite | 5 | Build tool and dev server |
| TailwindCSS | 3 | Utility-first CSS framework |
| React Router | v6 | Client-side routing |
| Zustand | 4 | Lightweight state management |
| Axios | - | HTTP client |
| TipTap | 3 | Rich text editor with custom extensions |

**TipTap Extensions**: StarterKit, Image, Video, Audio, Link, Table (with TableRow, TableHeader, TableCell), Underline, Placeholder, CodeBlock, HorizontalRule

### Backend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| Spring Boot | 3.2.5 | Application framework |
| Java | 21 | Programming language |
| Spring Security | - | Authentication and authorization |
| JWT (jjwt) | 0.12.5 | Stateless authentication |
| Spring Data JPA | - | Data persistence |
| Hibernate | - | ORM |
| MapStruct | 1.5.5 | Entity/DTO mapping |
| Lombok | - | Code generation |
| Flyway | - | Database migration tool |

### Database
| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 16 | Relational database |
| pg_trgm | - | Trigram extension for fast text search |
| GIN indexes | - | Full-text search indexes |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Web server and reverse proxy |
| Kubernetes | Container orchestration (production) |
| Helm | Kubernetes package manager |
| GitLab CI | CI/CD pipeline |

---

## 3. Project Structure

```
DCI_WhatIsNews/
├── .env                              # Environment variables
├── docker-compose.yml                # Docker Compose orchestration
├── README.md                         # Project documentation
├── CLAUDE.md                         # Architecture and development guide
│
├── backend/                          # Spring Boot REST API
│   ├── Dockerfile                    # Backend container definition
│   ├── pom.xml                       # Maven dependencies
│   └── src/main/
│       ├── java/com/whatisnew/
│       │   ├── WhatIsNewApplication.java    # Main entry point
│       │   ├── common/                       # Shared utilities
│       │   │   ├── Result.java               # Unified API response wrapper
│       │   │   └── GlobalExceptionHandler.java
│       │   ├── config/                       # Configuration classes
│       │   │   ├── SecurityConfig.java       # Spring Security + JWT filter
│       │   │   ├── WebConfig.java            # CORS, static resources
│       │   │   └── DataInitializer.java      # Default admin creation
│       │   ├── controller/                   # REST API endpoints
│       │   │   ├── AuthController.java       # POST /api/auth/login
│       │   │   ├── NewsController.java       # News CRUD + public endpoints
│       │   │   ├── CategoryController.java   # Category CRUD
│       │   │   ├── MediaController.java      # File upload/management
│       │   │   └── UserController.java       # Admin user management
│       │   ├── dto/                          # Data Transfer Objects
│       │   │   ├── NewsDTO.java
│       │   │   ├── CategoryDTO.java
│       │   │   ├── LoginRequest.java
│       │   │   ├── LoginResponse.java
│       │   │   └── PageResult.java           # Pagination wrapper
│       │   ├── entity/                       # JPA entities
│       │   │   ├── News.java
│       │   │   ├── Category.java
│       │   │   ├── AdminUser.java
│       │   │   └── MediaFile.java
│       │   ├── mapper/                       # MapStruct mappers
│       │   │   ├── NewsMapper.java
│       │   │   └── CategoryMapper.java
│       │   ├── repository/                   # Spring Data JPA repositories
│       │   │   ├── NewsRepository.java
│       │   │   ├── CategoryRepository.java
│       │   │   ├── AdminUserRepository.java
│       │   │   └── MediaFileRepository.java
│       │   ├── security/                     # JWT authentication
│       │   │   ├── JwtTokenProvider.java
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   └── UserDetailsServiceImpl.java
│       │   └── service/                      # Business logic
│       │       ├── NewsService.java          # Interface
│       │       ├── CategoryService.java      # Interface
│       │       ├── AuthService.java          # Interface
│       │       ├── MediaService.java         # Interface
│       │       ├── UserService.java          # Interface
│       │       └── impl/                     # Implementations
│       │           ├── NewsServiceImpl.java
│       │           ├── CategoryServiceImpl.java
│       │           ├── AuthServiceImpl.java
│       │           ├── MediaServiceImpl.java
│       │           └── UserServiceImpl.java
│       └── resources/
│           ├── application.yml               # Spring Boot configuration
│           └── db/migration/                 # Flyway migrations
│               ├── V1__Initial.sql           # Initial schema + seed data
│               └── V2__Update_Categories.sql # Category updates
│
├── frontend/                         # React SPA
│   ├── Dockerfile                    # Frontend container definition
│   ├── nginx.conf                    # Nginx reverse proxy config
│   ├── package.json                  # npm dependencies
│   ├── vite.config.ts                # Vite bundler configuration
│   ├── tailwind.config.js            # TailwindCSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── index.html                    # HTML entry point
│   └── src/
│       ├── main.tsx                  # React entry point
│       ├── App.tsx                   # Root component
│       ├── index.css                 # Global styles
│       ├── api/                      # API client modules
│       │   ├── request.ts            # Axios instance + interceptors
│       │   ├── auth.ts               # Auth API calls
│       │   ├── news.ts               # News API calls
│       │   ├── category.ts           # Category API calls
│       │   ├── media.ts              # Media API calls
│       │   └── user.ts               # User API calls
│       ├── components/               # Reusable components
│       │   ├── Layout.tsx            # Public layout (Header + Footer)
│       │   ├── AdminLayout.tsx       # Admin layout (sidebar + auth guard)
│       │   └── HeroCarousel.tsx      # Top-story carousel
│       ├── pages/                    # Route-level components
│       │   ├── frontend/             # Public pages
│       │   │   ├── Home.tsx          # Homepage
│       │   │   ├── NewsList.tsx      # News listing
│       │   │   ├── NewsDetail.tsx    # News detail view
│       │   │   └── CategoryPage.tsx  # Category-filtered view
│       │   └── admin/                # Admin pages
│       │       ├── Login.tsx         # Admin login
│       │       ├── Dashboard.tsx     # Admin dashboard
│       │       ├── NewsManage.tsx    # News list management
│       │       ├── NewsEdit.tsx      # News create/edit with TipTap
│       │       ├── CategoryManage.tsx # Category management
│       │       ├── MediaManage.tsx   # Media library
│       │       └── UserManage.tsx    # User management
│       ├── store/                    # State management
│       │   └── authStore.ts          # Zustand auth store
│       ├── router/                   # Routing configuration
│       │   └── index.tsx             # React Router v6 config
│       └── types/                    # TypeScript interfaces
│           └── index.ts              # All type definitions
│
├── k8s/                              # Kubernetes deployment
│   ├── manifest.yaml                 # Main Kubernetes resources
│   ├── namespace.yaml                # Namespace definition
│   ├── secrets.yaml                  # Secret configuration
│   ├── deploy.sh                     # Deployment script
│   ├── .gitlab-ci.yml                # GitLab CI/CD pipeline
│   ├── backend/                      # Backend Helm chart
│   ├── frontend/                     # Frontend Helm chart
│   └── postgres/                     # PostgreSQL Helm chart
│
└── docs/                             # Documentation
    └── 2026-06-01.md                 # Recent feature records
```

---

## 4. Database Schema

### Tables

#### `category`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| name | VARCHAR(100) | Category name |
| slug | VARCHAR(100) | URL-friendly identifier (unique) |
| description | TEXT | Category description |
| sort_order | INTEGER | Display order |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Update timestamp |

**Seeded Categories** (8 total):
1. News
2. DCI Cloud Service
3. AI & AI Models
4. AI Tools
5. Training Videos
6. Documentation
7. Community
8. Events

#### `news`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| title | VARCHAR(255) | Article title (GIN trigram index) |
| subtitle | VARCHAR(500) | Article subtitle |
| summary | TEXT | Article summary |
| content | TEXT | Rich text content (HTML) |
| cover_image | VARCHAR(500) | Cover image URL |
| category_id | BIGINT | Foreign key to category |
| tags | VARCHAR(500) | Comma-separated tags (GIN full-text index) |
| author | VARCHAR(100) | Author name |
| is_published | BOOLEAN | Publication status |
| is_top | BOOLEAN | Sticky/top article flag |
| view_count | INTEGER | View counter |
| is_deleted | BOOLEAN | Soft delete flag |
| published_at | TIMESTAMP | Publication timestamp |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Update timestamp |

**Indexes**:
- `idx_news_title_trgm`: GIN trigram index on `title` for fast LIKE searches
- `idx_news_tags_fts`: GIN index on `to_tsvector('simple', tags)` for full-text search

#### `admin_user`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| username | VARCHAR(50) | Username (unique) |
| password | VARCHAR(255) | BCrypt hashed password |
| display_name | VARCHAR(100) | Display name |
| email | VARCHAR(100) | Email address |
| is_active | BOOLEAN | Account active status |
| last_login_at | TIMESTAMP | Last login timestamp |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Update timestamp |

#### `media_file`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| original_name | VARCHAR(255) | Original filename |
| stored_name | VARCHAR(255) | Stored filename (UUID) |
| file_path | VARCHAR(500) | Full file path |
| file_size | BIGINT | File size in bytes |
| mime_type | VARCHAR(100) | MIME type |
| file_type | VARCHAR(20) | Type: IMAGE, VIDEO, AUDIO, DOCUMENT |
| width | INTEGER | Image width (if applicable) |
| height | INTEGER | Image height (if applicable) |
| created_at | TIMESTAMP | Upload timestamp |

### Key Database Design Decisions

1. **Soft Delete**: News articles use `is_deleted` flag - never physically removed
2. **GIN Trigram Index**: On `title` for fast pattern matching searches
3. **Full-Text Search**: On `tags` using PostgreSQL `tsvector`
4. **Flyway Migrations**: Schema versioned in `V1__Initial.sql`, `V2__Update_Categories.sql`
5. **BCrypt Password Hashing**: For admin user passwords

---

## 5. API Endpoints

### Public Endpoints (No Authentication Required)

| Method | Path | Description | Query Parameters |
|--------|------|-------------|------------------|
| POST | `/api/auth/login` | Admin login | - |
| GET | `/api/news` | List published news | `page`, `size`, `categoryId` |
| GET | `/api/news/{id}` | Get news detail | - |
| GET | `/api/news/search` | Search news | `keyword` |
| GET | `/api/news/featured/top` | Get top/sticky news | - |
| GET | `/api/news/featured/latest` | Get latest news | - |
| GET | `/api/categories` | List all categories | - |
| GET | `/api/categories/{slug}` | Get category by slug | - |

### Admin Endpoints (JWT Authentication Required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/news` | List all news (including unpublished) |
| POST | `/api/admin/news` | Create news article |
| PUT | `/api/admin/news/{id}` | Update news article |
| DELETE | `/api/admin/news/{id}` | Soft delete news article |
| PATCH | `/api/admin/news/{id}/publish` | Toggle publish status |
| PATCH | `/api/admin/news/{id}/top` | Toggle sticky/top status |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/{id}` | Update category |
| DELETE | `/api/admin/categories/{id}` | Delete category |
| GET | `/api/admin/media` | List media files (paginated) |
| POST | `/api/admin/media/upload` | Upload file (max 2GB) |
| DELETE | `/api/admin/media/{id}` | Delete media file |
| GET | `/api/admin/users` | List admin users |
| POST | `/api/admin/users` | Create admin user |
| PATCH | `/api/admin/users/{id}/password` | Change password |
| PATCH | `/api/admin/users/{id}/status` | Toggle user status |

### Response Format

All API responses use a unified wrapper:

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

**Error Response**:
```json
{
  "code": 404,
  "message": "News not found",
  "data": null
}
```

**Paginated Response** (`PageResult<T>`):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [...],
    "page": 0,
    "size": 10,
    "totalElements": 42,
    "totalPages": 5,
    "first": true,
    "last": false
  }
}
```

---

## 6. Authentication Flow

```
1. User submits credentials to POST /api/auth/login
2. AuthService validates credentials (BCrypt password check)
3. JwtTokenProvider generates JWT token (24-hour expiration)
4. Token returned to frontend
5. Frontend stores token in Zustand + localStorage
6. All admin requests include: Authorization: Bearer <token>
7. JwtAuthenticationFilter intercepts requests
8. Filter validates token and sets SecurityContext
9. Request proceeds to controller if valid
```

**JWT Configuration**:
- Secret: Configured via `JWT_SECRET` env var
- Expiration: 86400000ms (24 hours)
- Header: `Authorization: Bearer <token>`
- Storage: Frontend stores in localStorage via Zustand persist

---

## 7. Frontend Architecture

### Routing Structure

| Path | Component | Layout | Description |
|------|-----------|--------|-------------|
| `/` | Home | Layout | Homepage with hero carousel |
| `/news` | NewsList | Layout | Paginated news listing |
| `/news/:id` | NewsDetail | Layout | News article detail |
| `/category/:slug` | CategoryPage | Layout | Category-filtered news |
| `/admin/login` | Login | None | Admin login page |
| `/admin` | Dashboard | AdminLayout | Admin dashboard |
| `/admin/news` | NewsManage | AdminLayout | News management list |
| `/admin/news/new` | NewsEdit | AdminLayout | Create new article |
| `/admin/news/:id/edit` | NewsEdit | AdminLayout | Edit article |
| `/admin/categories` | CategoryManage | AdminLayout | Category management |
| `/admin/media` | MediaManage | AdminLayout | Media library |
| `/admin/users` | UserManage | AdminLayout | User management |

### State Management (Zustand)

**authStore.ts**:
```typescript
interface AuthStore {
  token: string | null
  username: string | null
  displayName: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}
```

- Persisted to localStorage
- Token automatically attached to admin API requests via Axios interceptor

### API Layer

**request.ts** (Axios instance):
- Base URL: `/api`
- Request interceptor: Attaches `Authorization: Bearer <token>` for admin routes
- Response interceptor: Redirects to `/admin/login` on 401

**API Modules**:
- `auth.ts`: Login endpoint
- `news.ts`: Public and admin news endpoints
- `category.ts`: Public and admin category endpoints
- `media.ts`: Media upload and management
- `user.ts`: Admin user management

### Rich Text Editor (TipTap)

**NewsEdit.tsx** uses TipTap with extensions:
- **StarterKit**: Basic formatting (bold, italic, headings, lists, blockquote, code, horizontal rule)
- **Image**: Insert images with URL or upload
- **Video**: Custom video extension
- **Audio**: Custom audio extension
- **Link**: Hyperlinks with href
- **Table**: Full table support (TableRow, TableHeader, TableCell)
- **Underline**: Underline formatting
- **Placeholder**: Placeholder text
- **CodeBlock**: Code blocks with syntax highlighting

**Toolbar Features**:
- Bold, Italic, Underline, Strikethrough
- Headings (H1, H2, H3)
- Bullet list, Ordered list
- Blockquote
- Code, Code block
- Image, Video, Audio
- Link
- Table
- Horizontal rule

---

## 8. Backend Architecture

### Layered Architecture

```
Controller Layer (HTTP concerns)
    ↓
Service Layer (Business logic)
    ↓
Repository Layer (Data access)
    ↓
Entity Layer (Domain model)
```

**Cross-cutting concerns**:
- **Mapper Layer**: MapStruct for entity ↔ DTO conversion
- **Security Layer**: JWT authentication filter
- **Exception Handling**: GlobalExceptionHandler

### Key Design Patterns

1. **DTO Pattern**: Separate DTOs for API contracts
2. **Repository Pattern**: Spring Data JPA interfaces
3. **Service Layer Pattern**: Business logic isolated in service implementations
4. **Mapper Pattern**: MapStruct for type-safe entity/DTO conversion
5. **Result Wrapper**: Unified API response format

### Configuration Classes

**SecurityConfig.java**:
- Configures Spring Security filter chain
- Defines public vs. authenticated URL patterns
- Adds JWT authentication filter
- Configures CORS

**WebConfig.java**:
- Configures CORS mappings
- Maps `/uploads/**` to file system directory
- Static resource handling

**DataInitializer.java**:
- Implements `ApplicationRunner`
- Creates default admin user on first startup
- Checks if `admin_user` table is empty

---

## 9. Environment Configuration

### Environment Variables (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `whatisnew` | Database name |
| `POSTGRES_USER` | `whatisnew` | Database user |
| `POSTGRES_PASSWORD` | `whatisnew123` | Database password |
| `POSTGRES_PORT` | `5432` | Database port |
| `BACKEND_PORT` | `8080` | Backend API port |
| `FRONTEND_PORT` | `3000` | Frontend Nginx port |
| `JWT_SECRET` | `WhatIsNew-JWT-Secret-Key-2024-Production` | JWT signing key |
| `JWT_EXPIRATION` | `86400000` | JWT token expiration (ms) |
| `FILE_UPLOAD_DIR` | `/app/uploads` | File upload directory |
| `ADMIN_DEFAULT_USERNAME` | `admin` | Default admin username |
| `ADMIN_DEFAULT_PASSWORD` | `admin123` | Default admin password |

### Spring Boot Configuration (`application.yml`)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/whatisnew
    username: whatisnew
    password: whatisnew123
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  servlet:
    multipart:
      max-file-size: 2048MB
      max-request-size: 2048MB

jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION}

file:
  upload-dir: ${FILE_UPLOAD_DIR}
```

---

## 10. Deployment

### Docker Compose (Development/Testing)

**Services**:
1. **postgres**: PostgreSQL 16 Alpine with health check
2. **backend**: Spring Boot application (depends on postgres health)
3. **frontend**: Nginx serving built React app

**Volumes**:
- `postgres_data`: PostgreSQL data persistence
- `uploads_data`: File upload storage

**Networks**:
- `whatisnew-network`: Bridge network for inter-service communication

**Commands**:
```bash
# Start all services
docker compose up -d --build

# Stop services
docker compose down

# Stop and remove volumes (clean database)
docker compose down -v

# View logs
docker compose logs -f [service_name]
```

**Access Points**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Admin Panel: http://localhost:3000/admin/login

### Kubernetes (Production)

**Directory Structure** (`k8s/`):
- `manifest.yaml`: Main Kubernetes resources
- `namespace.yaml`: Namespace definition
- `secrets.yaml`: Secret configuration
- `deploy.sh`: Deployment script
- `.gitlab-ci.yml`: GitLab CI/CD pipeline
- `backend/`: Helm chart for backend
- `frontend/`: Helm chart for frontend
- `postgres/`: StatefulSet + PVC + Service

**Deployment Process**:
1. Build Docker images
2. Push to container registry
3. Update Kubernetes manifests
4. Apply via `kubectl` or Helm
5. GitLab CI automates the process

---

## 11. Development Workflow

### Local Development Setup

#### Prerequisites
- Java 21
- Maven 3.9+
- Node.js 20+
- PostgreSQL 16 (or use Docker)

#### Backend Development
```bash
# Start PostgreSQL (via Docker)
docker run -d --name postgres-dev \
  -e POSTGRES_DB=whatisnew \
  -e POSTGRES_USER=whatisnew \
  -e POSTGRES_PASSWORD=whatisnew123 \
  -p 5432:5432 \
  postgres:16-alpine

# Navigate to backend
cd backend

# Run Spring Boot
./mvnw spring-boot:run
# or
mvn spring-boot:run
```

Backend starts at `http://localhost:8080`

#### Frontend Development
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend dev server starts at `http://localhost:5173`

**Vite Proxy**: Automatically proxies `/api` and `/uploads` to `http://localhost:8080`

### Database Management

**Flyway Migrations**:
- Automatically run on backend startup
- Versioned SQL files in `backend/src/main/resources/db/migration/`
- `V1__Initial.sql`: Base schema + seed data
- `V2__Update_Categories.sql`: Category updates

**Reset Database**:
```bash
# Via psql
psql -U whatisnew -d postgres -c "DROP DATABASE whatisnew;"
psql -U whatisnew -d postgres -c "CREATE DATABASE whatisnew;"

# Via Docker
docker compose down -v
docker compose up -d postgres
```

---

## 12. Key Implementation Details

### Soft Delete Pattern
- News articles use `is_deleted` boolean flag
- Never physically removed from database
- Queries filter out deleted articles by default
- Admin can view deleted articles if needed

### Media File Lifecycle
1. **Upload**: File saved to disk, metadata saved to `media_file` table
2. **Reference**: Files referenced in news content via URL
3. **Cleanup**: When article is deleted or edited, orphaned files are automatically removed
4. **Storage**: Files stored in `FILE_UPLOAD_DIR` (`/app/uploads` by default)

### Search Implementation
- **Title Search**: Uses GIN trigram index for fast `LIKE '%keyword%'` searches
- **Tag Search**: Uses PostgreSQL full-text search with `tsvector`
- **Combined**: Search endpoint queries both title and tags

### CORS Configuration
- Development: Allows `localhost:5173` (Vite dev server)
- Production: Configured for production domain
- Credentials allowed for authenticated requests

### File Upload
- Max size: 2048MB (2GB)
- Supported types: Images, Videos, Audio, Documents
- Storage: Local file system
- Serving: Via `/uploads/**` endpoint (Nginx in production, Vite proxy in dev)

---

## 13. Security Considerations

### Authentication
- JWT-based stateless authentication
- Tokens expire after 24 hours
- BCrypt password hashing for admin accounts
- Token stored in localStorage (XSS risk mitigated by React's JSX escaping)

### Authorization
- Public endpoints: All `/api/news/**` and `/api/categories/**`
- Admin endpoints: All `/api/admin/**` require valid JWT
- JWT filter validates token on every request

### File Upload Security
- File size limit: 2GB
- File type validation
- Files stored outside web root
- Served via controlled endpoint

### Production Recommendations
1. Change default passwords in `.env`
2. Use strong JWT secret (64+ character random string)
3. Enable HTTPS
4. Setup regular database backups
5. Configure reverse proxy (Nginx/Traefik/Caddy)
6. Enable rate limiting
7. Setup monitoring and logging

---

## 14. Common Development Tasks

### Add a New News Field
1. Add column to `news` table via Flyway migration
2. Update `News.java` entity
3. Update `NewsDTO.java`
4. Update `NewsMapper.java`
5. Update `NewsFormData` in `frontend/src/types/index.ts`
6. Update `NewsEdit.tsx` form

### Add a New Category
1. Add to Flyway migration or via admin panel
2. No code changes needed (dynamic categories)

### Change JWT Expiration
1. Update `JWT_EXPIRATION` in `.env`
2. Restart backend

### Change Upload Size Limit
1. Update `spring.servlet.multipart.max-file-size` in `application.yml`
2. Restart backend

### Add a New Admin API Endpoint
1. Create method in appropriate `*Controller.java`
2. Add business logic in service layer
3. Update `SecurityConfig.java` if new URL pattern

### Add a New Public Page
1. Create component in `frontend/src/pages/frontend/`
2. Add route in `frontend/src/router/index.tsx`
3. Add navigation link if needed

### Modify Search Behavior
1. Update custom queries in `NewsRepository.java`
2. Update `NewsService/impl`
3. Update `NewsController` if needed

---

## 15. Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend can't connect to DB | Ensure PostgreSQL is healthy: `docker compose ps` |
| Frontend can't reach API | Check nginx.conf proxy settings; ensure backend is up |
| Flyway migration fails | Check DB credentials in `.env`; reset DB if needed |
| Port already in use | Change `BACKEND_PORT`/`FRONTEND_PORT` in `.env` |
| Login fails | Admin account created on first startup; check logs |
| File upload fails | Check `FILE_UPLOAD_DIR` exists and is writable |
| JWT token invalid | Check `JWT_SECRET` matches between .env and application.yml |
| CORS errors | Check `WebConfig.java` CORS configuration |
| Search not working | Ensure `pg_trgm` extension is installed |

---

## 16. Recent Changes (2026-06-01)

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

## 17. Production Checklist

Before deploying to production:

- [ ] Change `POSTGRES_PASSWORD` to a strong password
- [ ] Change `JWT_SECRET` to a 64+ character random string
- [ ] Change `ADMIN_DEFAULT_PASSWORD` to a strong password
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure production CORS origins in `WebConfig.java`
- [ ] Setup regular PostgreSQL backups
- [ ] Configure monitoring and logging
- [ ] Setup rate limiting
- [ ] Review and update firewall rules
- [ ] Test all critical user flows
- [ ] Verify file upload directory permissions
- [ ] Check disk space for uploads

---

## 18. Architecture Diagrams

### Request Flow (Public)
```
Browser → Nginx (:3000) → /api/* → Spring Boot (:8080) → PostgreSQL (:5432)
                            └── /uploads/* (static files)
```

### Request Flow (Admin)
```
Browser → Nginx → Spring Boot → JwtAuthenticationFilter → SecurityContext
                                    ↓ (valid token)
                                  Controller → Service → Repository → DB
```

### Authentication Flow
```
Login Form → POST /api/auth/login → AuthService → BCrypt check
                                              ↓ (valid)
                                          JwtTokenProvider → Generate token
                                              ↓
                                          Return token to frontend
                                              ↓
                                          Store in Zustand + localStorage
                                              ↓
                                          Attach to all admin requests
```

### Deployment Architecture
```
Docker Compose:
┌─────────────────────────────────────────────────────────┐
│  whatisnew-network (bridge)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  frontend    │  │   backend    │  │  postgres    │  │
│  │  (Nginx)     │→ │ (Spring Boot)│→ │ (PostgreSQL) │  │
│  │  :3000       │  │    :8080     │  │    :5432     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ↓                                    ↓          │
│  uploads_data volume              postgres_data volume │
└─────────────────────────────────────────────────────────┘
```

---

## 19. Key Files Reference

### Backend Key Files
- `WhatIsNewApplication.java`: Main entry point
- `SecurityConfig.java`: Security configuration
- `JwtTokenProvider.java`: JWT token generation and validation
- `NewsController.java`: News API endpoints
- `NewsService.java` + `NewsServiceImpl.java`: News business logic
- `Result.java`: Unified API response wrapper
- `application.yml`: Spring Boot configuration
- `V1__Initial.sql`: Database schema and seed data

### Frontend Key Files
- `main.tsx`: React entry point
- `App.tsx`: Root component
- `router/index.tsx`: Routing configuration
- `authStore.ts`: Authentication state management
- `request.ts`: Axios instance with interceptors
- `NewsEdit.tsx`: Rich text editor with TipTap
- `AdminLayout.tsx`: Admin layout with sidebar
- `Layout.tsx`: Public layout with header/footer

### Configuration Files
- `.env`: Environment variables
- `docker-compose.yml`: Docker Compose configuration
- `nginx.conf`: Nginx reverse proxy configuration
- `vite.config.ts`: Vite bundler configuration
- `tailwind.config.js`: TailwindCSS configuration

---

## 20. Summary

DCI_WhatIsNew is a **production-ready, full-stack news and content management platform** that demonstrates:

- **Modern Architecture**: Three-tier with clear separation of concerns
- **Type Safety**: TypeScript frontend, Java backend
- **Security**: JWT authentication, BCrypt password hashing, CORS
- **Database Best Practices**: Flyway migrations, soft deletes, optimized indexes
- **Rich User Experience**: Responsive design, rich media support, real-time search
- **DevOps Ready**: Docker Compose for dev, Kubernetes for production, CI/CD pipeline
- **Maintainable Code**: Layered architecture, DTO pattern, MapStruct mappers

The platform is designed for easy deployment, scaling, and maintenance while providing a rich feature set for both content creators and public visitors.

---

**End of DCI_WhatIsNew Skill Document**
