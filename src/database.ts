import { Database } from "bun:sqlite";

const DB_PATH = process.env.TFSA_DB_PATH || "./tfsa-countdown.db";

const db = new Database(DB_PATH);

db.run(`
  CREATE TABLE IF NOT EXISTS contributions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    amount      REAL NOT NULL,
    contributed_at TEXT NOT NULL,
    note        TEXT
  )
`);

db.run(
  "CREATE INDEX IF NOT EXISTS idx_contributions_date ON contributions(contributed_at DESC)",
);

export interface Contribution {
  id: number;
  amount: number;
  contributed_at: string;
  note: string | null;
}

export function addContribution(
  amount: number,
  date: string,
  note?: string,
): void {
  db.run(
    "INSERT INTO contributions (amount, contributed_at, note) VALUES (?, ?, ?)",
    [amount, date, note ?? null],
  );
}

export function getAllContributions(): Contribution[] {
  return db
    .query("SELECT * FROM contributions ORDER BY contributed_at DESC, id DESC")
    .all() as Contribution[];
}

export function getTotalContributed(): number {
  const row = db
    .query("SELECT COALESCE(SUM(amount), 0) as total FROM contributions")
    .get() as { total: number };
  return row.total;
}

export { db };
