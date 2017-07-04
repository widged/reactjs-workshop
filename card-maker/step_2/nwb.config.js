const path = require('path');

module.exports = {
  type: 'react-app',
  webpack: {
    publicPath: '',
    aliases: {
      src: path.resolve('usage')
    }
  }
};
