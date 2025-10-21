// scripts/init-db.js
import db from '../src/db/db.js';

db.exec(`
CREATE TABLE IF NOT EXISTS onboardees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar TEXT,
  start_date TEXT NOT NULL,                      -- YYYY-MM-DD
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  current_task TEXT,
  deadline TEXT,                                 -- YYYY-MM-DD
  status TEXT NOT NULL DEFAULT 'progress' CHECK (status IN ('progress','delayed','completed','blocked')),
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  pending_questions INTEGER NOT NULL DEFAULT 0,
  department TEXT,
  last_activity TEXT,                            -- ex.: "2 horas atrás" (display)
  next_meeting TEXT,                             -- YYYY-MM-DD HH:MM
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_onboardees_status ON onboardees(status);
CREATE INDEX IF NOT EXISTS idx_onboardees_department ON onboardees(department);
`);

console.log('✅ Tabela `onboardees` pronta.');
