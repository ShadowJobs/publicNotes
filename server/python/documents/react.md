# router匹配规则
- 1. 从上到下匹配，匹配到第一个即返回
- 2. 如果第一级匹配到了，第二级不匹配，不会回到上一级重新匹配
```js
[
  {
    path: 'lpnp',
    routes: [
      { path: 'new', component: './Applications/LPNP/LPNPNewTask' },
    ]
  },

  {
    path: ':team',
    routes: [
      { path: 'tasks', component: './Applications/Common/TaskList', }, 
      { 
        path: ':id([a-zA-Z-]+)-report',
        component: './Applications/Common/Report' ,

      },
    ]
  },
  { path:"adas",routes:[....] }
]
// 上述匹配规则是希望lpnp/new匹配到第一个，lpnp/tasks匹配到:team/tasks，但是实际上走到第一层lpnp/里找不到，也不会再往下找:team/tasks
// 解决方案1：
  {
    path: 'lpnp',
    routes: [
      { path: 'new', component: './Applications/LPNP/LPNPNewTask' },
      { path: '/applications/:team/tasks', component: './Applications/Common/TaskList', }, 
      // 注意这里必须写全路径，不能是path:'tasks', 也不能写/applications/lpnp/tasks, 实测这样写TaskList里的useParams会获取不到team
      { path: "/applications/:team/lpnp-report", component: "./Applications/Common/Report" },
    ]
  },
  // 然后再写:team/tasks和:team/lpnp-report的路由
  {path:":team",routes:[.....同上]}
// 错误方案： 将:team放到lpnp之前， 这样会影响adas的匹配,adas/tasks会匹配到:team/tasks

const TaskList:React.FC=()=>{
  const team = useParams<{team:string}>().team
  return <Suspense fallback={<LazyLoading/>}><ApaTaskList team={team}/></Suspense>
}

```