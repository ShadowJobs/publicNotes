import { DEFAULT_ROUTE_PATH } from "@/config/navigation";
import { Button, Result } from "antd";

export default function NotFound() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button type="primary" href={DEFAULT_ROUTE_PATH}>
          Back Home
        </Button>
      }
    />
  );
}
