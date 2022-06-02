const presets = []
const plugins = []

if (process.env.NODE_ENV === 'production') {
  plugins.push('babel-plugin-unassert')
}

module.exports = { presets, plugins }
