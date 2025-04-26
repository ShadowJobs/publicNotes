let nextUnit = null;
let toRenderTree = null; //将要渲染的树
const render = (element, container) => {
  nextUnit = {
    dom: container,
    props: {
      children: [element]
    }
  }
  toRenderTree = nextUnit;
}

// 创建真实dom
const createDom = (fiber) => {
  const dom = fiber.type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(fiber.type);
  Object.keys(fiber.props)
    .filter(key => key !== "children")
    .forEach(name => {
      dom[name] = fiber.props[name];
    });
  return dom
}

const performUnitOfWork = (fiber) => {
  if(!fiber.dom){ //第一次不会进来
    fiber.dom = createDom(fiber);
  }
  // if(fiber.parent){ //v4 与v3相比的差异：这里仅处理构建fiber树，将真实dom的操作统一放到commitRoot中
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

  const elements = fiber.props.children;
  // 本段代码是为了构建fiber树，树的每一个节点，都有有一个指针child指向第一个子节点，有一个指针sibling指向下一个兄弟节点
  let prevSibling = null;
  for(let i=0;i<elements.length;++i){
    const el=elements[i]
    let newFiber = {
      type: el.type,
      props: el.props,
      parent: fiber,
      dom: null
    }
    if(i===0){
      fiber.child = newFiber;
    }else{
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
  }

//本层树构建完毕，返回下一个节点，如果有子节点，返回子节点，如果有兄弟节点，返回兄弟节点，如果没有兄弟节点，返回父节点的兄弟节点 
  if(fiber.child){
    return fiber.child;
  }
  let nextFiber = fiber;
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

const commitRoot = (node) => {
  node.parent.dom.appendChild(node.dom);
  if(node.child){
    commitRoot(node.child);
  }
  if(node.sibling){
    commitRoot(node.sibling);
  }
}

const workLoop = (deadline) => {
  let hasNoTime = false;
  while(nextUnit && !hasNoTime){
    nextUnit = performUnitOfWork(nextUnit);
    hasNoTime = deadline.timeRemaining() < 1;
  }

  if(!nextUnit && toRenderTree){
    // 树构建完毕，将fiber树转换为真实dom树
    commitRoot(toRenderTree.child);  //v4新增, 这里直接从根节点的child开始commit，因为commitRoot的节点必须要有parent，根的parent是#root。从第一个子节点开始遍历
    toRenderTree = null;
  }

  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop); 


export default render
