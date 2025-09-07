// webpack.config.js
const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      // Provide empty mocks
      'express': false,
      'http': false,
      'https': false,
      'url': false,
      'path': false,
      'fs': false,
      'net': false,
      'tls': false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser'
    }),
    // Completely ignore these modules
    new webpack.IgnorePlugin({
      resourceRegExp: /^express$/,
      contextRegExp: /.*/
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^http$/,
      contextRegExp: /.*/
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^https$/,
      contextRegExp: /.*/
    })
  ]
};