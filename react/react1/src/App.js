import './index.css';
import {BrowserRouter, Link, Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import {List} from './pages/List'
import {User} from './pages/User'
import { NameList } from './pages/subpages/NameList';
import { ScoreList } from './pages/subpages/ScoreList';
import CounterPage1 from './pages/CounterPage1';
import CounterPage2 from './pages/CounterPage2';
import CounterPage3 from './pages/CounterPage3';
import AuthComponent from './pages/AuthComponent';
import { Login } from './pages/login';
import { ReactSetState } from './pages/ReactSetState';
import { NativeEventPage } from './pages/NativeEvent';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Page4 } from './pages/Page4Provider';
import { QiankunMsg } from './pages/QiankunMsg';

const queryClient = new QueryClient();
window.queryClient=queryClient
function App() {
  console.log(process.env.REACT_APP_DEVELOPMENT_P1)
  return (
    <div style={{textAlign:"center"}}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={window.__POWERED_BY_QIANKUN__ ? '/react1' : '/'}>
      {window.__POWERED_BY_QIANKUN__ && <QiankunMsg/>}
      <ul>
        <li>最简路由，多级路由的简单使用</li>
        <li>第一种跨组件的通信方式：mobx,可以模块化store</li>
        <li>第二种跨组件的通信方式：redux</li>
        <li>
          <ul>路由鉴权：
            <li>用AuthComponent来封装需要鉴权的路径（定义见AuthComponent,使用见App.js）</li>
            <li>AuthComponent里面通过组件跳转，login.js里通过代码跳转，都是通过Navigate来实现的</li>
            <li>另外注意AuthComponent里children的用法</li>
          </ul>
        </li>
      </ul>
      {/* 本行是必须写的，不然下面的router会报错 */}
      <div className='with-border'>
        <Link to="/">首页</Link>
        <span> | </span>
        <Link to="/list">列表</Link>
        <span> | </span>
        <Link to="/user">用户</Link>
        <br/>
        <div className='with-border'>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/> }/>
            <Route path="/list" element={<List/>}>
              <Route path="/list/name" element={<NameList/>}/>
              <Route path="/list/score" element={<ScoreList/>}/>
            </Route>
            <Route path="/user/*" element={<AuthComponent><User/></AuthComponent>}/>
            {/* 注意这里的星号是只有二级嵌套路由，配合User.jsx里的route，那里面的route不能再带/user了 */}
          </Routes>
        </div>
      </div>
      </BrowserRouter>
      <br/>
      <div className='with-border'>
        计数组件，使用mobx
        <br/>
        <CounterPage1/><br/>
        <CounterPage2/><br/>
        注意,npm i mobx mobx-react-lite。      组件1,2都必须使用observer()
        <br/> mobx-react-lite只能在函数组件里使用，要用类组件则应该用npm i mobx-react
      </div>
      <br/>
      <div className='with-border'>
        mobx模块化,下面两个组件数据是通的<br/>
        <CounterPage3/>
        <CounterPage3/>
      </div>
      <br/>
      <Page4/>
      <br/>
      <br/>
      <ReactSetState></ReactSetState>
      <NativeEventPage></NativeEventPage>
      </QueryClientProvider>
    </div>
  );
}
export default App;
