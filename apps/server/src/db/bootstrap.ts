import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './client';
import { chapters } from './schema';
import { seedData } from './seed';

/**
 * Готовит БД к работе сервера при старте:
 *  1) всегда применяет миграции схемы (идемпотентно);
 *  2) наполняет данными ТОЛЬКО если БД пустая.
 *
 * Так на эфемерном диске (free-план Render) при первом старте БД соберётся
 * из plan-source.md, а если позже подключить постоянный диск — прогресс
 * пользователя переживёт рестарты (повторного сида не будет).
 */
export function bootstrapDb(): void {
  migrate(db, { migrationsFolder: './drizzle' });

  const row = db.select({ count: sql<number>`count(*)` }).from(chapters).get();
  const count = row?.count ?? 0;

  if (count === 0) {
    console.log('БД пустая — наполняю из plan-source.md…');
    seedData();
  } else {
    console.log(`БД уже наполнена (глав: ${count}) — сид пропущен.`);
  }
}
