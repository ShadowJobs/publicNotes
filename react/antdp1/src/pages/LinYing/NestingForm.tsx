// 生成一个带结构的表单
import { Button, Collapse, Form, FormInstance, Input,  Modal, Select, Space, } from "antd";
import _ from "lodash";
import {useEffect, useRef, useState } from "react";
const { Panel } = Collapse
import { PiplineFormItem } from "./TemplateForm";
import { PlusOutlined } from "@ant-design/icons";
import ListForm from "./ListForm";

const {Option}=Select
const { Item } = Form
const labelCol = { span: 4 }
const poplabelCol = { span: 2 }

export const inputReg = /^[a-zA-Z0-9_\-\.]+$/;  //正则：支持大小写字母，数字，- _ .
export const invalidInput = "Only allows upper and lower case letters, Arabic numerals, and [-_.] , and no other characters" 
const portTemps = [
    {platform:"plat1",name:"tmp1",tmpName:"tmpname1",params_template:{
        "log_level": {
          "business_type": "other",
          "choice_list": [
            "DEBUG",
            "INFO",
            "WARNING",
            "FATAL"
          ],
          "data_type": "choice",
          "default_value": "WARNING",
          "help": "log level",
          "max_size": 1
        },
        "murl": {
          "business_type": "onnx_model",
          "data_type": "string",
          "default_value": "",
          "help": "the om url"
        },
        "precision": {
          "business_type": "other",
          "choice_list": [
            "int8",
            "fp16",
            "fp32"
          ],
          "data_type": "choice",
          "default_value": "fp32",
          "help": "md precision",
          "max_size": 1
        },
        "special_configs": {
          "device_id": {
            "business_type": "other",
            "data_type": "int",
            "default_value": 8,
          },
          "enable_strict_type": {
            "business_type": "other",
            "data_type": "bool",
            "default_value": false,
          },
          "enable_tensorrt_parser": {
            "business_type": "other",
            "data_type": "bool",
            "default_value": false,
            "help": "parser om with ddd parser"
          },
          "minfer_calib_config_url": {
            "business_type": "other",
            "data_type": "json",
            "default_value": {},
            "help": "set"
          },
          "preprocess_config_url": {
            "business_type": "other",
            "data_type": "text",
            "default_value": "jdlsjfl",
            "help": "proprocess  perproces"
          }
        }
      }},
    {platform:"plat2",name:"tmp2",tmpName:"tmpname2"},
]

type ppi = { tmpName: string, expName: string, expDes: string, [key: string]: any }
type expParamsType = { porting: ppi,  profiling: ppi, platform: string }
type rowDataType = {
    name: string, id: number, description: string, creator_name: string,
    creator_id: number, group_name: string
    expParams?: expParamsType[],
}

//ppi means porting,profiling,inference. One completed ppi form
const PPIForm: React.FC<{
    index: number,form:FormInstance,
    fileHash: any, setFileHash: Function, header: string, initValues?: any
}> = ({ index, fileHash, setFileHash, header, initValues,form }) => {
    return <div>
        <Item labelAlign="left" labelCol={poplabelCol} label="Template Name"
            shouldUpdate={(prevValues, curValues) => { //用于控制子Item的刷新，因为子item读了表单的内容（getFieldValue），所以表单的platform值变化时，这里要刷新
                // 注意，这里必须写成2层的Item的嵌套结构，上次不设置name，只设置shouldUpdate，内层是一个函数，返回一个Item，且要设置name
                return prevValues.expParams?.[index]?.platform !== curValues.expParams?.[index]?.platform
            }}
        >
            {({ getFieldValue }) => <Item name={["expParams", index, header, "tmpName"]} {...initValues ? { initialValue: initValues.tmpName } : {}}>
                <Select placeholder="Select a md" showSearch 
                    onChange={(v) => { 
                        form?.setFieldValue(["expParams", index, header, "expName"], v) 
                        // form内部联动的方法：1,在依赖项的onChange里直接调用setFieldValue
                        // 2,使用useState在最外层做全局控制（简单的form可以用，复杂的联动不合适）
                        // 3，在shouldUpdate里做判断
                    }}
                >
                    {portTemps.filter(v => v.platform == getFieldValue(["expParams", index, 'platform'])).map(v => {
                        return <Option key={v.name} value={v.name}>{v.name}</Option>
                    })}
                </Select>
            </Item>}
        </Item>
        <Item>
            <Item name={["expParams", index, header, "expName"]} labelAlign="left" labelCol={labelCol} label={("expName")} rules={[{ required: true }]}
                {...initValues ? { initialValue: initValues.expName } : {}}
            ><Input /></Item>
            {header == "porting" ? <div>
                <Item name={["expParams", index, header, "smname"]} labelAlign="left" labelCol={labelCol} label={("smname")} rules={[
                    { required: true },
                    { pattern: inputReg, message: invalidInput }]}
                    {...initValues ? { initialValue: initValues.smname } : {}}
                ><Input /></Item>
            </div> : null}

{/* 以下这个Item是一个嵌套Item，通过设置子preNames的expParams，使表单的expParams变成了一个对象 */}
            <Item labelAlign="left" labelCol={poplabelCol} label=""
                shouldUpdate={(prevValues, curValues) => {
                    return prevValues.expParams?.[index]?.[header]?.tmpName !== curValues.expParams?.[index]?.[header]?.tmpName
                }}
            >
                {({ getFieldValue }) => {
                    const template = portTemps?.find(v => v.name == getFieldValue(["expParams", index, header, "tmpName"]))?.params_template
                    return template && Object.keys(template).filter(key => key != '__version__' && key != "output_blobs").map((key, i) => {
                        let v = template[key]
                        if (v.business_type == 'hide' || v.business_type == 'onnx_model' || v.business_type == 'seri_model' || v.data_type == "file") return undefined
                        return <PiplineFormItem key={key} k={key} v={v} fileHash={fileHash} setFileHash={setFileHash} preNames={["expParams", index, header, 'parameters']}
                            retryItem={initValues?.parameters?.[key]} />
                    })
                }}
            </Item>
            <br />
        </Item>
    </div>
}

