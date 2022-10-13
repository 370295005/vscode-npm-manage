const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const createStyleLoaders = require('./webpack.less')
const styleLoaders = createStyleLoaders({ isDev: true })

module.exports = {
  mode: 'production',
  target: 'node',
  devtool: false,
  entry: {
    webview: path.resolve('src', 'webView.tsx'),
    extension: path.resolve('src', 'extension.ts')
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js'
  },
  externals: {
    vscode: 'commonjs vscode' // vscode-module是热更新的临时目录，所以要排除掉。 在这里添加其他不应该被webpack打包的文件, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    symlinks: false,
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].chunk.css'
    }),
    new FriendlyErrorsPlugin(), // 优化输出信息
    new webpack.HashedModuleIdsPlugin(), // 每次没有变更的文件不会重新生成hash 节省资源
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve('src/view', 'webview.html'),
      filename: 'view/webview.html',
      chunks: ['react-lib', 'webview']
    })
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|jsx|ts|tsx)$/,
        use: 'eslint-loader'
      },
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader'
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
              compilerOptions: {
                module: 'es6' // override `tsconfig.json` so that TypeScript emits native JavaScript modules.
              }
            }
          }
        ]
      },
      ...styleLoaders
    ]
  },
  node: {
    __filename: true,
    __dirname: true
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
  stats: 'errors-only'
}
