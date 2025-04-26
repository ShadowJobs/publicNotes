import React from "react"
import { Link, Outlet } from "react-router-dom"
import { ReactQueryComp } from "./ReactQueryComp"

export function List(){
    return <div>List 使用outlet写法实现嵌套路由
        <ReactQueryComp />
        <br></br>
        <Link to='/list/name'>查姓名</Link>
        <span> | </span>
        <Link to='/list/score'>查分数</Link>
        <br/>
        {/* 使用outlet写法实现嵌套路由*/}

        <div className='with-border'>
        <Outlet></Outlet>
        </div>
    </div>
}