export const renderToRoot=(React,version)=>{
  const element=<div>
    <div title="hhh">
      hello,world 解析自jsx语法 {version}
    </div>
    <a href="https://www.qq.com">link</a>
  </div>
  // 这里element会调用createElement = (type, props, ...children)，来自babel-loader的转换

  const root=document.getElementById("root")
  React.render(element,root)
}