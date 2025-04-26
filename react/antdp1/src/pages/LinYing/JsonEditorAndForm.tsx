import React, { useState } from 'react';
import { Form, Button, Input, Select, Row, Col, message, Space } from 'antd';

import JsonEditor from './JSONEditor';
import { request } from 'umi';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { ExpressUrl } from '@/global';

export function removeEnter(str: string) {
  return str.replace(/\n/g, "")
}
type formValue = {
  data_name?: string;
  tags?: string[];
  params: { content: {}; valid: boolean };
  data_filter: { content: {}; valid: boolean },
};

const DataLakeJob: React.FC<{ req: any }> = ({ req }) => {
  const [form] = Form.useForm();
  const [refData, setrefData] = useState<any>();
  const [submitV, setsubmitV] = useState<any>();

  const handleSubmit = async (values: formValue) => {
    try {
      const submitValues = {
        ...values,
        data_name: values.data_name,
        tags: values.tags,
        data_filter: JSON.parse(removeEnter(refData.current.getText())),
        //这里的refData是从Editor里面获取的，不能直接从values里获取。注释见JSONEditor.tsx
      };
      setsubmitV(JSON.stringify(submitValues, null, 2));
      await request(`${ExpressUrl}/job`, {
        method: "post",
        data: submitValues,
      })
      console.log(submitValues);
    } catch (error: any) {
      console.log(error);
      message.error(error);
    }
  };
  return (
    <>
      <div>支持二维数组的输入</div>
      已输入的结构：<Input.TextArea value={submitV} style={{ height: 200 }} />
      <Form name="datalake" onFinish={handleSubmit} form={form} layout="vertical">
        <Form.Item name="data_name" label="Data name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.List name="matrix">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">

                  <Form.List name={[index]}>
                    {(subFields, { add: addItem, remove: removeItem }) => (
                      <>
                        {subFields.map((subField) => (
                          <Space direction="horizontal" style={{border:"1px dash black"}}>
                            <Form.Item name={[subField.name, 'x']} rules={[{ required: true, message: '请输入X' }]} label="Key">
                              <Input placeholder="输入X" />
                            </Form.Item>
                            <Form.Item name={[subField.name, 'y']} rules={[{ required: true, message: '请输入Y' }]} label="Value">
                              <Input placeholder="输入Y" />
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => removeItem(subField.name)} />
                          </Space>
                        ))}
                        <Button type="dashed" onClick={() => addItem({"x":1,"y":2})} icon={<PlusOutlined />}>
                          添加一列
                        </Button>
                      </>
                    )}
                  </Form.List>

                  <MinusCircleOutlined onClick={() => remove(index)} />
                </Space>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => add([{"x":1,"y":2}])} block icon={<PlusOutlined />}>
                  添加一行
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Row gutter={[10, 10]}>
          <Col span={12}>
            data_filter:
            <Form.Item name="data_filter">
              <JsonEditor setref={setrefData} configProps={{ mode: 'code' }} height={300} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit"> 提交 </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default DataLakeJob;
