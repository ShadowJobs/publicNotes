import { ThinkingDeepseakUrl } from "@/global";
import { ExportOutlined } from "@ant-design/icons";
import { Button } from "antd";

const MyGpt = () => {
  return <div style={{ position: "relative" }}>
    <div style={{ position: "absolute", right: 60, top: 22 }} title="新窗口打开">
      <Button href={ThinkingDeepseakUrl} size="small" target="_blank" type="link"><ExportOutlined /></Button>
    </div>
    <iframe src={ThinkingDeepseakUrl} style={{ width: "100%", height: "calc(100vh - 80px)" }}></iframe>
  </div>
}
export default MyGpt;