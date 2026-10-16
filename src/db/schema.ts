export const MIGRATIONS: string[] = [
  // ---------- version 1 ----------
  `
    CREATE TABLE IF NOT EXISTS transactions (
    id           TEXT PRIMARY KEY NOT NULL,              -- UUID made on the phone
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0), -- LKR 4,280.50 -> 428050
    direction    TEXT NOT NULL CHECK (direction IN ('in', 'out')),
    category     TEXT NOT NULL,
    merchant     TEXT NOT NULL,
    note         TEXT,
    occurred_at  TEXT NOT NULL,                           -- ISO date: when money moved
    source       TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'receipt', 'paste')),
    updated_at   TEXT NOT NULL,                           -- ISO date: for last-write-wins
    deleted      INTEGER NOT NULL DEFAULT 0,              -- soft delete: 0 = no, 1 = yes
    sync_status  TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced'))
  );

  CREATE INDEX IF NOT EXISTS idx_tx_occurred ON transactions (occurred_at DESC);

  CREATE TABLE IF NOT EXISTS sync_queue (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,         -- order of changes
    entity     TEXT NOT NULL,                             -- 'transaction' (later: 'budget', 'bill')
    entity_id  TEXT NOT NULL,
    op         TEXT NOT NULL CHECK (op IN ('upsert', 'delete')),
    payload    TEXT NOT NULL,                             -- the row as JSON
    created_at TEXT NOT NULL,
    attempts   INTEGER NOT NULL DEFAULT 0,
    last_error TEXT
  );  `,
  // ---------- version 2 ----------
  `
  CREATE TABLE IF NOT EXISTS budgets (
    id          TEXT PRIMARY KEY NOT NULL,
    category    TEXT NOT NULL UNIQUE,                     -- one monthly budget per category
    limit_cents INTEGER NOT NULL CHECK (limit_cents > 0),
    updated_at  TEXT NOT NULL,
    deleted     INTEGER NOT NULL DEFAULT 0,
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced'))
  );

  CREATE TABLE IF NOT EXISTS bills (
    id                 TEXT PRIMARY KEY NOT NULL,
    name               TEXT NOT NULL,                     -- "CEB electricity"
    category           TEXT NOT NULL DEFAULT 'bills',
    amount_cents       INTEGER NOT NULL CHECK (amount_cents > 0),
    due_day            INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31), -- day of each month
    remind_days_before INTEGER NOT NULL DEFAULT 2,
    last_paid_month    TEXT,                              -- '2026-10' when paid for October
    updated_at         TEXT NOT NULL,
    deleted            INTEGER NOT NULL DEFAULT 0,
    sync_status        TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced'))
  );
  `,
    // ---------- version 3 ----------
  `
  CREATE TABLE IF NOT EXISTS kv (
    key   TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  `,
  // ---------- version 4 goes here when you need it ----------
];