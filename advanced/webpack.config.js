const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const RemovePlugin = require('remove-files-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

const FILES_TO_BE_REMOVED = [
  /\.min.css\.map$/,
  /\.min.js\.map$/,
  /\.min.css$/,
  /\.min.js$/
];

module.exports = (_options, argv) => ({
  entry: JSON.parse(fs.readFileSync('./modules.json')),
  mode: argv.mode,
  watch: argv.mode === 'development',
  stats: 'minimal',
  output: {
    publicPath: process.env.ASSET_URL || '.',
    path: path.resolve(__dirname, './assets'),
    environment: {
      arrowFunction: false,
      bigIntLiteral: false,
      const: false,
      destructuring: false,
      dynamicImport: false,
      forOf: false,
      module: false
    },
    asyncChunks: true,
    filename: '[name].min.js',
    chunkFilename: (pathData) => {
      if (argv.mode === 'production') {
        return '[name].min.js';
      }
      return `[id].dev.min.js`;
    }
  },
  devtool: argv.mode === 'development' ? 'eval-source-map' : 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test:  /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: ['url-loader?limit=100000']
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'resolve-url-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'resolve-url-loader',
          'postcss-loader',
        ],
      },
    ]
  },
  watchOptions: { aggregateTimeout: 100 },
  resolve: {
    extensions: ['.js'],
    alias: { '@': path.resolve(__dirname, './src') }
  },
  plugins: [
    new RemovePlugin({
      before: {
        root: './assets',
        test: FILES_TO_BE_REMOVED.map(regex => ({
          folder: './',
          method: (absoluteItemPath) => (
            new RegExp(regex, 'm').test(absoluteItemPath)
          )
        }))
      }
    }),
    new MiniCssExtractPlugin({
      filename: '[name].min.css',
      experimentalUseImportModule: true,
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 10,
    }),
    new webpack.DefinePlugin({ 'process.env': argv.mode }),
    new webpack.ProvidePlugin({ React: 'react' }),
  ],
  optimization: {
    minimize: argv.mode === 'production',
    usedExports: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        test: /\.js(\?.*)?$/i,
        terserOptions: {
          compress: true,
          format: { comments: false },
        }
      }),
      new CssMinimizerPlugin()
    ],
  },
});