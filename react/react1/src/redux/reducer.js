
const initStore={
    count:0,
    inputValue:'',
    list:["list1","list2","list3"]
}

export default function reducer(state=initStore,action){
    switch(action.type){
        case "add":
            return {...state,count:state.count+1}
        case "minus":
            return {...state,count:state.count-1}
        case "addList":
            return {...state,list:[...state.list,"list4"]}
        case "changeInput":
            return {...state,inputValue:action.value}
        default:
            return state
    }
}