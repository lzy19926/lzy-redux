import { isPlainObject } from './utils/isPlainObject'
import { kindOf } from './utils/kindOf'
import type { Reducer, Action, Store, StoreEnhancer, Listener } from './types/reducer'

// preloadedState 你可以使用它在创建 store 时添加初始数据，例如(水合)包含在从服务器接收到的 HTML 页面中的值

// Enhancer（增强器），增强器可以对createStore方法进行增强，
// 也即，接受createStore方法，返回一个被增强的createStore方法，
// 当外部调用这个增强后的createStore时，得到的就是带有中间件的store和dispatch方法。

export default function createStore<
    S = any,
    A = Action
>(
    reducer: Reducer,
    enhancer?: StoreEnhancer
): Store<S, A>

//! -----------进行重载
export default function createStore<
    S = any,
    A extends Action = any
>(
    reducer: Reducer,
    preloadedState?: S,
    enhancer?: StoreEnhancer
): Store<S, A> {


    // 类型校验
    if (typeof reducer !== 'function') {
        throw new Error(`Expected the root reducer to be a function,Instated received: "${kindOf(reducer)}"`)
    }

    //todo 对preloadState进行处理
    // 因为进行了重载, 如果二号参数传入了preloadState,实际上是enhancer,则进行交换
    if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
        enhancer = preloadedState as StoreEnhancer
        preloadedState = undefined
    }


    // 对enhancer进行处理
    // (比如applyMiddleware), 用于在dispatch到执行reducer之间插入中间件
    // 如果三号参数传入了applyMiddleware,则会通过applyMiddleware创建store
    if (typeof enhancer !== 'undefined') {

        // 类型校验
        if (typeof enhancer !== 'function') {
            throw new Error(`Expected the enhancer to be a function. Instead, received: '${kindOf(enhancer)}'`)
        }

        // 通过enhancer创建store
        // enhancer返回一个enhancedCreateStore
        return enhancer(createStore)(reducer, preloadedState) as Store
    }

    let currentReducer = reducer
    let currentState = preloadedState as S
    let currentListeners: Listener[] = []
    let isDispatching = false  // 用于给状态变更加锁


    // todo getState方法 (加锁)
    function getState(): S {
        if (isDispatching) {
            throw new Error("You may not call store.getState() while the reducer is excuting")
        }

        return currentState as S
    }

    // todo add listener & return unSubscribe method 
    function subscribe(listener: Listener) {
        if (typeof listener !== 'function') {
            throw new Error(`Expected the listener to be a function. Instead, received: '${kindOf(listener)}'`)
        }

        if (isDispatching) {
            throw new Error("You may not call store.subscribe() while the reducer is excuting")
        }

        let isSubscribed = true

        currentListeners.push(listener)

        // remove this Listener from currentListeners
        return function unSubscribe() {
            if (!isSubscribed) return

            if (isDispatching) {
                throw new Error("You may not unSubscribe from a store listener while the reducer is excuting")
            }

            isSubscribed = false
            const index = currentListeners.indexOf(listener)
            currentListeners.splice(index, 1)
        }
    }

    // todo dispatch an action. It is the only way to trigger state change
    function dispatch(action: A) {

        // type checking
        if (!isPlainObject(action)) {
            throw new Error(`Actions must be plain objects. Instead, the actual type was: '${kindOf(action)}'`)
        }

        if (typeof action.type === 'undefined') {
            throw new Error("Actions may not have an undefined 'type' property.")
        }

        // 改变状态加锁
        if (isDispatching) {
            throw new Error('Reducers may not dispatch actions while reducer is dispatching')
        }

        // 执行reducer 改变状态
        try {
            isDispatching = true
            currentState = currentReducer(currentState, action)
        } finally {
            isDispatching = false
        }

        // 执行所有listeners  进行批量通知
        const listeners = currentListeners
        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i]
            listener()
        }

        return action
    }

    // return Store Instance 
    const store = {
        dispatch: dispatch,                           // dispatch Action 变更状态
        subscribe: subscribe,                         // 通过 store.subscribe(listener) 注册监听器回调  dispatch结尾会依次执行listener             
        getState: getState,                           // 获取currentState
        // [$$observable]: 4,                         // 看不懂
    } as unknown as Store

    return store
}