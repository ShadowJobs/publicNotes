
import { CounterIns } from "../store/count"
import {observer} from "mobx-react-lite"
function CounterPage2(){
    return <div  className="with-border">
        操作是在组件2里
        <button onClick={CounterIns.increment}>+1</button>
        <button onClick={CounterIns.pushList}>push 8</button>
    </div>
}

export default observer(CounterPage2)