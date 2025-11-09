module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './pages/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { 
    extend: {
      fontFamily: {
        'sf-pro-regular': ['SF-Pro-Text-Regular'],
        'sf-pro-bold': ['SF-Pro-Text-Bold'],
      }
    } 
  },
  plugins: [],
};