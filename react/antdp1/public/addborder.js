// 浏览器添加书签，在地址里里粘贴后面的代码，点击书签即可调试css，注意，不能有注释

javascript:(()=>{
  const headElement=document.head;
  const styleElement=document.createElement('style');
  styleElement.setAttribute("debug-css",'');
  styleElement.innerHTML=`* {outline:1px solid tomato;}`;
  const debugElement=document.querySelector("[debug-css]");
  if(debugElement){
    return debugElement.remove();
  }
  headElement.append(styleElement);
})();