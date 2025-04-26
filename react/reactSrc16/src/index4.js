/**
 * 在v3的基础上，将fiber树的构建和dom的操作分离，操作dom的操作放到commitRoot中
 */
import React from "./mReactV4"
import { renderToRoot } from "./renderToRoot"
renderToRoot(React,"v4")