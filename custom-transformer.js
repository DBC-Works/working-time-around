const babelJest = require('babel-jest')
const babelOptions = {
  presets: [
    '@babel/preset-typescript',
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        corejs: 3,
        useBuiltIns: 'usage',
      },
    ],
  ],
  plugins: [],
  babelrc: false,
}
if (process.env.NODE_ENV === 'production') {
  babelOptions.plugins.push('babel-plugin-unassert')
}

module.exports = babelJest.createTransformer(babelOptions)
