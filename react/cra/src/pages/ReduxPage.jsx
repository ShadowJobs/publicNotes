
import React from "react"
import store from "../redux/store"
import { connect } from "react-redux"
class ReduxPage extends React.Component{
    render(){
        return <div className="with-border">Home-ReduxPage<br/>
        react-redux的使用1，写reducer.js，初始值和操作都存在reducer里<br/>
        2，写store.js,只是单纯做一下管理和转发<br/>
        3，home.jsx里，constructor必须写订阅函数，change的时候必须调用dispatch<br/>
            <br/>
                counter={store.getState().count}
                <button onClick={()=>{
                    store.dispatch({type:"add"})
                }}>+1</button>
            <br/>
            下面2个input使用的是2中方式实现数据的双向绑定
            <input type="text" value={this.props.inputValue} onChange={(e)=>{
                store.dispatch({type:"changeInput",value:e.target.value})
            }}/>
            <input type="text" value={this.props.inputValue} onChange={this.props.inputChange}/>
            inputValue={this.props.inputValue}<br/>

            counter={this.props.asyncCount}
            <button onClick={()=>{
                store.dispatch(this.props.addAsync)
            }}>async +1</button>
        </div>
    }
}
const stateToProps=state=>{
    return {  //上面用props取值了
        asyncCount:state.asyncCount,
        count:state.count,
        inputValue:state.inputValue
    }
}
const dispatchToProps=(dispatch)=>{
    return{
        inputChange:(e)=>{
            dispatch({type:"changeInput",value:e.target.value})
        },
        addAsync:()=>{
            dispatch((dispatch0,getState)=>{
                new Promise(resolve=>{
                    setTimeout(()=>{
                        resolve(10)
                    },500)
                }).then(data=>{
                    dispatch0({type:"addAsync",value:data})
                })
            })
        }
    } 
}
export default connect(stateToProps,dispatchToProps)(ReduxPage)