/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,js}'],
  // Dark mode follows the data-theme attribute set by the theme toggle.
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      // Colours are driven by CSS variables so the 3-way theme toggle keeps working.
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        border: 'var(--border)',
        hover: 'var(--hover)',
        chip: 'var(--chip)',
        dot: 'var(--dot)',
        'inv-bg': 'var(--inv-bg)',
        'inv-text': 'var(--inv-text)',
        accent: '#22c55e',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
