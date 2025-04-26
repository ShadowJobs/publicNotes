import { CopyOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import { Button, Input, Modal, Select, Space, Switch, Tag, Tooltip, message } from "antd"
import { MouseEvent, useEffect, useRef, useState } from "react"
import { IndexedDbManager, equal } from "sdlin-utils"

export const QuestionTip: React.FC<{ tip: string, marginLeft?: number }> = ({ tip, marginLeft }) => {
  return <Tooltip title={(tip)}>
    <QuestionCircleOutlined style={{ marginLeft }} />
  </Tooltip>
}

const handleCopy = (value: string, e: MouseEvent) => {
  // 阻止选择事件触发
  e.stopPropagation();
  navigator.clipboard.writeText(value).then(() => {
    message.success(`Copied: ${value}`);
  }).catch(err => {
    message.error('Failed to copy!');
  });
}
export const SelectWithCopy: React.FC<{ options: string[], value?: any, onChange?: any }> = ({ options, value, onChange }) => {
  return <Select mode="multiple" allowClear showSearch value={value} onChange={onChange}>
    {options.map(option => (
      <Select.Option key={option} value={option}>
        <div style={{ position: "relative" }}>
          {option}
          <Button style={{ float: "right", marginTop: -4 }}
            type="link"
            icon={<CopyOutlined />}
            onClick={(e: MouseEvent) => handleCopy(option, e)}
          />
        </div>
      </Select.Option>
    ))}
  </Select>
}

export const MySwitch: React.FC<{ value: boolean }> = ({ value, ...props }) => {
  return <Switch checked={value} {...props} />
}

const SaveConfirmModal: React.FC<{ confirm: Function, close: (e: any) => void }> = ({ confirm, close }) => {
  const [name, setName] = useState('')
  return <Modal title="Save Confirm" onOk={() => {
    if (!name) {
      message.error('Name is empty')
      return
    }
    confirm(name)
  }} open onCancel={close}>
    <Input placeholder="Name" value={name} onChange={(e: any) => setName(e.target.value)} />
    <p>Save params?</p>
  </Modal>
}
export const FormSaver: React.FC<{ form: any, dbName: string, curFormValues: any, saverChange?: Function }> =
  ({ form, dbName = "form", curFormValues, saverChange }) => {
    const [pName, setPName] = useState('')
    const [initParams, setInitParams] = useState(curFormValues)
    const [dbinited, setDbinited] = useState(false)
    const [dbData, setDbData] = useState<any[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const ref = useRef(new IndexedDbManager(dbName, 1, dbName))
    const refreshOptions = () => {
      ref.current?.cursorGet().then((data: any) => {
        setDbData(data)
      })
    }
    useEffect(() => {
      ref.current.init().then(() => {
        setDbinited(true)
      })
      return () => {
        ref.current?.close()
      }
    }, [])
    useEffect(() => {
      if (dbinited) refreshOptions()
    }, [dbinited])
    return <div style={{ overflow: "auto" }}><div style={{ float: "right", border: "1px solid #80808050", padding: 5, borderRadius: 3, margin: 3 }}><Space>
      {modalOpen && <SaveConfirmModal close={() => setModalOpen(false)} confirm={(name: string) => {
        ref.current.set({ ...form.getFieldsValue(), id: name }).then(() => {
          setPName(name)
          message.success('Saved')
          setModalOpen(false)
          setInitParams(form.getFieldsValue())
        }).catch((err: Event) => {
          message.error('Save failed')
          console.log(err)
        })
        refreshOptions()
      }} />}
      {pName}
      {pName && !equal(initParams, { id: initParams.id, ...form.getFieldsValue() }) && <Tag>Edited</Tag>}
      <Select size="small" allowClear options={dbData.map(v => ({ label: v.id, value: v.id }))} onChange={(v: string) => {
        if (v) {
          setPName(v)
          let vv = dbData.find(vv => vv.id == v)
          if (!vv.result_query_dict) vv.result_query_dict = undefined
          setInitParams(vv)
          form.setFieldsValue(vv)
        } else {
          setPName('')
          setInitParams({})
          form.resetFields()
        }
        saverChange?.(v)
      }} style={{ width: 100 }} value={pName} />
      <Button type="primary" size="small" disabled={!pName || equal(initParams, { id: initParams.id, ...form.getFieldsValue() })} onClick={() => {
        ref.current.set({ ...form.getFieldsValue(), id: pName }).then(() => {
          message.success('Updated')
          setInitParams(form.getFieldsValue())
        })
      }}>Update</Button>
      <Button type="primary" size="small" onClick={() => { setModalOpen(true) }}>Save</Button>
      <Button type="primary" disabled={!pName} size="small" onClick={() => {
        ref.current.delete(pName)
        setPName('')
        form.resetFields()
        setInitParams(form.getFieldsValue())
        refreshOptions()
      }}>Delete</Button>
    </Space></div></div>
  }