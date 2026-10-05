import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Sora", "sans-serif"],
      },
      colors: {
        cts: { navy: "#10152f", panel: "#181e3e", red: "#e6002d", cream: "#f7f4ed", mist: "#aeb6d1" },
      },
      boxShadow: { glow: "0 0 45px rgba(230,0,45,.22)", card: "0 22px 60px rgba(4,7,24,.28)" },
    },
  },
  plugins: [],
} satisfies Config;
