const chalk = require('chalk')

const env = process.env.NODE_ENV || 'development'
console.log(chalk.red(`[>>>>>>>>>>>>>>>>当前开发环境:${env}<<<<<<<<<<<<<<<]`))

if (env === 'development') {
  module.exports = require('./config/webpack.config.development.js')
} else {
  module.exports = require('./config/webpack.config.production.js')
}
