
import React from "react";
import Person from "./person"
import Dog from "./dog"
class StoreIndex{
    constructor(){
        this.dogStore=Dog;
        this.personStore=Person;
    }
}

const rootstore = new StoreIndex ()
// "使用reactconntext机制完成统一方法封装
// 1查找机制: useContext优先从Provider value找如果找不到,就会找createContext方法传递过来的默认参数
const context = React.createContext(rootstore)
// 1这个方法作用:通过useContext拿 到rootStore实例对象然后返回
// 11只要在业务组件中调用useStore() -> rootstore
const useStore = () => React.useContext(context)
export default useStore