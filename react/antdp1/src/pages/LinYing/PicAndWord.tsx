
import React, { useEffect, useState } from 'react'
import _ from "lodash"
import { Button, Card, Col, Divider,  Image, Input, message, Modal, Row, Space, Spin, UploadProps, } from 'antd';
import 'moment/locale/zh-cn';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/lib/upload';
import Upload from 'antd/lib/upload/Upload';
import "antd/es/upload/style/index.css"
const renderTextWithImages = (text) => {
  // const imageRegex = /#\[(.*?)\]/g; //单独匹配#[picName]
  // const userRegex = /@\[(.*?)\]/g; //单独匹配@[userName]
  const combinedRegex = /@\[(.*?)\]|#\[(.*?)\]/g; //同时匹配#[picName]或@[userName]
  let _match;
  const matches = [];
  while ((_match = combinedRegex.exec(text)) !== null) {
    const [fullMatch, userName, imageName] = _match; //全匹配为@[ying.lin]或#[a.png],userName为ying.lin,imageName为a.png,一个match里不会同时出现userName和imageName

    if (userName) {
      matches.push(fullMatch)
    } else if (imageName) {
      matches.push(fullMatch)
    }
  }
  if (!matches.length) return <div>{text}</div>;
  let lastIndex = 0;
  const elements = [];
  for (const match of matches) {
    const startIndex = text.indexOf(match, lastIndex);
    const endIndex = startIndex + match.length;
    const before = text.slice(lastIndex, startIndex);
    if (before.length > 0) {
      elements.push(before);
      // elements.push(<br/>);
    }

    if (match.startsWith('#[')) { // image
      const imageName = match.replace('#[', '').replace(']', '');
      const [imageUrl, setImageUrl] = useState(null);
      useEffect(() => {
        fetch(`/epl/api/v1/internal/user_event/batch_get_image_link`,{
          method: 'POST',
          body: JSON.stringify({image_path_list:[imageName]})
        }).then((response) => response.text())
          .then((data) => setImageUrl(JSON.parse(data).data[imageName]))
          .catch((error) => console.log(error));
      }, []);
      const imageElement = imageUrl ? (
        <Image key={endIndex} src={imageUrl} width={200} height={150} alt="Comment Image" />
      ) : (
        <Image.PreviewGroup>
          <Image src="https://via.placeholder.com/150" alt="Comment Image Placeholder" />
        </Image.PreviewGroup>
      );
      elements.push(imageElement);
      elements.push(<br/>);
    } else if (match.startsWith('@[')) { // username
      const userName = match.replace('@[', '').replace(']', '');
      elements.push(<span style={{fontWeight:"bolder",color:"blue"}}>@{userName} </span>);
    }

    lastIndex = endIndex;
  }
  const rest = text.slice(lastIndex);
  if (rest.length > 0) elements.push(rest);
  return <div>{elements}</div>;
};

export const TextAndImage:React.FC<{text:string}> = ({text}) => {
  const renderedText = renderTextWithImages(text);
  return <div style={{ border: "1px solid rgba(222, 222, 222,200)",padding:5,marginBottom:8,height:text?undefined:30}}>{renderedText}</div>;
};

const CustomTextArea:React.FC<{eid:number,value:string,setValue:Function,filterKey:string,isCmt:boolean}> = 
({eid,value,setValue,filterKey,isCmt}) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [loading,setLoading]=useState(false)
  const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };
  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj as RcFile, url => {
        setLoading(false);
        setImageUrl(url);
        setPopoverVisible(false)
        message.success("上传成功")
        if(isCmt){
          setValue(pre=>{
            const newV={...pre}
            newV.comments[filterKey]=`${value}[${info.file.response.data.image_name}]`
            return newV
          })
        }else {
          setValue(pre=>{
            const newComments=[...pre]
            const preComment=newComments.find(v2=>v2.key==filterKey)
            preComment.comments=`${value}[${info.file.response.data.image_name}]`;
            return newComments
          })
        }
      });
    }
  };

  const beforeUpload = (file: RcFile) => {
    console.log(file);
    return true
  };
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );
  const handleOnChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue.endsWith('#') && inputValue.lastIndexOf('#') === inputValue.length - 1) {
      setPopoverVisible(true);
    } else {
      setPopoverVisible(false);
    }
    if(isCmt)
      setValue(pre=>{
        const newV={...pre}
        newV.comments[filterKey]=e.target.value;
        return newV
      })
    else
      setValue(pre=>{
        const newComments=[...pre]
        newComments.find(v2=>v2.key==filterKey).comments=e.target.value;
        return newComments
      })
  };
  
  return (
    <div style={{marginBottom:8}}>
      <Input.TextArea onChange={handleOnChange} value={value} />
      <Modal open={popoverVisible} onCancel={() => setPopoverVisible(false)}>
        <Upload name="file" accept="image/*" listType="picture-card" className="avatar-uploader"
          showUploadList={false} action={`/epl/api/v1/internal/user_event/upload_image?id=${eid}`}
          beforeUpload={beforeUpload} onChange={handleChange}
        >
          {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
        </Upload>
      </Modal>
    </div>
  );
};
const AnalysisEvent:React.FC=()=>{
  const [beginModify,setBeginModify]=useState(false)
  const [comments,setComments]=useState<{key:string,value:string,comments:string}[]>()
  const [modifyCmt,setModifyCmt]=useState(false)
  const query={id:58}
  const [initV,setInitV]=useState({
      "id": 58,
      "comments": {
        "root_cause": "#[hnp/user_event/58/a.png] 如图所示 #[hnp/user_event/58/b.png]",
        "release_plan": "",
        "status_update": ""
      }
  })
  return <div>
    {initV?<Card bordered style={{marginTop:-10}}>
        {
          [{key:"root_cause",label:"根因分析"}].map(v=><div key={v.key}>
            <span style={{width:100}}>{v.label}:</span>
            <span style={{}}>
              {
                modifyCmt?<CustomTextArea isCmt eid={query?.id} filterKey={v.key} value={initV.comments[v.key]} setValue={setInitV}/>
                :<TextAndImage text={initV.comments[v.key]}/>
              }
            </span>
          </div>)
        }
        {modifyCmt?<div style={{marginTop:8}}>
          <Space>
            <Button type='primary' onClick={async()=>{
              setModifyCmt(false)
            }}>保存</Button>
            <Button onClick={()=>{
              setModifyCmt(false)
            }} type="primary">取消</Button>
          </Space></div>:
            (<Button onClick={()=>{setModifyCmt(true)}} type="primary">修改汇总信息</Button>)
        }
        <Divider/>
        {comments?.map(v=><div key={v.key}>
            <span style={{width:100}}>{v.value}:</span>
            <span style={{}}>
              {
                beginModify?<CustomTextArea eid={query?.id} filterKey={v.key} value={v.comments} setValue={setComments}/>
                :<TextAndImage text={v.comments}/>
              }
            </span>
          </div>)
        }
        <br/>
    </Card>:<Row><Col span={24} style={{textAlign:"center"}}><Spin/></Col></Row>}
  </div>
}

export default AnalysisEvent
