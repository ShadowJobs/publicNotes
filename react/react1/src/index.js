import './public-path'; //注意一定要放靠前一些，因为下面import的组件中可能会用到这个public-path.js中的__webpack_public_path__变量
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import microActions from './microActions';

function createShadowRootAndRender(ReactComponent, container) {
  // 创建一个包裹div，如果container存在则使用给定的container否则创建一个新的元素
  const wrapper = container ? container.querySelector('#root') : document.createElement('div');
  if (!container) {
    wrapper.id = 'root';
    document.body.appendChild(wrapper);
  }

  // 创建或者获取shadowRoot
  let shadowRoot = wrapper.shadowRoot;
  if (!shadowRoot) {
    shadowRoot = wrapper.attachShadow({ mode: 'open' });
  }

  // 渲染React组件到shadowRoot
  ReactDOM.render(<React.StrictMode>{ReactComponent}</React.StrictMode>, shadowRoot);
}


function render(props) {
  const { container } = props;
  ReactDOM.render(<React.StrictMode><App /></React.StrictMode>, container ? container.querySelector('#root') : document.querySelector('#root'));
  // createShadowRootAndRender(<App />, container);

}

if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log('[react17] react app bootstraped');
}

export async function mount(props) {
  console.log('[react17] props from main framework', props);
  microActions.mainAppMounted(props.onGlobalStateChange, props.setGlobalState);
  render(props);
}

export async function unmount(props) {
  const { container } = props;
  ReactDOM.unmountComponentAtNode(container ? container.querySelector('#root') : document.querySelector('#root'));
  // const wrapper = container ? container.querySelector('#root') : document.getElementById('root');
  // if (wrapper && wrapper.shadowRoot) {
  //   ReactDOM.unmountComponentAtNode(wrapper.shadowRoot);
  //   // Optionally remove the wrapper element if it was created by us
  //   if (!container) {
  //     document.body.removeChild(wrapper);
  //   }
  // }

}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); //性能检测
