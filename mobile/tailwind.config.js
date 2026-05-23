/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: '#13131A',
        card: 'rgba(255,255,255,0.04)',
        accent: '#E8294C',
        accentSecondary: '#8B5CF6',
        textPrimary: '#F5F5F7',
        textSecondary: '#8E8E93',
        onlineGreen: '#30D158',
        border: '#2A2A35',
        error: '#FF453A',
        warning: '#FF9F0A',
      }
    },
  },
  plugins: [],
}
