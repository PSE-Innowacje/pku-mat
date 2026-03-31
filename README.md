# PKU-MAT

System do skladania oswiadczen rozliczeniowych w ramach oplat przesylowych i pozaprzesylowych dla Umow Przesylania z OSP.

## Funkcjonalnosc

- Logowanie z rolami (Administrator, Kontrahent)
- Dashboard z lista oswiadczen do zlozenia w biezacym miesiacu
- Skladanie oswiadczen rozliczeniowych (dynamiczny formularz wg typu oplaty i kontrahenta)
- Eksport zlozonych oswiadczen do plikow JSON
- Podglad zlozonych oswiadczen

### Obslugiwane typy

| Typ kontrahenta | Typy oplat |
|-----------------|------------|
| OSDp (Operator przylaczony) | OP (Oplata przejsciowa), OZE (Oplata OZE) |
| Wytworca | OZE (Oplata OZE) |

## Stack technologiczny

| Warstwa    | Technologia                          |
|------------|--------------------------------------|
| Frontend   | React 18 + TypeScript (Vite, port 5173) |
| Backend    | Kotlin + Spring Boot 3.2.5 (port 8080)  |
| Baza danych| Oracle Database 23 Free              |
| Bezpieczenstwo | Spring Security (sesje)           |

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

Baza bedzie dostepna pod `localhost:1521`. Uzytkownik `pku` z haslem `pku` zostanie utworzony automatycznie. Tabele i dane testowe sa tworzone przez skrypt `db/users/init.sql`.

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

## Dane logowania (srodowisko testowe)

| Login | Haslo | Rola | Typ kontrahenta |
|-------|-------|------|-----------------|
| `admin` | `admin123` | Administrator | - |
| `osdp_user` | `haslo123` | Kontrahent | OSDp |
| `wyt_user` | `haslo123` | Kontrahent | Wytworca |

## API

Wszystkie endpointy sa dostepne pod prefixem `/api/`.

### Endpointy publiczne
| Metoda | Sciezka | Opis |
|--------|---------|------|
| POST | `/api/auth/login` | Logowanie (JSON: `{username, password}`) |
| POST | `/api/auth/logout` | Wylogowanie |
| GET | `/api/auth/me` | Dane zalogowanego uzytkownika |
| GET | `/api/health` | Health check |

### Endpointy chronione (wymagaja sesji)
| Metoda | Sciezka | Opis |
|--------|---------|------|
| GET | `/api/dashboard` | Dashboard z lista oplat i statusami |
| GET | `/api/declarations` | Lista oswiadczen kontrahenta |
| GET | `/api/declarations/{id}` | Szczegoly oswiadczenia |
| GET | `/api/declarations/form?feeType={kod}` | Szablon formularza dla typu oplaty |
| POST | `/api/declarations` | Zlozenie oswiadczenia |

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

```bash
cd frontend
npm run lint
npm run format
```

## Struktura projektu

```
pku-mat/
├── frontend/                   # Aplikacja React (Vite)
│   ├── src/
│   │   ├── api/                # Klient API (fetch)
│   │   ├── components/         # Layout, ProtectedRoute, FormField
│   │   ├── context/            # AuthContext
│   │   ├── pages/              # Strony aplikacji
│   │   ├── types/              # Interfejsy TypeScript
│   │   └── __tests__/          # Testy jednostkowe
│   └── e2e/                    # Testy Playwright
├── backend/                    # Aplikacja Kotlin Spring Boot
│   └── src/main/kotlin/pl/pku/mat/
│       ├── config/             # SecurityConfig, FormFieldConfig
│       ├── controller/         # Kontrolery REST
│       ├── dto/                # Obiekty transferu danych
│       ├── entity/             # Encje Spring Data JDBC
│       ├── repository/         # Repozytoria
│       ├── security/           # UserDetailsService
│       └── service/            # Logika biznesowa
├── db/
│   └── users/
│       └── init.sql            # DDL + dane testowe (auto-wykonywane)
├── docker-compose.yml          # Pelne srodowisko
├── docker-compose.dev.yml      # Tylko baza danych
└── README.md
```

## Baza danych

Projekt korzysta z obrazu **gvenzl/oracle-free:23-slim**.

- **Schemat:** `PKU`
- **Haslo:** `pku` (srodowisko deweloperskie)
- **Service Name:** `FREEPDB1`
- **JDBC URL:** `jdbc:oracle:thin:@//localhost:1521/FREEPDB1`

### Tabele

| Tabela | Opis |
|--------|------|
| `roles` | Role uzytkownikow (ADMINISTRATOR, KONTRAHENT) |
| `users` | Uzytkownicy z hashami hasel (BCrypt) |
| `contractor_types` | Typy kontrahentow (OSDp, WYTWORCA) |
| `fee_types` | Typy oplat (OP, OZE) |
| `contractors` | Kontrahenci powiazani z uzytkownikami |
| `contractor_fee_types` | Mapowanie kontrahent-oplata |
| `declarations` | Oswiadczenia rozliczeniowe |
| `declaration_items` | Pozycje formularza oswiadczenia |

Skrypt `db/users/init.sql` tworzy wszystkie tabele i wypelnia je danymi testowymi przy pierwszym uruchomieniu kontenera Oracle.
