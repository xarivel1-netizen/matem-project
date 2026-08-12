import {
  attemptResultSchema,
  createTaskInputSchema,
  submitAttemptInputSchema,
  taskPublicSchema,
} from '@matem/shared';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { answersEqual } from '../answer/check';
import { db } from '../db/client';
import { attempts, dayParagraphs, paragraphs, progress, tasks } from '../db/schema';
import { notFound } from '../lib/errors';
import { toPublicTask } from '../lib/mappers';
import { parseIdParam, parseInput, serialize } from '../lib/validate';

// у /tasks/:id/attempt id берём из URL, тело содержит только ответ
const attemptBodySchema = submitAttemptInputSchema.pick({ answerGiven: true });

const taskListSchema = z.array(taskPublicSchema);

// фильтры выборки задач для сессии
const listQuerySchema = z.object({
  paragraphId: z.coerce.number().int().positive().optional(),
  chapterId: z.coerce.number().int().positive().optional(),
  // 'completed' — смешанная тренировка из уже пройденного (дни со статусом done)
  scope: z.enum(['completed', 'all']).optional(),
});

export default function taskRoutes(app: FastifyInstance): void {
  // GET /api/tasks — список задач для сессии (по параграфу / главе / пройденному)
  app.get('/tasks', (req) => {
    const q = listQuerySchema.parse(req.query);

    if (q.paragraphId !== undefined) {
      const rows = db.select().from(tasks).where(eq(tasks.paragraphId, q.paragraphId)).all();
      return serialize(taskListSchema, rows.map(toPublicTask));
    }

    if (q.chapterId !== undefined) {
      const rows = db
        .select({ t: tasks })
        .from(tasks)
        .innerJoin(paragraphs, eq(tasks.paragraphId, paragraphs.id))
        .where(eq(paragraphs.chapterId, q.chapterId))
        .all();
      return serialize(taskListSchema, rows.map((r) => toPublicTask(r.t)));
    }

    if (q.scope === 'completed') {
      // задачи из параграфов, привязанных к выполненным дням
      const rows = db
        .selectDistinct({ t: tasks })
        .from(tasks)
        .innerJoin(dayParagraphs, eq(dayParagraphs.paragraphId, tasks.paragraphId))
        .innerJoin(progress, eq(progress.dayId, dayParagraphs.dayId))
        .where(eq(progress.status, 'done'))
        .all();
      return serialize(taskListSchema, rows.map((r) => toPublicTask(r.t)));
    }

    const rows = db.select().from(tasks).all();
    return serialize(taskListSchema, rows.map(toPublicTask));
  });

  // POST /api/tasks — создать задачу к параграфу
  app.post('/tasks', (req, reply) => {
    const input = parseInput(createTaskInputSchema, req.body);

    const para = db
      .select({ id: paragraphs.id })
      .from(paragraphs)
      .where(eq(paragraphs.id, input.paragraphId))
      .get();
    if (!para) throw notFound(`Параграф #${input.paragraphId} не найден.`);

    const row = db
      .insert(tasks)
      .values({
        paragraphId: input.paragraphId,
        kind: input.kind,
        statementMd: input.statementMd,
        optionsJson: input.options ? JSON.stringify(input.options) : null,
        answer: input.answer,
        solutionMd: input.solutionMd,
        difficulty: input.difficulty,
      })
      .returning()
      .get();

    reply.code(201);
    return serialize(taskPublicSchema, toPublicTask(row));
  });

  // POST /api/tasks/:id/attempt — отправить ответ
  app.post('/tasks/:id/attempt', (req) => {
    const id = parseIdParam(req.params);
    const { answerGiven } = parseInput(attemptBodySchema, req.body);

    const task = db.select().from(tasks).where(eq(tasks.id, id)).get();
    if (!task) throw notFound(`Задача #${id} не найдена.`);

    const isCorrect = answersEqual(answerGiven, task.answer);
    db.insert(attempts).values({ taskId: id, answerGiven, isCorrect }).run();

    // правильный ответ раскрываем только при ошибке; решение отдаём, если оно есть
    const result: z.infer<typeof attemptResultSchema> = {
      isCorrect,
      solutionMd: task.solutionMd,
      ...(isCorrect ? {} : { correctAnswer: task.answer }),
    };
    return serialize(attemptResultSchema, result);
  });
}
