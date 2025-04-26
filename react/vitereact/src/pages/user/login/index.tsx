import Footer from "@/components/layout/Footer";
import PageTitle from "@/components/layout/PageTitle";
import { UserService } from "@/services";
import { setToken, UserInfo, type LoginParams } from "@/services/user";
import queryClient from "@/utils/query-client";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Layout, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Logo = () => (
  <div className="mb-10 mt-6 text-center">
  </div>
);

const LoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  // 在url里获取redirect参数，用于登录后跳转
  const searchParams = new URLSearchParams(window.location.search);
  const redirect = searchParams.get("redirect");


  const handleLogin = async (params: LoginParams) => {
    setIsLoading(true);
    try {
      if(!params.username || !params.password) {
        params.username="guest"
        params.password="guest"
      }
      const response = await UserService.login({ ...params, });
      setIsLoading(false);
      if (response.data.token) {
        const token = response.data.token
        setToken(token);
        message.success("User login success!");
        queryClient.invalidateQueries(["user/info"]);
        navigate(redirect || "/");
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <Form name="login" onFinish={handleLogin}>
      游客请输入guest,guest
      <Form.Item
        name="username"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <Input prefix={<UserOutlined />} placeholder="guest" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input prefix={<LockOutlined />} type="password" placeholder="guest" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Login
        </Button>
        &nbsp;
        <Button type="primary" loading={isLoading} onClick={() =>{
          handleLogin({} as LoginParams)
        }}>
          Guest Login
        </Button>
      </Form.Item>
    </Form>
  );
};

export default function LoginPage() {
  return (
    <>
      <PageTitle title="Login" />
      <Layout.Content className="p-8">
        <main className="my-36 grid place-items-center">
          <Card className="flex w-96 flex-col">
            <Logo />
            <LoginForm />
          </Card>
        </main>
        <Footer />
      </Layout.Content>
    </>
  );
}
