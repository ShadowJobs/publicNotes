class MicroActions {
  actions;
  onGlobalStateChange;
  setGlobalState;
  constructor() {
    this.actions = {};
    this.onGlobalStateChange = null;
    this.setGlobalState = null;
  }

  // registerAction(name, action) {
  //   this.actions[name] = action;
  // }

  // getAction(name) {
  //   return this.actions[name];
  // }

  mainAppMounted(onGlobalStateChange, setGlobalState) {
    this.onGlobalStateChange = onGlobalStateChange;
    this.setGlobalState = setGlobalState; 
    onGlobalStateChange?.((newState, prevState) => {
      console.log('mainApp', newState, prevState);
      // 弹出状态变化框
      // alert('mainApp' + JSON.stringify(newState));
      window.__GOT_QIANKUN_NEW_STATE__=newState
    })
  }
}

export default new MicroActions();