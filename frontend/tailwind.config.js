module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B1B3D",
        "navy-dark": "#07122A",
        "navy-light": "#162C5B",
        "royal-blue": "#0B2580",
        "royal-navy": "#0D226B",
        "navy-deep": "#081745",
        gold: "#D4AF37",
        "gold-light": "#F5E5A3",
        "gold-bright": "#FFD700",
        "gold-dark": "#AA7C11",
        cream: "#FAF7F0",
        maroon: "#0B1B3D", // aliased for backwards compatibility
        saffron: "#E59E1B"
      }
    }
  },
  plugins: []
};

