//注意的点，见下注释
//特别提示，monaco和plugin的
import React, { Suspense } from 'react';
import { Card, Row, Col, Space, Button, Select, Collapse } from 'antd';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution'; // 1,语法高亮，这么import可以使生成的时候引用的代码只有python的包
import "./hightlight11.8.0.min.css" //react-markdown的代码高亮样式,必须配合hightlight.js库
// import md from './markdown.txt'
//各种参数配置：https://microsoft.github.io/monaco-editor/docs.html#enums/editor.EditorOption.html
import md from '!!raw-loader!./markdown.md'
// 这里前提是安装了raw-loader库，否则会报错，仅需-D，在devDependencies里即可
console.log(md)

import { LogCard } from './MonacoEditorReact';
import { MarkdownComp } from './SmallComps';
// import { MonacoDiffEditor } from 'react-monaco-editor';
const MonacoDiffEditor = React.lazy(() => import('react-monaco-editor').then(module => ({
  default: module.MonacoDiffEditor
})));

let getTransStr = function (v) { return v }
class MonacoEditor extends React.Component {
  state = {
    loadings: [false,],
    code: "",
    file: "a.py",
    valid: true,
    timerId: 1,
    codes: [{
      code: `
    import cv2
    def draw(img, img_info):
        img = cv2.rectangle(img, (10, 10), (100, 100), (0, 0, 255), cv2.LINE_4, 2)
        print("11d1")
        return img
    `, file_name: "a.py"
    },],
    select_index: 0,
  }
  monacoInstance = null
  editorParentRef: any = React.createRef();
  handleSubmitRun = async () => {
    const value = this.monacoInstance.getValue(); //2，如何获取编辑器的值
    console.log(value);
  }

  clearTimer = () => {
    if (this.state.timerId) clearTimeout(this.state.timerId)
    this.state.timerId = 0
  }
  handleChange = () => { //每3秒保存1次，防止每次修改都保存
    this.clearTimer(true)
    this.state.timerId = setTimeout(() => {
      const value = this.monacoInstance.getValue(); //
      this.setState({ code: value });
      this.state.timerId = 0
    }, 3000);
  }

  componentDidMount() {
    const fetchCodeList = async () => {
      this.setState({ code: this.state.codes[0].code, select_index: 0 })
      const monacoInstance = monaco.editor.create(this.editorParentRef.current, {
        language: "python", theme: "vs-dark",
        width: "100%", height: "400px",
        value: this.state.codes[0].code, options: { selectOnLineNumbers: true },
      })
      monacoInstance.onDidChangeModelContent(() => { //3, 监听变化，这么写
        this.handleChange()
      })
      this.monacoInstance = monacoInstance //4，对于不变化的值，可以不放到state里
    }
    fetchCodeList()
  }
  componentWillUnmount() {
    this.monacoInstance.dispose() //5 一定要销毁
    this.clearTimer()
  }
  render() {
    const { codes } = this.state
    return (
      <Row>
        <Col span={12}>
          <Card>
            6, 注意monaco版本不能是0.33.0，不然编译会报错 ,这部分改动有3处
            1，在package.json中添加
            "monaco-editor": "^0.26.0",
            "monaco-editor-webpack-plugin": "^4.0.1"   注意这2个库的版本必须配对好，在网上查一下对应的版本表，不对应的话会报错
            2，在config.ts里配置MonacoWebpackPlugin和chainWebpack
            <br />
            其他的代码编辑器还有| <a href="https://scniro.github.io/react-codemirror2/">react-codemirror2</a> 仅支持js |
            <a href="https://github.com/securingsincity/react-ace">react-ace</a>支持语言多 |
            <a href="https://jpuri.github.io/react-draft-wysiwyg/#/">react-draft-wysiwyg</a> 点demo可及时看到代码
            <br />
            <Space>
              <Button style={{ marginBottom: 3 }} type="primary" onClick={() => { this.handleSubmitRun() }} loading={this.state.loadings[0]}>{getTransStr("运行")}</Button>
              <Select showSearch placeholder={getTransStr("选择模板")} optionFilterProp="children" value={this.state.select_index}
                style={{ width: '350px', paddingLeft: "10px", bottom: 3 }}
                onChange={index => {
                  this.monacoInstance.setValue(codes[index].code) //7，在外部如何修改编辑器的值
                  this.setState({ code: this.state.codes[index].code, select_index: index, file: this.state.codes[index].file_name })
                }
                }
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {codes.map((v: any, idx) => {
                  return <Select.Option value={idx} key={v.file_name}>{v.file_name}</Select.Option>
                })}
              </Select>
            </Space>
            <div ref={this.editorParentRef} style={{ width: "100%", height: 500 }} />
          </Card>
        </Col>
      </Row>
    )
  }
}
const CodeEditor = () => {
  const editorDidMount = (editor, monaco) => {
    console.log('editorDidMount', editor);
  };
  return <div>
    <Collapse defaultActiveKey={['1']}>
      <Collapse.Panel header="仅用monaco-editor " key="1">
        <MonacoEditor />
      </Collapse.Panel>
      <Collapse.Panel header="markdown展示" key="2">
        <MarkdownComp content={md.toString()} />
      </Collapse.Panel>
      <Collapse.Panel header="用monaco-editor-react显示日志" key="3">
        <LogCard curLog={`
2024-08-30T06:19:20.402077691Z ++ /usr/local/bin/fixuid
2024-08-30T06:19:20.404716481Z fixuid: updating user 'dock2er' to UID '12
2024-08-30T06:19:20.404727992Z fixuid: updating group 'dock1er' to GID '33
2024-08-30T06:19:20.406321529Z + eval export 'HOME="/home/robot"'
2024-08-30T06:19:20.406342686Z ++ export HOME=/home/robot
2024-08-30T06:19:20.406345550Z ++ HOME=/home/robot
2024-08-30T06:19:20.406530222Z + echo 'Running /usr/sbin/sshd -p 2222;
2024-08-30T06:19:20.406535735Z /usr/sbin/sshd -p 8890;
2024-08-30T06:19:20.406536030Z Running /usr/sbin/sshd -p 2222;
2024-08-30T06:19:20.406544965Z /usr/sbin/sshd -p 8890;
2024-08-30T06:19:20.406547737Z sleep 1m && cat /tmp/.mpir
      `} />
      </Collapse.Panel>

      <Collapse.Panel header="用monaco-editor-react做代码diff" key="4">

        <Suspense fallback={<div>Loading Editor...</div>}>
        <MonacoDiffEditor
          height="500"
          language="cpp"
          theme="vs-dark"
          options={{
            selectOnLineNumbers: true,
            automaticLayout: true,
            readOnly:true,
            lineNumbers: (lineNumber) => `${lineNumber + 100 - 1}`,
          }}
          original={`#include <stdio>\nint main();`}
          value={`#include <iostream>\nint main();`}
          editorDidMount={editorDidMount}
        />
        </Suspense>
      </Collapse.Panel>
    </Collapse>
  </div>
}
export default CodeEditor