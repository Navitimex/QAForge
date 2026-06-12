import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Theme toggling is done via data-theme attribute on <html>
  // No darkMode config needed — CSS variables handle it
  theme: {
    extend: {
      colors: {
        bg:         "var(--bg)",
        surface:    "var(--surface)",
        card:       "var(--card)",
        border:     "var(--border)",
        accent:     "var(--accent)",
        text:       "var(--text)",
        "text-2":   "var(--text-2)",
        "text-3":   "var(--text-3)",
        streak:     "#EAB308",
        "outer-bg": "var(--outer-bg)",
      },
      fontFamily: {
        sans:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        shell: "18px",
        card:  "14px",
        btn:   "10px",
      },
      height: {
        nav: "58px",
      },
      maxWidth: {
        shell:      "430px",
        "shell-lg": "1080px",
      },
    },
  },
  plugins: [],
};

export default config;
