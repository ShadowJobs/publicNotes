import React, { useEffect, useState } from "react";
import { Button, Space, Modal, Form, Select, Input, Switch, Divider } from "antd";
import { CloseCircleOutlined, EditOutlined } from "@ant-design/icons";
import queryClient from "@/utils/query-client";
import axios from "@/utils/axios";
import { DragOutlined } from '@ant-design/icons';
import { dashboardCfg } from "@/config/navigation";
// 图标选项
const iconOptions = [
  { value: '/images/doubao.png', label: 'Doubao' },
  { value: '/images/deepseek.ico', label: 'Deepseek' },
  { value: '/images/gemini_logo.png', label: 'Gemini' },
  { value: '/images/gpt-logo.jpeg', label: 'GPT' },
  { value: '/images/qwen.png', label: 'Qwen' },
  { value: '/images/deepResearch.png', label: 'DeepResearch' },
  { value: '/images/claude-logo.jpeg', label: 'Claude' },
  { value: '/images/default.png', label: 'Default' },
  { value: '/images/thinkin_claude.png', label: 'Thinkin Claude' },
  { value: '/images/tmp-llm-logo.png', label: 'TMP LLM' },
];
const EditCardModal: React.FC<{ visible: boolean; onCancel: () => void; initialValues: any }>
  = ({ visible, onCancel, initialValues }) => {
    const [form] = Form.useForm();
    const isAdd = initialValues?.isAdd;
    // const { data: dashboardCfg, isLoading } = useDashboardConfig()
    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();
      } catch (error) {
        console.error('Submit failed:', error);
      }
    };
    useEffect(() => {
      form.resetFields();
      form.setFieldsValue(initialValues);
    }, [initialValues]);
    return (
      <Modal title="编辑卡片" open={visible} onCancel={onCancel} onOk={handleSubmit}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Key" rules={[{ required: true, message: '请输入Key' }]} >
            {isAdd ? <Input /> : 
            <Select showSearch onChange={(v) => {
              form.resetFields()
              form.setFieldsValue({ name: v });
              form.setFieldsValue(dashboardCfg?.appHash[v]);
            }}
            options={Object.keys(dashboardCfg?.appHash || {}).map(v => ({ value: v, label: v }))} />}
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Select options={iconOptions} />
          </Form.Item>
          <Form.Item name="cardTitle" label="卡片显示标题" tooltip="卡片显示的标题,不设置则与Key相同,一个占一行">
            <Select mode="tags" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true, message: '请输入URL' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="recommend" label="推荐" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="is_new" label="新上线" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

const EditMenuModal: React.FC<{}> = () => {
  const appHash = dashboardCfg?.appHash || {};
  const MenuApps = Object.keys(dashboardCfg.appHash)
  const [editedMenu, setEditedMenu] = useState<any>(MenuApps)
  const [open, setOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [newFeature, setNewFeature] = useState<any>();

  // 处理拖拽开始
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // 处理拖拽进入区域
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    if (draggedItem !== index) {
      const newItems = [...editedMenu];
      const dragItem = newItems[draggedItem];
      // 删除拖拽项
      newItems.splice(draggedItem, 1);
      // 在新位置插入
      newItems.splice(index, 0, dragItem);
      setEditedMenu(newItems);
      setDraggedItem(index);
    }
  };

  // 删除项目
  const handleDelete = (index: number) => {
    const newItems = [...editedMenu];
    newItems.splice(index, 1);
    setEditedMenu(newItems);
  };

  return <>
    <Modal
      title="编辑菜单"
      open={open}
      onCancel={() => { setOpen(false) }}
      onOk={() => {
        // return console.log('editedMenu:', editedMenu)
        axios.post('/mdify/api/v2/dashboard/app-list', {
          config: editedMenu,
          app_type: "MenuAppRoutes"
        }).then(res => {
          console.log('Update dashboard config:', res.data);
          queryClient.invalidateQueries(["dashboard/config"]);
          setOpen(false);
        });
      }}
    >
      <div className="space-y-2">
        {editedMenu.map((title: string, index: number) => {
          const app = appHash[title];
          return (
            <div
              key={app.name}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              className={`
                  flex items-center justify-between 
                  p-2 border rounded-md border-gray-200
                  ${draggedItem === index ? 'bg-gray-100' : 'bg-white'}
                  cursor-move
                  hover:border-blue-500 
                  transition-colors
                `}
            >
              <div className="flex items-center gap-2">
                <DragOutlined className="text-gray-400" />
                <span>{app.name}</span>
              </div>
              <CloseCircleOutlined
                className="text-red-500 hover:text-red-600 cursor-pointer"
                onClick={() => handleDelete(index)}
              />
            </div>
          );
        })}
        <Divider />
        {newFeature ?
          <div style={{ textAlign: "center" }}>
            <Button type="default" onClick={() => {
              setEditedMenu([...editedMenu, newFeature]);
              setNewFeature(null);
            }}>添加到菜单</Button>
          </div> :
          <div style={{ textAlign: "center" }}>选择一个App</div>
        }
        <Select showSearch allowClear style={{ width: "100%" }}
          options={Object.keys(appHash).filter(v => !editedMenu.includes(v)).map(v => ({ value: v, label: v }))}
          value={newFeature}
          onChange={(v) => { setNewFeature(v) }}
        />
      </div>
    </Modal>

    <Button type="primary" onClick={() => {
      setOpen(true);
    }}>
      编辑Chat Gpts菜单
    </Button>
  </>
}

export { EditCardModal, EditMenuModal };