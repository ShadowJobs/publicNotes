const path = require('path');
const { whenProd, getPlugin, pluginByName } = require('@craco/craco')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');


//craco的使用：在不eject的情况下修改webpack的功能。
// 然后在项目里加craco.config.js文件，然后在package.json里把除了eject之外的react-scripts命令修改为craco.
// 如react-scripts start-> craco start

module.exports = {
  webpack: {
    alias: { "@": path.resolve(__dirname, 'src') },
    plugins:[
      ...(process.env.BUNDLE_ANALYZE ? [new BundleAnalyzerPlugin()] : []),

    ],
    configure: (webpackConfig) => {
      // webpackConfig自动注入的webpack配置对象
      // 可以在这个函数中对它进行详细的自定义配置
      // 只要最后return出去就行
      let cdn = { js: [], css: [] }
      // 只有生产环境才配置
      whenProd(() => {
        // key:需要不参与打包的具体的包
        // value: cdn文件中 挂载于全局的变量名称 为了替换之前在开发环境下
        // 通过import 导入的 react / react-dom
        webpackConfig.externals = {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
        // 配置现成的cdn 资源数组 现在是公共为了测试
        // 实际开发的时候 用公司自己花钱买的cdn服务器
        cdn = {
          js: [
            'https://cdnjs.cloudflare.com/ajax/libs/react/18.1.0/umd/react.production.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.1.0/umd/react-dom.production.min.js',
          ],
          css: []
        }
      })

      // 都是为了将来配置 htmlWebpackPlugin插件 将来在public/index.html注入
      // cdn资源数组时 准备好的一些现成的资源
      const { isFound, match } = getPlugin(
        webpackConfig,
        pluginByName('HtmlWebpackPlugin')
      )

      if (isFound) {
        // 找到了HtmlWebpackPlugin的插件，找不到就先  npm i html-webpack-plugin -D
        match.userOptions.cdn = cdn
      }


      // webpackConfig.output.publicPath = 'static-files/'; // 配置静态资源路径
      // if (env === 'development') {
      //   webpackConfig.devtool = 'eval-source-map';
      // }
      // webpackConfig.plugins = webpackConfig.plugins.map(plugin => {
      //   if (plugin instanceof WebpackManifestPlugin) {
      //     return new WebpackManifestPlugin({
      //       ...plugin.opts,
      //       filter: (file) => !file.name.endsWith('LICENSE.txt') //删除过程中生成的LICENSE.txt文件
      //     });
      //   }
      //   return plugin;
      // });
      if (env === 'production') {
        webpackConfig.devtool = false; //生产环境去掉map文件
      }
      // 这一段是配置路径的，如果代码里用到了a.ttf,那么文件存放路径就是/static-files/static/media/static/media/a.ttf
      // 经过实际测试，请求a.hash8.ttf的内容是export default "/static-files/static/media/static/media/codicon.f6283f7c.ttf";
      // 导致monaco的字体加载失败，所以下面这一段去掉，直接放到公共路径下
      // webpackConfig.module.rules.push({
      //   test: /\.(ttf|woff|woff2|eot|svg|otf)$/,
      //   use: {
      //     loader: 'file-loader',
      //     options: {
      //       name: 'static/media/[name].[hash:8].[ext]',
      //       publicPath: '/static-files/static/media/',
      //       outputPath: 'static/media/',
      //     },
      //   },
      // });
      console.log('Webpack config:', webpackConfig);
      webpackConfig.output = {
        ...webpackConfig.output,
        filename: 'static/js/[name].[contenthash:8].js',
      };
      // 经过实测，这样写，能够明显减少打包体积，被拆分了
      webpackConfig.optimization.splitChunks = {
        chunks: 'all',
        // name: false,
        // 如果配false，那么文件名就是hash值，如果要看到源文件名字，就用下面的配置
        name: (module, chunks, cacheGroupKey) => {
          const moduleFileName = module.identifier().split('/').reduceRight(item => item);
          const allChunksNames = chunks.map((item) => item.name).join('~');
          return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
        },
        
        cacheGroups: {
          vendor: {
            //   单独打包成若干个包，其中react,react-dom打包到vendor-react里,antd, @ant-design打包到vendor-antd, @antv打包到vendor-antv
            //   reactVendor: {
            //     test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            //     name: 'vendor-react',
            //     chunks: 'all',
            //   },
            //   antdVendor: {
            //     test: /[\\/]node_modules[\\/](@ant-design|antd)[\\/]/,
            //     name: 'vendor-antd',
            //     chunks: 'all',
            //   },
            //   antvVendor: {
            //     test: /[\\/]node_modules[\\/]@antv[\\/]/,
            //     name: 'vendor-antv',
            //     chunks: 'all',
            //   }

            // 下面一行会将5个react相关的包打包到一个文件里
            test: /[\\/]node_modules[\\/](react|react-dom|@ant-design|antd|@antv)[\\/]$/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
        
      };

      return webpackConfig
    }
  },
}
