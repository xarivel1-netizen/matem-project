import { eq } from 'drizzle-orm';
import { db, sqlite } from './client';
import { paragraphs } from './schema';
import { theoryContent } from './theory-content';

/**
 * Заливает подробную теорию в paragraphs.theoryMd по точному совпадению заголовка.
 * Ничего не удаляет: только проставляет theoryMd. Сообщает о ненайденных темах.
 */
function main(): void {
  const rows = db.select({ id: paragraphs.id, title: paragraphs.title }).from(paragraphs).all();
  const idByTitle = new Map(rows.map((r) => [r.title, r.id]));

  let updated = 0;
  const missing: string[] = [];

  for (const entry of theoryContent) {
    const id = idByTitle.get(entry.title);
    if (id === undefined) {
      missing.push(entry.title);
      continue;
    }
    db.update(paragraphs).set({ theoryMd: entry.md }).where(eq(paragraphs.id, id)).run();
    updated++;
  }

  console.log(`\nТеория залита: ${updated} из ${theoryContent.length} тем.`);
  if (missing.length > 0) {
    console.log('\n⚠ Не нашёл параграфы с такими заголовками (проверь точное совпадение):');
    for (const t of missing) console.log(`  — ${t}`);
  }

  sqlite.close();
}

main();
