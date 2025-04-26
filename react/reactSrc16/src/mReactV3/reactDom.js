let nextUnit = null;
const render = (element, container) => {
  nextUnit = {
    dom: container,
    props: {
      children: [element]
    }
  }
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
  if(!fiber.dom){ //第一次不会进来,从第二次开始，此时数据的格式为fiber节点，见第37行的newFiber
    fiber.dom = createDom(fiber);
  }
  if(fiber.parent){ //第一次不会进来
    fiber.parent.dom.appendChild(fiber.dom);
  }

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

const workLoop = (deadline) => {
  let shouldYield = false;
  while(nextUnit && !shouldYield){
    nextUnit = performUnitOfWork(nextUnit);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 优化：如果nextUnit为空，说明fiber树构建完毕，那么requestIdleCallback不必继续loop，可以用setTimeout代替
  // requestIdleCallback(workLoop);
  if(nextUnit){
    requestIdleCallback(workLoop);
    console.log('requestIdleCallback');
  }else{
    setTimeout(workLoop, 1/60 * 1000);
    console.log('setTimeout');
  }
}
requestIdleCallback(workLoop); 


export default render
