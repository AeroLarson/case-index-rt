/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
  // Performance optimizations
  corePlugins: {
    preflight: true,
  },
  // Reduce CSS bundle size
  safelist: [],
  // Faster compilation
  future: {
    hoverOnlyWhenSupported: true,
  },
}
