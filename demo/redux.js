const createStore = require('../out/createStore').default


function counterReducer(state = { value: 0 }, action) {
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

// 注册状态变更回调
store.subscribe(() => console.log(store.getState()))

// dispatch状态
store.dispatch({ type: 'Incremented' }) // {value: 1}
store.dispatch({ type: 'Incremented' }) // {value: 2}
store.dispatch({ type: 'Decremented' }) // {value: 1}