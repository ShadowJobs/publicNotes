import ErrorAlert from "@/components/layout/ErrorAlert";
import NotFound from "@/components/layout/NotFound";
import Root from "@/components/layout/Root";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { DEFAULT_ROUTE_PATH } from "@/config/navigation";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  redirect,
  useLoaderData,
  type LoaderFunction
} from "react-router-dom";


import { loader as layoutLoader } from "@/components/layout/loader";
import Welcome from "@/pages/Welcome";
import { UserService } from "@/services";
import { lazy } from "react";
import Tasks from "@/pages/Tasks";
import Dashboard from "@/pages/Dashboard";

const LoginPage = lazy(() => import("@/pages/user/login"));

const rootLoader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const token = UserService.getToken();

  if (url.pathname === "/user/login") {
    if (token) return redirect("/");
  } else {
    if (!token) return redirect("/user/login");
  }

  return {};
};
// rootLoader可以用来做路由守卫，验证用户登录状态，控制路由访问权限，实现路由重定向，代码：
// const rootLoader: LoaderFunction = async ({ request }) => {
//   const url = new URL(request.url);
//   const user = await UserService.getUser(); // 假设是异步操作

//   // 可以添加白名单路由
//   const publicRoutes = ['/user/login', '/about', '/help'];

//   try {
//     if (url.pathname === "/user/login") {
//       if (user) return redirect("/");
//     } else if (!publicRoutes.includes(url.pathname)) {
//       if (!user) return redirect("/user/login");
//     }

//     return { user }; // 可以返回用户信息供组件使用
//   } catch (error) {
//     console.error('Route guard error:', error);
//     return redirect("/error");
//   }
// };

const LLMPage = () => {
  const { url }: any = useLoaderData();
  return (
    <div>
      <h2>动态应用页面</h2>
      <div>
        {url}
      </div>
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(

    <Route path="/" loader={rootLoader} element={<Root />} errorElement={<NotFound />}>
      <Route path="/user/login" element={<LoginPage />} />
      <Route index loader={() => redirect(DEFAULT_ROUTE_PATH)} />
      <Route loader={layoutLoader} element={<SidebarLayout />}>
        <Route path="/dashboard" errorElement={<ErrorAlert />} element={<Dashboard />} />
        <Route path="/welcome" errorElement={<ErrorAlert />} element={<Welcome />} />
        <Route path="/react1" errorElement={<ErrorAlert />} />
        <Route path="/react1/:u" errorElement={<ErrorAlert />} />
        <Route path="/vue" errorElement={<ErrorAlert />} />
        <Route path="/vue/:u" errorElement={<ErrorAlert />} />
        <Route path="/data-management" errorElement={<ErrorAlert />}>
          <Route index loader={() => redirect("/")} />
        </Route>


        <Route path="AI-Apps" >
          <Route key={"SD-GPT"} path={"SD-GPT"} element={<iframe src={"https://www.baidu.com"}
            style={{ width: "100%", height: "calc(100vh - 90px)" }}></iframe>} />
          <Route path="AGPT">
            <Route index element={<NotFound />} />
            <Route key={"tp-gpt-list"} path={"tasks"} element={<Tasks />} />
            <Route key={"tp-gpt-new"} path={"new"} element={<div>NewTask </div>} />
          </Route>
          <Route path=":appname">
            <Route index element={<NotFound />} />
            <Route key={"ai-app-list"} path={"tasks"} element={<div>persTaskList</div>} />
            <Route key={"ai-app-new"} path={"new"} element={<div>persGPTNew</div>} />
          </Route>
        </Route>
        {/* 动态路由写法，方法二 */}
        <Route
          path="dynamic/:appName"
          loader={async ({ params }) => {
            const { appName } = params;
            // 根据 appName 请求后端接口获得对应的 URL 数据
            // const res = await axios.get(`/api/ai-app-url?name=${encodeURIComponent(appName)}`);
            console.log("appname=", appName)
            const res = { data: { url: "/dashboard" } }
            return res.data; // 假定返回结果形如 { url: "xxx" }
          }}
          element={<LLMPage />}
        />
        <Route path="lve">
          <Route path={"group"}>
            <Route path={"ci"}>
              <Route key={"ci-list"} path={"list"} element={<div>CITaskList</div>} />
              <Route key={"ci-detail"} path={"detail"} element={<div>CITaskDetail</div>} />
            </Route>
          </Route>
          <Route key={"insight-doc"} path={"insight-doc"} element={<iframe src={"/documents"}
            style={{ width: "100%", height: "calc(100vh - 90px)" }}></iframe>} />
        </Route>
        {/* 其余找不到的都走这个NotFound */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>
  )
);

export default router;
