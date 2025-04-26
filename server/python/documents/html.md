# 1 `<script>` 标签的 `type` 属性解析

### `type="module"` 的含义

在 `<script>` 标签中添加 `type="module"` 表示该脚本应该被视为 JavaScript 模块，等价于：  type="text/javascript; charset=utf-8"。有以下特点：

1\. 启用严格模式（strict mode）

2\. 允许使用 `import` 和 `export` 语句

3\. 具有自己的作用域，不会污染全局命名空间

4\. 默认延迟加载（相当于添加了 `defer` 属性），意味着它们会在文档解析完成后执行，但在 DOMContentLoaded 事件之前执行

5\. 只在支持 ES6 模块的现代浏览器中有效

示例：
```html
<script type="module">
  import { someFunction } from './module.js';
  someFunction();
</script>
```

### `type` 属性的常见取值

`<script>` 标签的 `type` 属性有多种可能的取值，以下是一些常见的：

1. `text/javascript`（默认值）：标准的 JavaScript MIME 类型
2. `module`：表示脚本是一个 JavaScript 模块，
3. `text/ecmascript`：ECMAScript 脚本（较少使用）
4. `application/javascript`：另一种 JavaScript MIME 类型
5. `application/ecmascript`：另一种 ECMAScript MIME 类型
6. `text/babel`：用于 Babel 转换的 JavaScript 代码
7. `text/typescript`：TypeScript 代码
8. `application/json`：JSON 数据
9. `text/plain`：纯文本（不会被作为脚本执行）
10. `importmap`：用于定义 import maps

### 特殊用法

1. 自定义类型：
   可以使用自定义的 `type` 值来阻止脚本执行，常用于模板或数据存储。
   ```html
   <script type="text/template" id="my-template">
     <!-- 模板内容 -->
   </script>
   ```

2. 空字符串，或省略 `type` 属性：
   如果完全省略 `type` 属性，浏览器会默认将其视为 `text/javascript`。

### 注意事项

1. 某些框架或库可能会使用特定的 `type` 值，如 React 的 JSX 转换可能使用 `text/babel`。

# 2 <keep-alive>
- 允许某些组件（如 Web Workers、iframes、和视频/音频标签）在用户离开页面后仍然保存在内存中，这样当用户返回页面时可以快速恢复，提高页面的响应速度和性能。当一个元素被包含在一个 <keep-alive> 标签内时，这个元素对应的部分 DOM 结构会被缓存。这意味着即使这个组件的内容被重新渲染，其之前的 DOM 结构也不会被完全清除,留给下次使用。在单页应用中，当你在不同的页面之间切换时，不需要每次都重新加载相关的 DOM 元素，keep-alive 可以保持这些元素的状态，使得用户体验更为流畅。
然而keep-alive 并不会保持 DOM 元素的 data 属性或者 JavaScript 中的状态信息，它仅仅是为了保持 DOM 结构的缓存。如果你需要保持状态信息，通常需要使用其他的方法，例如使用状态管理库（如 Redux、Vuex），或者在组件的 constructor 中将状态保存在 this.state 中

# 3 异步加载：
- 方法1<script defer type=...../>，属性和属性名一样的，可像defer这样写。
defer的作用，异步加载且不卡住主线程渲染，比如在准备数据。仅 ie可用。等价于async，async所有浏览器都支持
执行时机：defer是整个html都解析完（注意：不是整个页面资源都加载完），才会执行defer的脚本，async是下载完立即执行。
- 方法2：
```js
var sc=document.createElement("script");
sc.type="text/javascript";
sc.src="/a.js"; //本句会开始启动下载，但不执行
document.head.appdendChild(sc)//加了本句，脚本才是可执行的，加载完就会执行
sc.onload=()=>{....}  
// onload在ie不兼容，ie用sc.readState,取值为loading->complete/loaded, sc.onreadystatechange=()=>{}
```

