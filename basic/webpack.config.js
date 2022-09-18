const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

module.exports = (_, options) => {
  const isDevelopment = options.mode === 'development';

  return {
    entry: JSON.parse(fs.readFileSync('./modules.json')),
    watch: isDevelopment,
    stats: 'minimal',
    output: {
      path: path.resolve(__dirname, './assets'),
      filename: '[name].min.js'
    },
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'resolve-url-loader',
            'postcss-loader',
          ],
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: '[name].min.css' }),
      new webpack.DefinePlugin({ 'process.env': options.mode }),
    ],
    optimization: {
      minimize: !isDevelopment,
      usedExports: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: { compress: true }
        }),
        new CssMinimizerPlugin()
      ],
    }
  };
};