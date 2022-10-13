module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: { node: 'current' },
        corejs: { version: 3, proposals: true },
        useBuiltIns: 'usage'
      }
    ],
    '@babel/preset-react'
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ]
}
