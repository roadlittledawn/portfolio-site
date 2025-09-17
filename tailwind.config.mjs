/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Dark theme inspired by Shopify
        'dark': {
          'base': '#0D1213',     // Main background (rgb(13,18,19))
          'layer': '#151D1E',    // Secondary bg for header/sidebar (rgb(21,29,30))
          'card': '#24393D',     // Card backgrounds (rgb(36,57,61))
          'hover': '#2E4A4F',    // Card hover state
          'border': '#3A5559',   // Border color
          'border-subtle': '#2A3C3F', // Subtle borders
        },
        // Text colors for dark theme
        'text': {
          'primary': '#E6E8E9',   // Main text (high contrast)
          'secondary': '#A8B1B3', // Secondary text
          'muted': '#7A8587',     // Muted/disabled text
          'inverse': '#0D1213',   // For light backgrounds
        },
        // Accent colors (pops of color)
        'accent': {
          'blue': '#5CB3FF',      // Primary accent (bright blue)
          'green': '#5AE39A',     // Success/positive
          'amber': '#FFC266',     // Warning/highlight
          'purple': '#B794F6',    // Alternative accent
          'pink': '#FF7AA3',      // Alternative accent
        },
        // Keep some legacy colors for gradual migration
        'primary': '#5CB3FF',
        'primary-dark': '#4299E1',
        'secondary': '#A8B1B3',
        'muted': '#7A8587',
        'border': '#3A5559',
        'bg-light': '#24393D',
        'bg-lighter': '#2E4A4F',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  safelist: [
    'grid-cols-1',
    'grid-cols-2', 
    'grid-cols-3',
    'grid-cols-4',
    'sm:grid-cols-1',
    'sm:grid-cols-2',
    'sm:grid-cols-3',
    'sm:grid-cols-4',
    'md:grid-cols-1',
    'md:grid-cols-2',
    'md:grid-cols-3',
    'md:grid-cols-4',
    'lg:grid-cols-1',
    'lg:grid-cols-2',
    'lg:grid-cols-3',
    'lg:grid-cols-4',
    'xl:grid-cols-1',
    'xl:grid-cols-2',
    'xl:grid-cols-3',
    'xl:grid-cols-4',
  ],
  plugins: [],
}