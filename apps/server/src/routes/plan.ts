import { planResponseSchema, type DayStatus } from '@matem/shared';
import { asc } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../db/client';
import { chapters, dayParagraphs, days, paragraphs, progress } from '../db/schema';
import { serialize } from '../lib/validate';

// GET /api/plan — весь план: главы с параграфами и дни со статусом и id параграфов
export default function planRoutes(app: FastifyInstance): void {
  app.get('/plan', () => {
    const chs = db.select().from(chapters).orderBy(asc(chapters.number)).all();
    const paras = db
      .select()
      .from(paragraphs)
      .orderBy(asc(paragraphs.chapterId), asc(paragraphs.id))
      .all();
    const dys = db.select().from(days).orderBy(asc(days.dayNumber)).all();
    const links = db.select().from(dayParagraphs).all();
    const progs = db.select().from(progress).all();

    const parasByChapter = new Map<number, typeof paras>();
    for (const p of paras) {
      const arr = parasByChapter.get(p.chapterId) ?? [];
      arr.push(p);
      parasByChapter.set(p.chapterId, arr);
    }

    const paraIdsByDay = new Map<number, number[]>();
    for (const l of links) {
      const arr = paraIdsByDay.get(l.dayId) ?? [];
      arr.push(l.paragraphId);
      paraIdsByDay.set(l.dayId, arr);
    }

    const progByDay = new Map(progs.map((p) => [p.dayId, p]));

    const result = {
      chapters: chs.map((c) => ({
        id: c.id,
        number: c.number,
        title: c.title,
        paragraphs: (parasByChapter.get(c.id) ?? []).map((p) => ({
          id: p.id,
          number: p.number,
          title: p.title,
        })),
      })),
      days: dys.map((d) => {
        const pr = progByDay.get(d.id);
        return {
          id: d.id,
          dayNumber: d.dayNumber,
          title: d.title,
          note: d.note,
          isLocked: d.isLocked,
          status: (pr?.status ?? 'pending') as DayStatus,
          completedAt: pr?.completedAt ?? null,
          paragraphIds: paraIdsByDay.get(d.id) ?? [],
        };
      }),
    };

    return serialize(planResponseSchema, result);
  });
}
