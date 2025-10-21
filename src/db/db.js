import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../data/onboarding.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = DELETE');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = FULL');
db.pragma('busy_timeout = 5000');

export default db;
