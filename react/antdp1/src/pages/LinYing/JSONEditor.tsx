import React, { useRef, useEffect } from 'react';
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import { getLocale } from 'umi';

export function deepCompareTwoObj(obj1:any,obj2:any){
  if(typeof obj1!="object"||typeof obj2!="object"){
    return obj1===obj2
  }
  if(Object.keys(obj1).length!=Object.keys(obj2).length){
    return false
  }
  for(let key in obj1){
    if(!deepCompareTwoObj(obj1[key],obj2[key])){
      return false
    }
  }
  return true
}

//去掉字符串里的\n
export function removeEnter(str:string){
  return str.replace(/\n/g,"")
}

interface EditorValue {
  content?: {};
  valid?: boolean;
}

interface ConfigValue {
  statusBar?: boolean;
  mode?: 'code' | 'view' | 'text';
}

interface EditorInputProps {
  initialValue?: EditorValue;
  value?: EditorValue;
  onChange?: (value: EditorValue) => void;
  configProps?: ConfigValue;
  height?:number,
  setref?:any
}

const JsonEditor: React.FC<EditorInputProps> = ({
  initialValue = { content: {}, valid: true },
  value,
  onChange,
  configProps,
  height,
  setref
}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    triggerChange(initialValue);
  }, []);

  useEffect(() => {
    if (editorRef && editorRef.current && value && value.valid && value.content) {
      editorRef.current.set(value.content);
    }
  }, [value]);

  const setRef = (instance) => {
    if (instance) {
      editorRef.current = instance.jsonEditor;
      setref?.(editorRef)
    } else {
      editorRef.current = null;
    }
  };

  const triggerChange = (changedValue: EditorValue) => {
    if(deepCompareTwoObj(value,changedValue)) return;
    onChange?.({ ...value, ...changedValue });
  };

  const onContentChange = (newContent: {}) => {
    triggerChange({ content: newContent, valid: true });
  };

  const onContentValidationError = (error) => {
    if (error.length > 0) {
      triggerChange({ valid: false });
    }
  };

  return (
    //Editor有个bug:编辑后，如果格式正确，就会自动将光标跳到结尾。
    //解决：不设置onChange。但是不设置会导致另一个问题：外部的Form表单拿不到Editor的值。
    //解决2：在外部传入一个setref，将本组件的ref传给外部，外部再通过refData.current.getText()获取值。
    <Editor ref={setRef} value={initialValue.content}
      onChange={setref?undefined:onContentChange} //这里如果是setref，则不能触发onChange
      onValidationError={onContentValidationError}
      statusBar={configProps?.statusBar}
      mode={configProps?.mode ? configProps.mode : 'view'} //code编辑模式 view查看模式 text
      language={getLocale()=="zh-CN"?"zh-cn":"en"} //国际化设置
      htmlElementProps={{
        style: {
          width: '100%',
          height: height || '100%',
        },
      }}
    />
  );
};

export default JsonEditor;
