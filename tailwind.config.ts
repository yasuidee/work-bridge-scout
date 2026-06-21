import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 深いブルー基調。AI 関連はブルー〜パープルのグラデで先進感
        brand: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#bccfff",
          300: "#8eaeff",
          400: "#5a82fb",
          500: "#345ef0",
          600: "#1f42d6",
          700: "#1a33ad",
          800: "#1b2f8a",
          900: "#1b2c6e",
        },
        ai: {
          from: "#4f46e5",
          to: "#7c3aed",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "Hiragino Kaku Gothic ProN",
          "Meiryo",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
