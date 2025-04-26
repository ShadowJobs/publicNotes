/**
 * 在v6的基础上，增加了usestate
 */
import React from "./mReactV7"

function Counter() {
  const [state, setState] = React.useState(1);
  const [state2, setState2] = React.useState(2);
  React.useEffect(() => {
    console.log("start effect");
  }, []);
  React.useEffect(() => {
    console.log("effect state1:"+state);
    if(state!=1)alert("effect state1:"+state);
  }, [state]);
  function onClickHandle(params) {
    setState((state) => state + 1);
    setState((state) => state + 2);
  }
  return (
    <div>
      在v6的基础上，增加了useState()
      <h1>Num1: {state}</h1>
        <button onClick={onClickHandle}>+2+1</button>
      <hr />
      <h1>Num2: {state2}</h1>
      <button onClick={() => setState2((state) => state + 1)}>+1</button>
      <button onClick={() => setState2((state) => state + 2)}>+2</button>
    </div>
  );
}
const element = <Counter />;

React.render(element, document.getElementById('root'));