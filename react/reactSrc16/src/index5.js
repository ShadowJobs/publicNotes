/**
 * 在v4的基础上，增加了diff算法，实现了dom的增删改
 */
import React from "./mReactV5"
const updateValue = (e) => {
  rerender(e.target.value)
}

const e1=<div>aa</div>
const E2=({vl})=><h2>{vl}</h2>

console.log(e1)
console.log(<E2 vl="el2vv"/>)

const changeContent = (value) => {
  const element = <div>
    <h2 title="hhh">
      hello,{value} v5
    </h2>
    <a href="https://www.qq.com">link</a>
  </div>
  const root = document.getElementById("root")
  React.render(element, root)
}
const rerender = (value) => {
  const element = <div>
    在v4的基础上，增加了diff算法，实现了dom的增删改
    <h2 title="hhh">
      hello,{value} v5
    </h2>
    <input onInput={updateValue} value={value} />
    <button onClick={changeContent}>Change content</button>
    <a href="https://www.qq.com">link</a>
    {e1}
    {/* <E2 vl="e2value"/> */}
  </div>
  const root = document.getElementById("root")
  React.render(element, root)
}

rerender("world")
