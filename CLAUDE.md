# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PKU-MAT is a full-stack web application for submitting settlement declarations (oswiadczenia rozliczeniowe) related to transmission and non-transmission fees under Transmission Agreements with OSP. Built with React frontend, Kotlin/Spring Boot backend, and Oracle database.

## Architecture

- **Frontend** (`frontend/`): React 18 + TypeScript, built with Vite. Dev server on port 5173, proxies `/api/*` to backend at `localhost:8080`. In Docker, served by nginx on port 3000 with `proxy_pass` to backend container.
- **Backend** (`backend/`): Kotlin + Spring Boot 3.2.5 with Spring Data JDBC and Spring Security. Runs on port 8080. Package: `pl.pku.mat`.
- **Database** (`db/`): Oracle 23 Free (service: FREEPDB1, user: `pku`/`pku`). All DDL and seed data in `db/users/init.sql` (auto-executed on first container start).
- **Docs** (`docs/`): Project presentation (`prezentacja.html`) — HTML slide deck covering PRD requirements, extra features, assumptions, tech stack, and conclusions.
- **API convention**: All REST endpoints are prefixed with `/api/` (e.g., `/api/health`, `/api/dashboard`).
- **Spring profiles**: `dev` (Docker networking with `oracle-db` hostname), `test` (datasource, JDBC repos, and security excluded — repositories mocked in tests).
- **CORS**: Backend allows origins `http://localhost:5173` (Vite dev) and `http://localhost:3000` (Docker nginx). Configured in `SecurityConfig.kt`.

## Backend Package Structure

```
pl.pku.mat/
├── config/          # SecurityConfig, FormFieldConfig, GlobalExceptionHandler
├── controller/      # AuthController, BillingPeriodController, DashboardController, DeclarationController, HealthController
├── dto/             # Request/response DTOs
├── entity/          # Spring Data JDBC entities (@Table)
├── repository/      # CrudRepository interfaces
├── security/        # CustomUserDetailsService
└── service/         # BillingPeriodService, DeclarationService, DeclarationNumberGenerator, JsonExportService
```

## Frontend Structure

```
src/
├── api/             # API client (fetch wrapper), auth.ts, declarations.ts
├── components/      # Layout, ProtectedRoute, FormField
├── context/         # AuthContext (session-based auth state)
├── pages/           # LoginPage, DashboardPage, DeclarationFormPage, DeclarationDetailPage, DeclarationVersionsPage, ConfirmationPage
└── types/           # TypeScript interfaces matching backend DTOs
```

## API Endpoints

### Auth (public)
- `POST /api/auth/login` — JSON `{username, password}`, returns user info + session cookie
- `POST /api/auth/logout` — invalidates session
- `GET /api/auth/me` — returns current user from session

### Domain (authenticated)
- `GET /api/dashboard` — billing period declarations status for current month (per fee type × period)
- `GET /api/billing-periods?feeType={code}&year={y}[&month={m}]` — list billing periods
- `GET /api/declarations` — list all declarations for user's contractor
- `GET /api/declarations/by-period/{billingPeriodId}` — all declaration versions for a billing period
- `GET /api/declarations/{id}` — single declaration with items
- `GET /api/declarations/form?feeType={code}&billingPeriodId={id}` — form field definitions (versioned template) for fee type and billing period
- `POST /api/declarations` — submit declaration (`{feeTypeCode, billingPeriodId, items, comment}`), saves to DB with JSON in `json_content` CLOB column

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

- **Frontend unit tests**: Vitest with React Testing Library, jsdom environment. Tests in `src/__tests__/`. Setup file: `src/setupTests.ts`. E2e specs excluded from Vitest via config. Vitest config is in separate `vitest.config.ts` (not in `vite.config.ts`) to avoid TypeScript type conflicts during `tsc -b` build.
- **Frontend e2e tests**: Playwright (Chromium), specs in `e2e/`. Config auto-starts Vite dev server. Install browsers with `npx playwright install chromium`. Tests cover login flows (OSDp, Wytworca, invalid credentials).
- **Backend tests**: JUnit 5 + Spring Boot Test. Uses `test` profile which excludes DataSource, JDBC repositories, and Security auto-configuration. Repositories are mocked with `@MockBean`.

## Linting & Formatting

- **ESLint**: Flat config (`eslint.config.js`) with typescript-eslint, react-hooks, react-refresh plugins.
- **Prettier**: semi, singleQuote, tabWidth: 2.

## Database

Oracle connection: `jdbc:oracle:thin:@//localhost:1521/FREEPDB1`. In Docker the hostname is `oracle-db` (service name, via `dev` profile); container name is `pku-oracle-db`. The `gvenzl/oracle-free:23-slim` image auto-runs scripts from mounted `db/users/` on first start. If init.sql was not auto-executed, run manually: `docker exec -i pku-oracle-db sqlplus -S pku/pku@//localhost:1521/FREEPDB1 < db/users/init.sql`.

### Tables
`roles`, `users`, `contractor_types`, `fee_types`, `contractors`, `contractor_fee_types`, `form_templates`, `billing_periods`, `billing_period_templates`, `declarations`, `declaration_items`

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
- **Declaration number format**: `OSW/{fee_type}/{contractor_short}/{year}/{month}/{sub_period}/{version}[/KOR]` — `/KOR` suffix appended when submitted after billing period's `submission_deadline`
- **Declaration versioning**: Multiple versions can be submitted per billing period. Each new submission increments the version number. Versions submitted after deadline are corrections (korekty)
- **Form templates (versioned)**: Stored in `form_templates` table as JSON (`fields_json` CLOB). Version name format: `<fee_type_code>.<contractor_type_code>.<version_number>` (e.g., `OP.OSDp.1`). Each billing period is linked to a template via `billing_period_templates` mapping table (per contractor type). Different billing periods can use different template versions. Submitted declarations record the template version used (`form_template_version_name`)
- **JSON export**: Submitted declarations are serialized to JSON and stored in the `json_content` CLOB column of the `declarations` table
- **Billing periods**: Defined per fee type × year × month × sub_period. OP has monthly periods (sub_period=1), OZE has 10-day periods (3 sub_periods per month). Each period has `start_date`, `end_date`, and `submission_deadline` (default: end_date + 5 days). Declarations reference a `billing_period_id`. Seed data covers 6 months (Oct 2025 – Mar 2026).
- **Dashboard**: Shows all billing periods grouped by fee type in descending order (newest first). Fee type toggle buttons with missing declaration counts. Paginated cards (5 per page) per region. Each card shows period dates, deadline, status, last version number, and action buttons.
- **Declaration form**: Table layout with columns: LP, Opis, Wartosc (editable), Jednostka.

## Language

README and user-facing documentation are in Polish.
