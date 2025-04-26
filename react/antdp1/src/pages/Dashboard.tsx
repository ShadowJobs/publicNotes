import React, { useEffect } from 'react';
import { Divider, Card } from 'antd';
import { ThinkingDeepseakUrl } from '@/global';

const ProjectCard: React.FC<{ cfg: any }> = ({ cfg }) => {
  return <div style={{ position: "relative", height: 150 }}>
    <div style={{
      position: "absolute", left: 5, top: 5, border: "1px solid #0cc", borderRadius: 4,
      fontSize: 12, padding: 0, color: 'red', zIndex: 2
    }}>
      {cfg.recommend ? "荐" : ""}
    </div>
    <Card title={cfg.name}
      extra={<a href={cfg.url} target='_blank'>More</a>}
      style={{ maxWidth: 350, border: "1px solid #ccc", borderRadius: 10, height: 150 }}>
      <div>{cfg.description}</div>
    </Card>
  </div>
}
const ProjectConfig = [
  {
    name: "Vite + React",
    url: window.location.hostname === "localhost" ? "http://localhost:6002" : (window.location.protocol + '//' + window.location.hostname + ':39003'),
    description: "Vite + React构建的项目, 使用pnpm monorepo, vue3, craco, qiankun, 非qiankun等",
    type: "project"
  },
  {
    name: "火山云上的 Deepseek-v3",
    url: "https://shadowjobs.xyccstudio.cn:39006/chat/qHMKS7m3NMyZfyLR",
    description: "比官方稳定的deepseek-v3 ",
    type: "llm",
    recommend: true
  },
  {
    name: "火山云上的 Deepseek-r1",
    url: "https://shadowjobs.xyccstudio.cn:39006/chat/VjMVEV2wpRpAG7mX",
    description: "deepseek-r1-671b完整版, 比deepseek官方稳定性更高 ",
    type: "llm"
  },
  {
    name: "Deepseek v3 大模型",
    url: "https://shadowjobs.xyccstudio.cn:39006/chat/051B9SgDyz6DeDue",
    description: "官方 Deepseek v3 api",
    type: "llm"
  },
  {
    name: "Deepseek-r1 官方 api",
    url: "https://shadowjobs.xyccstudio.cn:39006/chat/UPt9RAHvuEJO8dB8",
    description: "Deepseek-r1, 官方api。（api没有钱了）",
    type: "llm"
  },
  {
    name: "腾讯云 Deepseek-r1",
    url: "https://shadowjobs.xyccstudio.cn:39006/chat/8Nou6rwxxEKjF3nz",
    description: "deepseek-r1-671b完整版, 腾讯云 ，上下文太长会被截断",
    type: "llm"
  },
  {
    name: "Dify",
    url: "https://shadowjobs.xyccstudio.cn:39006/apps",
    description: "Dify 模型管理",
    type: "project"
  },
  {
    name: "LLM做的翻译工具",
    url: "https://shadowjobs.xyccstudio.cn:39006/completion/JPG7Z5bXlaGVCZpi",
    description: "翻译工具,可以批量翻译，多种语言",
    type: "agent"
  },
  {
    name: "私有知识检索",
    url: "https://shadowjobs.xyccstudio.cn:39006/chat/2UrBdF7eIjdVxCOM",
    description: "私有知识检索, 用于检索自己的知识库",
    type: "agent"
  },
  {
    name: "工作流agent",
    url: "https://shadowjobs.xyccstudio.cn:39006/workflow/ORLUWNQXVR87jYXK",
    description: "工作流agent,执行代码",
    type: "agent"
  },
  {
    name: "旅游",
    url: "https://shadowjobs.xyccstudio.cn:39006/workflow/f7ccnq1vhc82w7fM",
    description: "输入城市，根据当地天气判断是否出游，以及花费",
    type: "agent"
  },
  { name:"silicon文生图",
    url:"https://shadowjobs.xyccstudio.cn:39006/workflow/5ymZwLYL00gjwZtz",
    description:"silicon文生图,使用免费的flux和stablediffusion模型",
    type:"agent"
  }

]
const nameHash: any = {
  "project": "项目",
  "llm": "大模型",
  "agent": "智能工具"
}
const Classify: React.FC<{ type: string }> = ({ type }) => {
  return <div>
    <Divider orientation="left">{nameHash[type]}</Divider>
    <div style={{
      margin: "0 auto", display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "10px", padding: "10px"
    }}>
      {ProjectConfig.filter(v => v.type == type).map((item, index) => <ProjectCard key={index} cfg={item} />)}
    </div>
  </div>
}
const Dashboard: React.FC = () => {
  return (<div>
    <Classify type="llm" />
    <Classify type="project" />
    <Classify type="agent" />
  </div>);
};

export default Dashboard;
