/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "apple-gray": {
          50: "#F9F9F9",
          100: "#F2F2F2",
          200: "#E6E6E6",
          300: "#D9D9D9",
          400: "#BFBFBF",
          500: "#A5A5A5",
          600: "#8C8C8C",
          700: "#737373",
          800: "#595959",
          900: "#404040",
        },
        "apple-blue": {
          50: "#F7FAFD",
          100: "#EFF4FB",
          200: "#D6E7F4",
          300: "#BDDCED",
          400: "#8CBCDF",
          500: "#5A9DC2",
          600: "#4883A6",
          700: "#366988",
          800: "#254E6A",
          900: "#13334C",
        },
      },
      fontFamily: {
        sans: ["San Francisco", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
  daisyui: {
    themes: false,
  },
};
