import React from "react"

export class ReactSetState extends React.Component{
    state={count:1}
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
    render(){return <div className="with-border">react17 setState在setTimeout中的表现,也能拿到最新的state值
        <br/>
        <div className="with-border">
            setState测试，counter={this.state.count}<br/>
            <button onClick={()=>{
                console.log("befor",this.state.count);
                this.setState({count:2})
                console.log("after",this.state.count);
            }}>changeState</button>
            <button onClick={this.countAdd}>countAdd</button>
            <button onClick={this.addInTimer}>addInTimer</button>
        </div>
    </div>}
}