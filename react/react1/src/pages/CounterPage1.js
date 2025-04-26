
import { CounterIns } from "../store/count"
import {observer} from "mobx-react-lite"
function CounterPage1(){
    return <div className="with-border">展示时在组件1里 {CounterIns.count} 
        <br/>
        [{CounterIns.filterList.toString()}]
    </div>
}
export default observer(CounterPage1)