import { statsSchema, type HeatmapCell } from '@matem/shared';
import { eq, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../db/client';
import { attempts, days, progress } from '../db/schema';
import { computeStreaks } from '../stats/streak';
import { serialize } from '../lib/validate';

const HEATMAP_DAYS = 90;

/** YYYY-MM-DD для смещения на N дней назад от today (UTC). */
function shiftDate(todayIso: string, deltaDays: number): string {
  const base = Date.parse(`${todayIso}T00:00:00Z`);
  return new Date(base + deltaDays * 86_400_000).toISOString().slice(0, 10);
}

export default function statsRoutes(app: FastifyInstance): void {
  // GET /api/stats — сводка прогресса
  app.get('/stats', () => {
    const today = new Date().toISOString().slice(0, 10);

    const totalDays = db.select({ n: sql<number>`count(*)` }).from(days).get()?.n ?? 0;
    const daysDone =
      db
        .select({ n: sql<number>`count(*)` })
        .from(progress)
        .where(eq(progress.status, 'done'))
        .get()?.n ?? 0;

    const attemptsTotal = db.select({ n: sql<number>`count(*)` }).from(attempts).get()?.n ?? 0;
    const attemptsCorrect =
      db
        .select({ n: sql<number>`count(*)` })
        .from(attempts)
        .where(eq(attempts.isCorrect, true))
        .get()?.n ?? 0;
    const tasksSolved =
      db
        .select({ n: sql<number>`count(distinct ${attempts.taskId})` })
        .from(attempts)
        .where(eq(attempts.isCorrect, true))
        .get()?.n ?? 0;

    // Серии — по датам выполнения дней
    const doneDates = db
      .select({ completedAt: progress.completedAt })
      .from(progress)
      .where(eq(progress.status, 'done'))
      .all()
      .map((r) => r.completedAt)
      .filter((c): c is string => c !== null);
    const { current: currentStreak, best: bestStreak } = computeStreaks(doneDates, today);

    // Тепловая карта: активность (число попыток) по календарным дням за 90 дней
    const cutoff = shiftDate(today, -(HEATMAP_DAYS - 1));
    const recentAttempts = db
      .select({ createdAt: attempts.createdAt })
      .from(attempts)
      .all()
      .map((r) => r.createdAt.slice(0, 10))
      .filter((d) => d >= cutoff);

    const counts = new Map<string, number>();
    for (const d of recentAttempts) counts.set(d, (counts.get(d) ?? 0) + 1);

    const heatmap: HeatmapCell[] = [];
    for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
      const date = shiftDate(today, -i);
      heatmap.push({ date, count: counts.get(date) ?? 0 });
    }

    const result = {
      totalDays,
      daysDone,
      percentComplete: totalDays > 0 ? Math.round((daysDone / totalDays) * 100) : 0,
      tasksSolved,
      attemptsTotal,
      attemptsCorrect,
      accuracy: attemptsTotal > 0 ? Math.round((attemptsCorrect / attemptsTotal) * 100) : 0,
      currentStreak,
      bestStreak,
      heatmap,
    };

    return serialize(statsSchema, result);
  });
}
