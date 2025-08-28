/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.js",
    "./public/**/*.html"
  ],
  safelist: [
    'bg-white', 'text-black',
    'bg-black', 'text-white',
    'bg-clairfond', 'text-clairtexte',
    'bg-sombrefond', 'text-sombretexte'
  ],
  theme: {
    extend: {
      colors: {
        // Palette principale
        noir: '#1E1E1E',
        creme: '#F6F2EB',
        rouge: '#9E2B25',
        or: '#CBAF7A',
        rosé: '#C26565',
        vertmarbre: '#3E665D',
        cuivre: '#6F4E37',

        // Compléments
        beige: '#EADAC1',
        gris: '#8E8E8E',
        orfonce: '#A78C5B',
        rougefonce: '#7A1B1B',

        // Thèmes visuels
        clairfond: '#fefefe',
        clairtexte: '#1e1e1e',
        sombrefond: '#121212',
        sombretexte: '#f8f8f8',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        didact: ['Didact Gothic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