// expParams 是个数组，OneForm是一个元素
const OneForm: React.FC<{
    index: number, fileHash: any,form:FormInstance,
    setFileHash: Function, initValues?: expParamsType
}> = ({ index, fileHash, setFileHash, initValues,form }) => {
    return <Item>
        <Item name={["expParams", index, "platform"]} labelAlign="left" labelCol={poplabelCol} label="Platform"
            {...initValues ? { initialValue: initValues.platform } : {}}
        >
            <Select placeholder="Select a platform" showSearch >
                {_.uniq(portTemps.map(v => v.platform)).sort().map(v => {
                    return <Option key={v} value={v}>{v}</Option>
                })}
            </Select>
        </Item>
        <Item>
            <Collapse defaultActiveKey={"1"}>
                <Panel header="Porting" key="1">
                    <PPIForm header="porting" index={index} form={form}
                        fileHash={fileHash} setFileHash={setFileHash} initValues={initValues?.porting} />
                </Panel>
                <Panel header="Profiling" key="2">
                    <PPIForm header="profiling" index={index} form={form}
                        fileHash={fileHash} setFileHash={setFileHash} initValues={initValues?.profiling} />
                </Panel>
            </Collapse>
        </Item>
    </Item>
}
const IssueFormItem: React.FC<{form:FormInstance,product:string}> = ({form,product}) => {
    const [issues,setissues]=useState<string[]>([])
    const getPhaseName=async()=>{
    //   const result=await safeReq(async ()=>{
        // return await request(`/`,{method: 'POST',data:{product,event_type}},);})
      const result=await new Promise((resolve,reject)=>{
        setTimeout(()=>{
            if(product=='a')resolve(['issue1','issue2','issue3'])
            else resolve(['issue6','issue4','issue5'])
        },500)
      })
      setissues(result)
    }
    useEffect(()=>{getPhaseName();form.setFieldsValue({event_issue_list:[]})},[product])
    return <Form.Item label={<div style={{width:98,textAlign:"right"}}>Focus issues</div>}>
      <Space>
        <Form.Item name="event_issue_list" noStyle rules={[{required:true,message:"focus issues can not be empty"}]}>
            <Select mode="multiple" allowClear showSearch  style={{width:"60vw"}}>
                {issues?.map(v=><Option value={v} key={v}>{v}</Option>)}
            </Select>
        </Form.Item>
        <Form.Item name="version2">
            <Input/>
        </Form.Item>
        <Button onClick={()=>{form.setFieldsValue({"event_issue_list":issues})}}>All</Button>
      </Space>
    </Form.Item>
  }
