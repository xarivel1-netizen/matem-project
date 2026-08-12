/** @type {import('tailwindcss').Config} */
// Токены дизайн-системы из DESIGN.md. Цвета вынесены в CSS-переменные
// (см. src/index.css) — так одна и та же утилита работает в светлой и тёмной теме.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        screen: 'var(--c-bg-screen)',
        card: 'var(--c-card)',
        elevated: 'var(--c-elevated)',
        separator: 'var(--c-separator)',
        navbar: 'var(--c-navbar)',
        label: {
          DEFAULT: 'var(--c-label)',
          secondary: 'var(--c-label-2)',
          tertiary: 'var(--c-label-3)',
        },
        accent: {
          DEFAULT: 'var(--c-accent)',
          soft: 'var(--c-accent-soft)',
        },
        success: 'var(--c-success)',
        error: 'var(--c-error)',
        warning: 'var(--c-warning)',
      },
      borderRadius: {
        sm: '10px',
        card: '14px',
        sheet: '20px',
        pill: '999px',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Inter Variable"',
          'Inter',
          'sans-serif',
        ],
      },
      fontSize: {
        // [размер, { lineHeight, letterSpacing, fontWeight }] — шкала DESIGN.md
        'large-title': ['34px', { lineHeight: '41px', letterSpacing: '-0.4px', fontWeight: '700' }],
        title2: ['22px', { lineHeight: '28px', letterSpacing: '-0.3px', fontWeight: '700' }],
        headline: ['17px', { lineHeight: '22px', letterSpacing: '-0.2px', fontWeight: '600' }],
        body: ['17px', { lineHeight: '22px', letterSpacing: '-0.2px', fontWeight: '400' }],
        subhead: ['15px', { lineHeight: '20px', letterSpacing: '-0.1px', fontWeight: '400' }],
        footnote: ['13px', { lineHeight: '18px', letterSpacing: '0px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', letterSpacing: '0.1px', fontWeight: '500' }],
      },
      boxShadow: {
        'ios-sm': '0 1px 2px rgba(0,0,0,0.04)',
        'ios-card': '0 1px 3px rgba(0,0,0,0.06)',
        'ios-lift': '0 8px 24px rgba(0,0,0,0.14)',
        sheet: '0 -8px 40px rgba(0,0,0,0.20)',
      },
      transitionTimingFunction: {
        // редко — почти всё на пружинах Framer Motion, но fallback для hover теней
        ios: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
};
