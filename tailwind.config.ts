import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        vitrina: {
          blue: '#3F44CD',
          navy: '#18193F',
          slate: '#6D727A',
          cream: '#E5DEC9',
          ice: '#DCE7FD',
          surface: '#0F102B',
          card: '#141638',
          border: 'rgba(229, 222, 201, 0.12)',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at 50% 0%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        glow: '0 0 50px -10px rgba(63, 68, 205, 0.35)',
        'glow-lg': '0 0 100px -20px rgba(63, 68, 205, 0.45)',
      },
    },
  },
  plugins: [],
};

export default config;
