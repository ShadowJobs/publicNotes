class MicroActions {
  listeners = [];
  onGlobalStateChange;
  setGlobalState;
  states;
  constructor() {
    this.onGlobalStateChange = null;
    this.setGlobalState = null;
    this.states = {}
  }

  mainAppMounted(onGlobalStateChange, setGlobalState) {
    this.onGlobalStateChange = onGlobalStateChange;
    this.setGlobalState = setGlobalState; 
    onGlobalStateChange?.((newState, prevState) => {
      this.states = newState
      Object.keys(this.listeners).forEach(key=>{
        this.listeners[key].forEach(fn=>{
          fn(newState[key])
        })
      })
    })
  }

  registerListener(key,fn) {
    if(!this.listeners[key]){
      this.listeners[key] = []
    }
    this.listeners[key].push(fn)
  }

  removeListener(key,fn) {
    if(!this.listeners[key]){
      return
    }
    if(fn){
      this.listeners[key] = this.listeners[key].filter(f=>f!==fn)
      return
    }else {
      delete this.listeners[key]
    }
  }
}

export default new MicroActions();