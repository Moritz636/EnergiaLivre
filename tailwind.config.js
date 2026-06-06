/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-pop': {
          '0%': { transform: 'scale(0.94)' },
          '60%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.9' },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow:
              '0 0 0 0 rgba(16, 185, 129, 0.45), 0 0 18px 0 rgba(16, 185, 129, 0.18)',
          },
          '50%': {
            boxShadow:
              '0 0 0 8px rgba(16, 185, 129, 0), 0 0 28px 4px rgba(16, 185, 129, 0.35)',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'drift-x': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(8px)' },
        },
        'energy-pulse': {
          '0%, 100%': { opacity: '0.18', transform: 'scale(1)' },
          '50%': { opacity: '0.32', transform: 'scale(1.04)' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'value-bump': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
        'caret-blink': {
          '0%, 50%, 100%': { opacity: '1' },
          '25%, 75%': { opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 600ms ease-out both',
        'fade-up': 'fade-up 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-down': 'fade-down 400ms ease-out both',
        'scale-pop': 'scale-pop 360ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.6s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'drift-x': 'drift-x 1.2s ease-in-out infinite',
        'energy-pulse': 'energy-pulse 7s ease-in-out infinite',
        'check-pop': 'check-pop 480ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'value-bump': 'value-bump 320ms ease-out',
        'caret-blink': 'caret-blink 1s steps(1) infinite',
      },
      boxShadow: {
        'glow-emerald': '0 0 30px -4px rgba(16, 185, 129, 0.55)',
        'glow-emerald-lg': '0 0 60px -8px rgba(16, 185, 129, 0.65)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
}
