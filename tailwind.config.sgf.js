// Add these colors to your existing tailwind.config.js under theme.extend.colors

const sgfColors = {
  sgf: {
    green: {
      50: '#E8F5E9',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#2E7D32',  // Primary green
      600: '#1B5E20',
      700: '#145214',
      800: '#0D3B0D',
      900: '#062406',
    },
    gold: {
      50: '#FFF8E1',
      100: '#FFECB3',
      200: '#FFE082',
      300: '#FFD54F',
      400: '#FFCA28',
      500: '#D4AF37',  // Primary gold
      600: '#C9A227',
      700: '#B8860B',
      800: '#996515',
      900: '#7A5311',
    },
    navy: {
      500: '#1A365D',
      600: '#153050',
      700: '#0F2440',
    }
  }
};

console.log('Add these to your tailwind.config.js:');
console.log(JSON.stringify(sgfColors, null, 2));
