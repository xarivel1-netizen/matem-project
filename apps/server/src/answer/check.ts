/**
 * Проверка ответов.
 * Отдельный модуль, чтобы логику сравнения можно было развивать независимо
 * (сейчас — нормализованные строки + численное сравнение чисел; позже сюда
 * можно подключить полноценный численный/символьный движок для дробей и корней).
 */

/**
 * Нормализует ответ перед сравнением:
 *  - обрезает крайние и внутренние пробелы;
 *  - десятичную запятую между цифрами приводит к точке («0,5» → «0.5»);
 *  - убирает ведущий «+» у чисел и незначащий ведущий ноль целой части.
 */
export function normalizeAnswer(raw: string): string {
  let s = raw.trim();
  // убрать все пробельные символы внутри («1 / 2» == «1/2», «2 x» == «2x»)
  s = s.replace(/\s+/g, '');
  // запятая как десятичный разделитель между цифрами → точка
  s = s.replace(/(\d),(\d)/g, '$1.$2');
  return s;
}

const NUMERIC_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;

/** Пытается разобрать нормализованную строку как конечное число, иначе null. */
function tryNumeric(normalized: string): number | null {
  if (!NUMERIC_RE.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

const EPSILON = 1e-9;

/**
 * Эквивалентны ли ответы.
 * Если оба нормализованных значения — числа, сравнивает численно с допуском.
 * Иначе сравнивает нормализованные строки (дроби, корни, выражения).
 */
export function answersEqual(given: string, correct: string): boolean {
  const g = normalizeAnswer(given);
  const c = normalizeAnswer(correct);

  const gn = tryNumeric(g);
  const cn = tryNumeric(c);
  if (gn !== null && cn !== null) {
    return Math.abs(gn - cn) < EPSILON;
  }
  return g === c;
}
