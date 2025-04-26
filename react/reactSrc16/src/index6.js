/**
 * 在v5的基础上，增加了对函数组件的支持
 */
import React from "./mReactV6"

const e1=<div>e1aa</div>
const E2=(props)=>{
  console.log(props)
  return <h2>{props.vl}<span>e2 child 2</span>{props?.children[0]}</h2>
}
const E3=({vl})=><E2 vl={vl}>xx</E2>
console.log(e1)
console.log(<>bbb</>)

const root = document.getElementById("root")
React.render(<>
  在v5的基础上，增加了对函数组件的支持
  {e1}
  <E2 vl="e2value">i am children</E2>
  <E3 vl="e2evalue"/>
</>, root)
