/**
 * 在v2的基础上，将大任务用requestIdleCallback拆分成fiber，可以避免卡顿
 */

import React from "./mReactV3"

import { renderToRoot } from "./renderToRoot"
renderToRoot(React,"v3")