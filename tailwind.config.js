/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#bad4ff',
          300: '#8ab4ff',
          400: '#528dff',
          500: '#165dff', // Primary Brand Blue
          600: '#0e46d7',
          700: '#0a35ab',
          800: '#0d2d88',
          900: '#10276d',
          950: '#0a1643',
        },
        cyan: {
          50: '#effbfa',
          100: '#d7f6f5',
          400: '#26d0ce',
          500: '#00a7c4', // Electric Cyan
          600: '#0285a0',
        },
        surface: {
          50: '#ffffff',
          100: '#f8fafc',
          200: '#f1f5f9',
          300: '#e2e8f0',
        },
        ink: {
          900: '#0f172a', // Slate 900
          800: '#1e293b',
          700: '#334155',
          500: '#64748b',
          400: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'card': '0 0 0 1px rgba(226, 232, 240, 0.8), 0 2px 8px -2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 0 0 1px rgba(22, 93, 255, 0.25), 0 8px 24px -4px rgba(22, 93, 255, 0.08)',
      }
    },
  },
  plugins: [],
}
