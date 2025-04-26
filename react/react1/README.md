# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


微应用分为有 webpack 构建和无 webpack 构建项目，有 webpack 的微应用（主要是指 Vue、React、Angular）需要做的事情有：

新增 public-path.js 文件，用于修改运行时的 publicPath。什么是运行时的 publicPath ？。
注意：运行时的 publicPath 和构建时的 publicPath 是不同的，两者不能等价替代。
微应用建议使用 history 模式的路由，需要设置路由 base，值和它的 activeRule 是一样的。
在入口文件最顶部引入 public-path.js，修改并导出三个生命周期函数。
修改 webpack 打包，允许开发环境跨域和 umd 打包。
主要的修改就是以上四个，可能会根据项目的不同情况而改变。例如，你的项目是 index.html 和其他的所有文件分开部署的，说明你们已经将构建时的 publicPath 设置为了完整路径，则不用修改运行时的 publicPath （第一步操作可省）。

无 webpack 构建的微应用直接将 lifecycles 挂载到 window 上即可。


<!-- 如何修改为微应用 start-->
以 create react app 生成的 react 16 项目为例，搭配 react-router-dom 5.x。

在 src 目录新增 public-path.js：
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

设置 history 模式路由的 base：
<BrowserRouter basename={window.__POWERED_BY_QIANKUN__ ? '/app-react' : '/'}>

入口文件 index.js 修改，为了避免根 id #root 与其他的 DOM 冲突，需要限制查找范围。
import './public-path'; //本句务必放到第一行
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

function render(props) {
  const { container } = props;
  ReactDOM.render(<App />, container ? container.querySelector('#root') : document.querySelector('#root'));
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log('[react16] react app bootstraped');
}

export async function mount(props) {
  console.log('[react16] props from main framework', props);
  render(props);
}

export async function unmount(props) {
  const { container } = props;
  ReactDOM.unmountComponentAtNode(container ? container.querySelector('#root') : document.querySelector('#root'));
}
这里需要特别注意的是，通过 ReactDOM.render 挂载子应用时，需要保证每次子应用加载都应使用一个新的路由实例。


修改 webpack 配置
安装插件 @rescripts/cli，当然也可以选择其他的插件，例如 react-app-rewired。
npm i -D @rescripts/cli
根目录新增 .rescriptsrc.js：
const { name } = require('./package');
module.exports = {
  webpack: (config) => {
    config.output.library = `${name}-[name]`;
    config.output.libraryTarget = 'umd';
    // webpack 5 
    config.output.chunkLoadingGlobal = `webpackJsonp_${name}`;
    //webpack 4
    //config.output.jsonpFunction = `webpackJsonp_${name}`; 
    config.output.globalObject = 'window';

    return config;
  },

  devServer: (_) => {
    const config = _;

    config.headers = {
      'Access-Control-Allow-Origin': '*',
    };
    config.historyApiFallback = true;
    config.hot = false;
    //webpack4写法： config.watchContentBase = false;
    //webpack5写法
    config.static={watch:true}
    config.liveReload = false;

    return config;
  },
};
修改 package.json：
-   "start": "react-scripts start",
+   "start": "rescripts start",
-   "build": "react-scripts build",
+   "build": "rescripts build",
-   "test": "react-scripts test",
+   "test": "rescripts test",
-   "eject": "react-scripts eject"