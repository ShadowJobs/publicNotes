### 创建项目
vue create my-project-name
创建时选择手动配置，注意tailwindcss的安装，应该选择支持，否则，如果是独立项目则没问题，可以run，如果是vue是一个monorepo的子项目，则会报错（点开页面时的运行时错误）

Cannot read properties of undefined (reading 'config')

跟tailwind,postcss有关的。
解决:
1. 创建时用 pnpm create vue@latest vue3proj (不一定非要这一步)
2. vue项目里添加tailwind.config.js 这是关键;只要是使用了css的vue，必须添加这个文件
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
***
***