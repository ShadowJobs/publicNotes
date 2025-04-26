import { DEFAULT_OPEN_PATH, DEFAULT_SELECTED_PATH, navigation } from "@/config/navigation";
import { Card, Layout, Menu, Skeleton } from "antd";
import { Suspense, useEffect, useState } from "react";
import { Outlet, useLoaderData, useLocation } from "react-router-dom";
import { useCreation } from "ahooks";

import Footer from "./Footer";
import Header from "./Header";
import type { LayoutLoaderData } from "./loader";
import "./layout.css"

export default function SidebarLayout() {
  const location = useLocation();
  const state = useCreation(() => {
    // 切换page后，由于路由路径发生变化，location里的state会变成null，左侧菜单选中效果便会失效，sessionStorage是不破坏原有配置下最好的做法
    // 最佳实践应该：根据路由配置动态生成菜单，把path作为菜单的key
    if (!location.state) {
      return JSON.parse(sessionStorage.getItem("location-state") ?? "{}");
    }
    sessionStorage.setItem("location-state", JSON.stringify(location.state));
    return location.state;
  }, [location.pathname]);

  const { isSidebarCollapsed } = useLoaderData() as LayoutLoaderData;
  const [isCollapsed, setIsCollapsed] = useState(isSidebarCollapsed);
  useEffect(() => {
    // @ts-ignore
    // import("../../registerApps.js")
  },[])
  return (
    <>
      <Layout.Sider
        collapsible
        collapsed={isCollapsed}
        onCollapse={(collapsed) => {
          localStorage.setItem("sidebar/collapsed", JSON.stringify(collapsed));
          setIsCollapsed(collapsed);
        }}
        className="group !fixed inset-y-0 left-0 h-screen !w-56 !min-w-[14rem] !max-w-[14rem]
                  !flex-none !basis-[14rem] overflow-hidden !bg-[#0068eb] !transition-none
                  data-[collapsed=true]:!w-20 data-[collapsed=true]:!min-w-[3rem]
                  data-[collapsed=true]:!max-w-[3rem] data-[collapsed=true]:!basis-[3rem]
                  3xl:!w-96 3xl:!min-w-[24rem] 3xl:!max-w-[24rem] 3xl:!basis-[24rem]"
        data-collapsed={isCollapsed}
        data-theme-override
      >
        <div className="flex items-center justify-center px-2 h-[64px] text-white">
          <h1>Vite+React+qiankun</h1>
        </div>
        <div className="menu-container" style={{ height: "calc(100vh - 112px)"}}><Menu
          theme="dark"
          mode="inline"
          inlineIndent={12}
          items={navigation}
          defaultOpenKeys={
            // 这里面的 keys来自于navigation.tsx里的key

            !isCollapsed ? (state?.keys ? state.keys : DEFAULT_OPEN_PATH) : undefined
          }
          selectedKeys={state?.keys ?? DEFAULT_SELECTED_PATH}
          className="bg-[#0051dd]"
        /></div>
      </Layout.Sider>

      <Layout className="ml-56 data-[collapsed=true]:ml-12 3xl:ml-96" data-collapsed={isCollapsed}>
        <Header />

        <Layout.Content className="p-2 md:p-4">
          <Suspense
            fallback={
              <>
                <Card className="mb-6 h-16">
                  <Skeleton active paragraph={{ rows: 0 }} />
                </Card>
                <Card>
                  <Skeleton active paragraph={{ rows: 8 }} />
                </Card>
              </>
            }
          >
            <Outlet />
            <div id="qiankuncontainer"></div>
          </Suspense>
        </Layout.Content>
        <Footer />
      </Layout>
    </>
  );
}
