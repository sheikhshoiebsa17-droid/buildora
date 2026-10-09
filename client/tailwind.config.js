/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#10172A',
          900: '#0B1120',
          800: '#10172A',
          700: '#1B2440',
        },
        brand: {
          50: '#F1EFFE',
          100: '#E4E0FD',
          500: '#6545F5',
          600: '#5A38E0',
          700: '#4C2EC4',
        },
        violet2: '#8B5CF6',
        accent: {
          blue: '#4385F5',
          cyan: '#19B7D5',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        page: '#F7F9FC',
        line: '#E5EAF2',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
        '3xl': '22px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,23,42,0.04), 0 1px 3px rgba(16,23,42,0.06)',
        lift: '0 10px 30px -12px rgba(16,23,42,0.18)',
        glow: '0 0 0 1px rgba(101,69,245,0.2), 0 8px 30px -6px rgba(101,69,245,0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.5s ease-out both',
        'float-slow': 'float-slow 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
