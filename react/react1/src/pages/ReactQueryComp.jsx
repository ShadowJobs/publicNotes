import { useState } from "react";
import { useQuery } from "react-query";
import { API_URL } from "../const";

const fetchData = async () => {
  const response = await (await fetch(`${API_URL}/job/react_query`)).json();
  return response.data;
};
const fetchPageData = (page = 0) => fetch(`${API_URL}/job/tasks_by_page?page=` + page).then((res) => res.json())

export const ReactQueryComp = () => {
  const [page, setPage] = useState(0)
  const { data, status, refetch, isFetching } = useQuery('cache', fetchData, {
    // enabled:true, //默认为true，也就是开启了缓存，加载时会请求1次
    staleTime: 1000 * 3, // 数据在3秒后会陈旧
    cacheTime: 1000 * 6, // 缓存在10秒后删除
    retry: 1, // 失败后重试次数
    refetchOnWindowFocus: false,// 窗口聚焦时是否自动刷新
    refetchOnMount: false, // 组件挂载时是否自动刷新
    refetchOnReconnect: false, // 断网重新连接后是否自动刷新
    refetchInterval: false, // 自动刷新的时间间隔
    refetchIntervalInBackground: false, // 页面在后台时是否自动刷新
    initialData: '初始数据,设置了之后，默认第一次不会请求数据，而是直接使用这个数据，点击强制获取可更新数据',
  });
  const pageData = useQuery(['pageData', page], () => fetchPageData(page), {
    keepPreviousData: true, // 保持上一次的数据，直到新数据返回，这样可以避免闪烁。如果设置为false，那么在新数据返回之前，数据会变成undefined
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 3, // 数据在3秒后会陈旧
    cacheTime: 1000 * 6, // 缓存在6秒后删除
  })
  return <div>
    <h5>React query测试，需要用QueryClient, QueryClientProvider包裹使用useQuery的组件，所有使用useQuery('cache')的地方，数据都是一套，不会重复获取</h5>
    {status === 'loading' ? <div>Loading...</div> :
      status === 'error' ? <div>Error fetching data</div> :
        <button onClick={refetch}>强制重新获取数据</button>}
    <div>{data}</div>
    {isFetching && <div>Fetching...</div>}
    {window.queryClient.getQueryCache().find('cache') && <div>通过window.queryClient，缓存中有数据</div>}
    <div>
      {pageData.status === 'success' && <div>
        {pageData.data.data}
      </div>}
      点击后会缓存，翻页会使用缓存里的数据，注意必须设置staleTime
      <button onClick={() => setPage(pre => pre - 1)}>page-1</button>
      <button onClick={() => setPage(pre => pre + 1)}>page+1</button>
      <br />相关文章
      <a href="https://juejin.cn/post/7169515109172609032" target="_blank">https://juejin.cn/post/7169515109172609032</a><br />
      <a href="https://haofly.net/react-query/" target="_blank">https://haofly.net/react-query/</a><br />
      <a href="https://juejin.cn/post/7169515109172609032" target="_blank">https://juejin.cn/post/7169515109172609032</a><br />
    </div>
  </div>
};