# 4 闭合和非闭合标签：
空元素是指那些不包含任何内容的元素。根据 HTML 规范，这些元素不应该有结束标签。常见的空元素包括，<br>：换行
<hr>：水平线
<img>：图片
<input>：输入框
<link>：定义外部资源链接
<meta>：元数据

对于空元素，你可以使用自闭合语法（例如，<br />）
在 HTML 中，正常元素不能使用自闭合语法。如果你写成 <div />，浏览器会将其解释为 <div> 开始标签，并认为接下来的内容是该 div 的子节点，直到遇到明确的结束标签 </div>。例如
<div id="a"/>
<div></div>
<div id="b"/>会被解析为<div id="a">
    <div></div>
<div id="b"></div>
</div>


# 5 内联（inline）特性

  1. 定义：
    内联元素是那些不会在新行开始的元素，它们通常在一行文本中流动。

  2. 特点：
    - 不会强制换行
    - 宽度和高度属性无效
    - 只能容纳文本或其他内联元素

  3. 常见的内联元素：
    `<span>`, `<a>`, `<strong>`, `<em>`, `<img>`, 以及默认情况下的 `<iframe>`

  ### 内联元素的宽度确定

  1. 内容宽度：
    内联元素的宽度主要由其内容（如文本、图片等）的宽度决定。

  2. 白空间处理：
    如果内联元素包含文本，其宽度还受到white-space属性的影响。

  3. 行框（line box）限制：
    内联元素的宽度会受到其所在行框的宽度限制。如果内容过长，可能会换行或溢出。

  4. 父容器影响：
    虽然内联元素不会自动填满父容器，但父容器的宽度会影响内联元素的换行行为。

  5. 替换元素例外：
    某些内联元素（如`<img>`和`<iframe>`）是替换元素，它们可以设置宽度和高度。

  6. margin/padding：
    只有左右方向的 margin 和 padding 会影响内联元素的布局，上下方向的 margin 和 padding 失效

  ### iframe 的特殊情况

  `<iframe>` 元素虽然默认为内联元素，但它同时也是一个替换元素：默认宽度：如果未指定宽度，iframe 通常会采用一个默认宽度（可能是 300px 或由浏览器决定）。

# 6. 手机版调试
1. 使用远程调试（没试过）：
   - 将手机通过USB连接到电脑。
   - 在手机上启用USB调试（在开发者选项中）。
   - 在电脑的Chrome浏览器中访问 `chrome://inspect/#devices`。
   - 你应该能看到你的设备和打开的标签页。
   - 点击"inspect"来打开开发者工具，你可以像在桌面版一样使用控制台和网络面板。

2. 使用内置日志查看器：
   - 在你的应用中添加一个简单的日志查看器组件。
   - 将console.log替换为自定义的日志函数，将消息存储在内存或本地存储中。
   - 添加一个隐藏的手势或按钮来显示日志查看器。

   示例代码：
   ```javascript
   let logs = [];
   
   function customLog(...args) {
     const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
     logs.push(message);
     console.log(...args);  // 保留原始的console.log
   }
   
   // 在组件中
   const [showLogs, setShowLogs] = useState(false);
   
   // 在JSX中
   {showLogs && (
     <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', overflow: 'auto', zIndex: 9999}}>
       {logs.map((log, index) => <div key={index}>{log}</div>)}
     </div>
   )}
   <button onClick={() => setShowLogs(!showLogs)}>Toggle Logs</button>
   ```

3. 使用第三方工具：
   - Eruda：一个专为手机网页前端调试的工具。
   - 在你的页面中添加以下代码：
     ```html
     <script src="//cdn.jsdelivr.net/npm/eruda"></script>
     <script>eruda.init();</script>
     ```

4. 使用云端服务：
   - 例如 LogRocket 或 Sentry 这样的服务可以捕获和记录前端错误和网络请求。
   - 需要在应用中集成这些服务的SDK。

# 7. svg
remix上的svg默认大小是很大的，没有设置颜色，需要设置fill,width,height, 另外水平对齐是baseline,居中需要设置vertical-align:middle
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue" width="20" height="20" style={{ verticalAlign: 'middle' }}>

