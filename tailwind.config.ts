// tailwind.config.ts - Minimal v4 config
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Theme config is now in globals.css @theme block
  // Dark mode is handled automatically with .dark class
};

export default config;