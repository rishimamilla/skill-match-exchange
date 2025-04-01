module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // Bright indigo
          light: '#818CF8',
          dark: '#4F46E5',
          darkMode: '#818CF8', // Lighter indigo for dark mode
        },
        secondary: {
          DEFAULT: '#10B981', // Bright emerald
          light: '#34D399',
          dark: '#059669',
          darkMode: '#34D399', // Lighter emerald for dark mode
        },
        accent: {
          DEFAULT: '#F59E0B', // Warm amber
          light: '#FBBF24',
          dark: '#D97706',
          darkMode: '#FBBF24', // Lighter amber for dark mode
        },
        background: {
          light: '#F8FAFC',
          DEFAULT: '#F1F5F9',
          dark: '#E2E8F0',
          darkMode: '#1E293B', // Dark slate for dark mode background
          darkModeLight: '#334155', // Slightly lighter dark slate
        },
        text: {
          DEFAULT: '#1E293B', // Dark slate for light mode
          light: '#64748B', // Slate for light mode secondary text
          darkMode: '#F8FAFC', // Light slate for dark mode
          darkModeLight: '#CBD5E1', // Slightly darker text for dark mode
        },
      },
    },
  },
  plugins: [],
};