/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#38BDF8",
        secondary: "#22D3EE",
        accent: "#818CF8",
        "tm-dark": "#0C4A6E",
        "tm-muted": "#64748B",
      },
      backgroundImage: {
        "tm-gradient":
          "linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 35%, #E0F2FE 70%, #F0F9FF 100%)",
        "tm-button":
          "linear-gradient(135deg, #38BDF8 0%, #22D3EE 50%, #38BDF8 100%)",
        "tm-card":
          "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(240,249,255,0.85) 100%)",
      },
      boxShadow: {
        "tm-glow": "0 0 24px rgba(56, 189, 248, 0.25), 0 4px 20px rgba(34, 211, 238, 0.15)",
        "tm-glow-lg":
          "0 0 40px rgba(56, 189, 248, 0.3), 0 8px 32px rgba(129, 140, 248, 0.15)",
        "tm-card": "0 4px 24px rgba(56, 189, 248, 0.08), 0 1px 3px rgba(0,0,0,0.04)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        sparkle: "sparkle 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
