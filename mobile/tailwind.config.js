/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#166534', // Green
          light: '#22c55e',
          dark: '#14532d',
        },
        gold: {
          DEFAULT: '#eab308',
          light: '#fef08a',
          dark: '#ca8a04',
        },
      }
    },
  },
  plugins: [],
}
