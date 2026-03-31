# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PKU-MAT is a full-stack web application for submitting settlement declarations (oswiadczenia rozliczeniowe) related to transmission and non-transmission fees under Transmission Agreements with OSP. Built with React frontend, Kotlin/Spring Boot backend, and Oracle database.

## Architecture

- **Frontend** (`frontend/`): React 18 + TypeScript, built with Vite. Dev server on port 5173, proxies `/api/*` to backend at `localhost:8080`.
- **Backend** (`backend/`): Kotlin + Spring Boot 3.2.5 with Spring Data JDBC and Spring Security. Runs on port 8080. Package: `pl.pku.mat`.
- **Database** (`db/`): Oracle 23 Free (service: FREEPDB1, user: `pku`/`pku`). All DDL and seed data in `db/users/init.sql` (auto-executed on first container start).
- **API convention**: All REST endpoints are prefixed with `/api/` (e.g., `/api/health`, `/api/dashboard`).
- **Spring profiles**: `dev` (Docker networking with `oracle-db` hostname), `test` (datasource, JDBC repos, and security excluded — repositories mocked in tests).

## Backend Package Structure

```
pl.pku.mat/
├── config/          # SecurityConfig, FormFieldConfig, GlobalExceptionHandler
├── controller/      # AuthController, DashboardController, DeclarationController, HealthController
├── dto/             # Request/response DTOs
├── entity/          # Spring Data JDBC entities (@Table)
├── repository/      # CrudRepository interfaces
├── security/        # CustomUserDetailsService
└── service/         # DeclarationService, DeclarationNumberGenerator, JsonExportService
```

## Frontend Structure

```
src/
├── api/             # API client (fetch wrapper), auth.ts, declarations.ts
├── components/      # Layout, ProtectedRoute, FormField
├── context/         # AuthContext (session-based auth state)
├── pages/           # LoginPage, DashboardPage, DeclarationFormPage, DeclarationDetailPage, ConfirmationPage
└── types/           # TypeScript interfaces matching backend DTOs
```

## API Endpoints

### Auth (public)
- `POST /api/auth/login` — JSON `{username, password}`, returns user info + session cookie
- `POST /api/auth/logout` — invalidates session
- `GET /api/auth/me` — returns current user from session

### Domain (authenticated)
- `GET /api/dashboard` — fee declarations status for current month
- `GET /api/declarations` — list all declarations for user's contractor
- `GET /api/declarations/{id}` — single declaration with items
- `GET /api/declarations/form?feeType={code}` — form field definitions for fee type
- `POST /api/declarations` — submit declaration (saves to DB + exports JSON file)

## Common Commands

### Frontend (run from `frontend/`)
```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run test         # Run Vitest unit tests
npm run test:e2e     # Run Playwright e2e tests
npm run lint         # ESLint check
npm run format       # Prettier format
```

### Backend (run from `backend/`)
```bash
./gradlew bootRun                    # Start Spring Boot app (port 8080)
./gradlew test                       # Run all tests
./gradlew test --tests "*.ClassName" # Run a single test class
./gradlew build                      # Full build
```

### Docker
```bash
docker compose up --build                      # Full stack (Oracle + backend + frontend)
docker compose -f docker-compose.dev.yml up    # Oracle only (for local dev)
docker compose -f docker-compose.dev.yml down -v  # Reset DB (deletes data)
```

## Testing

- **Frontend unit tests**: Vitest with React Testing Library, jsdom environment. Tests in `src/__tests__/`. Setup file: `src/setupTests.ts`. E2e specs excluded from Vitest via config.
- **Frontend e2e tests**: Playwright, specs in `e2e/`. Config auto-starts Vite dev server.
- **Backend tests**: JUnit 5 + Spring Boot Test. Uses `test` profile which excludes DataSource, JDBC repositories, and Security auto-configuration. Repositories are mocked with `@MockBean`.

## Linting & Formatting

- **ESLint**: Flat config (`eslint.config.js`) with typescript-eslint, react-hooks, react-refresh plugins.
- **Prettier**: semi, singleQuote, tabWidth: 2.

## Database

Oracle connection: `jdbc:oracle:thin:@//localhost:1521/FREEPDB1`. In Docker the hostname is `oracle-db` (via `dev` profile). The `gvenzl/oracle-free:23-slim` image auto-runs scripts from mounted `db/users/` on first start.

### Tables
`roles`, `users`, `contractor_types`, `fee_types`, `contractors`, `contractor_fee_types`, `declarations`, `declaration_items`

### Seed Data (test credentials)
| Login | Password | Role |
|-------|----------|------|
| `admin` | `admin123` | ADMINISTRATOR |
| `osdp_user` | `haslo123` | KONTRAHENT (OSDp) |
| `wyt_user` | `haslo123` | KONTRAHENT (Wytworca) |

## Domain Concepts

- **Contractor types**: OSDp (Operator przylaczony), Wytworca
- **Fee types**: OP (Oplata przejsciowa), OZE (Oplata OZE)
- **Declaration statuses**: NIE_ZLOZONE, ROBOCZE, ZLOZONE
- **Declaration number format**: `OSW/{fee_type}/{contractor_short}/{year}/{month}/{sub_period}/{version}`
- **Form field definitions**: Hardcoded in `FormFieldConfig.kt` per fee type x contractor type combination
- **JSON export**: Submitted declarations are exported to `./declarations-json/` (configurable via `app.declarations.json-dir`)

## Language

README and user-facing documentation are in Polish.
