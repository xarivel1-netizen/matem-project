import { ProgressRing } from './ui';

interface RingSpec {
  frac: number;
  color: string;
}

interface ActivityRingsProps {
  days: RingSpec;
  tasks: RingSpec;
  streak: RingSpec;
  size?: number;
}

/** Фирменный элемент: три концентрических кольца (Apple Fitness). */
export function ActivityRings({ days, tasks, streak, size = 152 }: ActivityRingsProps) {
  const stroke = 13;
  const gap = 5;
  const mid = size - (stroke + gap) * 2;
  const inner = mid - (stroke + gap) * 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <ProgressRing progress={days.frac} size={size} stroke={stroke} color={days.color} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <ProgressRing progress={tasks.frac} size={mid} stroke={stroke} color={tasks.color} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <ProgressRing progress={streak.frac} size={inner} stroke={stroke} color={streak.color} />
      </div>
    </div>
  );
}
