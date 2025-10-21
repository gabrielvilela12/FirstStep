// scripts/seed-onboardees.js
import db from '../src/db/db.js';

function brDateToISO(dmy) {
  const [d, m, y] = dmy.split('/');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function brDateTimeToISO(s) {
  const [date, time] = s.split('-').map(p => p.trim());
  return `${brDateToISO(date)} ${time}`;
}

const seedData = [
  {
    name: "Ana Silva",
    email: "ana.silva@vivo.com.br",
    phone: "+55 11 99999-0001",
    avatar: "",
    start_date: brDateToISO("15/01/2025"),
    progress: 65,
    current_task: "Assistir curso Tecnologia e Inovação",
    deadline: brDateToISO("25/01/2025"),
    status: "progress",
    total_tasks: 21,
    completed_tasks: 14,
    pending_questions: 2,
    department: "TI",
    last_activity: "2 horas atrás",
    next_meeting: brDateTimeToISO("23/01/2025 - 14:00"),
  },
  {
    name: "Carlos Santos",
    email: "carlos.santos@vivo.com.br",
    phone: "+55 11 99999-0002",
    avatar: "",
    start_date: brDateToISO("10/01/2025"),
    progress: 25,
    current_task: "Leitura de políticas",
    deadline: brDateToISO("20/01/2025"),
    status: "delayed",
    total_tasks: 21,
    completed_tasks: 5,
    pending_questions: 1,
    department: "Comercial",
    last_activity: "1 dia atrás",
    next_meeting: brDateTimeToISO("22/01/2025 - 10:00"),
  }
];

const upsert = db.prepare(`
  INSERT INTO onboardees (
    name, email, phone, avatar, start_date, progress, current_task,
    deadline, status, total_tasks, completed_tasks, pending_questions,
    department, last_activity, next_meeting
  ) VALUES (
    @name, @email, @phone, @avatar, @start_date, @progress, @current_task,
    @deadline, @status, @total_tasks, @completed_tasks, @pending_questions,
    @department, @last_activity, @next_meeting
  )
  ON CONFLICT(email) DO UPDATE SET
    name=excluded.name,
    phone=excluded.phone,
    avatar=excluded.avatar,
    start_date=excluded.start_date,
    progress=excluded.progress,
    current_task=excluded.current_task,
    deadline=excluded.deadline,
    status=excluded.status,
    total_tasks=excluded.total_tasks,
    completed_tasks=excluded.completed_tasks,
    pending_questions=excluded.pending_questions,
    department=excluded.department,
    last_activity=excluded.last_activity,
    next_meeting=excluded.next_meeting
`);

const tx = db.transaction((rows) => {
  rows.forEach(r => upsert.run(r));
});

tx(seedData);

const rows = db.prepare(`SELECT id, name, email, progress, status FROM onboardees ORDER BY id`).all();
console.log('🌱 Seed concluído:');
console.table(rows);
