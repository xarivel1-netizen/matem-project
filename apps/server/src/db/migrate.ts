import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db, sqlite } from './client';

// Применяет сгенерированные drizzle-kit миграции из ./drizzle
migrate(db, { migrationsFolder: './drizzle' });
sqlite.close();
console.log('Миграции применены.');
