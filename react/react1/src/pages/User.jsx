import {BrowserRouter, Link, Route, Routes} from 'react-router-dom'
import { Lin } from './subpages/Lin'
import { Wang } from './subpages/Wang'
import { ReactQueryComp } from './ReactQueryComp'

export function User(){
    return <div>User 使用react的原始Routes实现嵌套路由

        <br />
        <ReactQueryComp/>
        <Link to='/user/lin'>小林</Link>
        <span> | </span>
        <Link to='/user/wang'>小王</Link>
        <br/>

        <div className='with-border'>
        <Routes>
            <Route path='wang' element={<Wang/>}/> 
            {/* 这是最原始的写法
            注意这里的path不能带前缀，配合上级routes的'/*'来匹配使用 */}
            <Route path='lin' element={<Lin/>}/>
        </Routes>
        </div>

    </div>
}