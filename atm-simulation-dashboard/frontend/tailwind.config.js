/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1220',
        panel: '#121B2E',
        panelLight: '#1A2540',
        phosphor: '#37E8C6',
        phosphorDim: '#1F9C87',
        amber: '#F5A623',
        danger: '#FF5D5D',
        paper: '#E8ECF1',
        slate: '#7C8AA5',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(55, 232, 198, 0.25)',
      },
    },
  },
  plugins: [],
};
