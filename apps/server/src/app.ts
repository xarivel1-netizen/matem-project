import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
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

/** Папка собранного фронта. В проде (Render) сервер сам её отдаёт. */
function resolveWebDist(): string | null {
  const here = dirname(fileURLToPath(import.meta.url)); // apps/server/src
  const dist = process.env.MATEM_WEB_DIST ?? resolve(here, '../../web/dist');
  return existsSync(resolve(dist, 'index.html')) ? dist : null;
}

/**
 * Собирает Fastify-приложение: CORS (для дева), pino-логи, единый обработчик
 * ошибок и доменные плагины маршрутов под префиксом /api. Если рядом лежит
 * собранный фронт (apps/web/dist) — сервер отдаёт и его (single-origin в проде),
 * а неизвестные не-API GET уходят в index.html (SPA-маршрутизация).
 */
export function buildApp(opts: BuildOptions = {}): FastifyInstance {
  const app = Fastify({ logger: opts.logger ?? true });

  app.register(cors, { origin: true });

  const webDist = resolveWebDist();

  registerErrorHandler(app, { spa: webDist !== null });

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

  if (webDist) {
    app.register(fastifyStatic, { root: webDist });
    app.log.info(`Фронт отдаётся из ${webDist}`);
  }

  return app;
}
