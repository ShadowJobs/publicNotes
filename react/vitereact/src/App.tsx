import queryClient from "@/utils/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { App as AntdProvider, ConfigProvider } from "antd";
import enUS from "antd/es/locale/en_US";
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router-dom";
import router from "./config/router";

const App = () => {
  // 动态路由写法，方法一： (方法二见./config/router)
  // const [dynamicRoutes, setDynamicRoutes] = useState([]);
  // useEffect(() => {
  //   // 请求后端接口获取 AiAppRoutes 列表，并转换为自定义路由信息
  //   axios.get("/api/ai-app-routes").then(({ data }) => {
  //     const { AiAppRoutes } = data;
  //     if (Array.isArray(AiAppRoutes)) {
  //       // 将每个 appName 转换为 Route 元素
  //       const routes = AiAppRoutes.map(appName => (
  //         <Route
  //           key={appName}
  //           path={appName}
  //           loader={async () => {
  //             const res = await axios.get(`/api/ai-app-url?name=${encodeURIComponent(appName)}`);
  //             return res.data;
  //           }}
  //           element={<LLMPage />}
  //         />
  //       ));
  //       setDynamicRoutes(routes);
  //     }
  //   });
  // }, []);

  // // 静态路由配置
  // const router = createBrowserRouter(
  //   createRoutesFromElements(
  //     <Route path="/" element={<Root />} errorElement={<NotFound />}>
  //       <Route index loader={() => redirect("/dashboard")} />
  //       <Route path="/user/login" element={<LoginPage />} />
  //       <Route path="chat_entry" element={<Dashboard />} />
  //       <Route element={<SidebarLayout />}>
  //         <Route path="dashboard" element={<Dashboard />} />
  //         {/* AI-Apps 父路由下渲染动态路由 */}
  //         <Route path="AI-Apps">
  //           {dynamicRoutes}
  //         </Route>
  //       </Route>
  //     </Route>
  //   )
  // );
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            token: { colorPrimary: "#0068EB" }
          }}
          locale={enUS}
        >
          <AntdProvider>
            <RouterProvider router={router} />
          </AntdProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
