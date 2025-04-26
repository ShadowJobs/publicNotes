import { UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React from 'react';
import 'antd/dist/antd.min.css'   //1，这一句必须要，否则无法显示antd的样式
import { BrowserRouter,Route, Routes,Link} from 'react-router-dom'
import Home from './pages/Home';
import { List } from "./pages/List"
import EventBus from './EventBus'
import "./a.css"

const { Header, Content, Footer, Sider } = Layout;

window.EventBus=EventBus /////5使用eventBus来传递消息
const App = () => {
  // const  {pathname}=useLocation()  4,用这一行会报错useLocation() may be used only in the context of a <Router> component.
  // 所以直接用window.location.pathname
  return ( <BrowserRouter>
      <div style={{display:"inline-block",marginLeft:200}}>
        <pre style={{whiteSpace:"pre-line"}}>
      知识点：1 craco配置，craco.config.js,jsconfig.json,package.json
      2，自己写的spa：包含菜单，菜单和地址栏的双向更新，路由
      3, 使用react-redux实现通信
      4，使用eventBus的消息发布订阅模式，自写实现组件间通信
      5，react 18, 入口使用createRoot创建，与17不同
      </pre>
      </div>
    <Layout>
      <Sider breakpoint="lg" 
        style={{ //2 这一段style保证左边栏能够占满全屏，且不会随鼠标滚动
          overflow: 'auto', height: '100vh', position: 'fixed',
          left: 0, top: 0, bottom: 0,
        }}
        collapsedWidth="0"
        onBreakpoint={(broken) => { console.log(broken); }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className="logo" />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={window.location.pathname}>
          <Menu.Item key="/home">
            <Link to="/home">首页</Link>
          </Menu.Item>
          <Menu.Item key="/list">
            <Link to="/list">列表</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className="site-layout-sub-header-background" style={{ padding: 0, }} />
        <Content style={{marginLeft:200 }} >
          {/* 3 这里不设置marginleft会导致对齐重合 */}
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360, }} >
            <div className='with-border'>
              <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/home" element={<Home/>}/>
                <Route path="/list" element={<List/> }/>
              </Routes>
            </div>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', }} >
          ShadowJobs ©2018 Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  </BrowserRouter>
)};

export default App;