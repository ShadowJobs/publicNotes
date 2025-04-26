const fetchResource = (url: string) => fetch(url).then(res => res.text())

export interface AppExports {
  bootstrap: () => void
  mount: () => void
  unmount: () => void
}
export const importHtml = async (url: string) => {
  const html = await fetchResource(url)
  const template = document.createElement('div')
  template.innerHTML = html
  const scripts = template.querySelectorAll("script")

  const getExternalScripts = () => {
    return Promise.all(Array.from(scripts).map(script => {
      const src = script.getAttribute("src")
      if (!src) {
        return Promise.resolve(script.innerHTML)
      } else {
        return fetchResource(src.startsWith('http') ? src : `${url}${src}`)
      }
    }))
  }

  const execScripts: () => Promise<AppExports> = async () => {
    const scripts = await getExternalScripts()
    // 手动构造CommonJs运行环境 -> 目的，拿到子应用暴露出去的生命周期钩子函数
    const module = {
      exports: {} as AppExports
    }
    const exports = module.exports
    // 注：此时渲染后，没有挂载到主应用的container, 并且不会执行子应用的router
    // 主应用之所以消失，是因为主应用的入口也叫app
    scripts.forEach(code => {
      // eval执行的函数可以访问外部的变量
      eval(code)
    })
    // 执行完代码后，module.exports就是子应用导出的生命周期函数
    return module.exports
  }

  return {
    template,
    getExternalScripts,
    execScripts
  }
}