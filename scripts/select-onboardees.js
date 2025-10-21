// scripts/select-onboardees.js
import db from '../src/db/db.js';

const all = db.prepare(`
  SELECT id, name, email, department, status, progress
  FROM onboardees
  ORDER BY id
`).all();
console.log('Todos:');
console.table(all);

const delayed = db.prepare(`
  SELECT id, name, deadline
  FROM onboardees
  WHERE status = ?
  ORDER BY deadline
`).all('delayed');
console.log('Atrasados:');
console.table(delayed);

const search = db.prepare(`
  SELECT id, name, email
  FROM onboardees
  WHERE name LIKE ?
`).all('%Ana%');
console.log('Busca "Ana":');
console.table(search);
