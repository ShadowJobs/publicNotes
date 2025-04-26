import { UploadOutlined } from "@ant-design/icons";
import { Button, Card, Collapse, Form,  Input, InputNumber, message, Select, Upload } from "antd";
import { useEffect, useState } from "react";
import _ from "lodash";
import JsonEditor from './JSONEditor';
import { UploadFile } from "antd/es/upload/interface";
// 
/* 
自定义的Form.Item, 除了value和onchange不能加其他参数，否则初始值会失效。即此处不能加参数
<Collapse>下必须为<Panel>，即使是自己封装的组件，直接返回<Panel>也不行
<Form.list>下必须为一个函数，不能嵌套Collapse
所以带折叠的Form.list只能自己实现了。
form的name用数组[“a”,1,”b”]那么得到的表单结果为{a:[undefined,{b:1}]} */

const labelCol = { span: 4 }
const JsonFileSelect: React.FC<{ value: any, onChange?: Function }> = ({ value = {}, onChange }) => {
    const [innerRef, setInnerref] = useState<any>();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [fileContent, setFileContent] = useState({ content: { ...value }, valid: true })
    const [activeKeys, setActiveKeys] = useState<string | number>("");
    const triggerChange = (changedValue: any) => {
        if (changedValue?.valid == false)
            onChange?.({ ...value, ...changedValue })
        else {
            const newV = { ...value.content, ...changedValue.content }
            delete newV["valid"]
            onChange?.(newV)
        }
    }
    const uploadProps = {
        onRemove: (file: string) => { console.log(file) },
        beforeUpload: (file: any) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    setFileContent({ content: JSON.parse(reader.result), valid: true })
                    triggerChange({ content: JSON.parse(reader.result) })
                    setFileList([file])
                    setActiveKeys(1)
                } catch (e) {
                    message.error("File content error: invalid json string")
                }
            }
            reader.readAsText(file)
            return false;
        },
        fileList: fileList,
    };
    return <div style={{ border: "1px solid #6b6b6b2f", padding: 0 }}>
        <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Load JSON by File</Button>
        </Upload>

        <Collapse activeKey={activeKeys} onChange={v => setActiveKeys(v2 => v2 == 1 ? "" : 1)}>
            <Collapse.Panel header={"JSON config"} key={1}>
                <JsonEditor setref={setInnerref} height={420} value={fileContent} onChange={v => {
                    setFileContent(v.content)
                    triggerChange({ ...v })
                }} configProps={{ mode: 'code' }} />
            </Collapse.Panel>
        </Collapse>
    </div >
}
const TextFileSelect: React.FC<{ value: any, onChange?: Function }> = ({ value = {}, onChange }) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [fileContent, setFileContent] = useState(value)
    const uploadProps = {
        onRemove: (file: string) => {
            setFileList([])
        },
        beforeUpload: (file: any) => {
            const reader = new FileReader();
            reader.onload = () => {
                setFileContent(reader.result)
                onChange?.(reader.result)
                setFileList([file])
            }
            reader.readAsText(file)
            return false;
        },
        fileList: fileList,
    };
    return <div style={{ border: "1px solid #6b6b6b2f", padding: 0 }}>
        <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Load text by File</Button>
        </Upload>
        <Input.TextArea rows={8} value={fileContent} onChange={v => {
            setFileContent(v.target.value)
            onChange?.(v.target.value)
        }} />
    </div>
}

const PiplineFormItem: React.FC<{ k: string, v: any, setFileHash: Function, fileHash: any, retryItem: any, preNames: (string | number)[] }> =
    ({ k, v, fileHash, setFileHash, retryItem, preNames }) => {
        const uploadProps = {
            onRemove: (file: string) => {
                setFileHash(preHash => ({ ...preHash, [k]: [] }));
            },
            beforeUpload: (file: any) => {
                setFileHash(preHash => ({ ...preHash, [k]: [file] }))
                return false;
            },
            fileList: fileHash?.[k],
        };
        return v.data_type ?
            (
                <Form.Item label={k} labelAlign="left" labelCol={labelCol} name={[...preNames, k]} key={k}
                    rules={[{ required: k == 'quantizer_input_blobs' || k == 'input_blobs' },
                    ...(v.data_type == 'json' ? [
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || value?.valid == false) return Promise.reject(new Error('JSON parse error!'));
                                try {
                                    JSON.parse(JSON.stringify(value))
                                    return Promise.resolve();
                                } catch (error) {
                                    return Promise.reject(new Error('JSON parse error!'));
                                }
                            },
                        }),
                    ] : [])
                    ]}
                    initialValue={retryItem != undefined && retryItem.value != undefined ?
                        ((v.data_type == 'file_set' && v.business_type == "input_blob") ? "" : retryItem.value) :
                        v.default_value == "true" ? true :
                            v.data_type == 'int' ? parseInt(v.default_value) :
                                (v.data_type == 'file_set' && v.business_type == "input_blob") ? "" : v.default_value
                    }
                    tooltip={<div>{v.help}</div>}
                >
                    {(() => {
                        if (v.data_type == 'string') return <Input />
                        if (v.data_type == 'json') return <JsonFileSelect /> // 
                        if (v.data_type == 'text') return <TextFileSelect />
                        if (v.data_type == 'file') return <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                        if (v.data_type == 'file_set') {
                            if (v.business_type == "input_blob")
                                return <Select>
                                    {v.myList.map((v2: any) => {
                                        return <Select.Option key={v2.id} value={v2.id}>{`${v2.id} - ${v2.name} - ${v2.type}`}</Select.Option>
                                    })}
                                </Select>
                            else return <Upload {...uploadProps}>
                                <Button icon={<UploadOutlined />}>Select File</Button>
                            </Upload>
                        }
                        if (v.data_type == 'int') return <InputNumber />
                        if (v.data_type == 'bool') return (
                            <Select >
                                {[true, false].map((v: boolean) => {
                                    return <Select.Option key={v.toString()} value={v}>{v.toString()}</Select.Option>
                                })}
                            </Select>)
                        if (v.data_type == 'choice') return (
                            <Select mode={v.max_size > 1 ? 'multiple' : undefined} >
                                {v.choice_list.map((v2: string) => {
                                    return <Select.Option key={v2} value={v2}>{v2}</Select.Option>
                                })}
                            </Select>
                        )
                    })()}
                </Form.Item>
            ) : (
                <div>{k}:
                    <div style={{ border: "1px solid #6f6f6f35", paddingLeft: 10, paddingTop: 10, paddingRight: 10, borderRadius: 5, marginTop: 10 }}>
                        {Object.keys(v).map((key, i) => {
                            let v2 = v[key]
                            if (v2.business_type == 'hide' || v2.business_type == 'onnx_model' || v2.business_type == 'seri_model') return undefined
                            return v2.data_type == "file" ? undefined : <PiplineFormItem key={key} k={key} v={v2} fileHash={fileHash} setFileHash={setFileHash}
                                retryItem={retryItem && retryItem[key]} preNames={[...preNames, k]} />
                        })}
                    </div>
                </div>)
    }
export { JsonFileSelect, TextFileSelect, PiplineFormItem }