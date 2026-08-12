import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { cn } from '../lib/cn';

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * micromark корректно парсит display-математику `$$...$$`, только если открывающий и
 * закрывающий `$$` стоят на отдельных строках. Одностроковый `$$x$$` он считает инлайном,
 * а многострочный блок с закрывающим `$$` в конце строки — вообще не закрывает и «съедает»
 * всё дальше (заголовки, таблицы). Поэтому приводим КАЖДЫЙ `$$...$$` (одно- и многострочный)
 * к канонической форме: `$$` на своих строках, содержимое — одной строкой.
 * Инлайн `$...$` не затрагивается (в нём нет пары `$$`).
 */
function normalizeBlockMath(src: string): string {
  return src.replace(/\$\$([\s\S]*?)\$\$/g, (_m, body: string) => {
    const inner = body.replace(/\s+/g, ' ').trim();
    return `\n\n$$\n${inner}\n$$\n\n`;
  });
}

/**
 * Рендер markdown с LaTeX: инлайн $...$ и блочный $$...$$.
 * Блочные формулы скроллятся горизонтально внутри своей карточки (см. .md-body в index.css),
 * а не ломают вёрстку на узких экранах.
 */
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn('md-body', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {normalizeBlockMath(content)}
      </ReactMarkdown>
    </div>
  );
}
