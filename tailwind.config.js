/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: "var(--border)", // теперь border использует --border
      },
      colors: {
        border: "var(--border)", // для использования как цвета: border, ring, muted...
      },
    },
  },
}
