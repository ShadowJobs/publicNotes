import { delay } from "@/utils"
import { Button, Divider, message, Space } from "antd"
import React, { useDebugValue, useEffect,useMemo, useState,useDeferredValue, useTransition, memo } from "react"

const OrdinaryComp: React.FC<{ name: string }> = ({ name }) => {
  console.log('普通 rendered')
  const getName = () => {
    console.log('普通 getName')
    return name
  }
  return <div>
    OrdinaryComp,name is [{name}], getName() is [{getName()}]: 没有用 memo，name和count变化时都会重新渲染
  </div>
}
const MemoComp: React.FC<{ count: number }> = React.memo(({ count }) => {
  console.log('MemoComp rendered')
  return <div>
    MemoComp {count},使用了 React.memo() ，仅count变化时，会重新渲染，输出comp2 rendered
  </div>
})
const UseMemoComp: React.FC<{ name: string }> = ({ name }) => {
  console.log('UseMemoComp rendered')
  const getName = useMemo(() => {
    console.log('UseMemoComp getName')
    return name
  }, [name])
  return <div>
    UseMemoComp,name is [{name}], getName() is [{getName}]: 使用了 useMemo，name变化时[会]重新渲染，但是如果只是count变化，不会重新渲染
    只有当name变化时，getName()才会重新计算
  </div>
}
const Comp1: React.FC<{}> = ({ }) => {
  const [name, setName] = useState<string>('lin')
  const [count, setCount] = useState<number>(0)
  if (count > 5) {
    useDebugValue(count, (v) => console.log(`Debug: ${v}`));
  }
  return <div>
    <Space>
      <Button onClick={() => { setCount(count => count + 1) }}>count +1</Button>
      <Button onClick={() => { setName(name => name + '1') }}>change name</Button>
    </Space>
    <div>count={count}</div>


    <Divider>React.memo，useDebugValue 测试</Divider>
    <OrdinaryComp name={name} />
    <MemoComp count={count} />


    <Divider>useMemo 测试</Divider>
    <UseMemoComp name={name} />
  </div>
}

const UseCallbackComp: React.FC<{ callback: () => void, type: string }> = React.memo(({ callback, type }) => {
  console.log(type + ' UseCallbackComp rendered,因为父组件count变化导致父组件的渲染，重新创建了onClick函数')
  return <Button onClick={callback}>{type}</Button>
})
const Comp2: React.FC<{}> = ({ }) => {
  const [count, setCount] = useState<number>(0)
  const [age, setAge] = useState<number>(18)
  const onClick = () => {
    console.log('not use callback onClick()')
  }
  const onClickCallback = React.useCallback(() => {
    console.log('use callback onClickCallback()')
  }, [])

  return <div>
    <Divider>useCallback 测试</Divider>
    <div>
      count+1触发重新渲染，onClick会重新生成，但是onClickCallback不会重新生成,所以normal会重新渲染，callback不会。
      <br/>
      useStateReturnFunc用的是useState返回的函数，跟callback有相同的特性，所以也不会重新渲染
    </div>
    <Button onClick={() => { setCount(count => count + 1) }}>count +1</Button>
    <UseCallbackComp callback={onClick} type="normal" />
    <UseCallbackComp callback={onClickCallback} type="callback" />
    <UseCallbackComp callback={setAge} type="useStateReturnFunc" />
  </div>
}

const VeryLargeList=memo(({ items, withdelay }: { items: string[], withdelay?: boolean })=> {
  if(withdelay){delay(500)}
  return <ul style={{display:"flex"}}>
    {items.map((item,idx) => (
      <li key={idx} style={{margin:5,border:"1px solid gray"}}>{item}</li>
    ))}
  </ul>
})
const Comp3: React.FC<{}> = ({ }) => {
  const [filterText, setFilterText] = useState('');
  const deferredFilterText = useDeferredValue(filterText);

  const filteredItems = useMemo(() => {
    delay(1000)
    console.log(deferredFilterText,"length=",deferredFilterText.length)
    return deferredFilterText.split("")
  }, [deferredFilterText]);

  return <div>
    <Divider>useDeferredValue 测试</Divider>
    <div>将变量改为低优先级变量。自带防抖功能，节省了性能。快速输入，log里面会丢失部分中间值，但是最终的结果不会影响</div>
    <input value={filterText} onChange={e => setFilterText(e.target.value)} />
    <VeryLargeList items={filteredItems} />
  </div>
}

const Comp4: React.FC<{}> = ({ }) => {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    startTransition(() => {
      setQuery(v=>v+v.length);
    });
  };

  return (
    <div>    
      <Divider>useTransition 测试</Divider>
      <div>
        下面的列表渲染会耗费较多时间，使用了useTransition，输入时会显示Searching...，输入完成后再渲染列表。
        <br/>实测这里不能当防抖用，使用input组件+useTransition,在回调里只会拿到最后一个输入的字符
      </div>
      <button onClick={handleChange}>push</button>
      {isPending && <div>Searching...</div>}
      <VeryLargeList items={query.split("")} withdelay/>
    </div>
  );
}
const Hook1: React.FC<{}> = ({ }) => {
  return <div>
    <Comp1 />
    <Comp2 />
    <Comp3 />
    <Comp4 />
  </div>
}
export default Hook1