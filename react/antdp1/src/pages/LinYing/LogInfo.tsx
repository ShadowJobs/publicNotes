
import { Card, Space, Spin } from 'antd';
import React, { useCallback, useRef, useState } from 'react';


const LogInfo: React.FC = () => {
    const [loadIndex, setLoadIndex] = useState(5);
    const arr=Array.from({length: 66}, (_, index) => index);
    const observerRef = useRef();
    const lastElRef = useCallback((node) => { // 观察最后一个元素
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setLoadIndex(prevIndex => prevIndex + 5); // 每次多加载5个
        }
      });
      if (node) observerRef.current.observe(node);
    },[]);
    const str='<h2 style="color:green">将后端html字符串解析出来，使用dangerouslySetInnerHTML</h2>'
    return <div>
      <div dangerouslySetInnerHTML={{ __html: str }} />
      <Space direction="vertical">
        <Card style={{ backgroundColor: '#454545', color: '#27aa5e', whiteSpace: 'pre-wrap', }}
        //保留换行符whiteSpace
            bodyStyle={{ maxHeight: '65vh', overflow: 'scroll' }}
        >
            <Space>{"asjdlf\nfjalsjd;f\nafsdlfkssksss"}</Space>
        </Card>
    </Space>
    以下为分段加载内容，滚动时再加载
    {arr.slice(0,loadIndex).map(i=><div key={i} style={{height:100}}>
        {i}
    </div>)}
    {loadIndex<arr.length && <div ref={lastElRef} style={{textAlign:"center"}}>
      <Spin style={{marginRight:10}}/>Loading more...
    </div>}
    </div>
}

export default LogInfo