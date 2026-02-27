/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'accent-blue': 'var(--color-accent-blue)',
        'accent-green': 'var(--color-accent-green)',
        'accent-yellow': 'var(--color-accent-yellow)',
        'accent-red': 'var(--color-accent-red)',
        'accent-purple': 'var(--color-accent-purple)',
        'accent-orange': 'var(--color-accent-orange)',
        'status-pending': 'var(--color-status-pending)',
        'status-active': 'var(--color-status-active)',
        'status-completed': 'var(--color-status-completed)',
        'status-failed': 'var(--color-status-failed)',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
      },
    },
  },
  plugins: [],
}
