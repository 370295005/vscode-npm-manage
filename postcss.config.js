module.exports = {
  plugins: [
    require('postcss-flexbugs-fixes'),
    require('postcss-preset-env')({
      autoprefixer: {
        flexbox: 'no-2009' // 允许flex转换
      },
      stage: 2 // 为了支持所有浏览器
    })
  ]
}
