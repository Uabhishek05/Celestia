/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        blush: "#f8e9e5",
        rosewater: "#f2d7d5",
        clay: "#b77062",
        wine: "#6b3e38",
        pearl: "#f8f5f1",
        ink: "#1f1b1a",
        sage: "#dfe7dd",
        gold: "#d1a65a"
      },
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Cormorant Garamond'", "serif"]
      },
      boxShadow: {
        glass: "0 12px 40px rgba(122, 79, 69, 0.12)",
        soft: "0 10px 30px rgba(31, 27, 26, 0.08)"
      },
      backgroundImage: {
        "mesh-light":
          "radial-gradient(circle at top left, rgba(242,215,213,0.46), transparent 34%), radial-gradient(circle at 80% 15%, rgba(209,166,90,0.10), transparent 22%), linear-gradient(135deg, #f4eeea 0%, #efe7e1 52%, #ebe2db 100%)",
        "mesh-dark":
          "radial-gradient(circle at top left, rgba(183,112,98,0.22), transparent 28%), radial-gradient(circle at 80% 15%, rgba(209,166,90,0.16), transparent 24%), linear-gradient(135deg, #191514 0%, #221d1c 100%)"
      }
    }
  },
  plugins: []
};
