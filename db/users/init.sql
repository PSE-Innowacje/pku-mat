-- =============================================
-- PKU-MAT: DDL + Seed Data
-- Oracle 23 Free, schema: pku
-- =============================================

-- 1. Roles
CREATE TABLE roles (
    id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(50) NOT NULL UNIQUE
);

-- 2. Users
CREATE TABLE users (
    id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username      VARCHAR2(100) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    display_name  VARCHAR2(200) NOT NULL,
    role_id       NUMBER NOT NULL REFERENCES roles(id),
    active        NUMBER(1) DEFAULT 1 NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Contractor types
CREATE TABLE contractor_types (
    id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR2(20) NOT NULL UNIQUE,
    name VARCHAR2(100) NOT NULL
);

-- 4. Fee types
CREATE TABLE fee_types (
    id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR2(20) NOT NULL UNIQUE,
    name VARCHAR2(200) NOT NULL
);

-- 5. Contractors
CREATE TABLE contractors (
    id                 NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    short_name         VARCHAR2(50) NOT NULL UNIQUE,
    full_name          VARCHAR2(300) NOT NULL,
    contractor_type_id NUMBER NOT NULL REFERENCES contractor_types(id),
    user_id            NUMBER NOT NULL REFERENCES users(id),
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Contractor-fee mapping
CREATE TABLE contractor_fee_types (
    id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contractor_id NUMBER NOT NULL REFERENCES contractors(id),
    fee_type_id   NUMBER NOT NULL REFERENCES fee_types(id),
    CONSTRAINT uq_contractor_fee UNIQUE (contractor_id, fee_type_id)
);

-- 7. Billing periods (okresy rozliczeniowe)
CREATE TABLE billing_periods (
    id                  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fee_type_id         NUMBER NOT NULL REFERENCES fee_types(id),
    year                NUMBER(4) NOT NULL,
    month               NUMBER(2) NOT NULL,
    sub_period          NUMBER(2) DEFAULT 1 NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    submission_deadline DATE NOT NULL,
    CONSTRAINT uq_billing_period UNIQUE (fee_type_id, year, month, sub_period)
);

-- 8. Declarations
CREATE TABLE declarations (
    id                 NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    declaration_number VARCHAR2(200) NOT NULL UNIQUE,
    contractor_id      NUMBER NOT NULL REFERENCES contractors(id),
    fee_type_id        NUMBER NOT NULL REFERENCES fee_types(id),
    year               NUMBER(4) NOT NULL,
    month              NUMBER(2) NOT NULL,
    sub_period         NUMBER(2) DEFAULT 1 NOT NULL,
    version            NUMBER(3) DEFAULT 1 NOT NULL,
    status             VARCHAR2(30) DEFAULT 'NIE_ZLOZONE' NOT NULL,
    remarks            VARCHAR2(1000),
    json_content       CLOB,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    submitted_at       TIMESTAMP,
    created_by         NUMBER NOT NULL REFERENCES users(id),
    billing_period_id  NUMBER REFERENCES billing_periods(id)
);

-- 9. Declaration items (form field values)
CREATE TABLE declaration_items (
    id             NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    declaration_id NUMBER NOT NULL REFERENCES declarations(id),
    field_code     VARCHAR2(50) NOT NULL,
    field_value    NUMBER(15,3),
    CONSTRAINT uq_decl_field UNIQUE (declaration_id, field_code)
);

-- Indexes
CREATE INDEX idx_declarations_contractor ON declarations(contractor_id);
CREATE INDEX idx_declarations_status ON declarations(status);
CREATE INDEX idx_declaration_items_decl ON declaration_items(declaration_id);
CREATE INDEX idx_billing_periods_fee_type ON billing_periods(fee_type_id);

-- =============================================
-- SEED DATA
-- =============================================

-- Roles
INSERT INTO roles (name) VALUES ('ADMINISTRATOR');
INSERT INTO roles (name) VALUES ('KONTRAHENT');

-- Contractor types
INSERT INTO contractor_types (code, name) VALUES ('OSDp', 'Operator systemu dystrybucyjnego przylaczony');
INSERT INTO contractor_types (code, name) VALUES ('WYTWORCA', 'Wytworca');

-- Fee types
INSERT INTO fee_types (code, name) VALUES ('OP', 'Oplata przejsciowa');
INSERT INTO fee_types (code, name) VALUES ('OZE', 'Oplata OZE');

-- Users (BCrypt hashes: admin/admin123, osdp_user/haslo123, wyt_user/haslo123)
INSERT INTO users (username, password_hash, display_name, role_id, active)
VALUES ('admin', '$2a$10$RaQt1dg0RsOQ0avObHUb7eWseO8QDXWM3rQsFRq/.MZvoGckMBEAq', 'Administrator Systemu', 1, 1);
INSERT INTO users (username, password_hash, display_name, role_id, active)
VALUES ('osdp_user', '$2a$10$vs14RbJne7plMeJhqxbrfujDOqsC6A6uza8duGtYSnz50BKkgOEJK', 'Jan Kowalski (OSDp)', 2, 1);
INSERT INTO users (username, password_hash, display_name, role_id, active)
VALUES ('wyt_user', '$2a$10$vs14RbJne7plMeJhqxbrfujDOqsC6A6uza8duGtYSnz50BKkgOEJK', 'Anna Nowak (Wytworca)', 2, 1);

-- Contractors
INSERT INTO contractors (short_name, full_name, contractor_type_id, user_id)
VALUES ('OSDP1', 'Testowy Operator OSDp Sp. z o.o.', 1, 2);
INSERT INTO contractors (short_name, full_name, contractor_type_id, user_id)
VALUES ('WYT1', 'Testowy Wytworca S.A.', 2, 3);

-- Contractor-fee mapping (OSDp: OP + OZE, Wytworca: OZE only)
INSERT INTO contractor_fee_types (contractor_id, fee_type_id) VALUES (1, 1);
INSERT INTO contractor_fee_types (contractor_id, fee_type_id) VALUES (1, 2);
INSERT INTO contractor_fee_types (contractor_id, fee_type_id) VALUES (2, 2);

-- Billing periods: OP (fee_type_id=1) — miesięczne, 6 miesięcy (paź 2025 – mar 2026)
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (1, 2025, 10, 1, DATE '2025-10-01', DATE '2025-10-31', DATE '2025-11-05');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (1, 2025, 11, 1, DATE '2025-11-01', DATE '2025-11-30', DATE '2025-12-05');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (1, 2025, 12, 1, DATE '2025-12-01', DATE '2025-12-31', DATE '2026-01-05');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (1, 2026, 1, 1, DATE '2026-01-01', DATE '2026-01-31', DATE '2026-02-05');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (1, 2026, 2, 1, DATE '2026-02-01', DATE '2026-02-28', DATE '2026-03-05');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (1, 2026, 3, 1, DATE '2026-03-01', DATE '2026-03-31', DATE '2026-04-05');

-- Billing periods: OZE (fee_type_id=2) — dziesięciodniowe, 6 miesięcy (paź 2025 – mar 2026)
-- Październik 2025
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2025, 10, 1, DATE '2025-10-01', DATE '2025-10-10', DATE '2025-10-15');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2025, 10, 2, DATE '2025-10-11', DATE '2025-10-20', DATE '2025-10-25');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2025, 10, 3, DATE '2025-10-21', DATE '2025-10-31', DATE '2025-11-05');
-- Listopad 2025
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2025, 11, 1, DATE '2025-11-01', DATE '2025-11-10', DATE '2025-11-15');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2025, 11, 2, DATE '2025-11-11', DATE '2025-11-20', DATE '2025-11-25');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2025, 11, 3, DATE '2025-11-21', DATE '2025-11-30', DATE '2025-12-05');
-- Grudzień 2025
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2025, 12, 1, DATE '2025-12-01', DATE '2025-12-10', DATE '2025-12-15');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2025, 12, 2, DATE '2025-12-11', DATE '2025-12-20', DATE '2025-12-25');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2025, 12, 3, DATE '2025-12-21', DATE '2025-12-31', DATE '2026-01-05');
-- Styczeń 2026
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2026, 1, 1, DATE '2026-01-01', DATE '2026-01-10', DATE '2026-01-15');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2026, 1, 2, DATE '2026-01-11', DATE '2026-01-20', DATE '2026-01-25');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2026, 1, 3, DATE '2026-01-21', DATE '2026-01-31', DATE '2026-02-05');
-- Luty 2026
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2026, 2, 1, DATE '2026-02-01', DATE '2026-02-10', DATE '2026-02-15');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2026, 2, 2, DATE '2026-02-11', DATE '2026-02-20', DATE '2026-02-25');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2026, 2, 3, DATE '2026-02-21', DATE '2026-02-28', DATE '2026-03-05');
-- Marzec 2026
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2026, 3, 1, DATE '2026-03-01', DATE '2026-03-10', DATE '2026-03-15');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2026, 3, 2, DATE '2026-03-11', DATE '2026-03-20', DATE '2026-03-25');
INSERT INTO billing_periods (fee_type_id, year, month, sub_period, start_date, end_date, submission_deadline)
VALUES (2, 2026, 3, 3, DATE '2026-03-21', DATE '2026-03-31', DATE '2026-04-05');

COMMIT;
