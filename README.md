## 一个简易的手写redux , redux-react, redux-thunk 库


### Redux：功能简单的核心库,只是一个单纯的状态机

### React-Redux：是跟React的连接库，当Redux状态更新的时候通知React更新组件。

### Redux-Thunk：提供Redux的异步解决方案，弥补Redux功能的不足。
```js
import { createStore } from 'lzy-redux'

function counterReducer(state , action) {
  switch (action.type) {
    case 'Incremented':
      return { value: state.value + 1 }
    case 'Decremented':
      return { value: state.value - 1 }
    default:
      return state
  }
}

let store = createStore(counterReducer)

// 组件订阅状态
store.subscribe(() => console.log(store.getState()))

// dispatch状态
store.dispatch({ type: 'Incremented' }) // {value: 1}
store.dispatch({ type: 'Incremented' }) // {value: 2}
store.dispatch({ type: 'Decremented' }) // {value: 1}
