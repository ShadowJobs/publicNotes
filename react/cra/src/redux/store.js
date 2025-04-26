import {createStore,applyMiddleware,compose} from "redux"
import reducer from "./reducer"
import thunk from "redux-thunk"

// const store=createStore(reducer) //1,原始写法，不用redux-thunk，那么就不能在action里执行异步操作，会报错

//2，这个参数是用于redux-devtool的调试用的
// const store=createStore(reducer,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()) 

//3，这种写法是用于加上了thunk后的redux
//加上了thunk后，ReduxPage里的addAsync 就能用异步请求的方式了，否则会报错
// const store=createStore(reducer,applyMiddleware(thunk)) //适用redux-thunk的情况


//4，这种写法是使用thunk，且带redux-devtool调试
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}):compose
const enhancer = composeEnhancers(applyMiddleware(thunk))
const store=createStore(reducer,enhancer)


export default store