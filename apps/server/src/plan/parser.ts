/**
 * Парсер plan-source.md.
 * Чистый модуль без побочных эффектов: на вход markdown, на выход структура плана.
 * Ничего не выдумывает: чего в плане нет (например, §-номера) — оставляет null
 * и добавляет предупреждение в warnings.
 */

export interface ParsedChapter {
  number: number;
  title: string;
}

export interface ParsedParagraph {
  chapterNumber: number;
  number: number | null; // §-номер: в источнике не задан → null
  title: string;
}

export interface ParsedDay {
  dayNumber: number;
  chapterNumber: number;
  title: string;
  note: string | null;
  isLocked: boolean; // дни 22–30
  isReview: boolean; // строки с маркером ★ (повторение/тренажёр/итог)
  paragraphTitles: string[]; // параграфы, привязанные к этому дню
}

export interface ParseWarning {
  kind: string;
  message: string;
}

export interface ParseResult {
  chapters: ParsedChapter[];
  paragraphs: ParsedParagraph[];
  days: ParsedDay[];
  warnings: ParseWarning[];
}

const LOCKED_FROM = 22;
const LOCKED_TO = 30;

/** Убирает markdown-жир **...** и лишние пробелы. */
function stripBold(s: string): string {
  return s.replace(/\*\*/g, '').trim();
}

/** Разбивает строку markdown-таблицы на ячейки (без крайних пустых). */
function splitRow(line: string): string[] {
  const parts = line.split('|');
  // первая и последняя ячейки пустые из-за обрамляющих '|'
  return parts.slice(1, parts.length - 1).map((c) => c.trim());
}

function isTableRow(line: string): boolean {
  return line.trim().startsWith('|');
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every((c) => /^:?-{3,}:?$/.test(c) || c === '');
}

/**
 * Признак «несколько подтем в одной строке» — эвристика.
 * Если тема содержит внутреннюю точку с новым предложением, знак ↔ или ';',
 * то из неё, возможно, следует не один параграф.
 */
function looksMultiTopic(title: string): boolean {
  return /↔/.test(title) || /;/.test(title) || /\.\s+\S/.test(title);
}

export function parsePlan(md: string): ParseResult {
  const chapters: ParsedChapter[] = [];
  const paragraphs: ParsedParagraph[] = [];
  const days: ParsedDay[] = [];
  const warnings: ParseWarning[] = [];

  const lines = md.split(/\r?\n/);

  // Заявленные в шапке числа — для сверки с фактически распарсенным
  const statedChapters = md.match(/(\d+)\s+глав/)?.[1];
  const statedParagraphs = md.match(/(\d+)\s+параграф/)?.[1];

  let currentChapter: number | null = null;

  const chapterRe = /^\*\*Глава\s+(\d+)\.\s*(.+?)\*\*/;

  for (const rawLine of lines) {
    if (!isTableRow(rawLine)) continue;
    const cells = splitRow(rawLine);
    if (cells.length === 0) continue;
    if (isSeparatorRow(cells)) continue;

    const first = cells[0] ?? '';

    // Заголовок главы: | **Глава N. Название** | | |
    const chapterMatch = first.match(chapterRe);
    if (chapterMatch) {
      const number = Number(chapterMatch[1]);
      const title = chapterMatch[2]!.trim();
      chapters.push({ number, title });
      currentChapter = number;
      continue;
    }

    // Строка дня: первая ячейка — число (возможно в **...**)
    const dayToken = stripBold(first);
    if (!/^\d+$/.test(dayToken)) continue; // не день (шапка таблицы, пустое и т.п.)

    const dayNumber = Number(dayToken);
    const rawTitle = cells[1] ?? '';
    const rawNote = cells[2] ?? '';

    const isReview = rawTitle.includes('★');
    // чистим жир и ведущий маркер ★
    const title = stripBold(rawTitle).replace(/^★\s*/, '').trim();
    const note = stripBold(rawNote) || null;
    const isLocked = dayNumber >= LOCKED_FROM && dayNumber <= LOCKED_TO;

    if (currentChapter === null) {
      warnings.push({
        kind: 'day-without-chapter',
        message: `День ${dayNumber} встретился до заголовка главы — глава не определена.`,
      });
    }

    const paragraphTitles: string[] = [];
    // Дни-повторения (★) не создают новых параграфов
    if (!isReview && currentChapter !== null && title) {
      paragraphs.push({ chapterNumber: currentChapter, number: null, title });
      paragraphTitles.push(title);

      if (looksMultiTopic(title)) {
        warnings.push({
          kind: 'multi-topic-paragraph',
          message: `День ${dayNumber}: тема «${title}» похожа на несколько параграфов, но записана одной строкой — разбивку и §-номера уточнить.`,
        });
      }
    }

    days.push({
      dayNumber,
      chapterNumber: currentChapter ?? -1,
      title,
      note,
      isLocked,
      isReview,
      paragraphTitles,
    });
  }

  // --- Сверка с заявленными в шапке числами ---
  if (statedChapters && Number(statedChapters) !== chapters.length) {
    warnings.push({
      kind: 'chapter-count-mismatch',
      message: `В шапке заявлено глав: ${statedChapters}, распарсено: ${chapters.length}.`,
    });
  }
  if (statedParagraphs && Number(statedParagraphs) !== paragraphs.length) {
    warnings.push({
      kind: 'paragraph-count-mismatch',
      message: `В шапке заявлено параграфов: ${statedParagraphs}, а из тем дней извлечено: ${paragraphs.length}. План не задаёт §-номера и не перечисляет все параграфы отдельно — привязку § к темам нужно уточнить.`,
    });
  }
  if (paragraphs.length > 0 && paragraphs.every((p) => p.number === null)) {
    warnings.push({
      kind: 'no-paragraph-numbers',
      message: `Ни у одного параграфа нет §-номера: в plan-source.md номера параграфов не проставлены (в БД поле number = NULL).`,
    });
  }

  return { chapters, paragraphs, days, warnings };
}
