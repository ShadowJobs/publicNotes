import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import App from "./App";
import "antd/dist/reset.css";
import "@minko-fe/use-antd-resizable-header/dist/style.css";
import "./index.css";
import "./registerApps.js";
// Sentry.init({
//   dsn: "https://...@sentry.mmtwork.com/55",
//   integrations: [new Integrations.BrowserTracing()],
// });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
