const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
module.exports = {
  module: {
    // entry: './src/index.js',这里默认是src/index.js，如果要修改，就需要写entry，package.json里如果也写了--entry，那么两个entry会同时生效，但是如果重名了，就会报错，
    // 本项目在package.json里指定了entry，这里就不用写了
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]],
          },
        },
      },
    ],
  },
  optimization: {
    minimize: false, //不最小化，可用于分析编译后的源码
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'React',
      template: path.join(__dirname, 'src/index.html'), // 源模板文件
    }),
  ],
};
