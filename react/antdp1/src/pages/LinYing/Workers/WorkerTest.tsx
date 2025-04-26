import { message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

const bigJob = () => {
  const startTime = Date.now();
  let result = 0;
  while (Date.now() - startTime < 3000)
    result += Math.random();
  message.success("大任务计算完成")
  return result;
}
//使用web worker多线程技术，分离主-子线程
const WithWorkerTest: React.FC<{ value?: string[], onChange?: Function }> = ({ value, onChange }) => {
  const workerRef = useRef(null);
  const broadCastRef=useRef(null)
  useEffect(() => {
    workerRef.current = new Worker("/ChildWebWorker.worker.js");
    // 下面两种监听方法都可以
    // workerRef.current.addEventListener('message', ...) 和 workerRef.current.onerror(...)相同
    workerRef.current.addEventListener('message', (e) => {
      console.log("Received result from worker: ", e.data);
      message.success("收到子线程worker的消息" + e.data)
    });
    // workerRef.current.onmessage = function (event) {
    //   console.log('Received message ' + event.data);
    //   // doSomething();
    // }

    broadCastRef.current=new BroadcastChannel("test_broad")
    broadCastRef.current.onmessage=(e)=>{
      message.info(`收到广播：${e.data}`)
    }


    return () => {
      workerRef.current.terminate();//主线程写法：terminate
      // 子线程关闭用self.close()

      broadCastRef.current.close()
    };
  }, []);

  const handleButtonClick = () => {
    // Send data to our worker
    workerRef.current.postMessage({ "a": 1, "data": { "B": 2 } });
  };

  return <div>
    <button onClick={handleButtonClick}>使用worker子线程</button>
    <br/>
    <button onClick={()=>{
      console.log("click broad");
      broadCastRef.current.postMessage("有人点击了广播按钮")
      }}>发送广播
    </button> 

    注意广播可以在同一个浏览器的不同tab,iframe间传递消息，但是，本页面不会收到本页面post的消息.
    跨标签通信的方法还有
    <li>serice worker</li>
    <li>localStorage，window.onstorage监听</li>
    <li>websocket</li>
    <li>SharedWorker 定时器轮询</li>
    <li>indexdb 定时器轮询</li>
    <li>cookie 定时器轮询</li>
    <li>window.open window.postMessage????</li>
      
  </div>
};

const WorkerTest: React.FC<{}> = ({ }) => {
  return <div>
    <button onClick={() => { message.info("测试卡顿") }}>测试卡顿</button> 点击过程中，主线程计算会导致此按钮不可点击
    <div>
      <button onClick={bigJob}>2主线程直接计算</button> 这是1个3秒的任务
    </div>
    <WithWorkerTest /> 启用worker线程，不会卡主主线程，上面的测试按钮可以点击并响应
    但是注意：
    worker的限制 <a href="https://www.jianshu.com/p/4cdc14c2fc67" target='_blank'>https://www.jianshu.com/p/4cdc14c2fc67</a>
    <a href="https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API" target='_blank'>worker 官方文档</a>
    <ul>
      <li>1，Worker 线程一旦新建成功，就会始终运行，不会被主线程上的活动（比如用户点击按钮、提交表单）打断。这样有利于随时响应主线程的通信。但是，这也造成了 Worker 比较耗费资源，不应该过度使用，而且一旦使用完毕，就应该关闭。</li>
      <li>2，必须同源，不能跨域</li>
      <li>3，无法读取主线程所在网页的 DOM 对象，也无法使用document、window、parent这些对象。但是，Worker 线程可以navigator对象和location对象。</li>
      <li>4，不能执行alert()方法和confirm()方法，但可以使用 XMLHttpRequest 对象发出 AJAX 请求。</li>
      <li>5，无法读取本地文件，即不能打开本机的文件系统（file://），它所加载的脚本，必须来自网络。</li>
      <ul>
        ant d p等框架里因为对构建的文件夹做了统一的处理，所以，使用相对路径时，无法正确处理worker文件。有两种方式：
        <li>&nbsp;A，放到静态public文件夹里，没有任何限制，</li>
        <li>&nbsp;B，create react app和craco项目可以用如下步骤使用worker:
          <ul>
            <li>{`
            craco中修改craco.config.js
            module.exports = {
              // ...
              webpack: {
                configure: (webpackConfig, { env, paths }) => {
                  webpackConfig.module.rules.push({
                    test: /\.worker\.js$/,
                    use: { loader: 'worker-loader' },
                  });
            
                  return webpackConfig;
                },
              },
            };
            ant design pro中修改：chainWebpack(config){
              config.module
                .rule('worker')
                .test(/\.worker\.js$/)
                .use('worker-loader')
                .loader('worker-loader');
            }`}</li>
            <li>npm安装worker-loader, 将自定义的worker文件以.worker.js结尾</li>
            <li>使用worker的地方，craco中写import MyWorker from './ChildWebWorker.worker.js';<br/>
              ant d p写 import MyWorker from "worker-loader!./ChildWebWorker.worker.js";    
              <br/>workerRef.current = new MyWorker();</li>
            <li>对于ant design pro项目，如果启用了mfsu那么将无法使用worker，解决办法1，关闭mfsu，2，使用像<a href='https://github.com/GoogleChromeLabs/comlink'>comlink</a> 这样的库来处理Web Workers
              3,umi对于解决mfsu和worker的问题有<a href='https://umijs.org/docs/guides/mfsu'>官方解法</a>
            </li>
            
          </ul>
        </li>
      </ul>
      <li>6，消息传递的是个拷贝值，不是引用，浏览器内部的运行机制是，先将通信内容串行化，然后把串行化后的字符串发给 Worker，后者再将它还原</li>
      <li>7， 主线程与 Worker 之间也可以交换二进制数据，比如 File、Blob、ArrayBuffer 等类型，也可以在线程之间发送
      但是，拷贝方式发送二进制数据，会造成性能问题。比如，主线程向 Worker 发送一个 500MB 文件，默认情况下浏览器会生成一个原文件的拷贝。为了解决这个问题，JavaScript 允许主线程把二进制数据直接转移给子线程，但是一旦转移，主线程就无法再使用这些二进制数据了，这是为了防止出现多个线程同时修改数据的麻烦局面。这种转移数据的方法，叫做Transferable Objects。这使得主线程可以快速把数据交给 Worker，对于影像处理、声音处理、3D 运算等就非常方便了，不会产生性能负担。
      如果要直接转移数据的控制权，就要使用下面的写法。
        // Transferable Objects 格式
        worker.postMessage(arrayBuffer, [arrayBuffer]);
        <br/>
        // 例子
        var ab = new ArrayBuffer(1);
        worker.postMessage(ab, [ab]);
      </li>
      <li>8，worker的多线程不属于js，而是浏览器的接口</li>
    </ul>
  </div >
}

export default WorkerTest;
