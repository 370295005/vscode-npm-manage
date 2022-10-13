const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const generateScopedName = require('./generateScopedName')

const createStyleLoaders = ({ isDev = false, publicPath = '/' }) => {
  return [
    {
      test: /\.css$/,
      use: [
        {
          loader: isDev ? 'style-loader' : MiniCssExtractPlugin.loader
        },
        {
          loader: 'css-loader'
        }
      ]
    },
    {
      test: /\.module\.less$/,
      use: [
        {
          loader: isDev ? 'style-loader' : MiniCssExtractPlugin.loader
        },
        {
          loader: 'css-loader',
          options: {
            url: true,
            sourceMap: true,
            modules: {
              getLocalIdent({ resourcePath }, localIdentName, localName) {
                return generateScopedName(localName, resourcePath)
              }
            },
            importLoaders: 2
          }
        },
        'postcss-loader',
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              javascriptEnabled: true,
              strictMath: true,
              noIeCompat: true,
              globalVars: {},
              modifyVars: {}
            }
          }
        }
      ]
    },
    {
      test: /\.less$/,
      exclude: /\.module\.less$/,
      use: [
        {
          loader: isDev ? 'style-loader' : MiniCssExtractPlugin.loader
        },
        {
          loader: 'css-loader',
          options: {
            url: true,
            sourceMap: isDev,
            importLoaders: 2
          }
        },
        'postcss-loader',
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              javascriptEnabled: true,
              strictMath: true,
              noIeCompat: true,
              globalVars: {},
              modifyVars: {}
            }
          }
        }
      ]
    },
    {
      test: /\.(png|jpe?g|gif)$/,
      use: {
        loader: 'url-loader',
        options: {
          publicPath,
          limit: 8192 * 10,
          name: isDev ? 'img/[name].[hash].[ext]' : 'img/[name].[contenthash].[ext]'
        }
      }
    },
    {
      test: /\.(ttf|otf|eot|woff|woff2|svg)$/,
      use: 'file-loader'
    }
  ]
}

module.exports = createStyleLoaders
