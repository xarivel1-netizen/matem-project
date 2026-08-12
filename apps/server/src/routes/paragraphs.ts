import { paragraphDetailSchema, paragraphSchema, updateTheoryInputSchema } from '@matem/shared';
import { asc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db/client';
import { paragraphs, tasks } from '../db/schema';
import { notFound } from '../lib/errors';
import { toPublicTask } from '../lib/mappers';
import { parseIdParam, parseInput, serialize } from '../lib/validate';

const paragraphListSchema = z.array(paragraphSchema);

function loadParagraphDetail(id: number) {
  const p = db.select().from(paragraphs).where(eq(paragraphs.id, id)).get();
  if (!p) throw notFound(`Параграф #${id} не найден.`);
  const taskRows = db.select().from(tasks).where(eq(tasks.paragraphId, id)).all();
  return {
    id: p.id,
    chapterId: p.chapterId,
    number: p.number,
    title: p.title,
    theoryMd: p.theoryMd,
    tasks: taskRows.map(toPublicTask),
  };
}

export default function paragraphRoutes(app: FastifyInstance): void {
  // GET /api/paragraphs — все параграфы с теорией (для списка и поиска)
  app.get('/paragraphs', () => {
    const rows = db
      .select()
      .from(paragraphs)
      .orderBy(asc(paragraphs.chapterId), asc(paragraphs.id))
      .all();
    return serialize(
      paragraphListSchema,
      rows.map((p) => ({
        id: p.id,
        chapterId: p.chapterId,
        number: p.number,
        title: p.title,
        theoryMd: p.theoryMd,
      })),
    );
  });

  // GET /api/paragraphs/:id — параграф с теорией и задачами
  app.get('/paragraphs/:id', (req) => {
    const id = parseIdParam(req.params);
    return serialize(paragraphDetailSchema, loadParagraphDetail(id));
  });

  // PATCH /api/paragraphs/:id/theory — сохранить/обновить теорию (markdown)
  app.patch('/paragraphs/:id/theory', (req) => {
    const id = parseIdParam(req.params);
    const { theoryMd } = parseInput(updateTheoryInputSchema, req.body);

    const exists = db.select({ id: paragraphs.id }).from(paragraphs).where(eq(paragraphs.id, id)).get();
    if (!exists) throw notFound(`Параграф #${id} не найден.`);

    db.update(paragraphs).set({ theoryMd }).where(eq(paragraphs.id, id)).run();
    return serialize(paragraphDetailSchema, loadParagraphDetail(id));
  });
}
