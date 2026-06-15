# DCI_WhatIsNews - Technology Stack Reference

---

## 1. Programming Languages

| Language | Version | Layer | Usage |
|----------|---------|-------|-------|
| **Java** | 21 | Backend | Spring Boot application, REST API, business logic |
| **TypeScript** | 5.4.5 | Frontend | React SPA, type-safe UI development |
| **SQL** | PostgreSQL dialect | Database | Schema definitions, migrations, queries |
| **YAML** | - | Config | Spring Boot config, Docker Compose, K8s manifests |
| **HTML/CSS** | - | Frontend | Templates (JSX), TailwindCSS utility classes |

---

## 2. Backend Libraries & Packages (Maven)

### Spring Boot Starters (3.2.5)

| Package | GroupId | ArtifactId | Purpose |
|---------|---------|------------|---------|
| Spring Web | `org.springframework.boot` | `spring-boot-starter-web` | REST API, embedded Tomcat, HTTP handling |
| Spring Data JPA | `org.springframework.boot` | `spring-boot-starter-data-jpa` | ORM, repository abstraction, Hibernate |
| Spring Security | `org.springframework.boot` | `spring-boot-starter-security` | Authentication, authorization, filter chain |
| Spring Validation | `org.springframework.boot` | `spring-boot-starter-validation` | Bean validation (JSR-380) |
| Spring Test | `org.springframework.boot` | `spring-boot-starter-test` | Unit/integration testing |
| Spring Security Test | `org.springframework.security` | `spring-security-test` | Security testing utilities |

### Database & Migration

| Package | Version | Purpose |
|---------|---------|---------|
| `org.postgresql:postgresql` | (managed) | PostgreSQL JDBC driver |
| `org.flywaydb:flyway-core` | (managed) | Database schema versioning and migration |

### JWT Authentication

| Package | Version | Purpose |
|---------|---------|---------|
| `io.jsonwebtoken:jjwt-api` | 0.12.5 | JWT API interfaces |
| `io.jsonwebtoken:jjwt-impl` | 0.12.5 | JWT implementation (runtime) |
| `io.jsonwebtoken:jjwt-jackson` | 0.12.5 | JWT Jackson serialization (runtime) |

### Code Generation & Mapping

| Package | Version | Purpose |
|---------|---------|---------|
| `org.mapstruct:mapstruct` | 1.5.5.Final | Entity <-> DTO compile-time mapping |
| `org.projectlombok:lombok` | (managed) | Boilerplate code generation (@Data, @Getter, etc.) |
| `org.mapstruct:mapstruct-processor` | 1.5.5.Final | MapStruct annotation processor |
| `org.projectlombok:lombok-mapstruct-binding` | 0.2.0 | Lombok + MapStruct compatibility |

### Transitive Dependencies (via Spring Boot Parent)

| Package | Purpose |
|---------|---------|
| Hibernate | JPA implementation, ORM engine |
| Jackson | JSON serialization/deserialization |
| HikariCP | JDBC connection pooling |
| Spring AOP | Aspect-oriented programming |
| Spring Context | IoC container, dependency injection |
| Tomcat Embed | Embedded servlet container |
| SLF4J + Logback | Logging framework |

### Build Plugins

| Plugin | Purpose |
|--------|---------|
| `spring-boot-maven-plugin` | Package executable JAR, exclude Lombok |
| `maven-compiler-plugin` | Java 21 compilation, annotation processor paths |

---

## 3. Frontend Libraries & Packages (npm)

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI component library |
| `react-dom` | ^18.3.1 | React DOM rendering |
| `react-router-dom` | ^6.23.1 | Client-side routing (React Router v6) |
| `zustand` | ^4.5.2 | Lightweight state management |
| `axios` | ^1.7.2 | HTTP client for API calls |

### TipTap Rich Text Editor (v3.24.0)

