import React, { useState } from 'react';
import { Button } from 'antd';

import { DownloadOutlined } from '@ant-design/icons';
import { ExpressUrl } from '@/global';

const fanStyle = {
  width: '20px',
  height: '20px',
};

const DownloadFile: React.FC = () => {
  const [progress, setProgress] = useState(0)
  // 使用svg抗锯齿
  // 判断是否需要大弧标志（如果角度大于180度，这个值应该是1）
  const largeArcFlag = progress > 50 ? 1 : 0;
  // 将百分比转换成圆的弧度部分
  const angle = (3.6 * progress) * (Math.PI / 180); // 转换成弧度
  const radius = 10; // 圆的半径
  const circleCenterX = radius; // 圆心X坐标
  const circleCenterY = radius; // 圆心Y坐标

  // 计算扇形终点坐标
  const x = circleCenterX + radius * Math.cos(angle);
  const y = circleCenterY + radius * Math.sin(angle);
  // 构建SVG路径
  const d = `
    M ${circleCenterX},${circleCenterY} 
    L ${circleCenterX + radius},${circleCenterY} 
    A ${radius},${radius} 0 ${largeArcFlag} 1 ${x} ${y} 
    Z
  `;
  return (<div>
    <Button onClick={() => {
      let a = document.createElement('a');
      a.href = `/compress.zip`;
      a.download = 'compress.zip'; //可以重命名
      a.click();
    }}>下载1 a.click() 浏览器进程下载</Button>
    <Button href="/compress.zip" download="compress.zip">下载2 a标签</Button>
    <>
      {(progress > 0 && progress < 100) ? <>
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          borderColor: 'gray',
          backgroundImage: `conic-gradient(#fa8c16 ${3.6 * progress}deg, transparent ${3.6 * progress}deg)`, // 使用圆锥渐变制作扇形
          WebkitBackdropFilter: 'blur(1px)', // 对于Safari浏览器添加抗锯齿效果
          backdropFilter: 'blur(1px)' // 添加抗锯齿，对于支持backdrop-filter的浏览器
        }}
        ></div>
        <div style={fanStyle}>
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path d={d} fill="blue" />
          </svg>
        </div>
      </> :
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => {
          let url = `${ExpressUrl}/job/bigfile`
          fetch(url)
            .then(response => {
              // 获取总文件大小
              const contentLength = response.headers.get('Content-Length');
              if (!response.body || !contentLength) {
                console.error('无法获取下载进度信息。');
                return response.blob();
              }
              const total = parseInt(contentLength, 10);
              let loaded = 0;
              // 创建一个新的 reader 来读取数据
              const reader = response.body.getReader();
              const stream = new ReadableStream({
                start(controller) {
                  function read() {
                    reader.read().then(({ done, value }) => {
                      if (done) {
                        controller.close(); // 确保流被正确关闭
                        return;
                      }
                      loaded += value.byteLength;
                      console.log(`下载进度：${((loaded / total) * 100).toFixed(2)}%`);
                      setProgress((loaded / total) * 100)
                      controller.enqueue(value); // 将数据段传递到流中
                      read();
                    }).catch(error => {
                      console.error('下载过程中发生错误:', error);
                      controller.error(error);
                    });
                  }
                  read();
                }
              });
              return new Response(stream).blob();
            })
            .then(blob => {
              // 使用Blob创建下载链接，并模拟点击以开始下载
              const blobUrl = window.URL.createObjectURL(blob);
              let a = document.createElement('a');
              a.style.display = 'none';
              a.href = blobUrl;
              a.download = 'a.json'; // 设置下载文件的名称,如果不设置，则不会弹出文件保存框，而是直接在浏览器中打开，可能还是乱码
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(blobUrl);
            })
            .catch(error => console.error('下载失败:', error));
        }}>下载3, fetch自行控制下载</Button>}
      <Button onClick={async () => {
        const result = await fetch(`${ExpressUrl}/job/bigfile`) //第一次await只是head部分，第二次await res.json()才是body部分,但是json会等所有的数据都到达才返回
        const reader = result.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        while (true) {
          const r = await reader?.read();//这次是read的body部分
          if (r?.done) break;
          const txt = decoder.decode(r?.value);
          console.log(txt)//这里只读取最后一次的结果，方便展示的时候看到变化
        }
      }} >下载4,输出在控制台 </Button>
    </>
  </div>
  );
};

export default DownloadFile;
