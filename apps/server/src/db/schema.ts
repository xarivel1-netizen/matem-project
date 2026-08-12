import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Схема БД (Drizzle / SQLite).
 * Индексы стоят на всех внешних ключах и на attempts.created_at.
 */

export const chapters = sqliteTable('chapters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  number: integer('number').notNull().unique(),
  title: text('title').notNull(),
});

export const paragraphs = sqliteTable(
  'paragraphs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chapterId: integer('chapter_id')
      .notNull()
      .references(() => chapters.id),
    // §-номер nullable: в plan-source.md номера параграфов не проставлены
    number: integer('number'),
    title: text('title').notNull(),
    theoryMd: text('theory_md'),
  },
  (t) => ({
    chapterIdx: index('idx_paragraphs_chapter_id').on(t.chapterId),
  }),
);

export const days = sqliteTable('days', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dayNumber: integer('day_number').notNull().unique(),
  title: text('title').notNull(),
  note: text('note'),
  // is_locked: дни 22–30 (блок производных) нельзя сжимать
  isLocked: integer('is_locked', { mode: 'boolean' }).notNull().default(false),
});

export const dayParagraphs = sqliteTable(
  'day_paragraphs',
  {
    dayId: integer('day_id')
      .notNull()
      .references(() => days.id),
    paragraphId: integer('paragraph_id')
      .notNull()
      .references(() => paragraphs.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.dayId, t.paragraphId] }),
    dayIdx: index('idx_day_paragraphs_day_id').on(t.dayId),
    paragraphIdx: index('idx_day_paragraphs_paragraph_id').on(t.paragraphId),
  }),
);

export const progress = sqliteTable(
  'progress',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    dayId: integer('day_id')
      .notNull()
      .references(() => days.id),
    status: text('status', { enum: ['pending', 'done', 'skipped'] })
      .notNull()
      .default('pending'),
    completedAt: text('completed_at'),
  },
  (t) => ({
    dayIdx: index('idx_progress_day_id').on(t.dayId),
  }),
);

export const tasks = sqliteTable(
  'tasks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    paragraphId: integer('paragraph_id')
      .notNull()
      .references(() => paragraphs.id),
    kind: text('kind', { enum: ['input', 'choice'] }).notNull(),
    statementMd: text('statement_md').notNull(),
    // JSON-массив вариантов ответа, только для kind='choice'
    optionsJson: text('options_json'),
    answer: text('answer').notNull(),
    solutionMd: text('solution_md'),
    difficulty: integer('difficulty').notNull(),
  },
  (t) => ({
    paragraphIdx: index('idx_tasks_paragraph_id').on(t.paragraphId),
  }),
);

export const attempts = sqliteTable(
  'attempts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    taskId: integer('task_id')
      .notNull()
      .references(() => tasks.id),
    answerGiven: text('answer_given').notNull(),
    isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (t) => ({
    taskIdx: index('idx_attempts_task_id').on(t.taskId),
    createdAtIdx: index('idx_attempts_created_at').on(t.createdAt),
  }),
);
