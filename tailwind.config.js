/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    `./src/pages/**/*.{js,jsx,ts,tsx,mdx}`,
    `./src/mdx-pages/**/*.{js,jsx,ts,tsx,mdx}`,
    `./src/templates/**/*.{js,jsx,ts,tsx,mdx}`,
    `./src/components/**/*.{js,jsx,ts,tsx,mdx}`,
  ],
  theme: {
    fontFamily: {
      sans: ["HelveticaNeue", "Helvetica Neue", "Helvetica", "sans-serif"],
      serif: ["serif"],
    },
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
