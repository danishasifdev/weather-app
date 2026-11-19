/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF8129",
          deep: "#C14F00",
          text: "#B84D00",
          navy: "#1C2B45",
          sky: "#55B5E5",
          mint: "#B4E7E1",
          lime: "#D6EA70",
          peach: "#FFE0D0",
          grey: "#F5F5F5",
          muted: "#626A78",
          ink: "#5F6B7A",
          canvas: "#EEF3F4",
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '"Manrope"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
      },
      fontSize: {
        "10px": "10px",
        "11px": "11px",
        "13px": "13px",
      },
      borderRadius: {
        card: "24px",
        stat: "16px",
        forecast: "18px",
        btn: "14px",
      },
      boxShadow: {
        card: "0 12px 30px rgba(28, 43, 69, 0.08)",
        panel:
          "0 30px 80px rgba(28, 43, 69, 0.10), 0 2px 8px rgba(28, 43, 69, 0.04)",
        stat: "0 8px 20px rgba(28, 43, 69, 0.09)",
        orange: "0 10px 22px rgba(193, 79, 0, 0.26)",
        dropdown: "0 22px 50px rgba(28, 43, 69, 0.18)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(22px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94) translateY(12px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "progress-sweep": {
          from: { transform: "translateX(-110%)" },
          to: { transform: "translateX(410%)" },
        },
        "loader-spin": {
          to: { transform: "rotate(360deg)" },
        },
        "loader-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.12)", opacity: "1" },
        },
        "loader-drift": {
          from: { transform: "translateX(-7px)" },
          to: { transform: "translateX(7px)" },
        },
        "loader-rain": {
          "0%": { transform: "translateY(-5px)", opacity: "0" },
          "25%": { opacity: "1" },
          "100%": { transform: "translateY(16px)", opacity: "0" },
        },
        "loader-float": {
          "0%, 100%": { transform: "translateY(3px)" },
          "50%": { transform: "translateY(-3px)" },
        },
        "loader-dots": {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: "0.35" },
          "40%": { transform: "translateY(-3px)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.6s ease both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-down": "slide-down 0.28s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.5s infinite",
        "progress-sweep": "progress-sweep 1.3s ease-in-out infinite",
        "loader-spin": "loader-spin 2.4s linear infinite",
        "loader-pulse": "loader-pulse 2.2s ease-in-out infinite",
        "loader-drift": "loader-drift 3.2s ease-in-out infinite alternate",
        "loader-rain": "loader-rain 1.15s linear infinite",
        "loader-float": "loader-float 3.4s ease-in-out infinite",
        "loader-dots": "loader-dots 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
