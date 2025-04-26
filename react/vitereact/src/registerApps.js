import { registerMicroApps, start,initGlobalState } from 'qiankun';

// 自己写的qiankun 
// import { registerMicroApps, start,initGlobalState } from '../myqiankun/qiankun';

import microActions from './hooks/microActions';
const loader = (loading) => {
    console.log('加载状态', loading)
}
const initSt= {
    name:'jw',
    age:30,
    qkm:0
}
const actions = initGlobalState(initSt)
microActions.mainAppMounted(actions,initSt);
const host = window.location.hostname
registerMicroApps([
    {
        name: 'vueApp',
        entry: `//${host}:39004`,
        activeRule: '/vue',
        container: '#qiankuncontainer',
        loader,
        props: { a: 1, util: {} }
    },
    {
        name: 'react my',
        entry: `//${host}:39005`,
        activeRule: '/react1',
        container: '#qiankuncontainer', 
        loader,
        props: { a: 1, util: {} }
    }
], {
    beforeLoad() {
        console.log('before load')
    },
    beforeMount() {
        console.log('before mount')
        // microActions.setGlobalState(microActions.states)
    },
    afterMount() {
        console.log('after mount')
        microActions.setGlobalState(microActions.states)
    },
    beforeUnmount() {
        console.log('before unmount')
    },
    afterUnmount() {
        console.log('after unmount')
    }
})
start({
    sandbox:{
        // 实现了动态样式表
        // css-module,scoped 可以再打包的时候生成一个选择器的名字  增加属性 来进行隔离
        // BEM
        // CSS in js
        // shadowDOM 严格的隔离

        strictStyleIsolation:true,
        //experimentalStyleIsolation:true // 缺点 就是子应用中的dom元素如果挂在到了外层，会导致样式不生效
    }
})


