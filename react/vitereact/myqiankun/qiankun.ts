import { handleRouter } from "./handleRouter"
import { rewriteRouter } from "./rewriteRouter"
interface Props {
  container: Element
}
export interface Apps {
  name: string
  entry: string
  container: string
  activeRule: string
  bootstrap?: (props?: Props) => void
  mount?: (props: Props) => void
  unmount?: (props?: Props) => void
}

let _apps: Apps[] = []

export const getApps = () => _apps

export const registerMicroApps = (apps: Apps[]) => {
  _apps = apps
}

export const start = () => {
  rewriteRouter()
  handleRouter();
}

let _qiankunState = {}

export const initGlobalState = (state: any) => {
  _qiankunState = { ...state }
  return {
    setGlobalState: (state: any) => {
      _qiankunState = { ...state }
    },
    onGlobalStateChange: (callback: (state: any, prev: any) => void) => {
      // window.addEventListener('qiankunStateChange', (event: any) => {
      //   callback(event.detail, _qiankunState)
      //   _qiankunState = { ...event.detail }
      // })
    }
  }
}