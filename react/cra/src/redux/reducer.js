
const initStore={
    count:0,
    inputValue:'',
    list:["list1","list2","list3"],
    asyncCount:10,
}

export default function reducer(state=initStore,action){
    switch(action.type){
        case "add":
            return {...state,count:state.count+1}
        case "changeInput":
            return {...state,inputValue:action.value}
        case "addAsync":
            return {...state,asyncCount:state.asyncCount+action.value}
        default:
            return state
    }
}


//多个reducer如何分层，并带数据响应？
// import { combineReducers } from 'redux';
// export const rootReducer = combineReducers({
//     entities})