const TemplateEditor: React.FC<{editData?: any }> =
    ({editData}) => {
        let editId = useRef((editData?.id || Math.floor(Math.random() * 1e9 + 1e9)) + Math.floor(Math.random() * 1e9 + 1e9))
        const [inputParams, setInputParams] = useState<number[]>([editId.current])
        const [form] = Form.useForm()
        const [fileHash, setFileHash] = useState<any>({});
        const [visible,setVisible]=useState(true)
        const onFinish = async (values: any) => {
            console.log('Received values of form:', values);
        };
        const watchParams = Form.useWatch(["expParams"], form); //监听某个字段，类型为string或string[]

        useEffect(() => {
            editId.current = (editData?.id || Math.floor(Math.random() * 1e9 + 1e9)) + Math.floor(Math.random() * 1e9 + 1e9)
            setInputParams(editData ? (editData?.experiment_params?.map((v, idx) => {
                editId.current += 1;
                console.log(editId.current);
                v.editId = editId.current
                return editId.current
            }))
                : [editId.current + 1])
        }, [editData])
        return <Modal title={editData ? `Edit pipline ${editData.id}` : `Add pipline`} visible={visible}
            okText="Confirm" cancelText="Cancel" width={"80%"}
            onCancel={() => setVisible(false)} onOk={form.submit}
        >
            <Form name="modellab" form={form} onFinish={onFinish}>
                <Item name="name" labelAlign="left"  label={<div style={{ width: 61, textAlign: "right" }}>name</div>} rules={[{ required: true }]}
                    {...editData ? { initialValue: editData.name } : {}}
                ><Input /></Item>
                {/* 对齐，直接将label写成ReactNode，并在里面写style更合适，labelAlign和labelCol效果并不好；；注意星号会影响宽度 */}
                <Item name="name2" labelAlign="left"  label={<div style={{ width: 61, textAlign: "right" }}>name2</div>} rules={[{ required: true }]}
                ><Input /></Item>
                <h3>输入检测machine_type和queue_name不能同时输入的写法（输入一个后禁用另一个）</h3>
                <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues?.machine_type !== curValues?.machine_type}>
                    {({getFieldValue}) => {
                    return <Form.Item name="queue_name" label="Queue Name">
                        <Select disabled={!!getFieldValue("machine_type")} options={[{label:1,value:1}]} allowClear/>
                        </Form.Item>
                    }}
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues?.queue_name !== curValues?.queue_name}>
                    {({getFieldValue}) => {
                    return <Form.Item name="machine_type" label="Machine Type" >
                        <Select disabled={!!getFieldValue("queue_name")} options={[{label:1,value:1}]}  allowClear/>
                        </Form.Item>
                    }}
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.name !== curValues.name } tooltip={"name的值如果是a，则选项会变化"}>
                {({getFieldValue}) => { //联动：本Item的选项由前一个name的值来确定，使用shouldUpdate; 注意必须配合noStyle,否则会Item会占据很大的空白
                // 这里可以返回一个比较复杂的结构，里面甚至可以包含多个Item，但是必须要有name. 
                // IssueFormItem里面可以有状态，所以可以请求后端数据来决定选项
                    return <IssueFormItem form={form} product={getFieldValue("name")}></IssueFormItem>;
                }}
                </Form.Item>
                <Collapse defaultActiveKey={inputParams?.[0]}>
                    {portTemps && inputParams?.map((id, index) => {
                        // 注意：之前尝试这么写：const watchParams = Form.useWatch(["expParams",index,"porting","smname"], form)
                        // 这样会报错，如果是独立的组件函数没问题，但是这里是个map生成的，并不独立，所以点了“Add field"按钮后，会导致hook数量变化而报错
                        // forceRender是collapse强制渲染用的，不写的话，没有展开的formItem不会初始化，就没有值
                        return <Panel header={watchParams?.[index]?.porting.smname} forceRender key={id} extra={
                            <Button onClick={() => {
                                setInputParams(v => { v.splice(index, 1); return [...v] })
                                setInputParams(v => {
                                    const newParams = v.filter(v3 => v3 != id)
                                    const delIdx = inputParams.findIndex(v => v == id)
                                    if (editData?.experiment_params) {
                                        editData.experiment_params.splice(delIdx, 1)
                                        editData.experiment_params.map((v2, idx2) => {
                                            form.setFieldValue(["experiment_params", idx2, "platform"], v2.platform)
                                            form.setFieldValue(["experiment_params", idx2, 'porting',], v2.porting)
                                            form.setFieldValue(["experiment_params", idx2, "profiling"], v2.profiling)
                                            form.setFieldValue(["experiment_params", idx2, "inference"], v2.inference)
                                        })
                                    }
                                    return newParams;
                                })

                            }}>delete</Button>
                        }>
                            <OneForm index={index} form={form}
                                fileHash={fileHash} setFileHash={setFileHash} initValues={editData?.expParams?.[index]}
                            />
                        </Panel>
                    })}
                </Collapse>
            </Form>
            <Button type="dashed" onClick={() => {
                editId.current += 1
                console.log(editId.current);
                setInputParams(v => ([...v, editId.current]))
            }} style={{ width: '60%' }} icon={<PlusOutlined />}>
                Add field
            </Button>
        </Modal>
    }

const NestingForm: React.FC = () => {
    const [editData, seteditData] = useState<rowDataType>(); //主要用于传入初始表单值
    return <div>
      <TemplateEditor editData={editData} />
      <ListForm/>
    </div>
}
export default NestingForm;
export { OneForm }