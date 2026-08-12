import { dayDetailSchema, dayStatusSchema, type DayStatus } from '@matem/shared';
import { asc, eq, inArray } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db/client';
import { dayParagraphs, days, paragraphs, progress, tasks } from '../db/schema';
import { notFound } from '../lib/errors';
import { toPublicTask } from '../lib/mappers';
import { parseIdParam, parseInput, serialize } from '../lib/validate';

const progressBodySchema = z.object({ status: dayStatusSchema });

const progressResultSchema = z.object({
  dayId: z.number().int().positive(),
  status: dayStatusSchema,
  completedAt: z.string().nullable(),
});

export default function dayRoutes(app: FastifyInstance): void {
  // GET /api/days/:id — день с параграфами и задачами
  app.get('/days/:id', (req) => {
    const id = parseIdParam(req.params);
    const day = db.select().from(days).where(eq(days.id, id)).get();
    if (!day) throw notFound(`День #${id} не найден.`);

    const pr = db.select().from(progress).where(eq(progress.dayId, id)).get();
    const paraIds = db
      .select({ paragraphId: dayParagraphs.paragraphId })
      .from(dayParagraphs)
      .where(eq(dayParagraphs.dayId, id))
      .all()
      .map((r) => r.paragraphId);

    const paras =
      paraIds.length > 0
        ? db
            .select()
            .from(paragraphs)
            .where(inArray(paragraphs.id, paraIds))
            .orderBy(asc(paragraphs.id))
            .all()
        : [];

    const taskRows =
      paraIds.length > 0
        ? db.select().from(tasks).where(inArray(tasks.paragraphId, paraIds)).all()
        : [];
    const tasksByParagraph = new Map<number, typeof taskRows>();
    for (const t of taskRows) {
      const arr = tasksByParagraph.get(t.paragraphId) ?? [];
      arr.push(t);
      tasksByParagraph.set(t.paragraphId, arr);
    }

    const result = {
      id: day.id,
      dayNumber: day.dayNumber,
      title: day.title,
      note: day.note,
      isLocked: day.isLocked,
      status: (pr?.status ?? 'pending') as DayStatus,
      completedAt: pr?.completedAt ?? null,
      paragraphs: paras.map((p) => ({
        id: p.id,
        chapterId: p.chapterId,
        number: p.number,
        title: p.title,
        theoryMd: p.theoryMd,
        tasks: (tasksByParagraph.get(p.id) ?? []).map(toPublicTask),
      })),
    };

    return serialize(dayDetailSchema, result);
  });

  // PATCH /api/days/:id/progress — сменить статус дня
  app.patch('/days/:id/progress', (req) => {
    const id = parseIdParam(req.params);
    const { status } = parseInput(progressBodySchema, req.body);

    const day = db.select().from(days).where(eq(days.id, id)).get();
    if (!day) throw notFound(`День #${id} не найден.`);

    // completed_at ставим только для 'done'
    const completedAt = status === 'done' ? new Date().toISOString() : null;

    const existing = db.select().from(progress).where(eq(progress.dayId, id)).get();
    if (existing) {
      db.update(progress).set({ status, completedAt }).where(eq(progress.dayId, id)).run();
    } else {
      db.insert(progress).values({ dayId: id, status, completedAt }).run();
    }

    return serialize(progressResultSchema, { dayId: id, status, completedAt });
  });
}
