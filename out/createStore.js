"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// preloadedState 你可以使用它在创建 store 时添加初始数据，例如(水合)包含在从服务器接收到的 HTML 页面中的值
// Enhancer（增强器），增强器可以对createStore方法进行增强，
// 也即，接受createStore方法，返回一个被增强的createStore方法，
// 当外部调用这个增强后的createStore时，得到的就是带有中间件的store和dispatch方法。
function createStore(reducer) { }
