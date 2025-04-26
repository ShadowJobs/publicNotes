import { App as AntdApp, ConfigProvider } from "antd";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
      <ConfigProvider theme={{ token: { colorPrimary: "#4299e1" } }}>
        <AntdApp>
          <App />
        </AntdApp>
      </ConfigProvider>
  </React.StrictMode>
);
