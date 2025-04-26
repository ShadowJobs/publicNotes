class MicroActions {
  listeners: { [key: string]: Function[] } = {};
  onGlobalStateChange: Function | null;
  setGlobalState: Function | null;
  states: {
    qkm: number,
    [key: string]: any
  };
  constructor() {
    this.onGlobalStateChange = null;
    this.setGlobalState = null;
    this.states = { qkm: 0 }
  }

  mainAppMounted({ onGlobalStateChange, setGlobalState }: { onGlobalStateChange: Function, setGlobalState: Function }
    , initSt: any) {
    this.onGlobalStateChange = onGlobalStateChange;
    this.setGlobalState = setGlobalState;
    this.states = initSt
    onGlobalStateChange((newState: any, prevState: any) => {
      this.states = newState
      Object.keys(this.listeners).forEach((key: string) => {
        this.listeners[key].forEach(fn => {
          fn(newState[key])
        })
      })
    })
  }

  registerListener(key: string, fn: Function) {
    if (!this.listeners[key]) {
      this.listeners[key] = []
    }
    this.listeners[key].push(fn)
  }

  removeListener(key: string, fn?: Function) {
    if (!this.listeners[key]) {
      return
    }
    if (fn) {
      this.listeners[key] = this.listeners[key].filter(f => f !== fn)
      return
    } else {
      delete this.listeners[key]
    }
  }
}

export default new MicroActions();