# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PKU-MAT is a full-stack web application with a React frontend, Kotlin/Spring Boot backend, and Oracle database.

## Architecture

- **Frontend** (`frontend/`): React 18 + TypeScript, built with Vite. Dev server on port 5173, proxies `/api/*` to backend at `localhost:8080`.
- **Backend** (`backend/`): Kotlin + Spring Boot 3.2.5 with Spring Data JDBC. Runs on port 8080. Package: `pl.pku.mat`.
- **Database** (`db/`): Oracle 23 Free (service: FREEPDB1, user: `pku`/`pku`). Init scripts in `db/users/`, `db/struct/`, `db/plsql/`.
- **API convention**: All REST endpoints are prefixed with `/api/` (e.g., `/api/health`).
- **Spring profiles**: `dev` (Docker networking with `oracle-db` hostname), `test` (datasource excluded).

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
```

## Testing

- **Frontend unit tests**: Vitest with React Testing Library, jsdom environment. Tests in `src/__tests__/`. Setup file: `src/setupTests.ts`.
- **Frontend e2e tests**: Playwright, specs in `e2e/`. Config auto-starts Vite dev server.
- **Backend tests**: JUnit 5 + Spring Boot Test. Uses `test` profile which excludes DataSource auto-configuration (no DB needed).

## Linting & Formatting

- **ESLint**: Flat config (`eslint.config.js`) with typescript-eslint, react-hooks, react-refresh plugins.
- **Prettier**: semi, singleQuote, tabWidth: 2.

## Database

Oracle connection: `jdbc:oracle:thin:@//localhost:1521/FREEPDB1`. In Docker the hostname is `oracle-db` (via `dev` profile). The `gvenzl/oracle-free:23-slim` image auto-runs scripts from mounted `db/users/` on first start.

## Language

README and user-facing documentation are in Polish.
