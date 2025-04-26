import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function ErrorAlert() {
  const navigate = useNavigate();

  return (
    <Result
      status="error"
      title="Something went wrong!"
      subTitle="Please try again later."
      extra={[
        <Button key="go-back" type="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>,
        <Button key="refresh" onClick={() => navigate(0)}>
          Refresh
        </Button>
      ]}
    />
  );
}
