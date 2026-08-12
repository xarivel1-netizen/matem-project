import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

/** Прикладная ошибка с HTTP-статусом и машинным кодом. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (message: string): AppError => new AppError(404, 'NOT_FOUND', message);

/** Единый обработчик ошибок: всегда отдаёт { error: { code, message } }. */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof AppError) {
      reply.code(err.statusCode).send({ error: { code: err.code, message: err.message } });
      return;
    }
    if (err instanceof ZodError) {
      const message = err.issues
        .map((i) => `${i.path.join('.') || '(корень)'}: ${i.message}`)
        .join('; ');
      reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message } });
      return;
    }
    // Ошибки парсинга тела/типов у Fastify
    if (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 500) {
      reply.code(err.statusCode).send({ error: { code: 'BAD_REQUEST', message: err.message } });
      return;
    }
    app.log.error(err);
    reply.code(500).send({ error: { code: 'INTERNAL', message: 'Внутренняя ошибка сервера.' } });
  });

  app.setNotFoundHandler((req, reply) => {
    reply
      .code(404)
      .send({ error: { code: 'NOT_FOUND', message: `Маршрут не найден: ${req.method} ${req.url}` } });
  });
}
