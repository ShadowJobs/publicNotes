import React, { useState } from 'react';
import { Button, Select, Input } from 'antd';
import crypto from 'crypto';
import { ExpressUrl } from '@/global';
import { request } from 'umi';
const { Option } = Select;
const { TextArea } = Input;
function makeMd5(s, encoding = 'utf8') {
    return crypto.createHash('md5').update(s, encoding).digest('hex');
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const getTransResultNode=(translation)=>{
  const result=translation?.replace(/callback\(/,"").replace(/\)/,"")
  let obj
  try {
    obj=JSON.parse(result)
  } catch (error) {
    obj={msg:"Error in jsonparse"}
  }
  return <div>
    {JSON.stringify(obj,null,2)}
  </div>
}
function App() {
  const [text, setText] = useState("你好");
  const [translator, setTranslator] = useState("baidu");
  const [language, setLanguage] = useState("en");
  const [translation, setTranslation] = useState("{}");
  const [appid,setAppId]=useState("")
  const [appKey,setAppKey]=useState("")
  const [proxyType,setProxyType]=useState<"proxy-any"|"nginx-proxy"|"script-jsonp">("proxy-any")
  const baiduUrl="http://api.fanyi.baidu.com/api/trans/vip/translate"
  const handleTranslate = async () => {
    let url;
    let params;
    let result;

    const salt=getRandomInt(32768, 65536)
    const sign=makeMd5(`${appid}${text}${salt}${appKey}`)
    let jsonpRequest =null
    if (translator === "google") {
      // 填写谷歌翻译API
      url = `${ExpressUrl}/proxy-ly/any?url=https://translation.googleapis.com/language/translate/v2`;
      params = {
        q: text,
        target: language,
        key: 'YOUR_GOOGLE_TRANSLATE_API_KEY',
      };
    } else if (translator === "baidu") {
      if(proxyType==="proxy-any"){
        url = `${ExpressUrl}/any`;
        params = {
          q: text,
          from: 'zh',
          to: language,
          appid: appid,
          salt,
          sign,
          callback:"callback",
          url:baiduUrl
        };
      }else if(proxyType==="nginx-proxy"){
        // const reqBaiduUrl=encodeURIComponent(baiduUrl+"?q="+text+"&from=zh&to="+language
        //   +"&appid="+appid+"&salt="+getRandomInt(32768, 65536)+"&sign="+makeMd5(`${appid}${text}${salt}${appKey}`)+"&callback=callback")

        url=`/baidutrans-only-proxy/api/trans/vip/translate?q=${text}&from=zh&to=${language}&appid=${appid}&salt=${salt}&sign=${sign}&callback=callback`
      }else if(proxyType==="script-jsonp"){
        url = `${baiduUrl}?q=${text}&appid=${appid}&salt=${salt}&from=${"zh"}&to=${language}&sign=${sign}`
        jsonpRequest=(url, callback)=> {
            let script = document.createElement('script');
            script.src = `${url}&callback=${callback}`;
            document.body.appendChild(script);
        }
        window.handleResponse=(data)=> {
            console.log(data);
            setTranslation(data);
        }
      }
    }

    try {
      result = proxyType=="script-jsonp"?jsonpRequest(url, "handleResponse"): await request(url,{method:"GET",params})
      if(translator === "google") {
        setTranslation(result.data.data.translations[0].translatedText);
      } else if(translator === "baidu" && proxyType!=="script-jsonp") {
        setTranslation(result);
      }
    } catch (error) {
      console.log(error);
      setTranslation(`{"msg":"Error in translation"}`);
    }
  };

  return (
    <div className="App">
      <TextArea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      <Select defaultValue={translator} style={{ width: 120 }} onChange={(value) => setTranslator(value)}>
        <Option value="google">Google</Option>
        <Option value="baidu">Baidu</Option>
      </Select>
      <Select defaultValue={language} style={{ width: 120 }} onChange={(value) => setLanguage(value)}>
        <Option value="en">English</Option>
        <Option value="jp">Japanese</Option>
      </Select>
      <Select defaultValue={proxyType} style={{ width: 220 }} onChange={(value) => setProxyType(value)}>
        <Option value="proxy-any">proxy-any,自定义域名转发,通过自己的后台</Option>
        <Option value="nginx-proxy">nginx-proxy,nginx规则转发</Option>
        <Option value="script-jsonp">script-jsonp，jsonp直连</Option>
      </Select>
      <Button type="primary" onClick={() => handleTranslate()}>Translate</Button>
      <div>
        {translator === "google" ? <Input value="YOUR_GOOGLE_TRANSLATE_API_KEY" style={{width:200}}/> :
        translator === "baidu" ? <>
          baiduIp<Input value={appid} onChange={(e)=>setAppId(e.target.value)} style={{width:200}}/> 
          baiduKey<Input value={appKey} onChange={(e)=>setAppKey(e.target.value)}  style={{width:200}}/>
          <p>{proxyType=="script-jsonp"? JSON.stringify(translation,null,2) : getTransResultNode(translation)}</p>
        </>:null}
      </div>
    </div>
  );
}

export default App;
