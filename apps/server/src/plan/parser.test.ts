import { describe, expect, it } from 'vitest';
import { parsePlan } from './parser';

// Реальный кусок plan-source.md: две главы, обычные дни и день-повторение (★).
const REAL_SNIPPET = `
**Объём:** 42 параграфа, 5 глав. Темп: ~1,5 § в день.

| День | Тема | Что делаешь |
|------|------|-------------|
| **Глава 1. Функции** | | |
| 1 | Функции: определение, область определения и значений | База под весь курс. |
| 2 | Наибольшее/наименьшее значение. Чётность и нечётность | Учишься читать поведение функции. |
| **Глава 2. Степенная функция** | | |
| 5 | Степенная функция с натуральным и целым показателем | Свойства, графики. |
| **10** | **★ ПОВТОРЕНИЕ + самопроверка (главы 1–2)** | Всё, где < 80% — переделай. |
`;

// Кусок из главы 5 — проверяем is_locked (дни 22–30) и день-итог (★).
const CHAPTER5_SNIPPET = `
| День | Тема | Что делаешь |
|------|------|-------------|
| **Глава 5. Производная и исследование функции** — *главный блок* | | |
| 22 | Предел функции, непрерывность | Обзорно. |
| 24 | Таблица производных. Правила дифференцирования (сумма, произведение, частное) | Заучить. |
| **30** | **★ ПОЛНОЕ ИССЛЕДОВАНИЕ ФУНКЦИИ и построение графика** | Итог. |
`;

describe('parsePlan — базовый кусок', () => {
  const r = parsePlan(REAL_SNIPPET);

  it('извлекает две главы с номерами и названиями', () => {
    expect(r.chapters).toEqual([
      { number: 1, title: 'Функции' },
      { number: 2, title: 'Степенная функция' },
    ]);
  });

  it('извлекает дни с привязкой к текущей главе', () => {
    const day1 = r.days.find((d) => d.dayNumber === 1);
    expect(day1).toMatchObject({
      dayNumber: 1,
      chapterNumber: 1,
      title: 'Функции: определение, область определения и значений',
      note: 'База под весь курс.',
      isLocked: false,
      isReview: false,
    });
    const day5 = r.days.find((d) => d.dayNumber === 5);
    expect(day5?.chapterNumber).toBe(2);
  });

  it('день-повторение (★) помечается isReview и не создаёт параграф', () => {
    const day10 = r.days.find((d) => d.dayNumber === 10);
    expect(day10?.isReview).toBe(true);
    expect(day10?.title).toBe('ПОВТОРЕНИЕ + самопроверка (главы 1–2)');
    expect(day10?.paragraphTitles).toHaveLength(0);
  });

  it('§-номера параграфов всегда null (в источнике их нет)', () => {
    expect(r.paragraphs.length).toBeGreaterThan(0);
    expect(r.paragraphs.every((p) => p.number === null)).toBe(true);
  });

  it('день 2 с несколькими подтемами даёт предупреждение multi-topic', () => {
    expect(r.warnings.some((w) => w.kind === 'multi-topic-paragraph')).toBe(true);
  });

  it('предупреждает о расхождении числа параграфов с заявленными 42', () => {
    expect(r.warnings.some((w) => w.kind === 'paragraph-count-mismatch')).toBe(true);
  });
});

describe('parsePlan — глава 5', () => {
  const r = parsePlan(CHAPTER5_SNIPPET);

  it('заголовок главы с хвостом «— *главный блок*» парсится корректно', () => {
    expect(r.chapters).toEqual([
      { number: 5, title: 'Производная и исследование функции' },
    ]);
  });

  it('дни 22 и 30 заблокированы (isLocked)', () => {
    expect(r.days.find((d) => d.dayNumber === 22)?.isLocked).toBe(true);
    expect(r.days.find((d) => d.dayNumber === 30)?.isLocked).toBe(true);
  });

  it('день 30 — итоговый (★), без нового параграфа', () => {
    const day30 = r.days.find((d) => d.dayNumber === 30);
    expect(day30?.isReview).toBe(true);
    expect(day30?.paragraphTitles).toHaveLength(0);
  });
});
