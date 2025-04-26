import React from "react"

export class NativeEventPage extends React.Component{
    render(){return <div >
        
        <br/>
        <div className="with-border">
            原生事件的写法,直接在父组件上监听事件，然后在子组件上触发事件，通过target来确定是哪个组件触发的事件
            <br/>
            知识点：1冒泡 onClick，2捕获 onClickCapture<br/>
            3，通过target可以得到实际发生事件的组件
            <ul onClickCapture={e=>console.log("父组件捕获")} 
                onClick={e=>{console.log("父组件冒泡");console.log(e.nativeEvent.target.innerHTML)}}>
                <li onClickCapture={e=>console.log("子组件捕获")} onClick={e=>console.log("子组件冒泡")}> 文本1</li>
                <li> 文本2</li>
                <li> 文本3</li>
            </ul>
        </div>
    </div>}
}