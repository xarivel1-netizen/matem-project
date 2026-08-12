/**
 * Расчёт серий (streak) по датам выполненных дней.
 * Разрыв больше одного календарного дня обрывает серию.
 * Чистый модуль без обращения к БД — легко тестировать.
 */

/** YYYY-MM-DD → номер календарного дня (UTC), чтобы считать разрывы. */
function toDayNumber(isoDate: string): number {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
  return Math.floor(Date.UTC(y!, (m ?? 1) - 1, d ?? 1) / 86_400_000);
}

export interface Streaks {
  current: number;
  best: number;
}

/**
 * @param doneDates даты выполнения (любой ISO, берётся первые 10 символов). Дубликаты допустимы.
 * @param today «сегодня» как YYYY-MM-DD — от него отсчитывается текущая серия.
 */
export function computeStreaks(doneDates: string[], today: string): Streaks {
  if (doneDates.length === 0) return { current: 0, best: 0 };

  // уникальные дни, по возрастанию
  const uniq = Array.from(new Set(doneDates.map(toDayNumber))).sort((a, b) => a - b);

  // лучшая серия — самая длинная цепочка подряд идущих дней
  let best = 1;
  let run = 1;
  for (let i = 1; i < uniq.length; i++) {
    run = uniq[i]! - uniq[i - 1]! === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }

  // текущая серия — цепочка, заканчивающаяся сегодня или вчера
  const todayNum = toDayNumber(today);
  const last = uniq[uniq.length - 1]!;
  let current = 0;
  if (todayNum - last <= 1) {
    current = 1;
    for (let i = uniq.length - 1; i > 0; i--) {
      if (uniq[i]! - uniq[i - 1]! === 1) current++;
      else break;
    }
  }

  return { current, best };
}
