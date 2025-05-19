import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        "letter-pop": {
          "0%": {
            transform: "scale(0) rotate(-10deg)",
            opacity: "0",
          },
          "25%": {
            opacity: "0.7",
          },
          "50%": {
            transform: "scale(1.2) rotate(10deg)",
            opacity: "0.7",
          },
          "75%": {
            transform: "scale(0.9) rotate(-5deg)",
            opacity: "0.8",
          },
          "100%": {
            transform: "scale(1) rotate(0deg)",
            opacity: "1",
          },
        },
      },
      animation: {
        "letter-pop":
          "letter-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
