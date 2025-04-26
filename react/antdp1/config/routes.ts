export default [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      { component: './404', },
    ],
  },
  { path: '/dashboard', name: 'Dashboard', icon: 'dashboard', component: './Dashboard' },
  { path: '/welcome', name: 'Welcome', icon: 'smile', component: './Welcome' },
  {
    path: '/LinYing',
    name: 'LinYing',
    icon: 'crown',
    routes: [
      // {name: "Test", path: "/LinYing/Test", component: "./LinYing/Test" },
      { name: "Express+graphql", path: "/LinYing/express-graphql", component: "./LinYing/ExpressGraphql" },
      {
        name: "Css例子", path: "css", routes: [
          { name: "瀑布流", path: "/LinYing/css/Waterfall", component: "./LinYing/CssCase/Waterfall" },
          { name: "Css样例", path: "/LinYing/css/cases", component: "./LinYing/CssCase/SmallCssCases" },
          { name: "Css变量+布局", path: "/LinYing/css/css-variable", component: "./LinYing/CssCase/CssVariable" },
        ]
      },
      {
        name: "地图", path: "map", routes: [
          { name: "高德", path: "/LinYing/map/Gaode", component: "./LinYing/Map/Gaode" },
          { name: "高德热力图", path: "/LinYing/map/GaodeHeatmap", component: "./LinYing/Map/GaodeHeatmap" },
          { name: "GoogleMapReact", path: "/LinYing/map/GoogleMapReact", component: "./LinYing/Map/GoogleMapReact" },
          { name: "GoogleMapReactClusterer", path: "/LinYing/map/GoogleMapReactClusterer", component: "./LinYing/Map/GoogleMapReactClusterer" },
          { name: "GoogleMapOrigin", path: "/LinYing/map/GoogleMapOrigin", component: "./LinYing/Map/GoogleMapOrigin" },
          { name: "GoogleMapUseApi", path: "/LinYing/map/GoogleMapGMApi", component: "./LinYing/Map/GoogleMapGMApi" },
          { name: "GoogleHeatMap", path: "/LinYing/map/GoogleHeatMap", component: "./LinYing/Map/GoogleHeatMap" },
        ]
      },
      { name: "log+分段加载", path: "/LinYing/log", component: "./LinYing/LogInfo" },
      { name: "小组件", path: "/LinYing/SmallComps", component: "./LinYing/SmallComps" },
      { name: "Zip测试", path: "/LinYing/ZipTest", component: "./LinYing/ZipTest" },
      { name: "图片缩放", path: "/LinYing/ScalePicCanvas", component: "./LinYing/ScalePicCanvas" },
      { name: "BirdView", path: "/LinYing/BirdView", component: "./LinYing/BirdView" },
      { name: "react json配合form表单", path: "/LinYing/react-json-form", component: "./LinYing/JsonEditorAndForm", },
      { name: "代码编辑", path: "/LinYing/code-editor", component: "./LinYing/MonacoEditor" },
      { name: "echarts", path: "/LinYing/echarts", component: "./LinYing/AntChartEchartScatter" },
      { name: "charts", path: "/LinYing/Charts", component: "./LinYing/TestCharts/Charts" },
      { name: "nesting", icon: "smile", path: "/LinYing/NestingForm", component: "./LinYing/NestingForm" },
      { name: "htmlTable2-feishu", path: "/LinYing/HtmlTable2", component: "./LinYing/HtmlTable2" },
      { name: "图文混排", path: "PicAndWord", component: "./LinYing/PicAndWord" },
      {
        name: "WorkerTest+fullScreen", path: "/LinYing/WorkerTest", component: "./LinYing/Workers/WorkerTest",
        target: "_blank",
        layout: {
          hideMenu: true,
          hideNav: true,
          hideFooter: true,
        }
      },
      { name: "Jsondiff+ErrorBoundary", path: "/LinYing/JsonDiff", component: "./LinYing/JsonDiff" },
      { name: "JsTest+helmet", path: "/LinYing/JsTest", component: "./LinYing/JsTest/JsTest", menuRender: false },
    ]
  },

  {
    path: '/2025', name: "2025 GPT",
    routes:[
      {name: "MyGpt", path: "mygpt", component: "./2025/MyGpt"},
      {name: "G6Graph", path: "G6Graph", component: "./2025/G6Graph"},
      {name: "拼接Deepseek", path: "concat-ds", component: "./2025/ConcatDeepseek"},
    ]
  },
  {
    path: '/2024', icon: "twitter", name: "2024",
    routes:[
      {name: "Graphin", path: "Graphin", component: "./2024/Graphin"},
      {name: "SvgDraw", path: "SvgDraw", component: "./2024/SvgDraw"},
      {name: "Hook1", path: "Hook1", component: "./2024/Hook1"},
      {name: "ErrorStatistic", path: "ErrorStatistic", component: "./2024/ErrorStatistic"},
      {name: "AvatarUpdate", path: "AvatarUpdate", component: "./2024/AvatarUpdate"},
      {name: "BigFileUpload", path: "BigFileUpload", component: "./2024/BigFileUpload"},
      {name: "Http缓存分类", path: "Http", component: "./2024/HttpCache"},
      {name: "俄罗斯方块", path: "tetris", component: "./2024/Tetris"},
      {name: "中国象棋", path: "chess", component: "./2024/ChessCN/ChessGame"},
      {name: "2048", path: "2048", component: "./2024/Game2048"},
    ]
  },

  {
    path: '/management', icon: "lock", name: "Management",
    routes:[
      {name: "Users", path: "users", component: "./management/Users"},
    ]
  },
  {name: "Documents",icon:"FilePdf",path: "docs",routes:[
    {path:"private",component:"./Documents/PrivateDocs",name:"私有文档"},
    {path:":file",component:"./Documents/Document"}
  ]},
  {
    path: '/interest', icon: "apartment", name: "业余研究",
    routes: [
      { name: "DPlayer看视频", path: "dplayer", component: "./Interest/DPlayer" },
      { name: "直播视频", path: "LiveVideo", component: "./Interest/LiveVideo" },
      { name: "视频聊天", path: "VideoChat", component: "./Interest/VideoChat" },
      { name: "翻译", path: "translate", component: "./Interest/Translator" },
      { name: "Websocket聊天", path: "WebSocket", component: "./Interest/WebsocketPage" },
      { name: "动态生成表单", path: "AutoForm", component: "./Interest/AutoForm" },
      { name: "Shell", path: "terminal", component: "./Interest/Shell" },
    ]
  },
  {
    path: '/Three', name: 'Three', icon: 'dropbox',
    routes: [
      { name: "three", path: "/Three/three", component: "./Three/Three1" },
      { name: "earth", path: "/Three/Earth", component: "./Three/Earth" },
      { name: "city", path: "/Three/City", component: "./Three/City/CityIndex" },
      { name: "carTrajectory", path: "/Three/CarTrajectory", component: "./Three/CarTrajectory" },
    ]
  },
  { component: './404', },
];
