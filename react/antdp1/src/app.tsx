import type { Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-layout';
import { getMenuData, SettingDrawer } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RunTimeLayoutConfig } from 'umi';
import { history, Link, NavLink, request } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import defaultSettings from '../config/defaultSettings';
import React from 'react';
import * as allIcons from '@ant-design/icons';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Button, Tooltip } from 'antd';
import { PythonUrl } from './global';
import routes from '../config/routes';
import { autoRefresh, startListenError } from './startItems';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

// Notes: 根据字符串获取一个icon，用到React的createElement
const fixMenuItemIcon = (menus: MenuDataItem[], iconType = 'Outlined'): MenuDataItem[] => {
  menus?.forEach((item) => {
    const { icon, children } = item
    if (typeof icon === 'string') {
      let fixIconName = icon.slice(0, 1).toLocaleUpperCase() + icon.slice(1) + iconType
      item.icon = React.createElement(allIcons[fixIconName] || allIcons[icon])
    } 
    if(item.path=="/2025") 
      item.icon=<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{marginRight:5,marginBottom:-2}}>
        <path d="M11 4C11.6487 4 12.2498 4.20569 12.7411 4.55646C11.4486 5.22914 10.2602 6.07623 8.99996 6.80385L9.99996 8.5359C11.575 7.62654 13.0517 6.48541 14.7608 5.83037C16.1134 5.31198 17.681 5.83976 18.4282 7.13398C18.7526 7.69582 18.8749 8.31917 18.8168 8.92006C17.588 8.13708 16.2602 7.53146 15 6.80385L14 8.5359C15.575 9.44525 17.3016 10.1536 18.7234 11.3061C19.8487 12.2183 20.1754 13.8398 19.4282 15.134C19.1037 15.696 18.6249 16.1137 18.0752 16.3638C18.1385 14.9081 18 13.4553 18 12H16C16 13.8184 16.2498 15.6685 15.9626 17.4758C15.7353 18.9063 14.4944 20 13 20C12.351 20 11.7498 19.7942 11.2584 19.4432C12.5508 18.7701 13.7396 17.9238 15 17.1962L14 15.4641C12.4252 16.3733 10.9478 17.5147 9.23912 18.1696C7.88657 18.688 6.31898 18.1602 5.57176 16.866C5.24729 16.304 5.12493 15.6805 5.18316 15.0794C6.41224 15.8621 7.73964 16.4685 8.99997 17.1962L9.99997 15.4641C8.42517 14.5549 6.69801 13.8462 5.27649 12.6939C4.15128 11.7817 3.82455 10.1602 4.57176 8.86602C4.89624 8.30402 5.37506 7.88628 5.9247 7.63618C5.86145 9.09192 5.99997 10.5447 5.99997 12H7.99997C7.99997 10.1816 7.75013 8.33148 8.03733 6.52422C8.26467 5.09369 9.50554 4 11 4ZM14.7925 3.74171C13.8765 2.67659 12.5176 2 11 2C8.7782 2 6.89621 3.44833 6.24435 5.45243C4.86393 5.71314 3.59851 6.55175 2.83971 7.86602C1.72883 9.79013 2.04213 12.1442 3.4518 13.7107C2.98737 15.0366 3.08092 16.5518 3.83971 17.866C4.95059 19.7901 7.14589 20.6958 9.20742 20.2583C10.1234 21.3234 11.4824 22 13 22C15.2217 22 17.1037 20.5517 17.7556 18.5476C19.136 18.2869 20.4014 17.4482 21.1602 16.134C22.2711 14.2099 21.9578 11.8559 20.5481 10.2893C21.0126 8.96345 20.919 7.44825 20.1602 6.13398C19.0493 4.20987 16.854 3.30419 14.7925 3.74171Z"></path>
        </svg>
    children && children.length > 0 ? item.children = fixMenuItemIcon(children) : null
  });
  return menus
};
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      if(msg.data) msg.data.refreshT = Date.now()
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  const fetchMenu = async () => {
    const r = await request(`${PythonUrl}/doc/file-list`)
    const { breadcrumb, menuData } = getMenuData(
      routes,
    );
    // const docMenu = {name: "Documents", path: "docs",routes:[]}
    // for (const item of r.data) {
    //   docMenu.routes.push({name: item,path: item,component: "./LinYing/Document",})
    // }
    // console.log("docMenu",docMenu)
    // 往routes的添加，就会添加很多个，这里routes里用:file匹配所有，所以在menu里再添加多个file，实现1个route匹配多一个menuItem
    // routes.find((item) => item.name === '2024').routes?.push(docMenu) 
    const docRoutes = menuData.find(v => v.name == "Documents")
    docRoutes.children = docRoutes?.children.filter(v=>v.name=='私有文档')
    r.data?.map((item: string) => {
      docRoutes.children.push({ name: item, path: item })
    })
    // console.log("menuData",menuData)
    return menuData
  }
  const menuData = await fetchMenu(); //动态菜单可以这样获取，并放到返回值的menuData里
  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
      menuData: menuData || [],
      collapsed: _initialState.collapsed  // 添加初始状态

    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
    menuData: menuData || [],
    collapsed: _initialState.collapsed  // 添加初始状态

  };
}
let _initialState = {
  collapsed: false,
};

