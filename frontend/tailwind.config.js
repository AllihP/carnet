/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:    '#0A1F3C',
        teal:    { DEFAULT: '#0E7A5F', light: '#1DAA84', pale: '#E6F7F1' },
        gold:    { DEFAULT: '#C9A84C', light: '#E4C46A', pale: '#FEF3E2' },
        danger:  { DEFAULT: '#C0392B', pale: '#FEF2F2' },
        bg:      '#F2F5FA',
        border:  '#DDE3ED',
        text:    '#1A2535',
        muted:   '#6B7A90',
        card:    '#FFFFFF',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(10,31,60,.06), 0 4px 16px rgba(10,31,60,.04)',
        modal: '0 20px 60px rgba(10,31,60,.2)',
      },
      borderRadius: {
        xl2: '1.125rem',
      },
    },
  },
  plugins: [],
}
