# 1, 等号运算符的运算和转换规则
    从上到下按照规则比较，直到能得到确切结果为止：

  - 两端类型相同，比较值
  - 两端存在NaN,返回 false
  - undefined 和 null只有与自身比较，或者互相比较时，才会返回true
  - 两端都是原始类型，转换成数字比较；一端是原始类型，一端是对象类型，把对象转换成原始类型后进入第1步
  - 对象如何转原始类型？
  - 如果对象拥有[Symbol.toPrimitive]方法，调用该方法 若该方法能得到原始值，使用该原始值； 若得不到原始值，抛出异常
  - 调用对象的valueOf方法 若该方法能得到原始值，使用该原始值； 若得不到原始值，进入下一步
  - 调用对象的tostring方法 若该方法能得到原始值，使用该原始值； 若得不到原始值，抛出异常

# 2, 标签模板
```js
//1， 格式化日期
function formatDate(strings, ...values) {
    return strings.reduce((acc, str, i) => {
        let value = values[i - 1];
        if (value instanceof Date) {
            value = value.toISOString().split('T')[0]; // 格式化日期为 YYYY-MM-DD
        }
        return acc + value + str;
    });
}

const date = new Date();
const result = formatDate`Today's date is ${date}`;
console.log(result); // 输出: Today's date is YYYY-MM-DD

//2， 防止 XSS 攻击
function sanitize(strings, ...values) {
    const sanitizeValue = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                                                  .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
                                                  .replace(/'/g, '&#39;');
    return strings.reduce((acc, str, i) => acc + str + (values[i] ? sanitizeValue(values[i]) : ''), '');
}

const input = '<script>alert("XSS")</script>';
const result = sanitize`User input: ${input}`;
console.log(result); // 输出: User input: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;

// 3， 多语言支持
// 4， 格式化货币 

```

# 3, node
node 由16或18升级到23后，报错 node:internal/crypto/hash:79

code: 'ERR_OSSL_EVP_UNSUPPORTED'

解决：
方法1，修改package.json中的scripts，添加set NODE_OPTIONS=--openssl-legacy-provider（Windows）或export NODE_OPTIONS=--openssl-legacy-provider（Mac/Linux）

方法2： cross-env NODE_OPTIONS=--openssl-legacy-provider REACT_APP_ENV=dev UMI_ENV=dev umi dev

直接写到.zshrc里的话，如果build里又有NODE_OPTIONS的设置，那么zshrc里的设置会被覆盖，所以多个options写法："build": "cross-env NODE_OPTIONS='--max_old_space_size=8192 --openssl-legacy-provider' umi build"

## npx 

1. 基本概念
npx 是 npm (Node Package Manager) 从版本 5.2.0 开始引入的一个工具，它主要用于解决以下问题：
- 临时执行 npm 包中的二进制文件/命令
- 避免全局安装包
- 使用不同版本的包
1) 优先在本地 node_modules/.bin 路径中查找可执行文件
2) 如果找不到，会临时从 npm 仓库下载对应的包来执行
3) 执行完成后，如果是临时下载的包会自动删除

2. 主要用途

a) 执行一次性命令
```bash
# 不需要全局安装，直接运行 create-react-app
npx create-react-app my-app
```

b) 执行本地安装的模块
```bash
# 运行项目中安装的 webpack
npx webpack --config webpack.config.js
```

c) 指定版本运行
```bash
# 运行特定版本的 npm 包
npx cowsay@2.0.0 "Hello"
```

4. 高级用法示例

```bash
# 使用 --no-install 标志强制使用本地安装的包
npx --no-install webpack

# 使用 --ignore-existing 标志强制从远程下载
npx --ignore-existing create-react-app my-app

# 指定 node 版本运行命令
npx -p node@14 node -v
```

5. 与 npm run 的区别
- npm run 执行 package.json 中定义的脚本
- npx 直接执行包的二进制文件，不需要配置脚本

示例对比：
```json
{
  "scripts": {
    "webpack": "webpack --config webpack.config.js"
  }
}
```

```bash
# 使用 npm run
npm run webpack

# 使用 npx
npx webpack --config webpack.config.js
```

## package.json "preinstall": "npx only-allow pnpm"指令
only-allow 是一个检查包管理器的小工具
### `only-allow` 工具的实现原理

`only-allow` 通过检查环境变量来判断当前使用的包管理器：

```javascript
function getPackageManager() {
  // npm 设置 npm_config_user_agent 环境变量
  // yarn 设置 npm_config_user_agent 环境变量，但内容不同
  // pnpm 设置 npm_execpath 环境变量，包含 pnpm 字样
  
  if (process.env.npm_config_user_agent?.includes('pnpm')) return 'pnpm';
  if (process.env.npm_config_user_agent?.includes('yarn')) return 'yarn';
  if (process.env.npm_execpath?.includes('pnpm')) return 'pnpm';
  if (process.env.npm_execpath?.includes('yarn')) return 'yarn';
  return 'npm'; // 默认
}
```
