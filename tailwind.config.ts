import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        /* ── Shadcn-compatible tokens ── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        /* ── Brand semantic tokens ── */
        brand: {
          bg:       "var(--color-bg)",
          surface:  "var(--color-surface)",
          surface2: "var(--color-surface-2)",
          primary:  "var(--color-primary)",
          accent:   "var(--color-accent)",
          border:   "var(--color-border)",
          text:     "var(--color-text)",
          muted:    "var(--color-muted)",
        },
      },
      backgroundImage: {
        "gradient-brand": "var(--gradient-brand)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        brand:    "0 2px 12px rgba(37,99,235,0.25)",
        "brand-lg": "0 4px 24px rgba(37,99,235,0.30)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
