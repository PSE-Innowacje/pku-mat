# PKU-MAT

System wspomagajacy zarzadzanie danymi PKU, zbudowany w architekturze frontend-backend z baza danych Oracle.

## Stack technologiczny

| Warstwa    | Technologia                          |
|------------|--------------------------------------|
| Frontend   | React + TypeScript (Vite, port 5173) |
| Backend    | Kotlin + Spring Boot (port 8080)     |
| Baza danych| Oracle Database 23 Free              |

## Wymagania wstepne

- **Node.js** 20+
- **JDK** 21+
- **Docker** i **Docker Compose**
- **Gradle** 8.5+ (lub uzyj wrappera `./gradlew` z katalogu `backend/`)

## Szybki start (Docker Compose)

Uruchomienie calego srodowiska jednym poleceniem:

```bash
docker compose up --build
```

Po uruchomieniu:

| Usluga   | Adres                          |
|----------|--------------------------------|
| Frontend | http://localhost:3000           |
| Backend  | http://localhost:8080           |
| Oracle   | localhost:1521 (SID: FREEPDB1) |

Zatrzymanie:

```bash
docker compose down
```

Zatrzymanie wraz z usunieciem danych bazy:

```bash
docker compose down -v
```

## Lokalne srodowisko deweloperskie

W trybie lokalnym uruchamiamy tylko baze danych w Dockerze, a frontend i backend startujemy bezposrednio na maszynie.

### 1. Baza danych

```bash
docker compose -f docker-compose.dev.yml up -d
```

Baza bedzie dostepna pod `localhost:1521`. Uzytkownik `pku` z haslem `pku` zostanie utworzony automatycznie.

### 2. Backend

```bash
cd backend
./gradlew bootRun
```

Backend wystartuje na porcie **8080**.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend wystartuje na porcie **5173** (Vite dev server).

## Testy

### Frontend

```bash
cd frontend

# Testy jednostkowe (Vitest)
npm run test

# Testy e2e (Playwright)
npx playwright test
```

### Backend

```bash
cd backend
./gradlew test
```

## Linting i formatowanie

### Frontend

```bash
cd frontend
npm run lint
npm run format
```

### Backend

Linting Kotlin odbywa sie przez wtyczke ktlint w Gradle:

```bash
cd backend
./gradlew ktlintCheck
./gradlew ktlintFormat
```

## Struktura projektu

```
pku-mat/
├── frontend/               # Aplikacja React (Vite)
│   ├── Dockerfile
│   ├── src/
│   └── ...
├── backend/                # Aplikacja Kotlin Spring Boot
│   ├── Dockerfile
│   ├── src/
│   └── ...
├── db/                     # Skrypty bazodanowe
│   ├── users/              # Tworzenie uzytkownikow
│   │   └── create_pku.sql
│   ├── struct/             # Struktura tabel
│   │   └── init.sql
│   └── plsql/              # Procedury PL/SQL
│       └── init.sql
├── docker-compose.yml      # Pelne srodowisko (frontend + backend + db)
├── docker-compose.dev.yml  # Tylko baza danych (do pracy lokalnej)
├── .env.example            # Przykladowe zmienne srodowiskowe
├── .gitignore
└── README.md
```

## Baza danych

Projekt korzysta z obrazu **gvenzl/oracle-free:23-slim**.

- **Schemat:** `PKU`
- **Haslo:** `pku` (srodowisko deweloperskie)
- **Service Name:** `FREEPDB1`
- **JDBC URL:** `jdbc:oracle:thin:@//localhost:1521/FREEPDB1`

Skrypty inicjalizacyjne z katalogu `db/users/` sa automatycznie wykonywane przy pierwszym uruchomieniu kontenera (montowane do `/container-entrypoint-initdb.d/`).

Skrypty struktury tabel (`db/struct/`) i procedur PL/SQL (`db/plsql/`) nalezy uruchomic recznie po starcie bazy lub zintegrowac z pipeline'em migracji.
