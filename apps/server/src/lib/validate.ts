import { z, type ZodType } from 'zod';

const idParamsSchema = z.object({ id: z.coerce.number().int().positive() });

/** Достаёт положительный целочисленный :id из params (кидает ZodError при провале). */
export function parseIdParam(params: unknown): number {
  return idParamsSchema.parse(params).id;
}

/** Валидирует вход по схеме. */
export function parseInput<T>(schema: ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Валидирует ВЫХОД по схеме перед отправкой.
 * Несоответствие — это баг сервера, поэтому ZodError здесь превратится в 500
 * (см. обработчик — но чтобы отличать, помечаем как ошибку сериализации).
 */
export function serialize<T>(schema: ZodType<T>, data: unknown): T {
  return schema.parse(data);
}
