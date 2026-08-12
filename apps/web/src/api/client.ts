import {
  attemptResultSchema,
  dayDetailSchema,
  dayStatusSchema,
  paragraphDetailSchema,
  paragraphSchema,
  planResponseSchema,
  statsSchema,
  taskPublicSchema,
  type AttemptResult,
  type CreateTaskInput,
  type DayDetail,
  type DayStatus,
  type Paragraph,
  type ParagraphDetail,
  type PlanResponse,
  type Stats,
  type TaskPublic,
} from '@matem/shared';
import { z, type ZodType } from 'zod';

/** Ошибка API в едином формате { error: { code, message } }. */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiErrorSchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) });

// Все ответы парсятся zod-схемами из shared — источник правды по форме данных.
async function request<T>(path: string, schema: ZodType<T>, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError('NETWORK', 'Нет связи с сервером. Проверь, запущен ли он.');
  }

  const json: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const parsed = apiErrorSchema.safeParse(json);
    throw new ApiError(
      parsed.success ? parsed.data.error.code : `HTTP_${res.status}`,
      parsed.success ? parsed.data.error.message : res.statusText,
    );
  }

  return schema.parse(json);
}

const progressResultSchema = z.object({
  dayId: z.number().int().positive(),
  status: dayStatusSchema,
  completedAt: z.string().nullable(),
});
export type ProgressResult = z.infer<typeof progressResultSchema>;

export const api = {
  getPlan: (): Promise<PlanResponse> => request('/plan', planResponseSchema),
  getStats: (): Promise<Stats> => request('/stats', statsSchema),
  getDay: (id: number): Promise<DayDetail> => request(`/days/${id}`, dayDetailSchema),
  setDayProgress: (id: number, status: DayStatus): Promise<ProgressResult> =>
    request(`/days/${id}/progress`, progressResultSchema, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getParagraphs: (): Promise<Paragraph[]> => request('/paragraphs', paragraphListSchema),
  getParagraph: (id: number): Promise<ParagraphDetail> =>
    request(`/paragraphs/${id}`, paragraphDetailSchema),
  updateTheory: (id: number, theoryMd: string): Promise<ParagraphDetail> =>
    request(`/paragraphs/${id}/theory`, paragraphDetailSchema, {
      method: 'PATCH',
      body: JSON.stringify({ theoryMd }),
    }),

  listTasks: (params: {
    paragraphId?: number;
    chapterId?: number;
    scope?: 'completed' | 'all';
  }): Promise<TaskPublic[]> => {
    const qs = new URLSearchParams();
    if (params.paragraphId) qs.set('paragraphId', String(params.paragraphId));
    if (params.chapterId) qs.set('chapterId', String(params.chapterId));
    if (params.scope) qs.set('scope', params.scope);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request(`/tasks${suffix}`, taskListSchema);
  },
  submitAttempt: (taskId: number, answerGiven: string): Promise<AttemptResult> =>
    request(`/tasks/${taskId}/attempt`, attemptResultSchema, {
      method: 'POST',
      body: JSON.stringify({ answerGiven }),
    }),
  createTask: (input: CreateTaskInput): Promise<TaskPublic> =>
    request('/tasks', taskPublicSchema, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

const paragraphListSchema = z.array(paragraphSchema);
const taskListSchema = z.array(taskPublicSchema);