| Package | Version | Purpose |
|---------|---------|---------|
| `@tiptap/react` | ^3.24.0 | React integration for TipTap |
| `@tiptap/starter-kit` | ^3.24.0 | Basic formatting extensions bundle |
| `@tiptap/extension-image` | ^3.24.0 | Image insertion in editor |
| `@tiptap/extension-link` | ^3.24.0 | Hyperlink support |
| `@tiptap/extension-placeholder` | ^3.24.0 | Placeholder text |
| `@tiptap/extension-table` | ^3.24.0 | Table root extension |
| `@tiptap/extension-table-cell` | ^3.24.0 | Table cell support |
| `@tiptap/extension-table-header` | ^3.24.0 | Table header support |
| `@tiptap/extension-table-row` | ^3.24.0 | Table row support |
| `@tiptap/extension-underline` | ^3.24.0 | Underline formatting |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.4.5 | TypeScript compiler |
| `vite` | ^5.2.12 | Build tool, dev server, HMR |
| `@vitejs/plugin-react` | ^4.3.0 | Vite React plugin (Fast Refresh) |
| `tailwindcss` | ^3.4.4 | Utility-first CSS framework |
| `postcss` | ^8.4.38 | CSS processing tool |
| `autoprefixer` | ^10.4.19 | Auto-add CSS vendor prefixes |
| `@types/react` | ^18.3.3 | React type definitions |
| `@types/react-dom` | ^18.3.0 | React DOM type definitions |

---

## 4. API Endpoints

### Public API (No Auth)

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `POST` | `/api/auth/login` | Admin login, returns JWT | - |
| `GET` | `/api/news` | Paginated published news | `page`, `size`, `categoryId` |
| `GET` | `/api/news/{id}` | News detail (with prev/next) | - |
| `GET` | `/api/news/search` | Full-text search | `keyword` |
| `GET` | `/api/news/featured/top` | Top/sticky articles | - |
| `GET` | `/api/news/featured/latest` | Latest articles | - |
| `GET` | `/api/categories` | All categories | - |
| `GET` | `/api/categories/{slug}` | Category by slug | - |

### Admin API (JWT Required - `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/news` | List all news (including unpublished) |
| `POST` | `/api/admin/news` | Create article |
| `PUT` | `/api/admin/news/{id}` | Update article |
| `DELETE` | `/api/admin/news/{id}` | Soft-delete (`is_deleted=true`) |
| `PATCH` | `/api/admin/news/{id}/publish` | Toggle publish status |
| `PATCH` | `/api/admin/news/{id}/top` | Toggle sticky/top |
| `POST` | `/api/admin/categories` | Create category |
| `PUT` | `/api/admin/categories/{id}` | Update category |
| `DELETE` | `/api/admin/categories/{id}` | Delete category |
| `GET` | `/api/admin/media` | List media files (paginated) |
| `POST` | `/api/admin/media/upload` | Upload file (multipart, max 2GB) |
| `DELETE` | `/api/admin/media/{id}` | Delete media + disk file |
| `GET` | `/api/admin/users` | List admin users |
| `POST` | `/api/admin/users` | Create admin user |
| `PATCH` | `/api/admin/users/{id}/password` | Change password |
| `PATCH` | `/api/admin/users/{id}/status` | Toggle user active status |

### API Response Format

