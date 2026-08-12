import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import { registerErrorHandler } from './lib/errors';
import dayRoutes from './routes/days';
import paragraphRoutes from './routes/paragraphs';
import planRoutes from './routes/plan';
import statsRoutes from './routes/stats';
import taskRoutes from './routes/tasks';

export interface BuildOptions {
  logger?: boolean;
}

/**
 * Собирает Fastify-приложение: CORS (для дева), pino-логи, единый обработчик
 * ошибок и доменные плагины маршрутов под префиксом /api.
 */
export function buildApp(opts: BuildOptions = {}): FastifyInstance {
  const app = Fastify({ logger: opts.logger ?? true });

  app.register(cors, { origin: true });

  registerErrorHandler(app);

  app.get('/health', () => ({ ok: true }));

  // Домены — каждый отдельным плагином
  app.register(
    async (api) => {
      planRoutes(api);
      dayRoutes(api);
      paragraphRoutes(api);
      taskRoutes(api);
      statsRoutes(api);
    },
    { prefix: '/api' },
  );

  return app;
}
