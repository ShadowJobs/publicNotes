import { handleRouter } from "./handleRouter"

let prevRouter = ""
let nextRouter = location.pathname

export const getPrevRouter = () => prevRouter
export const getNextRouter = () => nextRouter

export const rewriteRouter = () => {
  // 处理history.go(), history.forward(), history.back()事件
  window.addEventListener("popstate", () => {
    prevRouter = nextRouter
    nextRouter = location.pathname
    handleRouter()
  })

  // 处理pushState -- 通过重写的方式
  const rawPushState = window.history.pushState
  window.history.pushState = (...args) => {
    prevRouter = location.pathname
    rawPushState.apply(window.history, args)
    nextRouter = location.pathname
    handleRouter()
  }

  // 处理replaceState -- 通过重写的方式
  // const rawReplaceState = window.history.replaceState
  // window.history.replaceState = (...args) => {
  //   prevRouter = location.pathname
  //   rawReplaceState.apply(window.history, args)
  //   nextRouter = location.pathname
  //   handleRouter()
  // }
}