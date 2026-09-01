import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D3A22",
        "primary-dark": "#072213",
        accent: "#68B632",
        "accent-dark": "#3F7A1A",
        "accent-light": "#7FD046",
        "accent-subtle": "#EBF7E7",
        "earth-gold": "#D69E2E",
        "sky-blue": "#319795",
        "bg-page": "#F8FAF8",
        "bg-card": "#FFFFFF",
        "bg-card-alt": "#F2F7F3",
        "bg-dark-section": "#0B2B19",
        "text-main": "#14281C",
        "text-muted": "#556B5D",
        "text-light": "#879C8E",
        "border-light": "#DFEBE2",
      },
      fontFamily: {
        heading: ["var(--font-outfit)", "sans-serif"],
        body: ["var(--font-jakarta)", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
    },
  },
  plugins: [],
};

export default config;
