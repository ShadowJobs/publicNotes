const path = require('path');
// 引入html-webpack-plugin插件，这个插件会生成一个HTML文件，自动将编译后的代码注入到这个HTML文件中
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 引入clean-webpack-plugin插件，这个插件用于在每次构建前清理/删除dist目录中的旧文件
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const AppendFilepathPlugin = require('./myplugin');
module.exports = {
  entry: './src/index.js',  // 指定入口文件，webpack将从这里开始构建

  // 开启 Webpack 的 SourceMap
  devtool: process.env.NODE_ENV !== 'production' ? 'inline-source-map' : false, // 或者使用其他可选值，如 'source-map'

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js', //输出的文件名
    environment: {
      arrowFunction: false //本行是指webpack打包时不使用箭头函数，对于在低版本的浏览器里（如ie11不支持箭头函数），必须加上。
    }
  },
  externals: {
    'react': 'window.React', //配套修改：在index.html中加react和react-dom的CDN引入，或者html-webpack-plugin插件中加入script标签引入
    'react-dom': 'window.ReactDOM',
  },
  module: {
    rules: [
      //ts配置方法1：使用ts-loader,要先安装ts-loader和typescript，并配置tsconfig.json
      //  {
      //   // 匹配 '.ts' 或 '.tsx' 文件
      //   test: /\.(ts|tsx)$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'ts-loader'
      //   }
      // },
      // // 如果你还想继续使用 Babel 来处理其他 JS 文件，可以保留如下规则
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ['@babel/preset-env']
      //     }
      //   }
      // }
      // ts配置方法2：使用@babel/preset-typescript
      {
        // test: /\.jsx?$/, 
        test: /\.(jsx?|tsx?)$/, // 匹配 JS, JSX, TS, 和 TSX 文件。 x? 表示 x 可能出现0次或1次。
        exclude: /node_modules/,
        use: [
          {
            loader: './myloader.js' //自定义loader
          },
          {//如果只用1个，则可以直接写'ts-loader',如果有多个加载器，则要用数组，use:[{...},{...}]，执行时从后往前执行，所以应该先转js
          loader: 'babel-loader',
          options: {
            // presets: ['@babel/preset-env', '@babel/preset-react']
            // 最后一个最先执行
            presets: [
              // '@babel/preset-env', //高版本向下兼容的插件（一般是2015+向下转换）,方法1：简写直接写字符串
              ['@babel/preset-env',//方法2：写成数组 
                {
                  //可能在哪些浏览器运行,有了这个之后，就不必配置tsconfig.json里的es版本target了，
                  //比如这里要支持ie版本11，那么babel会自动转化为老版本的js。所以由于ie11不支持const，所以生成的aOutPut里变成了var o={...}
                  targets: { "chrome": "88", "ie": "11" },
                  corejs: "3",//corejs版本,比如ie11里没有Promise，所以这里会引用corejs里的Promise
                  useBuiltIns: "usage"//使用corejs的方式，usage表示按需加载，如果代码里没有用到Promise，那么不会加载core里的Promise
                }
              ],
              '@babel/preset-react',
              '@babel/preset-typescript'// 添加这个预设来处理 TypeScript,这个插件可以处理js,jsx,ts,tsx文件,并且不需要额外配置tsconfig.json，
              // 缺点：没有类型检查；
              // 解决办法1,fork-ts-checker-webpack-plugin插件,npm install fork-ts-checker-webpack-plugin -D,然后再下面的plugins中配置
              // new ForkTsCheckerWebpackPlugin({async: false})//async: false表示等待类型检查器完成，然后再构建
              // 办法2：package.json配置{“build-check”:"npm run build && npm run type-check"，"build":"webpack ","type-check":"tsc --noEmit"}
            ],
            sourceMaps: true,
          }
        }]
      }
    ]
  },
  resolve: {
    alias: { //设置别名
      '@': path.resolve(__dirname, 'src'), // 将 '@' 设置为 'src' 目录的绝对路径
      //... 可能还有其他别名配置
    },
    // 自动解析确定的扩展，意味着在导入时可以省略这些扩展名 import './App' vs import './App.js' ，匹配顺序是从左到右
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'], // 添加 .ts 和 .tsx

    /**指定应该用包里的哪个代码。例如react-intl包下有src,lib,dist 3个目录，webpack打包的时候应该用哪个？（vscode在编辑提示的时候，会用到type字段指定的.d.ts），
     * 下面的mainFields配置，会先找react-intl里package.json的browser字段，然后是module，最后是main （不配置，默认值是['browser', 'module', 'main']）
     * react-intl的package.json里有{"main": "./dist/index.js","module": "./lib/index.js"},
     * 那么会先找browser,发现react-intl的package.json没有指定，那么会找module，
     * 发现有指定，所以会用./lib/index.js ； lib目录下的index.js是es6的代码，而dist目录下的index.js是es5的代码，通常用lib，这样可以tree shaking。
     */
    mainFields: ['browser', 'module', 'main'],


    // ... 其他 resolve 配置 ...
  },

  // plugins和loader的区别：插件通常操作的是整个 bundle，而 loaders 则能够在文件被添加到 bundle 之前对它们进行转换
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new AppendFilepathPlugin()
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    open: true
  }
};
