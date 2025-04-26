# 依赖安装规则
比如 A 模块是 B 模块的插件。用户安装的 B 模块是 1.0 版本，但是 A 插件只能和 2.0 版本的 B 模块一起使用。这时，用户要是将 1.0 版本的 B 的实例传给 A，就会出现问题。因此，需要一种机制，在模板安装的时候提醒用户，如果 A 和 B 一起安装，那么 B 必须是 2.0 模块。

peerDependencies 字段就是用来供插件指定其所需要的主工具的版本。
上面代码指定在安装 chai-as-promised 模块时，主程序 chai 必须一起安装，而且 chai 的版本必须是 1.x。如果项目指定的依赖是 chai 的 2.0 版本，就会报错。

需要注意，从 npm 3.0 版开始，peerDependencies 不再会默认安装了。从7.0开始，又会默认安装了。在 npm 7.0 及以后，peerDependencies 会被自动安装（除非有冲突），并且 npm 会尝试解决版本冲突。
--legacy-peer-deps 选项是为了向后兼容并模拟旧的行为。使用这个选项运行 npm install 时，npm 将忽略 peerDependencies 自动安装的行为，而是像 npm v6 及以前的版本那样处理它们。也就是说，即使有 peerDependencies 冲突，npm 也不会自动尝试解决它们，也不会抛出错误，只是给出警告信息。开发者需要自己手动解决任何潜在的冲突，并确保所有的 peerDependencies 被满足。

# 命令
可以直接用shell语法,如果没有定义 start 脚本，npm start 有一个默认行为（尝试运行 node server.js）。
npm run start 在没有定义 start 脚本时会报错。
```json
{
  "scripts": {
      "dev": "./node_modules/webpack/bin/webpack.js --config ./webpack.config.js --watch --env.dev true",
      "build": "if [ -z $pub ]; then pub=false;fi && ./node_modules/webpack/bin/webpack.js --config ./webpack.config.js --env.pub $pub"
  }, 
  "devDependencies": {
      "copy-webpack-plugin": "^6.0.2",
      "webpack": "^3.12.0"
  },
  //publishConfig决定了我们发布包发布到哪里去，此时发布包就不是往 www.npmjs.com/ 了
  "publishConfig": {
    "registry": "http://a/nexus/repository/npm-hosted/"
  }
}
```

本json来源于nodejs+npm，[官方文档](http://nodejs.cn/learn/the-package-json-guide) ,
[补充](https://www.cnblogs.com/ForeverS2C/p/13773584.html)

module：打包的入口文件，

main:npm包的入口文件 

typins:Typescript入口 

files:[],发布package时，控制哪些文件会发布上传到远程，
即使不在 "files" 列表中，npm 也会自动包含某些文件，如：
  package.json
  README
  CHANGES / CHANGELOG / HISTORY
  LICENSE / LICENCE
  NOTICE
  主文件（即 "main" 字段指定的文件）
如果没有 "files" 字段，npm 默认会包含所有文件，除了 .gitignore 中指定的文件。
可以使用 .npmignore 文件来进一步排除文件，它的优先级高于 "files" 字段。


gitHooks，代码质量检查，
"gitHooks": {"pre-commit": "lint-staged","commit-msg": "node scripts/verify-commit-msg.js"} 

config：设置一些用于npm包的脚本命令会用到的配置参数 

engines：指定项目所需要的node.js版本  

browserslist：支持的浏览器 
```json
"type":"module"//对于import的使用个，需要添加这个参数才行。因为node环境下默认是require，如果不加这个参数，
//等价的方式1： 也可以将.js改成.mjs，node也能找到，否则使用import的地方会找不到。
//等价的方式3： 在使用的<script>里加上type="module"

"types": "dist/index.d.ts"
"typings": "dist/index.d.ts" 同types
//指定ts的类型文件，注意，这里不用./开头（antd的package.json中的typings字段就是这样的）
<!-- 下面的配置冗余，但是得写上 -->
"main": "./dist/ly-utils.umd.js",
"module": "./dist/ly-utils.es.js",
"exports": {
  ".": {
    "import": "./dist/ly-utils.es.js",
    "require": "./dist/ly-utils.umd.js",
    "types": "./types/index.d.ts"
  }
},
```

[browser,module,main的区别](https://www.cnblogs.com/h2zZhou/p/12929472.html)

npm 包分为：
只允许在客户端使用的，只允许造服务端使用的， 浏览器/服务端都可以使用。
如果我们需要开发一个 npm 包同时兼容支持 web端 和 server 端，需要在不同环境下加载npm包不同的入口文件，显然一个 main 字段已经不能够满足我们的需求，这就衍生出来了 module 与 browser 字段。

main : 定义了 npm 包的入口文件，browser 环境和 node 环境均可使用

module : 定义 npm 包的 ESM 规范的入口文件，browser 环境和 node 环境均可使用

browser : 定义 npm 包在 browser 环境下的入口文件

config 字段用来配置 scripts 运行时的配置参数，如下所示：
"config": {"port": 3000}
如果运行 npm run start，则 port 字段会映射到npm_package_config_port环境变量中：
console.log(process.env.npm_package_config_port) // 3000
用户可以通过npm config set foo:port 3001 命令来重写 port 的值。

bin 字段用来指定各个内部命令对应的可执行文件的位置：

"bin": {
  "someTool": "./bin/someTool.js"
}
这里，someTool 命令对应的可执行文件为 bin 目录下的 someTool.js，someTool.js 会建立符号链接 node_modules/.bin/someTool。由于 node_modules/.bin / 目录会在运行时加入系统的 PATH 变量，因此在运行 npm 时，就可以不带路径，直接通过命令来调用这些脚本。因此，下面的写法可以简写：

scripts: {  
  start: './node_modules/bin/someTool.js build'
}
 
// 简写
scripts: {  
  start: 'someTool build'
}
所有 node_modules/.bin / 目录下的命令，都可以用 npm run [命令] 的格式运行。

上面的配置在 package.json 包中提供了一个映射到本地文件名的 bin 字段，之后 npm 包将链接这个文件到 prefix/fix 里面，以便全局引入。或者链接到本地的 node_modules/.bin / 文件中，以便在本项目中使用。

eslint 的配置可以写在单独的配置文件. eslintrc.json 中，也可以写在 package.json 文件的 eslintConfig 配置项中。
```json
"eslintConfig": {
  "root": true,
  "env": {
    "node": true
  },
  "extends": [
    "plugin:vue/essential",
    "eslint:recommended"
  ],
  "rules": {},
  "parserOptions": {
    "parser": "babel-eslint"
  },
}
```

# imports 
```json
{
  "imports": {
    "#minpath": { //import {minpath} from '#minpath' 会自动查找到default （浏览器环境）别名必须以 # 开头，以便与常规的 npm 包或内置模块区分开。
// 路径映射可以指向文件或目录，而且可以使用通配符。
// 导入时使用的别名需要与 package.json 中定义的别名完全匹配。
      "node": "./lib/minpath.js",
      "default": "./lib/minpath.browser.js"
    },
    "#minproc": {
      "node": "./lib/minproc.js",
      "default": "./lib/minproc.browser.js"
    }
  }
}
```