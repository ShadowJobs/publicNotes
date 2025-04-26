import React, { useEffect } from "react"

export function List(){
    const [count,setCount] = React.useState(0);
    useEffect(()=>{
        setTimeout(()=>{
            setCount(x=>x+1);
            console.log(1)
        },1000)
    },[count<5?5:count])
    return <div>List 
        {count}
    </div>
}