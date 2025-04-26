```json
// tsconfig.json 配置
{
  "compilerOptions": { // 编译器选项
    "target": "ESNext",  // 指定ECMAScript目标版本 "ES3"（默认）， "ES5"，"ES6"/ "ES2015"， "ES2016"， "ES2017"或 "ESNext"
    "useDefineForClassFields": true, // 为类字段使用define
    "lib": ["DOM", "DOM.Iterable", "ESNext"], // 引入的库
    "declaration": true, // 生成对应的.d.ts文件
    "declarationDir": "./dist/types", // 生成对应的.d.ts文件的目录
    "allowJs": true, // 允许使用JS文件. 即js文件也会被编译，并生成对应的.d.ts文件.而js的.d.ts生成规则，可以在js文件里写 JSDoc 注释，见add.js里的注释格式
    "checkJs": true, // 检查JS文件,利用JSDoc注释，可以检查js文件

    "skipLibCheck": true, // "skipLibCheck": true, // 跳过第三方的lib检查，使用 "skipLibCheck": true 不会导致 TypeScript 编译器忽略您的应用代码中的类型错误。它只是跳过了对所有 .d.ts 文件的类型检查。这意味着：
    // 项目中的 TypeScript 代码 (*.ts, *.tsx) 仍然会被完全检查。
    // 来自于第三方声明文件的类型错误不会阻止编译过程。
    // 如果第三方库之间的类型定义有冲突，这些冲突也不会阻碍编译。


    "noEmit": true, // 不生成输出文件
    "allowImportingTsExtensions": true, // 允许导入.ts文件


    "declarationMap": false, // 指定编译时是否生成.map文件 ？
    "sourceMap": true, // 编译时是否生成.map文件 ？

    "esModuleInterop": false, // 不使用esModuleInterop
// esModuleInterop选项通常与导入CommonJS模块有关。在JavaScript中，存在两种主流的模块系统：ES6模块和CommonJS模块。TypeScript需要能够处理这两种形式的模块。
// 设置esModuleInterop为true时，TypeScript编译器会采用更加符合ES6模块规范的方式来导入CommonJS模块。具体来说，它允许你使用import foo from 'foo'的形式来导入没有默认导出的CommonJS模块，而不是使用import * as foo from 'foo'的形式。
// 启用esModuleInterop可以避免因CommonJS和ES6模块差异而导致的错误，并且它也会启用另一个选项allowSyntheticDefaultImports，这个选项允许你在类型检查时把命名导出当作默认导出来使用，它不改变代码输出，只影响类型检查阶段。


    "allowSyntheticDefaultImports": true, // 允许合成默认导入
    "strict": true, // 严格模式
    "forceConsistentCasingInFileNames": true, // 强制文件名大小写一致
    "module": "ESNext",  // 指定生成哪个模块系统代码:"None"， "CommonJS"， "AMD"， "System"， "UMD"， "ES6"或 "ES2015"
    
    "moduleResolution": "Node", // 模块解析方式查看是否为内置模块（如fs、path等）。 老的写法是用esModuleInterop:true + allowSyntheticDefaultImports:true
    // 尝试将导入路径视为文件，并按照.ts、.tsx、.d.ts、.js等后缀名依次查找。（如果不这么写，那么导入的时候就必须用完整路径，如./node_modules/antd/es/button）
    // 尝试将导入路径视为目录，寻找该目录下的package.json文件中指定的main字段，或者直接查找索引文件（默认为index.ts、index.tsx、index.d.ts、index.js等）。
    // 如果设置成其他值，比如"classic"，则使用TypeScript早期的模块解析策略，它相对简单，但不兼容Node.js模块解析机制。
    // 解决BUG: react-comps里的antd模块找不到，就是配置了这个解决的，说明在react-comps里的tsconfig.json里。


    "resolveJsonModule": true, // 解析JSON模块
    "isolatedModules": true, // 隔离模块
    "noEmit": true, // 不生成输出文件
    "jsx": "react-jsx", // JSX语法
    "baseUrl": ".", // 基本路径
    "newLine": "lf", // 当生成文件时指定行结束符： "crlf"（windows）或 "lf"（unix）
    "paths": {
      "@/*": ["./src/*"], // 路径别名
      // "sdlin-utils": ["../../sdlin-utils/src"],// 配置了这一项后，ts不去node_modules里找sdlin-utils，而是去../../sdlin-utils/src找。
      // 在vite.config.js里也有个alias配置，这个是vite的配置，tsconfig.json里的paths是ts的配置，是指定给Vite在开发服务器和生产构建中使用的。这允许你在开发过程中避免使用长且易出错的相对路径，并且确保构建时能够正确地解析这些路径。如果你只在Vite环境下开发并构建应用，那么在vite.config.js中的alias可能就足够了。然而，如果你还想要在你的编辑器（比如VS Code）中得到正确的路径解析、智能感知（IntelliSense）以及类型检查支持，那么你可能仍然需要在tsconfig.json或jsconfig.json中设置paths
    },
    "exclude": ["node_modules"]
  },
  "include": ["src"], // 包含的文件，也可以写"src/**/*.tsx"。意思是上述compilerOptions里的配置对这里的配置的目录或文件生效
  "references": [{ "path": "./tsconfig.node.json" }] // 引用的tsconfig文件
}


```