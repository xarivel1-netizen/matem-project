import { buildApp } from './app';
import { bootstrapDb } from './db/bootstrap';

// При старте: миграции + сид, если БД пустая (безопасно и в дев, и в проде).
bootstrapDb();

const app = buildApp();
const PORT = Number(process.env.PORT ?? 3001);

app
  .listen({ port: PORT, host: '0.0.0.0' })
  .then(() => app.log.info(`Сервер поднят на :${PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
