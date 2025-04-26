import { useEffect, useState } from "react"
import { Helmet } from "umi";
import B from "./B";
import { Tooltip, message } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

import { useQuery } from 'react-query';
import { fetchPageData, fetchReQuery } from "@/services/myExpressApi/express1";
import { ExpressUrl } from "@/global";
// tag函数会把模板字符串拆分成数组，参数是拆分后的数组和变量
const TagFunc1 = (strs, ...args: any[]) => {
  console.log(strs, args);//
  return strs[0]
}
const TagFunc2 = (strs, a, b) => {
  console.log(strs);
  console.log(a(true));
  console.log(b);

  return strs[0]
}
const A = () => {
  return <>This is A 2</>
}
export default function JsTest() {
  // 初步用法
  const userInput = "<img src='http://url.to.file.which/not.exist' onerror=alert(document.cookie);>"
  const TagFuncTest1 = () => {
    let b = 2
    var x = `background-color: ${ri => ri ? '#1890ff' : '#fff'}`
    console.log(x); //x里的函数不会执行，直接输出字符串
    TagFunc1`background-color: ${ri => ri ? '#1890ff' : '#fff'};color:"red"`
    TagFunc1`background-color: ${"blue"};color:${"red"}` //本函数结果拆分的数组为["background-color: ",";color:",""]，参数为["blue","red"]
    TagFunc2`background-color: ${ri => ri ? '#1890ff' : '#fff'};color:"red"${b}`
  }
  function htmlEscape(literals, ...substitutions) {
    let result = "";
    // 遍历原始的字符串和占位符
    for (let i = 0; i < substitutions.length; i++) {
      result += literals[i];
      result += escape(substitutions[i]);  // 对用户的输入进行转义处理
    }
    // 添加最后一段文字
    result += literals[literals.length - 1];
    return result;
  }
  function escape(s) {
    return s.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  const [controller, setController] = useState()
  const [xhr, setXhr] = useState()
  const { data, status } = useQuery('todos', fetchReQuery, {
    enabled: true, //默认为true，也就是开启了缓存，加载时会请求1次
    staleTime: 1000 * 3, // 数据在3秒后会陈旧
    cacheTime: 1000 * 6, // 缓存在10秒后删除
    retry: 1, // 失败后重试次数
    refetchOnWindowFocus: false,// 窗口聚焦时是否自动刷新
    refetchOnMount: false, // 组件挂载时是否自动刷新
    refetchOnReconnect: false, // 断网重新连接后是否自动刷新
    refetchInterval: false, // 自动刷新的时间间隔
    refetchIntervalInBackground: false, // 页面在后台时是否自动刷新
    // initialData: '初始数据,设置了之后，默认第一次不会请求数据，而是直接使用这个数据，点击强制获取可更新数据', 
  });

  const [page, setPage] = useState(0)
  const pageData = useQuery(['pageData', page], () => fetchPageData(page), {
    keepPreviousData: true, // 保持上一次的数据，直到新数据返回，这样可以避免闪烁。如果设置为false，那么在新数据返回之前，数据会变成undefined
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 3, // 数据在3秒后会陈旧
    cacheTime: 1000 * 6, // 缓存在6秒后删除
  })

  useEffect(() => {
    TagFuncTest1();
  }, [])
  return <>
    <Helmet>
      <meta charSet="utf-8" />
      <title>本页面标题被修改了</title>
      <link rel="canonical" href="http://mysite.com/example" />  {/* 用于告诉搜索引擎这个页面的永久链接地址。 */}
      <meta name="description" content="这是一个示例描述" /> {/* 搜索相关 */}
    </Helmet>
    <ul style={{ listStyleType: "decimal" }}>
      <li>tag 函数TagFunc1`backgr${"{2}"}`,请查看代码;模板字符串里如果直接写函数，那么就会直接输出函数字符串；如果传给tag函数，就可以在tag函数中执行</li>
      <li>tag函数用于html <div dangerouslySetInnerHTML={{
        __html: htmlEscape`<div>${userInput}</div>`
      }} /></li>
      <li>Helmet用法，查看源码</li>
      <li>
        <div>测试热更 hmr 本文件内的JsTest自己的代码，和模块 A的代码，会收到umi.xxx.hot-update.json<br />，
          umi.xxx.hot-update.js（这里面只返回了一个ID）,
          <br /> p_LinYing_JsTest.xxx.hot-update.js,这里面返回了完整的JsTest代码</div>
        <A />
        <div>对于B模块的修改，同样会收到umi.xxx.hot-update.json,umi.xxx.hot-update.js
          但是p_LinYing_JsTest.xxx.hot-update.js里只包含了B.tsx的代码，不会返回整个JsTest.
          所以热更的最小单位应该是文件，而不是组件
        </div>
        <B />
      </li>
      <li>
        <Tooltip title={
          <ul style={{ listStyleType: "decimal" }}>
            <li>防止重复请求： 当用户连续点击按钮导致多次发送相同的请求时，可以取消之前未完成的请求。</li>
            <li>依赖先前请求的后续请求： 如果你有两个请求，第二个请求依赖于第一个请求的结果，但第一个请求又需要很长时间，此时用户决定不等待而离开当前页面，那么这两个请求都可以被取消。</li>
            <li>搜索功能： 在实现即时搜索（用户输入每个字符都发送请求）的时候，如果用户输入的速度非常快，那么在前一个请求还未返回结果之前，新的请求就已经发出。在这种情况下，我们只关心最新的请求结果，旧的或者慢的请求结果会被忽视，因此可以取消还未返回的请求。</li>
            <li>优化性能： 对于一些资源密集型操作，如大文件上传/下载，如果用户在操作过程中选择取消，服务器端的处理也应该随之停止，以节省服务器资源。</li>
            <li>提高用户体验： 在某些情况下，当用户进行了其他操作（如切换页面，关闭模态框等）以后，原来的请求返回的数据可能不再需要，这时候可以取消请求。</li>
          </ul>}>
          请求取消 <InfoCircleOutlined />
        </Tooltip>
        <br />fetch的请求取消
        <button onClick={() => {
          const _controller = new AbortController()
          setController(_controller)
          fetch(`${ExpressUrl}/job/longtime`, { signal: _controller.signal })
            .then(response => response.json())
            .then(data => {
              message.success("请求成功")
              console.log(data)
              setController(undefined)
            })
            .catch(err => {
              if (err.name === 'AbortError') {
                console.log('Fetch aborted');
              } else {
                console.error('Another error: ', err);
              }
            });
        }}>fetch请求</button>
        {controller && <button onClick={() => controller?.abort()}>取消</button>}
        <br />
        xhr的请求取消
        <button onClick={() => {
          if (xhr) {
            xhr.abort()
            setXhr(null)
          }
          const _xhr = new XMLHttpRequest();
          setXhr(_xhr)
          _xhr.open('GET', `${ExpressUrl}/job/longtime`, true);
          _xhr.send();
          _xhr.onreadystatechange = function () {
            if (_xhr.readyState === 4) {
              if (_xhr.status === 200) {
                console.log(_xhr.responseText);
              } else {
                console.error(_xhr.statusText);
              }
              setXhr(null)
            }
          };
        }}>xhr请求</button>
        {xhr && <button onClick={() => {
          xhr.abort()
        }}>取消</button>}
        <br />
        axios的请求取消,略，看下面的源码
        {/*import axios from 'axios';

        // 创建一个 CancelToken 实例
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        // 发起一个 axios 请求
         axios.get('/user/12345', {
          cancelToken: source.token
        }).then(function (response) {
          console.log(response);
        }).catch(function (thrown) {
          if (axios.isCancel(thrown)) {
            console.log('Request canceled', thrown.message);
          } else {
            // 处理错误
          }
        });

        // 取消请求（message 参数是可选的）
        source.cancel('Operation canceled by the user.'); */}
      </li>
      <li>
        <div>React query测试</div>
        <div>antdp项目要修改app.tsx</div>
        <ul style={{ listStyleType: "decimal" }}>
          <li>
            <div>共享测试：另一个共享本react-query的页面在welcome里</div>
            <div>status: {status}</div>
            {status === "loading" ? <div>loading...</div> :
              status === "error" ? <div>error</div> :
                <div>
                  <div>data: {data?.data}</div>
                </div>}
          </li>
          <li>
            <div>翻页测试</div>
            <div>
              {pageData.status === 'success' && <div>
                {pageData.data.data}
              </div>}
              点击后会缓存，翻页会使用缓存里的数据，注意必须设置staleTime
              <button onClick={() => setPage(pre => pre - 1)}>page-1</button>
              <button onClick={() => setPage(pre => pre + 1)}>page+1</button>
            </div>
          </li>
        </ul>
      </li>
    </ul>
  </>
}