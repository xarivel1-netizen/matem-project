import type { Difficulty, TaskPublic } from '@matem/shared';

interface TaskRow {
  id: number;
  paragraphId: number;
  kind: 'input' | 'choice';
  statementMd: string;
  optionsJson: string | null;
  difficulty: number;
}

/** Задача → публичный вид (без answer и solutionMd). */
export function toPublicTask(row: TaskRow): TaskPublic {
  return {
    id: row.id,
    paragraphId: row.paragraphId,
    kind: row.kind,
    statementMd: row.statementMd,
    options: row.optionsJson ? (JSON.parse(row.optionsJson) as string[]) : null,
    difficulty: row.difficulty as Difficulty,
  };
}
