import { useContext } from "react";
import { FormDataContext, FormDataProvider } from "../myprovider";

function CounterPage4() {
  const {formData, setFormData, prdv} = useContext(FormDataContext);
  return <FormDataProvider><div className="with-border">
    <button onClick={()=>{setFormData(pre=>{
      pre++;
      return pre;
    })}}>+1</button>
    <div>value is {formData}</div>
    <div>prdv is {prdv}</div>
  </div></FormDataProvider>
}

export const Page4=()=>{
  return <div className='with-border'>
    使用createContext+useContext<br/>
    <FormDataProvider>
      <CounterPage4/>
      <CounterPage4/>
    </FormDataProvider>
  </div>
}
export default CounterPage4;