/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Map CSS variable tokens to Tailwind classes
        // e.g. bg-accent, text-text, border-border, etc.
        accent: {
          DEFAULT: 'var(--accent)',
          2:       'var(--accent-2)',
          dim:     'var(--accent-dim)',
          glow:    'var(--accent-glow)',
        },
        bg: {
          DEFAULT: 'var(--bg)',
          card:    'var(--bg-card)',
          'card-2':'var(--bg-card-2)',
          hover:   'var(--bg-hover)',
        },
        border: {
          DEFAULT: 'var(--border)',
          light:   'var(--border-light)',
        },
        text: {
          DEFAULT: 'var(--text)',
          2:       'var(--text-2)',
          3:       'var(--text-3)',
          inv:     'var(--text-inv)',
        },
        success: {
          DEFAULT: 'var(--success)',
          dim:     'var(--success-dim)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          dim:     'var(--warning-dim)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          dim:     'var(--danger-dim)',
        },
        info: {
          DEFAULT: 'var(--info)',
          dim:     'var(--info-dim)',
        },
      },
      borderRadius: {
        xl:  'var(--radius)',
        lg:  'var(--radius-sm)',
        md:  'var(--radius-xs)',
      },
      boxShadow: {
        card: 'var(--shadow)',
        'card-md': 'var(--shadow-md)',
      },
    },
  },
  plugins: [],
}