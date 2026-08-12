import { z } from 'zod';

/**
 * Общие типы и zod-схемы предметной области.
 * Импортируются и клиентом (apps/web), и сервером (apps/server).
 * Источник правды по данным — SQLite на сервере; эти схемы описывают его сущности
 * и валидируют вход/выход API.
 */

// ---------- Перечисления ----------

export const dayStatusSchema = z.enum(['pending', 'done', 'skipped']);
export type DayStatus = z.infer<typeof dayStatusSchema>;

export const taskKindSchema = z.enum(['input', 'choice']);
export type TaskKind = z.infer<typeof taskKindSchema>;

export const difficultySchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type Difficulty = z.infer<typeof difficultySchema>;

// ---------- Сущности ----------

export const chapterSchema = z.object({
  id: z.number().int().positive(),
  number: z.number().int().positive(),
  title: z.string().min(1),
});
export type Chapter = z.infer<typeof chapterSchema>;

export const paragraphSchema = z.object({
  id: z.number().int().positive(),
  chapterId: z.number().int().positive(),
  // §-номер: в plan-source.md не задан → допускаем null
  number: z.number().int().positive().nullable(),
  title: z.string().min(1),
  theoryMd: z.string().nullable(),
});
export type Paragraph = z.infer<typeof paragraphSchema>;

export const daySchema = z.object({
  id: z.number().int().positive(),
  dayNumber: z.number().int().positive(),
  title: z.string().min(1),
  note: z.string().nullable(),
  // is_locked — реализует правило «блок производных (дни 22–30) не сжимать»
  isLocked: z.boolean(),
});
export type Day = z.infer<typeof daySchema>;

export const dayParagraphSchema = z.object({
  dayId: z.number().int().positive(),
  paragraphId: z.number().int().positive(),
});
export type DayParagraph = z.infer<typeof dayParagraphSchema>;

export const progressSchema = z.object({
  id: z.number().int().positive(),
  dayId: z.number().int().positive(),
  status: dayStatusSchema,
  completedAt: z.string().nullable(),
});
export type Progress = z.infer<typeof progressSchema>;

export const taskSchema = z.object({
  id: z.number().int().positive(),
  paragraphId: z.number().int().positive(),
  kind: taskKindSchema,
  statementMd: z.string().min(1),
  // варианты ответа — только для kind === 'choice'
  options: z.array(z.string()).nullable(),
  answer: z.string().min(1),
  solutionMd: z.string().nullable(),
  difficulty: difficultySchema,
});
export type Task = z.infer<typeof taskSchema>;

export const attemptSchema = z.object({
  id: z.number().int().positive(),
  taskId: z.number().int().positive(),
  answerGiven: z.string(),
  isCorrect: z.boolean(),
  createdAt: z.string(),
});
export type Attempt = z.infer<typeof attemptSchema>;

// ---------- Вход API (валидация запросов сервера) ----------

export const updateProgressInputSchema = z.object({
  dayId: z.number().int().positive(),
  status: dayStatusSchema,
});
export type UpdateProgressInput = z.infer<typeof updateProgressInputSchema>;

export const submitAttemptInputSchema = z.object({
  taskId: z.number().int().positive(),
  answerGiven: z.string().min(1),
});
export type SubmitAttemptInput = z.infer<typeof submitAttemptInputSchema>;

export const createTaskInputSchema = z
  .object({
    paragraphId: z.number().int().positive(),
    kind: taskKindSchema,
    statementMd: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).nullable().default(null),
    answer: z.string().min(1),
    solutionMd: z.string().min(1).nullable().default(null),
    difficulty: difficultySchema,
  })
  // для kind='choice' варианты обязательны, и правильный ответ должен быть среди них
  .refine((v) => v.kind !== 'choice' || (v.options !== null && v.options.length >= 2), {
    message: 'Для задачи с выбором нужны варианты (минимум 2).',
    path: ['options'],
  })
  .refine((v) => v.kind !== 'choice' || v.options === null || v.options.includes(v.answer), {
    message: 'Правильный ответ должен быть среди вариантов.',
    path: ['answer'],
  });
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

export const updateTheoryInputSchema = z.object({
  theoryMd: z.string(),
});
export type UpdateTheoryInput = z.infer<typeof updateTheoryInputSchema>;

// ---------- Выход API (валидация ответов сервера) ----------

/** Задача в публичном виде — без answer и solutionMd (их клиент не видит до попытки). */
export const taskPublicSchema = z.object({
  id: z.number().int().positive(),
  paragraphId: z.number().int().positive(),
  kind: taskKindSchema,
  statementMd: z.string(),
  options: z.array(z.string()).nullable(),
  difficulty: difficultySchema,
});
export type TaskPublic = z.infer<typeof taskPublicSchema>;

export const attemptResultSchema = z.object({
  isCorrect: z.boolean(),
  correctAnswer: z.string().optional(),
  solutionMd: z.string().nullable().optional(),
});
export type AttemptResult = z.infer<typeof attemptResultSchema>;

const paragraphBriefSchema = z.object({
  id: z.number().int().positive(),
  number: z.number().int().positive().nullable(),
  title: z.string(),
});

export const chapterWithParagraphsSchema = chapterSchema.extend({
  paragraphs: z.array(paragraphBriefSchema),
});
export type ChapterWithParagraphs = z.infer<typeof chapterWithParagraphsSchema>;

export const dayListItemSchema = daySchema.extend({
  status: dayStatusSchema,
  completedAt: z.string().nullable(),
  paragraphIds: z.array(z.number().int().positive()),
});
export type DayListItem = z.infer<typeof dayListItemSchema>;

export const planResponseSchema = z.object({
  chapters: z.array(chapterWithParagraphsSchema),
  days: z.array(dayListItemSchema),
});
export type PlanResponse = z.infer<typeof planResponseSchema>;

export const paragraphDetailSchema = paragraphSchema.extend({
  tasks: z.array(taskPublicSchema),
});
export type ParagraphDetail = z.infer<typeof paragraphDetailSchema>;

export const dayDetailSchema = daySchema.extend({
  status: dayStatusSchema,
  completedAt: z.string().nullable(),
  paragraphs: z.array(paragraphDetailSchema),
});
export type DayDetail = z.infer<typeof dayDetailSchema>;

export const heatmapCellSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  count: z.number().int().nonnegative(),
});
export type HeatmapCell = z.infer<typeof heatmapCellSchema>;

export const statsSchema = z.object({
  totalDays: z.number().int().nonnegative(),
  daysDone: z.number().int().nonnegative(),
  percentComplete: z.number().min(0).max(100),
  tasksSolved: z.number().int().nonnegative(),
  attemptsTotal: z.number().int().nonnegative(),
  attemptsCorrect: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100),
  currentStreak: z.number().int().nonnegative(),
  bestStreak: z.number().int().nonnegative(),
  heatmap: z.array(heatmapCellSchema),
});
export type Stats = z.infer<typeof statsSchema>;

/** Единый формат ошибки API. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
