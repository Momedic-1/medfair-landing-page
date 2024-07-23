// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/preline/dist/*.js', // Add Preline's path
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('preline/plugin'), // Add Preline plugin
  ],
};