```json
// Success
{ "code": 200, "message": "success", "data": { ... } }

// Error
{ "code": 404, "message": "News not found", "data": null }

// Paginated (PageResult<T>)
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

## 5. Database (PostgreSQL 16)

### Connection Configuration

| Parameter | Value |
|-----------|-------|
| Host | `localhost` (dev) / `postgres` (Docker) |
| Port | `5432` |
| Database | `whatisnews` |
| Username | `whatisnews` |
| Password | `whatisnews123` |
| Driver | `org.postgresql.Driver` |
| Dialect | `org.hibernate.dialect.PostgreSQLDialect` |
| Pool | HikariCP (max 20, min idle 5) |
| DDL Mode | `validate` (Flyway manages schema) |

### PostgreSQL Extensions

| Extension | Purpose |
|-----------|---------|
| `pg_trgm` | Trigram matching for fast `LIKE '%keyword%'` searches on `title` |

### Tables

#### `category`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGSERIAL` | PK | Primary key |
| `name` | `VARCHAR(100)` | NOT NULL | Category display name |
| `slug` | `VARCHAR(120)` | NOT NULL, UNIQUE | URL-friendly identifier |
| `description` | `VARCHAR(500)` | - | Category description |
| `sort_order` | `INT` | NOT NULL, DEFAULT 0 | Display order |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Creation time |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Update time |

**Current Categories** (4 active after V2 migration):
1. News (`news`)
2. DCI Cloud Service (`dci-cloud-service`)
3. AI Models (`ai-models`)
4. Training Videos (`training-videos`)

#### `news`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGSERIAL` | PK | Primary key |
| `title` | `VARCHAR(300)` | NOT NULL | Article title |
| `subtitle` | `VARCHAR(500)` | - | Article subtitle |
| `summary` | `TEXT` | - | Short summary for cards |
| `content` | `TEXT` | NOT NULL | Rich text HTML content |
| `cover_image` | `VARCHAR(500)` | - | Cover image URL/path |
| `category_id` | `BIGINT` | NOT NULL, FK -> category(id) | Category reference |
| `tags` | `VARCHAR(500)` | - | Comma-separated tags |
| `author` | `VARCHAR(100)` | NOT NULL, DEFAULT 'WhatIsNew Editor' | Author name |
| `is_published` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Publish status |
| `is_top` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Sticky/pinned flag |
| `view_count` | `BIGINT` | NOT NULL, DEFAULT 0 | View counter |
| `is_deleted` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Soft delete flag |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Creation time |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Update time |
| `published_at` | `TIMESTAMP` | - | Publication time |

**Indexes**:
| Index Name | Type | Column(s) | Condition | Purpose |
|------------|------|-----------|-----------|---------|
| `idx_news_category_id` | B-tree | `category_id` | - | Category filter |
| `idx_news_is_published` | B-tree | `is_published` | `WHERE is_deleted = FALSE` | Published articles |
| `idx_news_is_top` | B-tree | `is_top` | `WHERE is_deleted = FALSE` | Top/sticky articles |
| `idx_news_published_at` | B-tree | `published_at DESC` | `WHERE is_deleted = FALSE` | Chronological sort |
| `idx_news_created_at` | B-tree | `created_at DESC` | - | Admin sort |
| `idx_news_title_trgm` | GIN | `title gin_trgm_ops` | - | Fast LIKE search |
| `idx_news_tags` | GIN | `to_tsvector('english', tags)` | - | Full-text tag search |

#### `admin_user`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGSERIAL` | PK | Primary key |
| `username` | `VARCHAR(50)` | NOT NULL, UNIQUE | Login username |
| `password` | `VARCHAR(255)` | NOT NULL | BCrypt hashed password |
| `display_name` | `VARCHAR(100)` | - | Display name |
| `email` | `VARCHAR(200)` | - | Email address |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Account status |
| `last_login_at` | `TIMESTAMP` | - | Last login time |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Creation time |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Update time |

#### `media_file`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGSERIAL` | PK | Primary key |
| `original_name` | `VARCHAR(500)` | NOT NULL | Original filename |
| `stored_name` | `VARCHAR(500)` | NOT NULL | UUID-based stored name |
| `file_path` | `VARCHAR(1000)` | NOT NULL | Full file path |
| `file_size` | `BIGINT` | NOT NULL, DEFAULT 0 | File size (bytes) |
| `mime_type` | `VARCHAR(100)` | - | MIME type |
| `file_type` | `VARCHAR(20)` | NOT NULL, DEFAULT 'IMAGE' | IMAGE/VIDEO/DOCUMENT |
| `width` | `INT` | - | Image width |
| `height` | `INT` | - | Image height |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Upload time |

