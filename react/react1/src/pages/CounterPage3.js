
import {observer} from "mobx-react-lite"
import useStore from '../store/storeIndex'
function CounterPage3(){
    const store=useStore()
    const {dogStore}=store //注意这里只能解构1层，再往深层解构会破坏mobx的自动观察
    return <div  className="with-border">
        store数据来自不同模块,注意storeIndex的写法<br/>
        dogName:{dogStore.name}<br/>
        personName:{store.personStore.name}<br/>
        <button onClick={dogStore.addName}>add name</button>
        <button onClick={store.personStore.addName}>add name</button>
    </div>
}

export default observer(CounterPage3)