
// 通过接口定义Store类,而不是class
export interface Store<
    S = any,
    A = Action
> {
    dispatch: Dispatch<A>,
    getState: GetState<S>,
    subscribe: (listener: () => void) => Unsubscribe,
    [Symbol.observable](): Observable<S>
}

export interface StoreEnhancer { }

export type Action = { type: string }

export type Listener = () => void

// reducer传入State,执行Action,返回更新后的State
export type Reducer<S = any, A = Action>
    = (state: S, action: A) => S