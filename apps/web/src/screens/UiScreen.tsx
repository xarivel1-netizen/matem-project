import { useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Icon,
  IconButton,
  ListGroup,
  ListRow,
  Pill,
  ProgressRing,
  Screen,
  SegmentedControl,
  Sheet,
} from '../components/ui';
import { ThemeToggle } from '../theme/ThemeToggle';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-1 pb-2 text-footnote uppercase tracking-wide text-label-secondary">{title}</div>
      {children}
    </div>
  );
}

export function UiScreen() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [seg, setSeg] = useState<'all' | 'done' | 'left'>('all');
  const [ring, setRing] = useState(0.35);

  return (
    <Screen title="UI Kit" right={<IconButton label="Настройки" variant="tinted"><Icon.Gear /></IconButton>}>
      <Section title="Кнопки">
        <div className="flex flex-wrap gap-2">
          <Button variant="filled">Отметить день</Button>
          <Button variant="tinted">Позже</Button>
          <Button variant="plain">Пропустить</Button>
          <Button variant="filled" disabled>
            Недоступно
          </Button>
        </div>
        <div className="mt-2 flex gap-2">
          <IconButton label="Добавить" variant="tinted">
            <Icon.Plus />
          </IconButton>
          <IconButton label="Закрыть">
            <Icon.XMark />
          </IconButton>
        </div>
      </Section>

      <Section title="Пилюли-статусы">
        <div className="flex flex-wrap gap-2">
          <Pill tone="neutral">В плане</Pill>
          <Pill tone="accent">Сегодня</Pill>
          <Pill tone="success">Готово</Pill>
          <Pill tone="warning">Отставание</Pill>
          <Pill tone="error">Ошибка</Pill>
        </div>
      </Section>

      <Section title="SegmentedControl">
        <SegmentedControl
          segments={[
            { value: 'all', label: 'Все' },
            { value: 'done', label: 'Готово' },
            { value: 'left', label: 'Осталось' },
          ]}
          value={seg}
          onChange={setSeg}
        />
      </Section>

      <Section title="Карточки">
        <div className="space-y-3">
          <Card>
            <div className="text-headline text-label">Статичная карточка</div>
            <div className="text-subhead text-label-secondary">Без нажатия</div>
          </Card>
          <Card onClick={() => setSheetOpen(true)}>
            <div className="text-headline text-label">Интерактивная карточка</div>
            <div className="text-subhead text-label-secondary">Нажми — откроется шторка</div>
          </Card>
        </div>
      </Section>

      <Section title="Список (ListGroup / ListRow)">
        <ListGroup footer="Строка с иконкой, подзаголовком, значением и шевроном.">
          <ListRow icon={<Icon.BookOpen />} title="Теория" subtitle="5 глав" showChevron onClick={() => {}} />
          <ListRow
            icon={<Icon.PencilSquare />}
            iconBg="bg-success"
            title="Задачи"
            trailing={<span className="tabular">14</span>}
            showChevron
            onClick={() => {}}
          />
          <ListRow
            title="Отметить день"
            trailing={<Checkbox checked={checked} onChange={setChecked} label="Отметить день выполненным" />}
          />
        </ListGroup>
      </Section>

      <Section title="ProgressRing">
        <div className="flex items-center gap-5">
          <ProgressRing progress={ring} size={96}>
            <span className="tabular text-headline text-label">{Math.round(ring * 100)}%</span>
          </ProgressRing>
          <div className="flex flex-col gap-2">
            <Button variant="tinted" onClick={() => setRing((r) => Math.min(1, r + 0.15))}>
              +15%
            </Button>
            <Button variant="plain" onClick={() => setRing(0)}>
              Сброс
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Тема">
        <ThemeToggle />
      </Section>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Шторка">
        <p className="text-body text-label">Тяни вниз, чтобы закрыть. Или тапни по фону.</p>
        <div className="mt-4">
          <Button variant="filled" fullWidth onClick={() => setSheetOpen(false)}>
            Понятно
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}
