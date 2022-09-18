module.exports = {
  presets: [
    [
      '@babel/preset-react',
      {
        development: process.env.BABEL_ENV === 'development',
        throwIfNamespace: true,
        runtime: 'automatic'
      },
    ],
  ],
  plugins: [
    '@babel/plugin-transform-react-pure-annotations'
  ],
};