import { describe, expect, it } from 'vitest';
import { computeStreaks } from './streak';

describe('computeStreaks', () => {
  it('пустой список → нули', () => {
    expect(computeStreaks([], '2026-08-12')).toEqual({ current: 0, best: 0 });
  });

  it('серия, заканчивающаяся сегодня', () => {
    const dates = ['2026-08-10', '2026-08-11', '2026-08-12'];
    expect(computeStreaks(dates, '2026-08-12')).toEqual({ current: 3, best: 3 });
  });

  it('серия, заканчивающаяся вчера, ещё считается текущей', () => {
    const dates = ['2026-08-10', '2026-08-11'];
    expect(computeStreaks(dates, '2026-08-12').current).toBe(2);
  });

  it('разрыв больше одного дня обрывает текущую серию', () => {
    const dates = ['2026-08-05', '2026-08-06', '2026-08-07'];
    // от 12-го до 7-го разрыв 5 дней → текущая 0, лучшая 3
    expect(computeStreaks(dates, '2026-08-12')).toEqual({ current: 0, best: 3 });
  });

  it('лучшая серия берётся из середины истории', () => {
    const dates = [
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
      '2026-07-04', // серия 4
      '2026-07-10', // разрыв
      '2026-08-12', // сегодня, серия 1
    ];
    expect(computeStreaks(dates, '2026-08-12')).toEqual({ current: 1, best: 4 });
  });

  it('дубликаты дат не ломают счёт', () => {
    const dates = ['2026-08-11', '2026-08-11', '2026-08-12'];
    expect(computeStreaks(dates, '2026-08-12')).toEqual({ current: 2, best: 2 });
  });
});
