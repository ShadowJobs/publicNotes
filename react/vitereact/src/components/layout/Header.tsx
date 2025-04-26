import useUser from "@/hooks/useUser";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Dropdown, Layout, message, Space, theme } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import useQiankunState from "@/hooks/useQiankunState";
import microActions from "@/hooks/microActions";
export default function Header() {
  const {
    token: { colorBgContainer }
  } = theme.useToken();
  const { pathname } = useLocation();

  const { data: user } = useUser();
  const navigate = useNavigate();
  const [qkm] = useQiankunState();

  const handleLogout = () => {
    localStorage.removeItem("token");
    message.info("User logged out!");
    navigate(`/user/login?redirect=${pathname}`);
  };

  return (
    <Layout.Header
      className="flex items-center justify-between"
      style={{
        background: colorBgContainer
      }}
    >
      <Breadcrumb
        items={[
          { title: "home" },
          ...pathname
            .split("/")
            .slice(1)
            .map((item) => ({ title: item }))
        ]}
      />
      <Space>
        <Button type="primary" onClick={() => {
          let newQkm: number = qkm + 1
          microActions.setGlobalState!({ qkm: newQkm })
        }}>qiankun msg {qkm}</Button>
        <Dropdown
          trigger={["click", "hover"]}
          menu={{
            items: [
              {
                key: "logout",
                label: "Logout",
                icon: <LogoutOutlined />,
                onClick: handleLogout
              }
            ]
          }}
        >
          <Button type="text" className="flex items-center !py-6">
            <Avatar icon={<UserOutlined />} />
            <span className="ml-4">{user?.name ?? "anonymous"}</span>
          </Button>
        </Dropdown>
      </Space>
    </Layout.Header>
  );
}
