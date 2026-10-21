/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#07090E',
          surface: '#11151F',
          card: '#161B26',
          border: '#1E2433',
          muted: '#94A3B8',
        },
        brand: {
          neon: '#00FF66',
          emerald: '#10B981',
          accent: '#059669',
          glow: 'rgba(0, 255, 102, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '10px',
      },
    },
  },
  plugins: [],
};
