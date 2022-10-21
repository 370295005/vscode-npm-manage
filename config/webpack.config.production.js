const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const createStyleLoaders = require('./webpack.less')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const styleLoaders = createStyleLoaders({ isDev: true })

const productionBaseConfig = {
  mode: 'production',
  stats: 'errors-only',
  devtool: false,
  resolve: {
    symlinks: false,
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  },
  externals: {
    vscode: 'commonjs vscode' // vscode-module是热更新的临时目录，所以要排除掉。 在这里添加其他不应该被webpack打包的文件, 📖 -> https://webpack.js.org/configuration/externals/
  }
}

const extensionConfig = {
  target: 'node', // 打包对象设置为node,不再打包原生模块,例如 fs/path  TODO: webview是否单独设置为web?
  entry: {
    extension: path.resolve('src', 'extension.ts')
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  plugins: [new FriendlyErrorsPlugin()],
  node: {
    __filename: true,
    __dirname: true
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|jsx|ts|tsx)$/,
        use: 'eslint-loader',
        exclude: /antd/
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                module: 'es6' // override `tsconfig.json` so that TypeScript emits native JavaScript modules.
              }
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  ...productionBaseConfig
}

const webViewConfig = {
  entry: {
    webview: path.resolve('src', 'webView.tsx')
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js'
  },
  plugins: [
    new FriendlyErrorsPlugin(),
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, '../src/iconfont'), to: path.resolve(__dirname, '../dist/iconfont') },
      { from: path.resolve(__dirname, '../src/images'), to: path.resolve(__dirname, '../dist/images') }
    ]),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve('src/view', 'webview.html'),
      filename: 'view/webview.html',
      chunks: ['react-lib', 'webview']
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].chunk.css'
    })
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|jsx|ts|tsx)$/,
        use: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'ts-loader',
            options: {
              // 因为webview 需要在 web环境运行,无法使用ts6的commonjs 这里需要覆盖 tsconfig
              compilerOptions: {
                module: 'esnext',
                target: 'es5'
              }
            }
          }
        ],
        exclude: /node_modules/
      },
      ...styleLoaders
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        'react-lib': {
          chunks: 'all',
          test: /react|react-dom|loose-envify|object-assign|prop-types|scheduler/,
          name: () => {
            return 'lib/react-lib'
          },
          priority: 10
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        cache: true, // 利用缓存处理编译
        parallel: true, // 多线程压缩
        // sourceMap: shouldUseSourceMap, // 减少文件映射
        terserOptions: {
          output: {
            comments: false
          },
          compress: {
            warnings: false,
            drop_debugger: true,
            drop_console: true
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }]
        }
      })
    ]
  },
  ...productionBaseConfig
}

module.exports = [extensionConfig, webViewConfig]
