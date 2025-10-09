/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface:    "var(--surface)",
        header:     "var(--header)",
        footer:     "var(--footer)",
        muted:      "var(--muted)",
        foreground: "var(--foreground)",
        border:     "var(--border)",
        input:      "var(--input)",
        "input-foreground": "var(--input-foreground)"
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};