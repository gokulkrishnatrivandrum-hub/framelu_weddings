import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbf7',
          100: '#fbf7ee',
          200: '#f5ebcc',
          300: '#eedda3',
          400: '#e1bf55',
          500: '#d4a323',
          600: '#bf8a1b',
          700: '#9f6b17',
          800: '#815418',
          900: '#6b4518',
        },
        rosewood: {
          50: '#fdf3f4',
          100: '#fce7e8',
          500: '#be123c',
          600: '#9f1239',
          700: '#881337',
          900: '#4c0519',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