**Indexes**:
| Index Name | Type | Column | Purpose |
|------------|------|--------|---------|
| `idx_media_file_type` | B-tree | `file_type` | Filter by type |

### Flyway Migrations

| Version | File | Description |
|---------|------|-------------|
| V1 | `V1__Initial.sql` | Base schema (4 tables) + `pg_trgm` extension + seed data (5 categories, 1 admin, 8 articles) |
| V2 | `V2__Update_Categories.sql` | Restructure to 4 categories, reassign news, delete old categories |

### Key Database Design Decisions

| Decision | Implementation | Rationale |
|----------|---------------|-----------|
| Soft Delete | `news.is_deleted` flag | Articles never physically removed, recoverable |
| Trigram Search | GIN index + `pg_trgm` on `title` | Fast `LIKE '%keyword%'` without full scan |
| Full-Text Search | GIN index + `tsvector` on `tags` | Efficient tag-based search |
| BCrypt Passwords | Spring Security BCryptPasswordEncoder | Secure password storage |
| Schema Versioning | Flyway migrations | Reproducible, version-controlled schema changes |
| Connection Pooling | HikariCP (max 20, min 5) | Efficient DB connection management |

---

## 6. Infrastructure & DevOps

### Container Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| Docker | - | Containerization |
| Docker Compose | v3.8 | Multi-container orchestration |
| Nginx | - | Frontend serving + reverse proxy |
| PostgreSQL Alpine | 16-alpine | Lightweight DB container |

### Kubernetes (Production)

| Component | Purpose |
|-----------|---------|
| Helm Charts | Package management per service (backend, frontend, postgres) |
| StatefulSet | PostgreSQL with persistent storage |
| PVC | Persistent volume claims for data |
| GitLab CI | CI/CD pipeline (`.gitlab-ci.yml`) |
| `deploy.sh` | Deployment script |
| `secrets.yaml` | Secret management |
| `namespace.yaml` | Namespace isolation |

---

## 7. Configuration Summary

### Backend (`application.yml`)

| Config | Value |
|--------|-------|
| Server Port | `8080` |
| JPA DDL Auto | `validate` |
| Show SQL | `false` |
| Open-in-View | `false` |
| Max File Upload | `2048MB` |
| Max Request Size | `2048MB` |
| Jackson Date Format | `yyyy-MM-dd HH:mm:ss` |
| Jackson Timezone | `Asia/Shanghai` |
| Jackson Non-null | `true` |
| Flyway Enabled | `true` |
| Flyway Baseline | `true` |
| Hikari Max Pool | `20` |
| Hikari Min Idle | `5` |

### Frontend (`vite.config.ts`)

| Config | Value |
|--------|-------|
| Dev Port | `5173` |
| Proxy `/api` | `http://localhost:8080` |
| Proxy `/uploads` | `http://localhost:8080` |
| Path Alias `@/` | `./src/` |

### Environment Variables (`.env`)

| Variable | Default |
|----------|---------|
| `POSTGRES_DB` | `whatisnews` |
| `POSTGRES_USER` | `whatisnews` |
| `POSTGRES_PASSWORD` | `whatisnews123` |
| `POSTGRES_PORT` | `5432` |
| `BACKEND_PORT` | `8080` |
| `FRONTEND_PORT` | `3000` |
| `JWT_SECRET` | `WhatIsNew-JWT-Secret-Key-2024-Production` |
| `JWT_EXPIRATION` | `86400000` (24h) |
| `FILE_UPLOAD_DIR` | `/app/uploads` |
| `ADMIN_DEFAULT_USERNAME` | `admin` |
| `ADMIN_DEFAULT_PASSWORD` | `admin123` |
