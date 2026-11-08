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
          50: '#f4f7fc',
          100: '#e8edf7',
          200: '#d2dcf0',
          300: '#acc1e4',
          400: '#7ea1d5',
          500: '#4f7fc3',
          600: '#2456b8', // Original soothing Vneconomics deep blue
          700: '#1e4494',
          800: '#1c3a7a',
          900: '#1b3263',
          950: '#101d3b',
        },
        support: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#126a61', // Original Vneconomics teal support
          700: '#0f564f',
        },
        surface: {
          50: '#ffffff',
          100: '#f8fafc',
          200: '#f1f5f9',
          300: '#e2e8f0',
        },
        ink: {
          900: '#16243a', // Original soft deep navy ink
          800: '#22334f',
          700: '#374967',
          600: '#485a76',
          500: '#62738d',
          400: '#8ca0bb',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 0 0 1px rgba(226, 232, 240, 0.8), 0 2px 8px -2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 0 0 1px rgba(36, 86, 184, 0.25), 0 10px 25px -5px rgba(36, 86, 184, 0.08)',
      }
    },
  },
  plugins: [],
}
