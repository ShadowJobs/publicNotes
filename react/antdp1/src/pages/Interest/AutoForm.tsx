import { ProForm } from '@ant-design/pro-components';
import { useState } from 'react';
import { Checkbox, DatePicker, Form, Input, InputNumber, Radio, Select, Slider, Switch } from 'antd';
import ReactJson from 'react-json-view';
import InputTag from '../LinYing/InputTag';
import "./interest.less"
import moment from 'moment';
const TestFormData = {
  layout: "vertical",
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
  labelAlign: "right",
  size: "small",
  labelWidth: 90,
  defaultValues:{
    name:"张三",
    car:["benz"],
    company:{name:"公司1",addr:"地址1"},
    second_hand:true,
    is_active:true,
    age:18,
    hobby:["basketball"],
    tags:["movie"],
    slider:[20,80],
    date:moment("2021-01-01"),
    date_range:[moment("2021-01-01"),moment("2021-01-02")],
    time_range:[moment("2021-01-01 12:00:00"),moment("2021-01-02 12:00:00")],
  },
  fItems: [
    { t: "input", name: "name", label: "姓名", required: true },
    {
      t: "select", name: "car", label: "车辆", required: true, options: [{ label: "奔驰", value: "benz" }, { label: "宝马", value: "bmw" }],
      rules: [{ required: true, message: "请选择车辆" }],
      itemProps: { mode: "multiple", placeholder: "请选择车辆", showSearch: true, optionFilterProp: "label" },
      itemStyle: { flex: "200px 1fr " },
    },
    { t: "input", name: ["company", "name"], label: "公司名", },
    { t: "input", name: ["company", "addr"], label: "公司地址", },
    { t: "radio", name: "second_hand", label: "是否二手", options: [{ label: "是", value: true }, { label: "否", value: false }] },
    { t: "switch", name: "is_active", label: "是否激活", },
    { t: "number", name: "age", label: "年龄", },
    { t: "checkbox", name: "hobby", label: "爱好", options: [{ label: "篮球", value: "basketball" }, { label: "足球", value: "football" }] },
    { t: "inputtag", name: "tags", label: "标签", options: [{ label: "电影", value: "movie" }, { label: "书", value: "book" }] },
    { t: "slider", name: "slider", label: "滑块", itemProps: { min: 0, max: 100, step: 10 } },
    { t: "date", name: "date", label: "日期", itemProps: { format: "YYYY-MM-DD" } },
    { t: "time_range", name: "date_range", label: "日期范围", itemProps: { format: "YYYY-MM-DD HH:mm:ss" } },
    { t: "time_range", name: "time_range", label: "时间范围", itemProps: { format: "YYYY-MM-DD HH:mm:ss", showTime: true } },
  ]
}

const FItemNode = (props: any) => {
  const { item } = props
  const { t, name, label, width, required } = item
  const FormItemStyle = { width: (width || 90) + (required ? -10 : 0), textAlign: "right" }
  return <Form.Item name={name} label={<div style={FormItemStyle}>{label}</div>} rules={[{ required: required, message: `请输入${label}` }]}>
    {t === "input" ? <Input /> :
      t === "select" ? <Select options={item.options} {...item.itemProps} /> :
        t === "radio" ? <Radio.Group options={item.options} {...item.itemProps} /> :
          t === "switch" ? <Switch {...item.itemProps} /> :
            t === "checkbox" ? <Checkbox.Group options={item.options} {...item.itemProps} /> :
              t === "inputtag" ? <InputTag {...item.itemProps} /> :
                t === "slider" ? <Slider range {...item.itemProps} /> :
                  t === "date" ? <DatePicker {...item.itemProps} /> :
                    t === "time_range" ? <DatePicker.RangePicker {...item.itemProps} /> :
                      t === "number" ? <InputNumber {...item.itemProps} />
                        : <></>
    }
  </Form.Item>
}
const AutoItems = ({ data }) => {
  return data.map((item: any) => <FItemNode key={item.name.toString()} width={TestFormData.labelWidth} item={item} />)
}
const AutoForm = ({formData}) => {
  const [usePro, setUsePro] = useState(false)
  const [inputObj, setInputObj] = useState(formData || TestFormData)
  const [form] = Form.useForm()
  const onFinish = async (values: any) => {
    console.log(values)
  }
  return (
    <>
      <ReactJson src={inputObj} name={false} collapsed={true} />
      <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
        <div style={{width:400,marginLeft:-150}}>
        <ProForm onFinish={onFinish} form={form} layout='horizontal' className="auto-form" initialValues={inputObj.defaultValues}>
          <AutoItems data={inputObj.fItems} />
        </ProForm>
        </div>
      </div>
    </>
  );
};

export default AutoForm;