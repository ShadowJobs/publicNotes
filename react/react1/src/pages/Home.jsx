
import React from "react"
import store from "../redux/store"
class Home extends React.Component{
    constructor(props){
        super(props)
        this.state=store.getState() //固定写法，想不这么写：参考cra项目的react-redux写法
        store.subscribe(this.changeState)  //这一行不写，下面的state变化监听不到
    }
    changeState=()=>{
        this.setState(store.getState())
    }
    render(){
        return <div>Home
        redux的实现1，写reducer.js，初始值和操作都存在reducer里<br/>
        2，写store.js,只是单纯做一下管理和转发<br/>
        3，home.jsx里，constructor必须写订阅函数，change的时候必须调用dispatch<br/>
            <br/>
                counter={store.getState().count}
                <button onClick={()=>{
                    store.dispatch({type:"add"})
                }}>+1</button>
            <br/>
            <input type="text" value={this.state.inputValue} onChange={(e)=>{
                store.dispatch({type:"changeInput",value:e.target.value})
            }}/>
            inputValue={this.state.inputValue}
            <div style={{whiteSpace:"pre",textAlign:'left'}}>{`对于函数组件，可以用下面的写法：
function render(){ReactDom.render(<App/>,document.getElementById("root"))}
render()
store.subscribe(render)`}</div>
        </div>
    }
}

export default Home