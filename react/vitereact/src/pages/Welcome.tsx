import { Divider, Form, Input } from "antd"
import React, { useEffect, useState } from "react"
import { Button, FormSaver } from "react-comps"
const Welcome: React.FC<{}> = ({ }) => {
  const isLocalhost = window.location.hostname === "localhost"
  const [form] = Form.useForm()
  const [curFormValues, setCurFormValues] = useState<any>()
  const [addResult, setAddResult] = useState<number>()

  useEffect(() => {
    // wasm 演示
    fetch('/helloWorld.js')
    .then(response => response.text())
    .then(scriptText => {
      const blob = new Blob([scriptText], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        // @ts-ignore 
        window.createModule().then(moduleInstance => {
          moduleInstance._main();
          setAddResult(moduleInstance._add(1, 2));
        });
      };
      document.body.appendChild(script);
    });
    
  }, []);

  return <>
    <div>
      <Button>
        来自自研组件库的按钮
      </Button>
      <div>WASM 调用c++ add()结果：{addResult}</div>
    </div>
    <Divider />
    <FormSaver form={form} dbName="form" curFormValues={{ user: "sdlin", age: 18 }} />
    <Form form={form}
      onFieldsChange={(changedFields: any, allFields: any) => { setCurFormValues(allFields) }}>
      <Form.Item label='user' name='user'><Input /></Form.Item>
      <Form.Item label='age' name='age'><Input /></Form.Item>
    </Form>
    <Divider />
    <div style={{ display: 'flex' }}>
      <div style={{ flexGrow: 1 }}>
        <div><a href={isLocalhost ? "http://localhost:6003" : "/sub"} target="_blank">非qiankun的 react 子项目</a></div>
        <iframe src={isLocalhost ? "http://localhost:6003" : "/sub"} style={{ width: "100%", height: '500px' }}></iframe>
      </div>
      <div style={{ flexGrow: 1 }}>
        <div><a href={isLocalhost ? "http://localhost:6004" : "/vue3"} target="_blank">非qiankun的 Vue3 子项目</a></div>
        <iframe src={isLocalhost ? "http://localhost:6004" : "/vue3"} style={{ width: "100%", height: '500px' }}></iframe>
      </div>
    </div>
  </>
}
export default Welcome