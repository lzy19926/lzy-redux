"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isPlainObject_1 = require("./utils/isPlainObject");
const kindOf_1 = require("./utils/kindOf");
//! -----------进行重载
function createStore(reducer, preloadedState, enhancer) {
    // 类型校验
    if (typeof reducer !== 'function') {
        throw new Error(`Expected the root reducer to be a function,Instated received: "${(0, kindOf_1.kindOf)(reducer)}"`);
    }
    //todo 对preloadState进行处理
    // 因为进行了重载, 如果二号参数传入了preloadState,实际上是enhancer,则进行交换
    if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
        enhancer = preloadedState;
        preloadedState = undefined;
    }
    // 对enhancer进行处理
    // (比如applyMiddleware), 用于在dispatch到执行reducer之间插入中间件
    // 如果三号参数传入了applyMiddleware,则会通过applyMiddleware创建store
    if (typeof enhancer !== 'undefined') {
        // 类型校验
        if (typeof enhancer !== 'function') {
            throw new Error(`Expected the enhancer to be a function. Instead, received: '${(0, kindOf_1.kindOf)(enhancer)}'`);
        }
        // 通过enhancer创建store
        // enhancer返回一个enhancedCreateStore
        return enhancer(createStore)(reducer, preloadedState);
    }
    let currentReducer = reducer;
    let currentState = preloadedState;
    let currentListeners = [];
    let isDispatching = false; // 用于给状态变更加锁
    // todo getState方法 (加锁)
    function getState() {
        if (isDispatching) {
            throw new Error("You may not call store.getState() while the reducer is excuting");
        }
        return currentState;
    }
    // todo add listener & return unSubscribe method 
    function subscribe(listener) {
        if (typeof listener !== 'function') {
            throw new Error(`Expected the listener to be a function. Instead, received: '${(0, kindOf_1.kindOf)(listener)}'`);
        }
        if (isDispatching) {
            throw new Error("You may not call store.subscribe() while the reducer is excuting");
        }
        let isSubscribed = true;
        currentListeners.push(listener);
        // remove this Listener from currentListeners
        return function unSubscribe() {
            if (!isSubscribed)
                return;
            if (isDispatching) {
                throw new Error("You may not unSubscribe from a store listener while the reducer is excuting");
            }
            isSubscribed = false;
            const index = currentListeners.indexOf(listener);
            currentListeners.splice(index, 1);
        };
    }
    // todo dispatch an action. It is the only way to trigger state change
    function dispatch(action) {
        // type checking
        if (!(0, isPlainObject_1.isPlainObject)(action)) {
            throw new Error(`Actions must be plain objects. Instead, the actual type was: '${(0, kindOf_1.kindOf)(action)}'`);
        }
        if (typeof action.type === 'undefined') {
            throw new Error("Actions may not have an undefined 'type' property.");
        }
        // 改变状态加锁
        if (isDispatching) {
            throw new Error('Reducers may not dispatch actions while reducer is dispatching');
        }
        // 执行reducer 改变状态
        try {
            isDispatching = true;
            currentState = currentReducer(currentState, action);
        }
        finally {
            isDispatching = false;
        }
        // 执行所有listeners  进行批量通知
        const listeners = currentListeners;
        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            listener();
        }
        return action;
    }
    // return Store Instance 
    const store = {
        dispatch: dispatch,
        subscribe: subscribe,
        getState: getState, // 获取currentState
        // [$$observable]: 4,                         // 看不懂
    };
    return store;
}
exports.default = createStore;
