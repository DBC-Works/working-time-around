const presets = [
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
]
const plugins = []

if (process.env.NODE_ENV === 'production') {
  plugins.push('babel-plugin-unassert')
}

module.exports = { presets, plugins }
