/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "loginBg": "url('loginBg.jpg')",
      colors: {
        'discord-purple': '#7289da',
        "discord-dark":"#282b30",
        "discord-middle-dark":"#424549",
        "discord-black":"#1e2124",
      },
    },
  },
  plugins: [],
}

