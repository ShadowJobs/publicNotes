// https://umijs.org/config/
import { defineConfig } from 'umi';
import { join } from 'path';

import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

import WebpackPageBuildTimePlugin from '../scripts/webpack-page-build-time-plugin';
import WebpackEntryBuildTimePlugin from '../scripts/webpack-entry-build-time-plugin';

const { REACT_APP_ENV } = process.env;
process.env.TEST_ENV2 = "test2"
console.log("running in compile time")
console.log(process.env.TEST_ENV)
console.log(process.env.NODE_ENV)
console.log(process.env.NODE_ENV2)
export default defineConfig({
  define: {
    'process.env': process.env,
  },
  hash: true,
  antd: {},
  // publicPath: '/ly/',

  dva: {
    hmr: true,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: false,
    siderWidth: 208,
    ...defaultSettings,
    collapsedButtonRender: false,//这个是隐藏菜单的收起按钮。具体定义是在ProLayout里
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'root-entry-name': 'variable',
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  openAPI: [
    {
      requestLibPath: "import { request } from 'umi'",
      // 或者使用在线的版本
      // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
      schemaPath: join(__dirname, 'oneapi.json'),
      mock: false,
    },
    {
      requestLibPath: "import { request } from 'umi'",
      schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
      projectName: 'swagger',
    },
  ],
  nodeModulesTransform: { type: 'none' },
  mfsu: {},
  webpack5: {},
  exportStatic: {},



  // 如果用npm run analyze，会生成一个stats.json文件，可以用webpack-bundle-analyzer分析
  // analyze: {
  //   analyzerMode: process.env.ANALYZE ? 'server' : false,
  //   analyzerPort: 8888,
  //   openAnalyzer: true,
  //   // 生成 stats 文件，用于后续分析
  //   generateStatsFile: true,
  //   statsFilename: 'stats.json',
  // },
  // chunks: ['vendors', 'umi'],

  // 强制使用es6的lodash，减小打包体积
  // 这个这样写是因为很多库都是用lodash，只改自己的代码是不够的,注意下面chainWebpack里也要加上
  alias: {
    'lodash': 'lodash-es',
  },


  chainWebpack: (memo, { webpack }) => {
    // memo.module.rule('js').exclude.add(/\.md$/)
    // memo.module.rule('jsx').exclude.add(/\.md$/)
    // memo.module.rule('ts').exclude.add(/\.md$/)
    // memo.module.rule('tsx').exclude.add(/\.md$/)
    // memo.module.rule("markdown").test(/\.md$/).use('raw-loader').loader('raw-loader').options({ esModule: false });
    // 实测，上述内容都不会生效，生效的方法是在import时候加上!!raw-loader!前缀，import md from '!!raw-loader!./markdown.md'
    // 要安装raw-loader库，否则会报错，仅需-D，在devDependencies里即可

    const config = memo;
    config.resolve.alias.set('lodash', 'lodash-es');

    if (process.env.ANALYZE) {

      config.plugin('page-build-time')
        .use(WebpackPageBuildTimePlugin, [{
          outputToConsole: true,
          outputToFile: true,
          filename: 'page-build-times.json'
        }]);

      config.plugin('entry-build-time')
        .use(WebpackEntryBuildTimePlugin, [{
          outputToConsole: true,
          outputToFile: true,
          filename: 'entry-build-times.json'
        }]);

      config.plugin('named-chunks').use(
        // 注意这里webpack的来源，不能用import webpack from 'webpack'或者import {webpack} from 'umi'，否则找不到NamedChunksPlugin
        webpack.NamedChunksPlugin,
        [
          (chunk: any) => {
            if (chunk.name) return chunk.name;

            const seen = new Set();
            const nameLength = 4;

            return Array.from(chunk.modulesIterable, (m: any) => {
              const id = m.id?.toString() || '';
              const name = id.split(/[\\/]/)
                .slice(-nameLength)
                .join('_');

              if (seen.has(name)) return false;
              seen.add(name);
              return name;
            }).filter(Boolean).join('_');
          }
        ]
      );
      config.optimization.splitChunks({
        chunks: 'all',
        minSize: 30000,
        minChunks: 1,
        automaticNameDelimiter: '.',
        cacheGroups: {
          vendor: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
          icons: {
            name: 'icons',
            test: /[\\/]node_modules[\\/](@ant-design|antd)[\\/]/,
            priority: 15,
          },
          charts: {
            name: 'charts',
            test: /[\\/]node_modules[\\/](echarts|zrender|@antv)[\\/]/,
            priority: 15,
          },
        },
      });

    }
    // vite里的做法是，import md from 'markdown.md?raw'，这个是vite的内置语法
    memo.plugin('monaco-editor').use(MonacoWebpackPlugin, [
      { languages: ['javascript', 'json', 'python'] },
    ]);
    // memo.module
    //   .rule('worker')
    //   .test(/\.worker\.js$/)
    //   .use('worker-loader')
    //   .loader('worker-loader');
    memo.optimization.splitChunks({
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/](react|react-dom|@ant-design|antd|@antv)[\\/]$/,
          name: 'vendors',
          chunks: 'all',
        }
      }
    });
    // 如果build时找不到module错误，用如下方案解决
    // memo.module.rule('mjs').test(/\.mjs$/).include.add(/node_modules/).end().type('javascript/auto');

    return memo;
  },

  // externals:  process.env.CDN_REGION === 'EU' ? {}:{
  //   'react': 'window.React',
  //   'react-dom': 'window.ReactDOM',
  // },

  // // 引入被 external 库的 scripts
  // // 区分 development 和 production，使用不同的产物
  // scripts: scripts: process.env.CDN_REGION === 'EU' ? 
  // [
  //   'https://unpkg.com/react@18.2.0/umd/react.production.min.js',
  //   'https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js',
  // ]: process.env.NODE_ENV === 'development' ? [
  //   'https://gw.alipayobjects.com/os/lib/react/18.2.0/umd/react.development.js',
  //   'https://gw.alipayobjects.com/os/lib/react-dom/18.2.0/umd/react-dom.development.js',
  // ] : [
  //   'https://gw.alipayobjects.com/os/lib/react/18.2.0/umd/react.production.min.js',
  //   'https://gw.alipayobjects.com/os/lib/react-dom/18.2.0/umd/react-dom.production.min.js',
  // ],

  devtool: REACT_APP_ENV === 'dev' ? "source-map" : undefined,//线上关掉，不然会很慢
  devServer: {
    //注意devServer是umi的配置，不是webpack的配置，修改之后umi会自动合并到webpack的配置中，并且需要重启
    // 重启后在浏览器里还需要清空缓存，disable cache，并手动刷新才能生效
    port: 8009,
    headers: {
      // 'X-Frame-Options': 'DENY',  // 只允许同源的站点嵌入，实测在本地无效（gpt解释为localhost下，同源限制会放宽，或许使用ip访问也会生效？），
      // 但是gpt说在build后nginx服务器上可行，所以待验证

      // 'Content-Security-Policy': "frame-ancestors 'none'",//本地会生效
      // "Access-Control-Allow-Origin": "http://localhost:8009", //只允许同源访问，在别的域名下使用fetch时会报错
    }
  }
});
