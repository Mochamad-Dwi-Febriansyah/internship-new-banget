/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <- harus di sini
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}","./components/**/*.{vue,js}", "./pages/**/*.{vue,js}"], 
  theme: {
    extend: {
      fontFamily: {  
        satoshi: ["Satoshi", "sans-serif"] 
      },
      container:{
        center: true,
        padding: "2rem"
      }, 
    },
  },
  
  plugins: [],
}

