# 一. tailwind css 
  1. 安装和配置 Tailwind CSS:
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  # 生成 Tailwind 配置文件
  npx tailwindcss init -p
  然后修改tailwind.config.cjs,可以直接参考本项目里的配置
  ```
  2. 创建主 CSS 文件 (src/input.css):
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

  3. 在 package.json 中添加构建命令:
  ```json
    "scripts": {
      "build": "tailwindcss -i ./src/input.css -o ./dist/output.css --watch"
    }
  ```

  4. 在 入口tsx 文件中引入 CSS 文件

  ## 常用类名说明

  ### 1. 布局
  - `container`: 响应式容器
  - `flex`: Flex 布局
  - `grid`: Grid 布局
  - `hidden/block`: 显示/隐藏

  ### 2. 间距
  - `p-{size}`: padding
  - `m-{size}`: margin
  - `space-x-{size}`: 水平间距
  - `space-y-{size}`: 垂直间距

  ### 3. 尺寸
  - `w-{size}`: 宽度
  - `h-{size}`: 高度
  - `max-w-{size}`: 最大宽度

  ### 4. 颜色
  - `text-{color}`: 文字颜色
  - `bg-{color}`: 背景颜色
  - `border-{color}`: 边框颜色
  - bg-[#D1E9FF]/50: 背景颜色透明度,50%
  - rounded-2xl: 圆角从 rounded（默认较小）到 rounded-xl、rounded-2xl 等，rounded-2xl 会让元素的角更加圆润

  ### 5. 响应式前缀
  - `sm:`: >= 640px
  - `md:`: >= 768px
  - `lg:`: >= 1024px
  - `xl:`: >= 1280px
  - `2xl:`: >= 1536px

  ### 6. 基本单位
  - w-20: 宽度 5rem 不写单位就是0.25rem，带单位写法： w-[20px]


  ## 最佳实践

  1. 组件提取
  ```javascript
  // 可以使用 @apply 指令创建可复用的组件样式
  @layer components {
    .btn-primary {
      @apply py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600;
    }
  }
  ```

  2. 自定义配置
  ```javascript
  // tailwind.config.js
  module.exports = {
    theme: {
      extend: {
        colors: {
          'brand': '#ff0000',
        },
        spacing: {
          '128': '32rem',
        }
      }
    }
  }
  ```

  注意事项： 开发环境文件可能较大,生产环境会自动优化

## 底层原理：

1. 预处理和构建过程
```javascript
// tailwind.config.js - 配置文件
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'], // 扫描文件
  theme: {
    extend: {} // 主题配置
  },
  plugins: [] // 插件配置
}
```

2. JIT(Just-In-Time)引擎原理
<div class="text-sm md:text-base hover:text-blue-500">
编译后：
```css
/* 按需生成的CSS */
.text-sm { font-size: 0.875rem; }
@media (min-width: 768px) {
  .md\:text-base { font-size: 1rem; }
}
.hover\:text-blue-500:hover { color: #3B82F6; }
```

3. 工作流程：
```
源代码 
-> 扫描HTML/JS文件 
-> 提取Utility Classes 
-> 生成对应CSS 
-> 压缩优化 
-> 最终CSS文件
```

4. 核心概念实现：

a) 原子类生成：
```javascript
// 内部实现示意
const utilities = {
  'text-sm': {
    fontSize: '0.875rem'
  },
  'bg-blue-500': {
    backgroundColor: '#3B82F6'
  }
}
```

b) 响应式设计：
```javascript
// 断点系统实现
const screens = {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px'
}
```

5. 变体系统(Variants)：
```javascript
// 伪类和状态变体
const variants = {
  hover: selector => `${selector}:hover`,
  focus: selector => `${selector}:focus`,
  dark: selector => `.dark ${selector}`
}
```

6. 插件系统：
```javascript
// 自定义插件示例
const plugin = require('tailwindcss/plugin')

module.exports = plugin(function({ addUtilities }) {
  addUtilities({
    '.custom-class': {
      'property': 'value'
    }
  })
})
```

7. PurgeCSS 集成：
```javascript
// 清除未使用的样式
module.exports = {
  purge: {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    options: {
      safelist: ['safe-class']
    }
  }
}
```

## group用法
`tailwindcss group` 是 Tailwind CSS 中一个非常强大的功能，它允许你**基于父元素的状态来控制子元素的样式**。  简单来说，就是当一个父元素应用了 `group` 类后，它的子元素就可以使用 `group-*` 变体 (variants) 来定义样式，这些样式只有在父元素处于特定状态时才会生效。

**核心概念:**

* **`group` 类 (Parent Element):**  你需要在一个父元素上添加 `group` 类。 这个类本身不应用任何样式，它的作用是**标记这个元素作为一个 "group"**，使得它的子元素可以使用 `group-*` 变体。

* **`group-*` 变体 (Child Elements):**  在 `group` 类的子元素上，你可以使用 `group-hover:`, `group-focus:`, `group-active:`, `group-disabled:` 等变体前缀，来定义只有当 **父元素** 处于 `:hover`, `:focus`, `:active`, `:disabled` 等状态时才应用的样式。

**工作原理:**

Tailwind CSS 的 `group-*` 变体实际上是利用了 CSS 的**选择器优先级**和 **状态伪类**。  当你在父元素上添加 `group` 类，并在子元素上使用 `group-hover:text-red-500` 这样的类时，Tailwind CSS 会在编译时生成类似这样的 CSS 规则：

```css
.group:hover .group-hover\:text-red-500 { /* 注意转义字符 \ */
  --tw-text-opacity: 1;
  color: rgb(248 113 113 / var(--tw-text-opacity)); /* text-red-500 的颜色值 */
}
```

**关键点:**

* **父元素需要有 `group` 类:**  `group-*` 变体只有在子元素所属的父元素上存在 `group` 类时才会生效。
* **基于父元素状态:**  `group-*` 变体是基于 **父元素** 的状态 (例如 `:hover`, `:focus`) 来触发子元素的样式变化，而不是子元素自身的状态。
* **常见的 `group-*` 变体:**
    * `group-hover:`  父元素 `:hover` 时生效
    * `group-focus:`  父元素 `:focus` 时生效
    * `group-active:` 父元素 `:active` 时生效
    * `group-disabled:` 父元素 `:disabled` 时生效
    * `group-focus-within:` 父元素或其后代元素 `:focus-within` 时生效 (当父元素或其任何后代元素获得焦点时触发)
    * 还有一些响应式断点变体，例如 `group-md:`, `group-lg:` 等，可以结合断点一起使用。

**常见使用场景:**

* **导航菜单 (Nav Menu):**  当鼠标悬停在整个导航菜单项 (父元素) 上时，改变菜单项内的图标或文字颜色 (子元素)。
* **卡片组件 (Card Component):**  当鼠标悬停在卡片上时，显示卡片的阴影、边框，或者改变卡片内按钮的样式。
* **列表项 (List Item):**  当鼠标悬停在列表项上时，改变列表项的背景色或突出显示。
* **任何需要在父元素状态改变时，同时影响多个子元素样式的场景。**

**优势:**

* **代码更简洁、语义化:**  使用 `group-*` 变体可以更清晰地表达样式之间的父子关系和状态依赖，代码更易读和维护。
* **避免复杂的 CSS 选择器:**  相比于手写复杂的 CSS 选择器 (例如 `nav:hover li a`),  `group-*` 变体更加方便快捷。
* **Tailwind CSS 生态系统的优势:**  可以充分利用 Tailwind CSS 提供的各种原子类和变体组合，快速构建复杂的交互效果。

**代码示例:**

```html
<div class="group bg-gray-100 p-4 rounded-md hover:bg-gray-200 cursor-pointer">
  <h2 class="text-lg font-semibold group-hover:text-blue-500">
    卡片标题
  </h2>
  <p class="text-gray-500 group-hover:text-gray-700">
    卡片内容描述...
  </p>
  <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4 group-hover:bg-green-500">
    按钮
  </button>
</div>
```

**解释:**

* 最外层的 `div` 添加了 `group` 类，标记为父元素。
* 当鼠标悬停在 `div.group` 上时 (`hover:bg-gray-200`)，背景色会变成更浅的灰色。
* `h2` 元素使用了 `group-hover:text-blue-500`，所以当父元素 `div.group` 被悬停时，标题文字颜色会变成蓝色。
* `p` 元素使用了 `group-hover:text-gray-700`，内容描述文字颜色也会在父元素悬停时变深。
* `button` 元素使用了 `group-hover:bg-green-500`，按钮的背景色在父元素悬停时会变成绿色 (覆盖了按钮自身的 `hover:bg-blue-600` 样式，因为 `group-hover` 的优先级更高)。

**总结:**

`tailwindcss group` 功能提供了一种优雅且强大的方式，来基于父元素的状态控制子元素的样式。  它使你的 Tailwind CSS 代码更加简洁、语义化，并能更方便地实现复杂的交互效果。  理解和熟练运用 `group-*` 变体是提升 Tailwind CSS 开发效率和代码质量的关键。

## @apply用法：
  1. @apply 的基本概念：
    - @apply 允许你在 CSS 中直接使用 Tailwind 的工具类。
    - 它可以将多个 Tailwind 类合并到一个自定义的 CSS 规则中。

  2. @apply 的用途：
    - 当你需要在 CSS 文件中应用 Tailwind 类时使用，而不是在 HTML 中。
    - 适用于需要覆盖第三方组件样式的情况，比如Ant Design 组件。你自定义或覆盖第三方组件的样式，同时保持 Tailwind 的语法和设计系统。

  3. 示例解释: 参考vitereact/index.css里的apply

## 默认p-4,手机上需要设置为p-0写法： className="p-0 md:p-4" md:p-4 表示在中等屏幕及以上（≥768px）应用 1rem 的 padding
注意顺序： 必须先写p-0，再写md:p-4，否则会被覆盖

# 二. css-in-js 
先定义一个index.css， 里面放置通用的变量等
```css
:root {
  --primary-color:rgb(1, 99, 245);
  --padding: 2px;
  --padding-small: 4px;
  --padding-medium: 8px;
  --padding-large: 16px;
}
```
然后在tsx里使用css-in-js
```jsx
import styled from 'styled-components'
const Button = styled.button<{ size: string }>`
  color: var(--primary-color);
  ${({ size }) => css`
    padding: var(--padding-${size});
  `}
`
const ButtonWithSize = ({size})=>{
  return <Button size={size}>Click me</Button>
}
使用的时候
<ButtonWithSize size="small"/>
```

### 原理： 
1. 基本原理
```javascript
// 基础实现示例
const styles = {
  container: {
    color: 'red',
    fontSize: '14px'
  }
}

// 运行时将JS对象转换为CSS并注入到DOM
```

2. 常见实现方式：

A. Styled-components实现：
```javascript
// 带标签的模板字符串实现
const Button = styled.button`
  color: ${props => props.primary ? 'blue' : 'gray'};
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
`;

// 使用
<Button primary>Primary Button</Button>
```

B. Emotion实现：
```javascript
// @emotion/react方式
const style = css`
  background-color: hotpink;
  &:hover {
    color: ${props => props.color};
  }
`

// 使用
<div css={style}>This has a hotpink background.</div>
```

3. 动态样式处理：
```javascript
// props驱动的样式
const DynamicComponent = styled.div`
  background: ${props => props.bg};
  padding: ${props => props.big ? '50px' : '20px'};
`;

// 主题支持
const theme = {
  colors: {
    primary: 'blue',
    secondary: 'gray'
  }
};

const ThemedButton = styled.button`
  color: ${props => props.theme.colors.primary};
`;
```

4. 样式注入机制：
```javascript
// 运行时样式注入
function insertStyle(id, css) {
  if (!document.querySelector(`#${id}`)) {
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = css;
    document.head.appendChild(style);
  }
}
```

5. 性能优化：
```javascript
// 样式缓存
const styleCache = new Map();

function getStyles(props) {
  const key = JSON.stringify(props);
  if (styleCache.has(key)) {
    return styleCache.get(key);
  }
  const styles = computeStyles(props);
  styleCache.set(key, styles);
  return styles;
}
```

6. SSR支持：
```javascript
// 服务端渲染支持
import { ServerStyleSheet } from 'styled-components';

const sheet = new ServerStyleSheet();
try {
  const html = renderToString(sheet.collectStyles(<App />));
  const styleTags = sheet.getStyleTags();
} finally {
  sheet.seal();
}
```

7. 工具函数：
```javascript
// 常用工具函数
const cssToObject = (css) => {
  return css.split(';')
    .filter(Boolean)
    .reduce((acc, current) => {
      const [property, value] = current.split(':');
      acc[property.trim()] = value.trim();
      return acc;
    }, {});
};
```

8. 样式组合：
```javascript
// 样式继承和组合
const BaseButton = styled.button`
  padding: 10px;
  border-radius: 4px;
`;

const PrimaryButton = styled(BaseButton)`
  background: blue;
  color: white;
`;
```

9. 全局样式：
```javascript
// 全局样式定义
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
  }
