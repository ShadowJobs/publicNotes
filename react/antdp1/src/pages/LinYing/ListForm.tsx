import React, { useState } from 'react'
import _ from "lodash"
import { history, request } from 'umi';
import { Button, Card, Col, Divider, Form, Input, message, Row, Space, Tabs, } from 'antd';
import MonacoEditor from 'react-monaco-editor';
import ProForm, { ProFormDateTimeRangePicker, ProFormDependency, ProFormGroup, ProFormList, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import moment from 'moment';
import { safeReq } from '@/utils';

const CommonPart: React.FC = () => {
  return <Row gutter={24}>
    <Col span={24}><Form.Item name="name" label={<div style={{ width: 98, textAlign: "right" }}>Name</div>} rules={[{ required: true }]}>
      <Input />
    </Form.Item></Col>
    <Col span={24}><Form.Item name="description" label={<div style={{ width: 98, textAlign: "right" }}>Description</div>} rules={[{ required: true }]}>
      <Input />
    </Form.Item></Col>
  </Row>
}
const ListForm: React.FC = () => {
  const [tabKey, setTabKey] = useState<string>("Format")
  const recordTemplate = {
    "keys": ["crpd", "rpd", "rpi"],
    time: [moment().add(-1, "days"), moment()],
  }
  const initV = {
    name: "test_V2",
    description: "test_V2",
    params_list: [recordTemplate]
  }

  const [form] = Form.useForm()
  const [form2] = Form.useForm()

  const submitDailyTask = async (formParams: any) => {
    let params: any;
    try {
      if (tabKey == 'Format') {
        formParams.params_list?.map((v: any) => {
          if (v.time) {
            v.begin_time = moment(v.time[0]).format("YYYY-MM-DD HH:mm:ss")
            v.end_time = moment(v.time[1]).format("YYYY-MM-DD HH:mm:ss")
          }
          delete v.time
        })
        params = formParams.params_list
      } else {
        params = JSON.parse(formParams.json)
      }
    } catch (error: any) {
      console.log(error);
      message.error("Invalid json string")
      return
    }
    return console.log({
      params_list: params,
      name: formParams.name,
      description: formParams.description,
    });

    await safeReq(async () => {
      let storageData = JSON.parse(localStorage.getItem("listform") || "{}")
      if (Object.keys(storageData).length == 0) {
        storageData = { version: [], keys: [] }
      }
      console.log(params);
      localStorage.setItem("listform", JSON.stringify(storageData))
      return await request<any>(
        `/submit_task`,
        {
          method: 'POST', data: {
            params_list: params,
            name: formParams.name,
            description: formParams.description,
          }
        },
      );
    }, () => {
      message.success("Success.")
      history.push("/v-tasks")
    })
  }
  const changeTab = (tabType: string) => {
    setTabKey(tabType)
    if (tabType == "JSON") {
      const params = form.getFieldsValue()
      params.params_list?.map((v: any) => {
        if (v.time) {
          v.begin_time = moment(v.time[0]).format("YYYY-MM-DD HH:mm:ss")
          v.end_time = moment(v.time[1]).format("YYYY-MM-DD HH:mm:ss")
        }
        delete v.time
      })
      form.setFieldsValue({ "json": JSON.stringify(params.params_list, null, 2) })
    } else {
      try {
        const params = JSON.parse(form.getFieldValue("json"))
        params.map((v2: any) => {
          if (v2.begin_time) v2.time = [moment(v2.begin_time), moment(v2.end_time)]
        })
        console.log(params);
        form.setFieldsValue({ params_list: params })
      } catch (e) {
        message.error("Invalid json string")
      }
    }
  }
  return <div>
    <ol>定义ProFormGroup里的表单按格子分布，使用grid,并且必须配合Row和Col使用</ol>
    <ol>ProFormGroup里的表单，必须使用ProFormSelect,ProFormText这种不能用Form.Item+Select的方式，这种方式会导致初始值不生效</ol>
    <ol>想保持Label的宽度一致，必须自定定义label为div+width+textAlign</ol>

    <Card bordered style={{ marginTop: -10 }}>
      <div>
        <ProForm form={form} onFinish={async (values: any) => { submitDailyTask(values) }} layout="horizontal" initialValues={initV}>
          <Tabs activeKey={tabKey} onChange={changeTab} style={{ marginTop: -20 }} destroyInactiveTabPane>
            <Tabs.TabPane tab={("交互模式")} key={"Format"}>
              <CommonPart />
              <ProFormList name={"params_list"} label=""
                // rules={[{
                //   required: true,
                //   validator: async (_, value) => {
                //     if (value && value.length > 0) return;
                //     throw new Error('At least one item is required!');
                //   },
                // }]}
                creatorButtonProps={{ position: "bottom" }} //按钮和插入数据的位置
                creatorRecord={{ keys: [] }}
              >
                <ProFormGroup key="group" grid>
                  <Row gutter={24}>
                    <Col span={12}><ProFormSelect name="version" mode="tags" label={<div style={{ width: 110, textAlign: "right" }}>Version</div>} /></Col>
                    <Col span={12}>
                      <ProFormSelect name="keys" mode="multiple" options={recordTemplate.keys.map(v => ({ label: v, value: v }))} label={<div style={{ width: 110, textAlign: "right" }}>Keys</div>} />
                    </Col>
                    <Col span={12}>
                      <ProFormDateTimeRangePicker style={{ width: "100%" }} name="time" label={<div style={{ width: 110, textAlign: "right" }}>{("时间")}</div>}
                        fieldProps={{ style: { width: "100%" } }} />
                    </Col>
                    <Col span={12}>
                      <ProFormSelect name="hostname" mode="tags" label={<div style={{ width: 110, textAlign: "right" }}>{("车辆")}</div>} />
                    </Col>
                    <Col span={12}><ProFormText name="eql" label={<div style={{ width: 110, textAlign: "right" }}>Eql</div>} /></Col>
                    <Col span={12}><ProFormSelect name="car_type" mode="tags" label={<div style={{ width: 110, textAlign: "right" }}>Car Type</div>} /></Col>
                  </Row>
                </ProFormGroup>
                <Divider />
              </ProFormList>
            </Tabs.TabPane>
            <Tabs.TabPane tab={("编辑模式")} key={"JSON"}>
              <CommonPart />
              <Form.Item name={'json'}>
                <MonacoEditor height={550} language="json" theme="vs" options={{ selectOnLineNumbers: true }} />
              </Form.Item>
            </Tabs.TabPane>
          </Tabs>
        </ProForm></div>
    </Card>
    <Card bordered style={{ marginTop: 10 }}>
      使用函数生成child，精确控制数组里的日期
      <ProForm style={{width:"100%"}} form={form2} onFinish={async (values: any) => { console.log(values) }} layout="horizontal">
        <ProFormList name={"params_list"} label=""
          creatorButtonProps={{ position: "bottom" }} //按钮和插入数据的位置
          creatorRecord={{ keys: [] }}
          itemContainerRender={(doms) => {
            return <ProForm.Group grid>{doms}</ProForm.Group>;
          }}
          alwaysShowItemLabel
        >
          {(f, index, action) => {
            console.log(f, index, action);
            return (
              <Row gutter={24}>
                <Col span={12}><ProFormSelect name="version" mode="tags" label={<div style={{ width: 110, textAlign: "right" }}>Version</div>} /></Col>
                <Col span={12}>
                  <ProFormSelect name="keys" mode="multiple" options={recordTemplate.keys.map(v => ({ label: v, value: v }))} label={<div style={{ width: 110, textAlign: "right" }}>Keys</div>} />
                </Col>
                <Col span={12}>
                  <ProFormDateTimeRangePicker style={{ width: "100%" }} name="time" label={<div style={{ width: 110, textAlign: "right" }}>{("时间")}</div>}
                    fieldProps={{ 
                      style: { width: "100%" } ,
                      renderExtraFooter:()=>{
                        return <Space>
                          <Button type="primary" size="small" onClick={()=>{
                            // 当前时间往前推1个月
                            const start=moment().subtract(1,'months')
                            const end=moment()
                            form2.setFieldValue(["params_list",index,"time"],[start,end])
                          }}>Last Month</Button>
                          <Button type="primary" size="small" onClick={()=>{
                            const start=moment().subtract(2,'weeks')
                            const end=moment()
                            form2.setFieldValue(["params_list",index,"time"],[start,end])
                          }}>Last 2 Weeks</Button>
                          <Button type="primary" size="small" onClick={()=>{
                            const start=moment().subtract(1,'weeks')
                            const end=moment()
                            form2.setFieldValue(["params_list",index,"time"],[start,end])
                          }}>
                            Last Week
                          </Button>
                          <Button type="primary" size="small" onClick={()=>{
                            const start=moment().subtract(1,'days').startOf('day')
                            const end=moment().subtract(1,'days').endOf('day')
                            form2.setFieldValue(["params_list",index,"time"],[start,end])
                          }}>
                            Yesterday
                          </Button>
                          <Button type="primary" size="small" onClick={()=>{
                            // 今天0点到24点
                            const start=moment().startOf('day')
                            const end=moment().endOf('day')
                            form2.setFieldValue(["params_list",index,"time"],[start,end])
                          }}>
                            Today
                          </Button>
                        </Space>
                      }
                    }} />
                </Col>
                <Col span={12}>
                  <ProFormSelect name="hostname" mode="tags" label={<div style={{ width: 110, textAlign: "right" }}>{("车辆")}</div>} />
                </Col>
              </Row>
            );
          }}
          <Divider />
        </ProFormList>
      </ProForm>
    </Card>
    <Card bordered style={{ marginTop: 10 }}>
      联动表单
      <ProForm style={{width:"100%"}} onFinish={async (values: any) => { console.log(values) }} >
        <ProFormList name={"params_list"} label=""
          creatorButtonProps={{ position: "bottom" }} //按钮和插入数据的位置
          creatorRecord={{ keys: [] }}
          itemContainerRender={(doms) => {
            return <ProForm.Group grid>{doms}</ProForm.Group>;
          }}
          alwaysShowItemLabel
        >
          {(f, index, action) => {
            console.log(f, index, action);
            return (
              <>
                <ProFormText initialValue={index} name="rowKey" label={`第 ${index} 配置`} />
                <ProFormText name="name" key="name" label="姓名" />
                <ProFormDependency key="remark" name={['name']}>
                  {({ name }) => {
                    if (!name) return <span style={{ lineHeight: '92px'}}>输入姓名展示</span>
                    return <ProFormText name="remark" label="昵称详情" />;
                  }}
                </ProFormDependency>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: 60,}}>
                  <Button type="primary" key="SET"
                    onClick={() => {
                      action.setCurrentRowData({
                        name: 'New Name' + index,
                        remark: 'New Remark' + index,
                      });
                    }}
                  >
                    设置此项
                  </Button>

                  <Button type="dashed" key="clear"
                    onClick={() => {
                      action.setCurrentRowData({
                        name: undefined,
                        remark: undefined,
                      });
                    }}
                  >
                    清空此项
                  </Button>
                </div>
              </>
            );
          }}
          <Divider />
        </ProFormList>
      </ProForm>
    </Card>
  </div>
}

export default ListForm