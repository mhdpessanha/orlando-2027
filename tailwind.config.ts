import type { Config } from "tailwindcss";

const PARK_KEYS = ["mk", "ep", "hs", "ak", "us", "ds", "tv", "ink", "epic"];
const SHADES = [50, 100, 200, 400, 600, 800, 900];

export default {
  content: ["./src/**/*.{ts,tsx}"],
  safelist: [
    ...PARK_KEYS.flatMap((k) => SHADES.flatMap((s) => [
      `bg-${k}-${s}`, `text-${k}-${s}`, `border-${k}-${s}`, `ring-${k}-${s}`, `hover:bg-${k}-${s}`,
    ])),
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
      colors: {
        // Park palette - cada parque tem sua identidade
        mk: { 50: "#FBEAF0", 100: "#F4C0D1", 200: "#ED93B1", 400: "#D4537E", 600: "#993556", 800: "#72243E", 900: "#4B1528" },
        ep: { 50: "#EEEDFE", 100: "#CECBF6", 200: "#AFA9EC", 400: "#7F77DD", 600: "#534AB7", 800: "#3C3489", 900: "#26215C" },
        hs: { 50: "#FAEEDA", 100: "#FAC775", 200: "#EF9F27", 400: "#BA7517", 600: "#854F0B", 800: "#633806", 900: "#412402" },
        ak: { 50: "#EAF3DE", 100: "#C0DD97", 200: "#97C459", 400: "#639922", 600: "#3B6D11", 800: "#27500A", 900: "#173404" },
        us: { 50: "#FAECE7", 100: "#F5C4B3", 200: "#F0997B", 400: "#D85A30", 600: "#993C1D", 800: "#712B13", 900: "#4A1B0C" },
        ds: { 50: "#E1F5EE", 100: "#9FE1CB", 200: "#5DCAA5", 400: "#1D9E75", 600: "#0F6E56", 800: "#085041", 900: "#04342C" },
        tv: { 50: "#E6F1FB", 100: "#B5D4F4", 200: "#85B7EB", 400: "#378ADD", 600: "#185FA5", 800: "#0C447C", 900: "#042C53" },
        ink: { 50: "#FAFAF7", 100: "#F1EFE8", 200: "#D3D1C7", 400: "#888780", 600: "#5F5E5A", 800: "#444441", 900: "#2C2C2A" },
        epic: { 50: "#FEEBEB", 100: "#FBC8C8", 200: "#F39595", 400: "#DC4848", 600: "#A2272D", 800: "#761A20", 900: "#4D1015" },
      },
      animation: {
        twinkle: "twinkle 3s ease-in-out infinite",
        fadeIn: "fadeIn 0.6s ease-out",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
} satisfies Config;
