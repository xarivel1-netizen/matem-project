import type { SVGProps } from 'react';

// Набор SVG-иконок (stroke 1.5, 24×24, currentColor). Никаких эмодзи.
type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ChevronRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 6l6 6-6 6" />
  </Base>
);

export const ChevronLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Base>
);

export const Search = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4-4" />
  </Base>
);

export const Plus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const Check = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 13l4 4L19 7" />
  </Base>
);

export const XMark = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
);

export const ListBullet = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 6h12M8 12h12M8 18h12" />
    <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
  </Base>
);

export const BookOpen = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 6.5C10.5 5.5 8 5 4 5v13c4 0 6.5.5 8 1.5 1.5-1 4-1.5 8-1.5V5c-4 0-6.5.5-8 1.5z" />
    <path d="M12 6.5v13" />
  </Base>
);

export const PencilSquare = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 19h14M7 15l8.5-8.5a1.8 1.8 0 012.5 2.5L9.5 17.5 6 18l.5-3z" />
  </Base>
);

export const ChartBar = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 20V10M12 20V4M19 20v-6" />
  </Base>
);

export const Sun = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
  </Base>
);

export const Moon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 14.5A8 8 0 019.5 4a7 7 0 100 16 8 8 0 0010.5-5.5z" />
  </Base>
);

export const Gear = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M19.8 7.5l-1.9 1.1M6.1 15.4l-1.9 1.1" />
  </Base>
);

export const Flame = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3c1 3-1 4-1 6a3 3 0 006 .5c0-1-.3-2-1-3 2 1 3.5 3.3 3.5 6a6.5 6.5 0 11-13 0c0-3.2 2-5.3 3.5-7 .8 1 1.2 2.3 2 2.5.6-1.6-.5-3.5-2.5-5z" />
  </Base>
);
