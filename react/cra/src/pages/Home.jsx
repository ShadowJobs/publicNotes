
import React from "react"
import ReduxPage from "./ReduxPage"
import ReduxPage2 from "./ReduxPage2"
import store from '../redux/store';
import {Provider,connect} from "react-redux"
import { Comp1 } from "../Components/Comp1";
import { Comp2 } from "../Components/Comp2";
class Home extends React.Component{
    state={count:1}
    static getDerivedStateFromProps(props,state){
        console.dir(props);
        console.dir(state);
        return null
    }
    countAdd=()=>{
        console.log("before",this.state.count);
        this.setState({count:this.state.count+1})
        this.setState({count:this.state.count+1})
        this.setState({count:this.state.count+1})
        console.log("after",this.state.count);
    }
    addInTimer=()=>{
        setTimeout(()=>{
            console.log("before",this.state.count);
            this.setState({count:this.state.count+1})
            console.log("aftert",this.state.count);
        },500)
    }
    render(){
        return <div>
            react-redux的使用<br/>
            1, 与直接使用redux不同的地方，调用的地方写法是使用provider包裹，然后传入store参数<br/>，用connect，不用再constructor里订阅，直接在render里调用<br/>
            2, 传入的store写法见reduxPage.jsx<br/>
            3，
            坑：本来想直接用provider包裹home的，但是又有home是个路由组件，所以直接导出会报错，所以单独写了一个ReduxPage组件,这样包裹就不会报错
            <Provider store={store}><ReduxPage/></Provider>
            <Provider store={store}><ReduxPage2/></Provider>
            <br/>
            <div className="with-border">
                自己实现EventBus事件总线，组件间通信<br/>
                <Comp1></Comp1>
                <Comp2></Comp2>
            </div>
            <br/>
            <div className="with-border">
                setState测试，react 18中setTimeout不会影响setState的异步表现<br/>
                count值：{this.state.count}<br/>
                <button onClick={()=>{
                    console.log("befor",this.state.count);
                    this.setState({count:2})
                    console.log("after",this.state.count);
                }}>changeState</button>
                <button onClick={this.countAdd}>countAdd</button>
                <button onClick={this.addInTimer}>addInTimer</button>
            </div>
        </div>
    }
}
export default Home