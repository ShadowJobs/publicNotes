import React from "react"
import { useNavigate } from "react-router-dom"

export function Login(){
    const nv=useNavigate()
    return <div>登录
        <button onClick={()=>{
            localStorage.setItem('token','123')
            nv('/',{replace:true})
        }}>登录</button>
    </div>
}