`;
```

10. 实际应用示例：
```javascript
// React组件中的完整示例
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.primary};
  font-size: 24px;
  margin-bottom: 16px;
`;

function ProductCard({ product }) {
  return (
    <Card>
      <Title>{product.name}</Title>
      <p>{product.description}</p>
    </Card>
  );
}
```

使用建议：

1. 性能考虑：
```javascript
// 使用memo避免不必要的重渲染
const StyledComponent = React.memo(styled.div`
  // styles
`);

// 提取静态样式
const staticStyles = css`
  // 静态样式定义
`;
```


# 三. module css
普通的css方式是直接在tsx里import "./x.css"，但是这样会导致全局污染，而module css则是局部作用域，不会污染全局，但是需要在webpack配置里加入module: true
具体方式是将x.css 改为 x.module.css，然后在tsx里import styles from "./x.module.css"，然后使用styles.xxxx
底层的原理是： 
1. 局部作用域
```jsx
// Button.jsx
import styles from './Button.module.css'
function Button() {
  // 实际渲染的类名会被转换为唯一的标识符
  // 比如 'Button_button_xk9sb'
  return <button className={styles.button}>Click me</button>
}
```

2. 编译原理：
- 在构建时，CSS Modules 会将类名转换为唯一的标识符
- 生成一个 CSS 文件，包含所有转换后的类名
- 生成一个 JavaScript 对象，映射原始类名和转换后的类名

3. 实现方式：
```javascript
// 构建工具会将CSS Module转换为类似这样的结构
{
  'button': 'Button_button_xk9sb'
}
```

4. 主要特点：
```css
/* 支持组合 */
.button {
  composes: base from './base.css';
  color: red;
}

/* 支持全局作用域 */
:global(.global-class) {
  color: blue;
}
```

5. 使用场景示例：
```jsx
// 多个类名 条件类名
<div className={`${styles.container} ${styles.active}`}>
<div className={isActive ? styles.active : styles.inactive}>
```

6. 调试支持：
```css
/* 开发环境会保留原始类名信息 */
.Button_button_xk9sb /* button */
```

7. 注意事项：
```css
/* 避免使用全局选择器 */
* { margin: 0; } // 不推荐

/* 优先使用类选择器 */
.button { color: red; } // 推荐
```

8. 实际运行时：
```html
<!-- 编译前 -->
<button class="button">

<!-- 编译后 -->
<button class="Button_button_xk9sb">
```