# vite与webpack的区别
- 开发使用esbuild，快，打包使用rollup，解决兼容性问题
- nobundle , vite不会打包，而是使用esbuild实时编译
- 只针对web, 所以很多配置都预设置了

# 简单的vite项目搭建
必须以要有index.html ,注意<script>标签的type="module"
默认支持es6模块化, ts, jsx, 

# loader 
类似webpack，vite里的rollup读取文件内容的rawloader写法如下
import md from 'a.md?raw';