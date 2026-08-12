import type { ChapterWithParagraphs, DayListItem, PlanResponse } from '@matem/shared';

export interface ChapterGroup {
  chapter: ChapterWithParagraphs;
  days: DayListItem[];
}

/** Карта id параграфа → его заголовок (для подписи дней). */
export function paragraphTitleMap(plan: PlanResponse): Map<number, string> {
  const m = new Map<number, string>();
  for (const ch of plan.chapters) {
    for (const p of ch.paragraphs) m.set(p.id, p.title);
  }
  return m;
}

/**
 * Группирует дни по главам. День относится к главе своего первого параграфа;
 * дни-повторения (без параграфов) наследуют главу предыдущего дня.
 */
export function groupByChapter(plan: PlanResponse): ChapterGroup[] {
  const chapterByParagraph = new Map<number, number>();
  for (const ch of plan.chapters) {
    for (const p of ch.paragraphs) chapterByParagraph.set(p.id, ch.number);
  }

  const daysByChapter = new Map<number, DayListItem[]>();
  const sorted = [...plan.days].sort((a, b) => a.dayNumber - b.dayNumber);
  let current = plan.chapters[0]?.number ?? 1;

  for (const d of sorted) {
    const firstPara = d.paragraphIds[0];
    if (firstPara !== undefined && chapterByParagraph.has(firstPara)) {
      current = chapterByParagraph.get(firstPara)!;
    }
    const arr = daysByChapter.get(current) ?? [];
    arr.push(d);
    daysByChapter.set(current, arr);
  }

  return plan.chapters
    .slice()
    .sort((a, b) => a.number - b.number)
    .map((chapter) => ({ chapter, days: daysByChapter.get(chapter.number) ?? [] }));
}

/**
 * Текущий день — первый невыполненный (следующий по плану).
 * Если всё выполнено — последний.
 */
export function currentDayNumber(plan: PlanResponse): number {
  const sorted = [...plan.days].sort((a, b) => a.dayNumber - b.dayNumber);
  const next = sorted.find((d) => d.status !== 'done');
  return next?.dayNumber ?? sorted[sorted.length - 1]?.dayNumber ?? 1;
}

export interface BehindInfo {
  count: number;
  days: DayListItem[];
}

/**
 * Отставание: дни, которые остались невыполненными ПОЗАДИ последнего
 * выполненного (их «перепрыгнули»). Без дат — по фактическим статусам.
 */
export function behindInfo(plan: PlanResponse): BehindInfo {
  const doneNumbers = plan.days.filter((d) => d.status === 'done').map((d) => d.dayNumber);
  if (doneNumbers.length === 0) return { count: 0, days: [] };
  const lastDone = Math.max(...doneNumbers);
  const missed = plan.days
    .filter((d) => d.dayNumber < lastDone && d.status !== 'done')
    .sort((a, b) => a.dayNumber - b.dayNumber);
  return { count: missed.length, days: missed };
}
