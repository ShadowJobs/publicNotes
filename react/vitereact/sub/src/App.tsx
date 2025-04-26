import { createContext, useRef } from "react";
import { add, equal } from "sdlin-utils";
// import { useSearchParam } from "react-use";

export const SUBViewerContext = createContext<HTMLDivElement | null>(null);


const App = () => {
  // const md5 = useSearchParam("md5");
  const SUBViewerRef = useRef<HTMLDivElement | null>(null);
  return (
    <SUBViewerContext.Provider value={SUBViewerRef.current}>
      inner react program
      <div>
        monorepo使用子项目
        use add.js to add 1 + 2 = {add(1, 2)}
        <br/>
        {`obj1:{"a":1,"b":2} equal obj2:{"a":1,"b":2} = {${equal({ a: 1, b: 2 }, { a: 1, b: 2 })}}`}
        <br/>
        {`obj1:{"a":1,"b":2} equal obj2:{"a":1,"b":1} = {${equal({ a: 1, b: 2 }, { a: 1, b: 1 })}}`}
      </div>
    </SUBViewerContext.Provider>
  );
};

export default App;