if (typeof window !== 'undefined') {
  try {
    const collapsed = localStorage.getItem('pro-sidebar-collapsed')?.toLocaleLowerCase() === 'true';
    _initialState.collapsed = collapsed;
  } catch (error) {
    console.error(error);
  }
}
// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const searchParams = new URLSearchParams(window.location.search);
  const hideHeader = searchParams.get('hideHeader') === '1';
  const hideMenu = searchParams.get('hideMenu') === '1';

  return {
    // menuRender:false,隐藏整个菜单
    // 移动端专用处理
    headerContentRender: (_, defaultDom) => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        return (
          <div style={{ }}>
            <allIcons.MenuUnfoldOutlined
              onClick={() => {
                localStorage.setItem('pro-sidebar-collapsed', !initialState?.collapsed ? 'true' : 'false');
                setInitialState((preState) => ({
                  ...preState,
                  collapsed: !preState?.collapsed,
                }));
              }}
              style={{ marginRight: 16,marginLeft:10 }}
            />
            {defaultDom}
          </div>
        );
      }
      return defaultDom;
    },
    collapsed: initialState?.collapsed,
    onCollapse: (collapsed: boolean) => {
      setInitialState((preState) => ({
        ...preState,
        collapsed
      }));
      localStorage.setItem('pro-sidebar-collapsed', collapsed.toString());
    },

    headerRender: hideHeader ? false : undefined,
    menuRender: hideMenu ? false : undefined,
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: { //水印
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
  
    },
    links: [<Button type="primary"
      icon={initialState?.collapsed ? <allIcons.MenuUnfoldOutlined /> : <allIcons.MenuFoldOutlined />}
       onClick={() => {
      const collapsed = !initialState?.collapsed;
      setInitialState((preState) => ({
        ...preState,
        collapsed
      }));
      localStorage.setItem('pro-sidebar-collapsed', collapsed.toString());
    
    }} ></Button>,
    ...(isDev
      ? [

        <Link to="/umi/plugin/openapi" target="_blank">
          <LinkOutlined />
          <span>OpenAPI 文档</span>
        </Link>,
        <Link to="/~docs">
          <BookOutlined />
          <span>业务组件文档</span>
        </Link>,
      ]
      : [])],
    // 自定义菜单渲染的写法
    // import React from 'react';
    // import { MenuDataItem } from '@ant-design/pro-layout';
    // import * as allIcons from '@ant-design/icons';
    // // FIX从接口获取菜单时icon为string类型
    menuDataRender: () => fixMenuItemIcon(initialState?.menuData),
    //自定义菜单项，
    menuItemRender: (itemProps: MenuDataItem, defaultDom: React.ReactNode, props: BaseMenuProps) => {
      if (itemProps.buttonUrl) {
        return <div >
          <span onClick={() => history.push(itemProps.path!)}>{defaultDom}</span>
          <Tooltip title={("创建新")}>
            <Button type="link" style={{ color: "#eff2f2" }} className="button-scale" icon={<allIcons.PlusOutlined />} onClick={() => history.push(itemProps.buttonUrl)} />
          </Tooltip>
        </div>
      } else
        if (itemProps.target === "_blank") {
          if (itemProps.name == 'WorkerTest+fullScreen')
            return <>
              <NavLink to={itemProps.path} >{defaultDom}</NavLink> &nbsp;
              <Tooltip title={("附加了tip")} >
                <allIcons.QuestionCircleOutlined />
              </Tooltip>
            </>
          else return defaultDom
        } else
          return <NavLink to={itemProps.path} >{defaultDom}</NavLink>
    },
    // menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

const queryClient = new QueryClient();
export function rootContainer(container) { //Important ， App()的入口处
  return (
    <QueryClientProvider client={queryClient}>
      {container}
    </QueryClientProvider>
  );
}
startListenError()
autoRefresh()