module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
      extend: {
        colors: {
          ise: {
            navy: "#0B0C2A",
            green: "#1DB96E",
            gradientFrom: "#0B0C2A",
            gradientTo: "#1DB96E",
          },
        },
      },
    },
  plugins: [],
};