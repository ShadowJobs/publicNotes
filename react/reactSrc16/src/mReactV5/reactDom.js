let nextUnit = null;
let toRenderTree = null; //将要渲染的树
let deletions;
const render = (element, container) => {
  nextUnit = {
    dom: container,
    props: {
      children: [element]
    },
    old: null, //v5新增,第一次null，第二次开始，以前一个构建的tree作为old，用来对比
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
  if (!fiber.dom) { //第一次不会进来
    fiber.dom = createDom(fiber);
  }
  deletions = [];
  const elements = fiber.props.children;
  let oldFiber = fiber.old && fiber.old.child; //v5新增
  let prevSibling = null;
  for (let i = 0; i < elements.length; ++i) {
    const el = elements[i]
    if (el instanceof Event) continue //实测，这里会有event对象，应该是浏览器或babel解析jsx时，加入到dom里，然后被塞到children里了
    let sameFiber = el && oldFiber && el.type === oldFiber.type; //v5新增

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
    return;
  }
  let parentFiber = node.parent;
  while (!parentFiber.dom) {
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
    toRenderTree = null;
  }

  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);


export default render
