
# 1 Redux 的产生背景及其解决的问题

## 2. useContext 和 Provider 的局限性

虽然 React 的 Context API（包括 `useContext` 和 `Provider`）提供了一种在组件树中共享数据的方法，但它们主要解决了组件间传递数据的问题，而非全面的状态管理。以下是一些局限性：

1. **性能问题**：当 Context 值变化时，所有使用该 Context 的组件都会重新渲染，可能导致性能问题。
2. **状态更新逻辑**：Context 本身不提供状态更新的机制，需要自行实现。
3. **状态追踪和调试**：对于复杂应用，仅使用 Context 难以追踪状态变化和调试。
4. **中间件支持**：Context 不提供类似 Redux 中间件的功能，难以处理异步操作和副作用。

### 3.4 强大的中间件系统

Redux 提供了中间件机制，可以轻松处理异步操作和副作用。 如： applyMiddleware(thunk)

### 3.5 时间旅行调试

Redux DevTools 提供了强大的调试功能，包括状态快照和时间旅行。

### 3.6 可预测性和一致性

Redux 的单向数据流和严格的更新模式确保了应用状态的可预测性和一致性。

### 3.8 优化性能
Redux 配合 React-Redux，可以通过浅比较来避免不必要的重渲染。

# 2 connect， 给组件加上redux功能，原理 + 自己的实现：
获取 store：
connect 函数通过 React 的上下文（Context）API 获取由 <Provider> 组件提供的 Redux store。<Provider> 包裹在应用的最顶层，并接收一个 store 属性，这样整个应用的任何组件都能够访问到 Redux store。

映射状态和派发到 Props：
你可以给 connect 传递两个可选的参数： mapStateToProps 和 mapDispatchToProps 。

监听 store 变化：
connect 使得组件自动订阅 Redux store 的变化。当 Redux store 发生变化时，它会重新计算 mapStateToProps 和 mapDispatchToProps 的结果，并在需要时更新组件的 props，从而触发组件的重新渲染。

优化性能：
connect 通过浅比较前后 mapStateToProps 和 mapDispatchToProps 的结果来避免不必要的重新渲染。
```javascript
import React, { useContext, useState, useEffect } from 'react';
// 创建一个 Context 以供 Provider 和 connect 使用
const ReduxContext = React.createContext(null);

// Provider 组件，它接收一个 store，并通过 Context API 使得这个 store 在子组件中可用
export function Provider({ store, children }) {
  return <ReduxContext.Provider value={store}>{children}</ReduxContext.Provider>;
}

// connect 函数，接收 mapStateToProps 和 mapDispatchToProps，
// 并返回另一个函数，这个函数接收一个组件并返回一个新的增强组件
export function connect(mapStateToProps, mapDispatchToProps) {
  return (WrappedComponent) => {
    return (props) => {
      const store = useContext(ReduxContext); // 从 Context 获取 store
      const [mappedState, setMappedState] = useState(() =>
        mapStateToProps(store.getState())
      );

      // 订阅 store 的变化
      useEffect(() => {
        const unsubscribe = store.subscribe(() => {
          setMappedState(mapStateToProps(store.getState()));
        });
        return unsubscribe; // 清理订阅
      }, [store]);
      
      // 构造 dispatchProps 对象
      const dispatchProps = mapDispatchToProps
        ? mapDispatchToProps(store.dispatch)
        : { dispatch: store.dispatch };

      // 将 stateProps、dispatchProps 和 ownProps 合并后作为 props 传递给包装的组件
      return <WrappedComponent {...props} {...mappedState} {...dispatchProps} />;
    };
  };
}
```




```javascript
function createStore(reducer, initialState) {
  let state = initialState;
  let listeners = [];

  // getState 方法返回当前的应用状态。
  const getState = () => state;

  // dispatch 方法接受一个 action（描述发生了什么），然后调用 reducer 函数来计算新的状态。
  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach(listener => listener());
  };

  // subscribe 方法允许外部代码订阅状态变化的通知。
  const subscribe = (listener) => {
    listeners.push(listener);
    return () => { // 返回一个取消订阅的函数
      listeners = listeners.filter(l => l !== listener);
    };
  };

  // 初始化状态
  dispatch({ type: '@@redux/INIT' });

  return { getState, dispatch, subscribe };
}

// combineReducers 是一个辅助函数，它帮助我们组合多个 reducer 到一个单一的 reducing 函数中。
function combineReducers(reducers) {
  return (state = {}, action) => {
    return Object.keys(reducers).reduce(
      (nextState, key) => {
        nextState[key] = reducers[key](state[key], action);
        return nextState;
      },
      {}
    );
  };
}

// 使用示例:
const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
};

const todosReducer = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([action.text]);
    default:
      return state;
  }
};

// 组合多个 reducers
const rootReducer = combineReducers({
  counter: counterReducer,
  todos: todosReducer
});

// 创建 store
const store = createStore(rootReducer);

// 订阅状态变化
store.subscribe(() => console.log(store.getState()));

// 派发 actions
store.dispatch({ type: 'INCREMENT' }); // 输出: { counter: 1, todos: [] }
store.dispatch({ type: 'ADD_TODO', text: 'Learn Redux' }); // 输出: { counter: 1, todos: ['Learn Redux'] }
```


