/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",   // (optional, for safety)
  ],
  theme: {
    extend: {
      colors: {
        brand: "#145147",
      },
    },
  },
  plugins: [],
};
