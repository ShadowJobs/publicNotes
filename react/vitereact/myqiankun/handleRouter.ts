import { getApps, Apps } from "./qiankun"
import { importHtml } from "./importHtml"
import { getNextRouter, getPrevRouter } from "./rewriteRouter"

export const handleRouter = async () => {
  const prevApp = getApps().find(item => getPrevRouter().startsWith(item.activeRule))

  // 获取当前路由的路径
  const nextRouter = getNextRouter()
  const app = getApps().find(item => nextRouter.startsWith(item.activeRule))

  if (prevApp) {
    await unmount(prevApp)
  }

  if (!app) {
    return
  }

  const { template, execScripts } = await importHtml(app.entry)

  const container = document.querySelector(app.container)
  container?.appendChild(template);

  
  (window as any)['__POWERED_BY_QIANKUN__'] = true;
  // 解决子应用找不到静态资源文件，为webpack注入运行时的publicPath
  (window as any)['__INJECTED_PUBLIC_PATH_BY_QIANKUN__'] = app.entry + "/";

  //获取子应用的生命周期函数
  const appExports = await execScripts()
  
  app.bootstrap = appExports.bootstrap
  app.mount = appExports.mount
  app.unmount = appExports.unmount

  await bootstrap(app)
  await mount(app)
}

const bootstrap = async (app: Apps) => {
  await app.bootstrap?.()
}

const mount = async (app: Apps) => {
  await app.mount?.({
    container: document.querySelector(app.container)!
  })
}

const unmount = async (app: Apps) => {
  await app.unmount?.({container: document.querySelector(app.container)!})
}