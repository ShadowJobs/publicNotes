import { sendErrorToServer } from "@/startItems";
import { WarningTwoTone } from "@ant-design/icons";
import { Card } from "antd";
import React from "react";
// 函数组件无法实现，只能用类组件
class ErrorBoundary extends React.Component {
  constructor(props) {
      super(props);
      this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
      // 更新 state 使得下次渲染可以展示出错 UI
      return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
      // 这里你也可以将错误记录到一些报告服务中
      console.log(error, errorInfo);

      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        type: 'react_comp'
      };
      
      // 发送错误信息到服务器
      sendErrorToServer(errorData);
  }
//   上2个函数只能捕获生命周期里的钩子里的错误，一般是render的错误


  render() {
      if (this.state.hasError) {
          // 自定义你的出错 UI 
          return <Card title={this.props.title}>
            <h1><WarningTwoTone/> 数据格式错误</h1>
            ErrorBoundary只能用类组件来定义。<br/>
            这里是自定义的ErrorBoundary，React也自带了一个在import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';里面会打印对战信息
            注意，只在本地调试时会显示全屏的错误，点关闭按钮就能看到实际效果。在prod下会直接显示最终效果
          </Card>
      }
      return this.props.children;
  }
}
export default ErrorBoundary