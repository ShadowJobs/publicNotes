let nextUnit = null;
let toRenderTree = null; //将要渲染的树
let currentTree = null; //当前的fiber树，记录上一个根，用来下一次diff //v5新增
let deletions;

let hookIndex = 0
let currentFiber=null //currentTree中的正在perform的某一个节点

//v7新增：useEffect
export const useEffect = (func,reliables) => {
  let curIdx = hookIndex
  let hook={func,reliables}
  hookIndex++;
  let oldhook=currentFiber.old && currentFiber.old.hooks[curIdx]
  let hasChanged=true
  if(oldhook){
    if(oldhook.reliables.length===0)
      hasChanged=false //如果没有依赖，只执行一次
    else
      hasChanged=oldhook.reliables.some((dep,i)=>dep!==reliables[i])
  }
  if(hasChanged){
    oldhook?.cleanup && oldhook.cleanup()
  }
  currentFiber.hooks.push(hook)
  if(hasChanged) currentFiber.effects.push(hook)
}

// v7新增：useState
export const useState = (initState) => {
  let curIdx = hookIndex
  hookIndex++;
  let hook={}
  let oldhooks=currentFiber.old && currentFiber.old.hooks
  if(oldhooks?.[curIdx]){
    hook=oldhooks[curIdx]
  }else{
    hook={data:initState}
  }
  currentFiber.hooks.push(hook)
  const setState = (newV) => {
    const newValue = typeof newV == "function"?newV(hook.data):newV
    if(hook.data!==newValue){
      hook.data=newValue
      nextUnit = {
        dom: currentTree.dom,
        props: currentTree.props,
        old: currentTree,
      }
      toRenderTree = nextUnit;
    }
  }
  return [hook.data, setState]
}
const render = (element, container) => {
  nextUnit = {
    dom: container,
    props: {
      children: [element]
    },
    old: null, //v5新增,第一次不会进来，第二次开始，以前一个构建的tree作为old，用来对比
  }
  toRenderTree = nextUnit;
}

// 创建真实dom
const createDom = (fiber) => {
  const dom = fiber.type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(fiber.type);
  updateDom(dom, {}, fiber.props);
  return dom
}

const performUnitOfWork = (fiber) => {
  deletions = [];
  let elements = fiber.props.children;
  if (fiber.type instanceof Function) { //v6新增：函数组件
    hookIndex = 0 //重置要写在这里，因为下一行就会开始执行函数组件，里面就可能要用到hookIndex了。
    currentFiber = fiber
    currentFiber.hooks=[]
    currentFiber.effects=[]
    elements = [fiber.type(fiber.props)];
  }
  if (!fiber.dom) { //第一次不会进来
    fiber.dom = fiber.type instanceof Function ? createDom({ props: fiber.props }) : createDom(fiber);
  }
  let oldFiber = fiber.old && fiber.old.child;
  let prevSibling = null;
  for (let i = 0; i < elements.length; ++i) {
    const el = elements[i]
    if (el instanceof Event) continue //实测，这里会有event对象，应该是浏览器或babel解析jsx时，加入到dom里，然后被塞到children里了
    let sameFiber = el && oldFiber && el.type === oldFiber.type;

    // 与v4的差异，这里增加了新旧fiber的对比，复用。
    let newFiber = null;
    if (sameFiber) {
      newFiber = {
        type: el.type,
        props: el.props,
        parent: fiber,
        dom: oldFiber.dom,
        effectTag: "UPDATE",
        old: oldFiber
      }
    } else if (el && oldFiber) { //有新的，有旧的,但type不一样,删除旧的，新增新的
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
      newFiber = {
        type: el.type,
        props: el.props,
        parent: fiber,
        dom: null,
        effectTag: "PLACEMENT",
        old: null,
      }
    } else if (oldFiber) { //有旧的，没新的；删除
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    } else {//有新的，没旧的；新增
      newFiber = {
        type: el.type,
        props: el.props,
        parent: fiber,
        dom: null,
        effectTag: "PLACEMENT",
        old: null,
      }
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (i === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
  }

  //本层树构建完毕，返回下一个节点，如果有子节点，返回子节点，如果有兄弟节点，返回兄弟节点，如果没有兄弟节点，返回父节点的兄弟节点 
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}
const updateDom = (dom, oldProps, newProps) => {
  Object.keys(oldProps).forEach(name => {
    if (name !== "children") {
      if (!(name in newProps)) {
        dom[name] = "";
      }
      if (name.startsWith("on")) {
        dom.removeEventListener(name.toLowerCase().slice(2), oldProps[name]);
      }
    }
  })
  Object.keys(newProps).forEach(name => {
    if (name !== "children") {
      if (oldProps[name] !== newProps[name]) {
        dom[name] = newProps[name];
      }
      if (name.startsWith("on")) {
        dom.addEventListener(name.toLowerCase().slice(2), newProps[name]);
      }
    }
  })
}
const commitRoot = (node) => {
  if (node.effectTag === "DELETION") {
    node.parent.dom.removeChild(node.dom);
    if(node.effects) node.effects.forEach(hook=>hook.cleanup && hook.cleanup())
    return;
  }
  let parentFiber = node.parent;
  while (!parentFiber.dom) {//循环的原因：<><><div/></></>这种情况，有2层<>,那么会产生只有虚拟节点没有dom真实节点的节点，dom是null，需要找到最近的有dom的父节点，挂载
    parentFiber = parentFiber.parent;
  }
  if (node.effectTag === "PLACEMENT" && node.dom) {
    parentFiber.dom.appendChild(node.dom);
  }
  if (node.effectTag === "UPDATE" && node.dom) {
    updateDom(node.dom, node.old.props, node.props);
  }
  if (node.child) {
    commitRoot(node.child);
  }
  if (node.sibling) {
    commitRoot(node.sibling);
  }
  if(node.effects) node.effects.forEach(hook=>hook.func())
}

const workLoop = (deadline) => {
  let shouldYield = false;
  while (nextUnit && !shouldYield) {
    nextUnit = performUnitOfWork(nextUnit);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnit && toRenderTree) {
    // 树构建完毕，将fiber树转换为真实dom树
    deletions.forEach(commitRoot);
    commitRoot(toRenderTree.child);
    currentTree = toRenderTree; //v5新增,记录当前tree，用于后续setState时更新
    toRenderTree = null;
  }

  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);


export default render
