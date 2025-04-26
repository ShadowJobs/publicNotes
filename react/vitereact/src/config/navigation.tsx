import {
  AppstoreOutlined,
  BarChartOutlined,
  BranchesOutlined,
  DashboardOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { MenuProps } from "antd";
import { Link } from "react-router-dom";
const ThinkingDeepseakUrl = "https://shadowjobs.xyccstudio.cn:39006/chat/VjMVEV2wpRpAG7mX";
const AiAppHash: any = {
  "火山云上的 Deepseek-v3": {
    name: "火山云上的 Deepseek-v3",
    url: "https://shadowjobs.xyccstudio.cn:39006/chat/qHMKS7m3NMyZfyLR",
    description: "比官方稳定的deepseek-v3 ",
    type: "llm",
    icon:"/images/deepseek.svg",
    recommend: true
  },
  "火山云上的 Deepseek-r1": {
    name: "火山云上的 Deepseek-r1",
    url: "https://shadowjobs.xyccstudio.cn:39006/chat/VjMVEV2wpRpAG7mX",
    description: "deepseek-r1-671b完整版, 比deepseek官方稳定性更高 ",
    icon:"/images/deepseek.svg",
    type: "llm"
  },
  "Deepseek v3 大模型": {
    name: "Deepseek v3 大模型",
    url: ThinkingDeepseakUrl,
    icon:"/images/deepseek.svg",
    description: "官方 Deepseek v3 api, 自己配的thinking能力",
    type: "llm"
  },
  "Deepseek-r1 官方 api": {
    name: "Deepseek-r1 官方 api",
    icon:"/images/deepseek.svg",
    url: "https://shadowjobs.xyccstudio.cn:39006/chat/UPt9RAHvuEJO8dB8",
    description: "Deepseek-r1, 官方api",
    type: "llm"
  },
  "Dify": {
    name: "Dify",
    url: "https://shadowjobs.xyccstudio.cn:39006/apps",
    description: "Dify 模型管理",
    icon: "/images/dify.ico",
    type: "project"
  },
  "LLM做的翻译工具": {
    name: "LLM做的翻译工具",
    url: "https://shadowjobs.xyccstudio.cn:39006/completion/JPG7Z5bXlaGVCZpi",
    description: "翻译工具,可以批量翻译，多种语言",
    type: "agent"
  },
  "私有知识检索": {
    name: "私有知识检索",
    url: "https://shadowjobs.xyccstudio.cn:39006/chat/2UrBdF7eIjdVxCOM",
    description: "私有知识检索, 用于检索自己的知识库",
    type: "agent"
  },
  "工作流agent": {
    name: "工作流agent",
    url: "https://shadowjobs.xyccstudio.cn:39006/workflow/ORLUWNQXVR87jYXK",
    description: "工作流agent,执行代码",
    type: "agent"
  },
  "旅游":{
    name: "旅游",
    url: "https://shadowjobs.xyccstudio.cn:39006/workflow/f7ccnq1vhc82w7fM",
    description: "输入城市，根据当地天气判断是否出游，以及花费",
    type: "agent"
  },

  "silicon文生图":{ name:"silicon文生图",
    url:"https://shadowjobs.xyccstudio.cn:39006/workflow/5ymZwLYL00gjwZtz",
    description:"silicon文生图",
    type:"agent"
  }

}

export const DashboardApps = Object.keys(AiAppHash).map((title) => {
  return AiAppHash[title];
});

export const dashboardCfg={
  appHash: AiAppHash,
  DashboardApps,

}

type MenuItem = NonNullable<MenuProps["items"]>[0];

export const DEFAULT_ROUTE_PATH = "/dashboard";
export const DEFAULT_OPEN_PATH = ["dashboard"];
export const DEFAULT_SELECTED_PATH = ["dashboard"];

export const LinkTo = ({ name, to, keys, target }: { name: string; to: string; keys?: string[]; target?: string }) => (
  <Link to={to} state={{ keys }} target={target}>
    {name}
  </Link>
);

export const navigation: MenuItem[] = [
  {
    key: "dashboard",
    label: <LinkTo name="Dashboard" to="/dashboard" keys={["dashboard"]} />,
    icon: <DashboardOutlined />,
  },
  {
    key: "welcome",
    label: <LinkTo name="Welcome" to="/welcome" keys={["welcome"]} />,
    icon: <AppstoreOutlined />,
  },
  {
    key: "qiankun-sub-vue",
    label: <LinkTo name="qiankun-vue" to="/vue" keys={["qiankun-sub-vue"]} />,
    icon: <BarChartOutlined />,
  },
  {
    key: "qiankun-sub-react",
    label: <LinkTo name="qiankun-react" to="/react1" keys={["qiankun-sub-react"]} />,
    icon: <BarChartOutlined />,
  },

  // 这里面的 keys 会用于menu里的defaultSelectedKeys, defaultOpenKeys,所以，keys就是前面树的keys数组，写错了，menu的高亮就不对了
  {
    key: "qa-gpt", label: "Task", icon: <QuestionCircleOutlined/>, children: [
      { key: "qa-gpt-robot", label: <LinkTo name="QA GPT" to="https://applink.feishu.cn/TYuSw5gWw" keys={["AI-Bots", "qa-gpt-robot"]} target="_blank" /> },
      { key: "gpt", label: <LinkTo name="Tasks" to="/AI-Apps/AGPT/tasks" keys={["qa-gpt", 'gpt']} /> },
    ]
  },
  {
    key: "lve", label: "Log Insight", icon: <BranchesOutlined />, children: [
      { key: "insight-doc", label: <LinkTo name="Introduction" to="/lve/insight-doc" keys={["lve", "insight-doc"]} /> },
      {
        key: "insight-group", label: "Group", children: [
          { key: "ci-list", label: <LinkTo name="CI" to="/lve/group/ci/list" keys={["lve", "insight-group", "ci", "ci-list"]} /> },
        ]
      }
    ]
  },
];
