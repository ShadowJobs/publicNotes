
import { ExclamationCircleOutlined } from '@ant-design/icons';
import confirm from 'antd/lib/modal/confirm';
import { PythonUrl } from './global';

//--------------------********* 自动检测前端发版
let lastSrcs: any;  //上一次获取到的script地址
let needTip = true; // 默认开启提示
const scriptReg = /<script.*src=["'](?<src>[^"']+)/gm;
const extractNewScripts = async () => {
  let result = [];
  try {
    const html = await fetch('/?_timestamp=' + Date.now()).then((resp) => resp.text());
    scriptReg.lastIndex = 0;
    let match: RegExpExecArray
    while ((match = scriptReg.exec(html) as RegExpExecArray)) {
      result.push(match.groups?.src)
    }
  } catch (error) {
    console.error(error);
  }
  return result;
}
const needUpdate = async () => {
  const newScripts = await extractNewScripts();
  if (!lastSrcs) {
    lastSrcs = newScripts;
    return false;
  }
  let result = false;
  if (lastSrcs.length !== newScripts.length) {
    result = true;
  }
  // 必须检测到脚本里含有/umi.xxx.js才刷新，否则可能是其他脚本的更新
  if (!newScripts.some((src: string) => src.includes('/umi.'))) {
    console.log("没有umj.js，可能正在更新，也可能nginx报错，挂了等")
    return false;
  }
  for (let i = 0; i < lastSrcs.length; i++) {
    if (lastSrcs[i] !== newScripts[i]) {
      result = true;
      break
    }
  }
  lastSrcs = newScripts;
  return result;
}
const DURATION = 900000;
const autoRefresh = () => {
  setTimeout(async () => {
    const willUpdate = await needUpdate();
    if (willUpdate) {
      // 延时更新，防止部署未完成用户就刷新空白
      setTimeout(() => {
        confirm({
          title: '检测到页面有内容更新，为了功能的正常使用，是否立即刷新？',
          icon: <ExclamationCircleOutlined />,
          content: '页面有更新',
          onOk() {
            console.log('click reload');
            window.location.reload();
          },
          onCancel() {
            console.log('Cancel');
          },
        })
      }, 300000);
      needTip = false; // 关闭更新提示，防止重复提醒
    }
    if (needTip) {
      autoRefresh();
    }
  }, DURATION)
}
// --------------------********* 自动检测前端发版

// --------------------********* 错误监听
function sendErrorToServer(errorInfo) {
  const data = JSON.stringify(errorInfo);

  fetch(`${PythonUrl}/front-err/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  }).catch(err => {
    console.error('Error reporting failed:', err);
  });
}
const startListenError = () => {
  window.onerror = function (message, source, lineno, colno, error) {
    const errorInfo = {
      message,
      source,
      lineno,
      colno,
      stack: error && error.stack,
      type:"normal",
      user:window.currentUser?.name
    };
    
    sendErrorToServer(errorInfo);
    // return true; // 阻止默认的错误处理
  };
  window.addEventListener('unhandledrejection', function (event) {
    const errorInfo = {
      message: event.reason.message,
      stack: event.reason.stack,
      user:window.currentUser?.name,
      type:"promise"
    };

    sendErrorToServer(errorInfo);
  });

}

export { autoRefresh, startListenError, sendErrorToServer };