import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kitchen: {
          primary: '#e4317a',
          ink: '#2b2f38',
          muted: '#6b7280',
          surface: '#ffffff',
          canvas: '#f6f4f1',
          line: '#e7e2dc',
          success: '#1f8a5b',
          danger: '#c0392b',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
