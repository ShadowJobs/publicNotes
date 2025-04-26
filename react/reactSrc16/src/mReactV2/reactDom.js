const render = (element, container) => {
  const dom = element.type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(element.type);
  dom
  Object.keys(element.props)
    .filter(key => key !== "children")
    .forEach(name => {
      dom[name] = element.props[name];
    });
  if(element.props.children){
    // 这个版本的问题：无法被中断，会卡主线程。下一个版本v3:使用fiber
    element.props.children.forEach(child => {
      render(child, dom);
    });
  }
  container.appendChild(dom);
}

export default render
