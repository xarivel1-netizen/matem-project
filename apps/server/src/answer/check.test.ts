import { describe, expect, it } from 'vitest';
import { answersEqual, normalizeAnswer } from './check';

describe('normalizeAnswer', () => {
  it('обрезает пробелы по краям и внутри', () => {
    expect(normalizeAnswer('  2 ')).toBe('2');
    expect(normalizeAnswer('1 / 2')).toBe('1/2');
  });

  it('запятую между цифрами приводит к точке', () => {
    expect(normalizeAnswer('0,5')).toBe('0.5');
    expect(normalizeAnswer('3,14')).toBe('3.14');
  });
});

describe('answersEqual', () => {
  it('«0,5» и «0.5» эквивалентны', () => {
    expect(answersEqual('0,5', '0.5')).toBe(true);
  });

  it('численно равные с разным видом равны (2 == 2.0)', () => {
    expect(answersEqual('2', '2.0')).toBe(true);
    expect(answersEqual(' -3 ', '-3')).toBe(true);
  });

  it('дроби сравниваются как нормализованные строки', () => {
    expect(answersEqual('1/2', '1 / 2')).toBe(true);
    expect(answersEqual('1/2', '0.5')).toBe(false); // численно не разворачиваем (пока)
  });

  it('корни сравниваются как строки', () => {
    expect(answersEqual('√2', ' √2 ')).toBe(true);
    expect(answersEqual('2√3', '3√2')).toBe(false);
  });

  it('разные числа не равны', () => {
    expect(answersEqual('2', '3')).toBe(false);
  });
});
