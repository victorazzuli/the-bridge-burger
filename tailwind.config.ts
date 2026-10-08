import type { Config } from "tailwindcss";

/** Cores vêm dos tokens CSS em src/styles/tokens.css (fonte única do design system). */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: v("bg"),
        surface: v("surface"),
        "surface-2": v("surface-2"),
        primary: v("primary"),
        "primary-ink": v("primary-ink"),
        secondary: v("secondary"),
        accent: v("accent"),
        text: v("text"),
        muted: v("muted"),
        line: v("line"),
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      screens: { xs: "420px" },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        breathe: { from: { transform: "scale(1)" }, to: { transform: "scale(1.07)" } },
        bump: { "0%": { transform: "scale(1)" }, "35%": { transform: "scale(1.35)" }, "100%": { transform: "scale(1)" } },
        rise: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        bump: "bump .45s cubic-bezier(.16,1,.3,1)",
        rise: "rise .5s cubic-bezier(.16,1,.3,1) both",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(.16,1,.3,1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
