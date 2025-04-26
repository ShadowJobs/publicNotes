// v1，手写一个render。（数据来自babel-loader的转换jsx后的对象）
import React from "react"
// 这里会调用React.createElement方法,所以本例先借用React的方法
const element=<h1 title="hhh">hello,world 解析自jsx语法 v1</h1>
// element编译结果为// createElement("h1", {
//   title: "hhh"
// }, "hello,world")

console.log(element)
// 输出结果为{
//   "type": "h1",
//   "key": null,
//   "ref": null,
//   "props": {
//       "title": "hhh",
//       "children": "hello,world"
//   },
//   "_owner": null,
//   "_store": {}
// }

const pnode=document.getElementById("root")
const node=document.createElement("h2")
node.title="hhh"
node.appendChild(document.createTextNode("hello,手写文字"))
pnode.appendChild(node) 

const pnode2=document.createElement(element.type)
pnode2.title=element.props.title
pnode2.appendChild(document.createTextNode(element.props.children))
pnode.appendChild(pnode2)