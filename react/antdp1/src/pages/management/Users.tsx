import { allUsers, changeUserRole, deleteUser } from "@/services/ant-design-pro/api";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, message, Modal, Select, Space, Table } from "antd";
import { useEffect, useState } from "react";
import { history, useModel } from "umi";

const ChangeRole: React.FC<{ data: any, callback?: Function, disabled?: boolean }> = ({ data, callback, disabled }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [role, setRole] = useState<'user' | 'guest'>(data.role);
  return <>
    {!isSelecting && <Button type="primary" disabled={disabled} onClick={async () => {
      setIsSelecting(true);
    }}>
      Change Role
    </Button>}
    {isSelecting && <div style={{ border: "1px solid #ccc", padding: 3 }}>
      <Select size="small" style={{ width: 100 }}
        options={['user', 'guest'].map((v) => ({ label: v, value: v }))}
        value={role} onChange={(v) => {
          setRole(v);
        }}
      />
      &nbsp;
      <Button size="small" onClick={async () => {
        const res = await changeUserRole({ id: data.id, role });
        if (res.code !== 0) message.error(res.msg);
        else {
          callback?.();
          setIsSelecting(false);
        }
      }}>OK</Button>
    </div>}
  </>
}
const Users: React.FC = () => {
  const [users, setUsers] = useState([]);
  const { initialState } = useModel('@@initialState');
  const { role: myRole, name } = initialState?.currentUser || {};
  const getAllUsers = async () => {
    const response = await allUsers();
    setUsers(response.data);
  }
  useEffect(() => {
    getAllUsers();
  }, []);
  return <>
    <Table dataSource={users} rowKey="id" columns={[
      { dataIndex: 'id', title: 'ID' },
      { dataIndex: 'name', title: 'Name' },
      { dataIndex: 'gender', title: 'Gender' },
      { dataIndex: 'role', title: 'Role' },
      {
        dataIndex: 'operation', title: 'Operation', render: (d, row: any) => {
          return <Space>
            <Button type="primary" disabled={myRole != 'admin'} icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Delete User',
                  content: 'Are you sure to delete this user?',
                  onOk: async () => {
                    const res = await deleteUser({ id: row.id });
                    if (res.code !== 0) message.error(res.msg);
                    else getAllUsers();
                  }
                });
              }}>
              Delete
            </Button>
            <ChangeRole data={row} callback={getAllUsers} disabled={myRole != 'admin'} />

            {row.name === name && <Button type="primary" icon={<EditOutlined />}
            onClick={async () => {
              history.push(`/user/login?openforget=1`);
            }}>
              修改密码
            </Button>}
          </Space>
        }
      }
    ]} />
  </>
}
export default Users;