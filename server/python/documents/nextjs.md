[中文文档](https://www.nextjs.cn/docs/basic-features/pages)

# 1, 特殊文件
page.tsx 

layout.tsx 所有的内容都会自动套用这个layout(layout不能用usepathname,因为是服务端组件)，template.tsx 用于生成静态页面,

默认套用规则 layout -> template -> page，layout和template的区别：template在路由变化后，会丢失状态，layout不会

not_fount.tsx 404页面
error.tsx 500页面
loading.tsx loading页面
default.tsx 默认页面


# 2. next.config.js 
reactStrictMode: true, // 严格模式, 有些错误可以通过这个关闭

# 3. metadata
每个页面通过Metadata组件设置metadata，可修改page的title，description，keywords, icon等信息

# 4. tailwind 参考页面
https://creative-tim.com/twcomponents/search?query=button

# 5. 端口和代理配置
  - 端口：package.json里next dev -p 8005
  - 代理：.env里 NEXT_PUBLIC_API_PREFIX=http://localhost:32348, 
  ```js
  // next.config.js配置代理转发
   async rewrites(){
    return [
      // 新增的GPT接口转发规则
      {
        source: "/my-gpt/:path*", // 匹配所有以 /my-gpt/ 开头的路径, 注意这里dify里要先修改.env里的NEXT_PUBLIC_API_PREFIX=/my-gpt/console/api
        destination: "https://mymmt.works/:path*", // 保持原始路径参数
      },
    ]
  },
  async redirects() {
    return [
      // 原有的根路径重定向（保留原有配置）
      {
        source: '/',
        destination: '/apps',
        permanent: false,
      },
    ]
  },

```

# 6. 路由
  - 动态路由：[id].tsx
  - 嵌套路由：[id]/[name].tsx
  - 路由参数：useRouter().query.id
  - 获取路径参数：
    ```tsx
    import { useRouter,useParams } from 'next/router'
    //浏览器路径 /app/:id?uid=123
    const router = useRouter()//客户端组件获取方式
    const { id } = router.query 
    const { uid } = useParams() //客户端组件获取方式
    // 服务端组件获取方式,直接在参数里
    
    export default function Page({ params }: { params: { conversatinoid: string } }) {
      return <div>Conversation ID: {params.conversatinoid}</div>
    }

    ```
# 7. useSWR
```tsx
// 类似 react-query，用于数据请求，缓存，更新等操作

const { data: appChatListData, isLoading: appChatListDataLoading } = useSWR(chatShouldReloadKey ? ['appChatList', chatShouldReloadKey, isInstalledApp, appId] : null, () => fetchChatList(chatShouldReloadKey, isInstalledApp, appId)
// 如果第一个参数是null,则不会执行第二个参数的函数，否则，第一个参数就是依赖数组，类似useEffect的第二个参数
在 SWRConfig 中，你可以为所有 useSWR 调用设置全局 key 前缀。

<SWRConfig value={{ provider: () => new Map(), fetcher: (key) => fetch(key).then(res => res.json()) }}>
  <App/>
</SWRConfig>
// 预加载,你可以使用相同的 key 预加载数据，后续的 useSWR 调用会使用预加载的数据。
mutate('/api/user', fetchUser())
// ...之后
useSWR('/api/user', fetcher)

设置为用不刷新
const { data: uspDetail, mutate } = useSWR(
    ["dvp-comps-st", job.dvp_job_id],
    () => getJobDetail({
      source: "TLMP",
      user_name: userName,
      job_id: job.dvp_job_id,
    }),
    {
      //简单设置可以设置refreshInterval:86400,1天刷新一次
      // 禁用所有自动重新验证
      revalidateIfStale: false,  // 当缓存过期时不重新验证
      revalidateOnFocus: false,  // 当窗口获得焦点时不重新验证
      revalidateOnReconnect: false, // 当浏览器恢复网络连接时不重新验证
      
      // 设置极长的缓存时间 (大约为114年)
      dedupingInterval: 3600000 * 24 * 365 * 100, // 100年的毫秒数
      
      // 永不过期的缓存
      focusThrottleInterval: Infinity, // 焦点节流间隔设为无限
      
      // 可选：如果您需要设置初始数据
      // fallbackData: initialData,
    }
  );
```

# 8. 部署
  - 本地启动：npm run dev -p 8005, 
  - 服务器部署：npm run build ，再执行npm start ，注意，scripts里的start命令读取了npm_config_port,这个值不是在.env里配置的，而是在 ./npm run start --port 5006 这样的命令里配置的
  - 坑1： 服务器上，无论是run dev还是run build，都极其消耗资源，慢，最后的结果都是系统会kill掉进程。gpt建议修改next.config.js里的swcMinify: true和webpack5: true。但是实测没什么用。所以，需要在本地build，然后rsync到服务器上，再run start
  - 坑2：nextjs默认只提供http服务，如果需要https服务，需要自己配置nginx
  - 坑3：使用了npm run start --port=5006 这样启动的服务，直接control+c就可以完全杀死了，但是使用 nohup npm run start --port=5006 > output.log 2>&1，会发现进程kill不掉，经查发现是他不但启动了多个子进程，还有一个nextjs服务端进程，导致ps aux | grep -E "npm|node" 都找不到这个进程，并且，lsof -i:5006 也看不到端口被谁占用，必须用
  - **坑** dify项目部署时，必须删除整个web/.next文件夹，然后copy，否则有的文件会找不到,返回404。可能有关联内容。

