import React, { useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Space, Divider, Modal, DatePicker } from 'antd';
import { useIntl } from 'umi';
import './Welcome.less';
import { eliminateAsyncCall, savePageWithStyles } from '@/utils';
import { useQuery } from 'react-query';
import { fetchReQuery } from '@/services/myExpressApi/express1';
import { ExpressUrl, FrontendPre, ThinkingDeepseakUrl } from '@/global';

import locale from 'antd/es/date-picker/locale/en_US';

const { RangePicker } = DatePicker;

const getAsyncJobData = async () => {
  const res = await fetch(`${ExpressUrl}/job/objdata`);
  res.json().then(res => console.log(res));
}
const getJobData = () => {
  // 非await的fetch重写，见utils.ts
  const result = fetch(`${ExpressUrl}/job/objdata`)
  console.log(result);
}

const SelfCompTest: React.FC<{ name: string }> = ({ name }) => {
  return <div>自定义组件+ {name}</div>
}
const CreateElementTest = ({ render, props }) => {
  return <div>
    aaaaaaaa
    <br />
    {React.createElement(render, props)}
  </div>
}
const Welcome: React.FC = () => {
  const intl = useIntl();
  // 对于轮询任务非常适合用react-query
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
  const [visible, setVisible] = React.useState<boolean>(false)
  useEffect(() => {
    console.log("In running time")
    console.log(process.env.TEST_ENV)
    console.log(process.env.TEST_ENV2)
    console.log(process.env.NODE_ENV)
  }, [])
  return (
    <PageContainer>
      <h2>
        <a style={{ textDecoration: "underline" }} href={
          window.location.hostname === "localhost" ? "http://localhost:6002" : (window.location.protocol + '//' + window.location.hostname + ':39003')
        } target='_blank'>Monorepo 微前端项目,主vite+react,子1:react,子2:vue3</a>
      </h2>
      <h2>
        <a style={{ textDecoration: "underline" }} href={ThinkingDeepseakUrl} target='_blank'>
          LLM项目： My Deepseek
        </a>
      </h2>
      <Space>
        <Button onClick={savePageWithStyles}>保存,导出当前页面</Button>
        <a href={`${FrontendPre}/LinYing/JsTest`}>测试Helmet</a>
        <Button><a href={`${FrontendPre}/responsiveTest`}>响应式原理</a></Button>
        <Button><a href={`${FrontendPre}/webgltest.html`}>webgl</a></Button>
        <Modal open={visible} onCancel={() => setVisible(false)} onOk={() => setVisible(false)}>
          <div>部署时的现状：跟同学共同租了一个云服务，他先部署了自己的服务在域名根目录下，可以通过域名直接定位。所以我的服务需要通过路由
            来做转发定位。需要做如下工作：
          </div>
          <ul style={{
            listStyleType: "decimal",
          }}>
            <li>前端react修改：修改index.html(通过路径转发共用域名和端口时，需要添加这个path，其他情况不需要)，添加{'<base href="/ly/">'}，或者修改config/config.ts，添加 publicPath: '/ly/'（本项目通过deploy修改）
              目的是将前端所有的资源访问都加上/ly/，避免跟同学的项目访问冲突</li>
            <li>前端所有的api请求都加上/api-ly/前缀，并且至少伪造mock的登录和currentUser2个接口，移植到express项目里，除此之外express不用再做其他修改</li>
            <li>在服务器部署前端服务：遇到的问题1，由于买的服务器是最低配的，所以执行npm run build会报内存不够的错误，解决：在
              本地执行npm run build，然后将dist目录上传到服务器,
            </li>
            <li>在服务器部署后端服务：直接在后端启动screen+express，端口5000</li>
            <li>修改nginx：{`location /ly/ {
                alias /xxx/antdp1/;  # react应用>生成的build目录
                try_files $uri $uri/ /index.html;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              }`}
              <div>这一段是做前端的转发</div>
              {`location /api-ly/ {
                proxy_pass http://127.0.0.1:5000/;
              }`}
              <div>这一段是做后端转发</div>
            </li>
            <li>写一个sh文件，自动做3件事，因为本地配置了publicPath后，跑步起来，所以脚本第一件事是修改publicPath，
              将config.ts的默认为//publicPath: '/ly/'，deploy第一句就是将path的注释去掉，然后run build,然后重新注释
              删除服务器上的代码，上传新dist代码
            </li>
            <li>本地mock里的/api/的登录和currentUser也都要改成/api-ly/，不然本地依然访问/api/会导致跟线上不一致</li>
          </ul>
        </Modal>
        <Button onClick={() => setVisible(true)} >部署</Button>
        <Button><a href={`${FrontendPre}/webcomp.html`} target='_blank'>Web Component</a></Button>
        <Button><a href={`${FrontendPre}/常用标签.html`} target='_blank'>常用html标签</a></Button>
      </Space>
      <div><Space>
        <Button onClick={getAsyncJobData}>异步fetch</Button>
        <Button onClick={() => eliminateAsyncCall(getJobData)}>非await的fetch</Button>

        <RangePicker locale={locale} showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />单独指定组件的语言，国际化
      </Space></div>
      <div>
        <div>
          {CreateElementTest({ render: SelfCompTest, props: { name: "传输的data部分" } })}
          将组件作为一个函数传入，然后在函数里使用React.createElement，这样就可以在组件里使用JSX了
        </div>
      </div>
      <Divider />
      <div>
        <div>React query测试</div>
        <div>另一个共享本react-query的页面在LinYing/JsTest里</div>
        <div>status: {status}</div>
        {status === "loading" ? <div>loading...</div> :
          status === "error" ? <div>error</div> :
            <div>
              <div>data: {data?.data}</div>
            </div>}
      </div>
    </PageContainer>
  );
};

export default Welcome;
