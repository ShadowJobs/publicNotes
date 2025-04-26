import {makeAutoObservable,computed} from 'mobx';

class counter{
    count=0;
    list=[1,2,3,4]
    constructor(){
        makeAutoObservable(this,{
            filterList:computed //标记这是一个计算属性（类似于vue里的compute，但是这一行其实可以省略）
        }); //这一句就会是counter变成响应式
    }
    get filterList(){return this.list.filter(v=>v%2==0)} //计算属性
    increment=()=>{ this.count++; }
    pushList=()=>{this.list.push(8)}  //这里数组的push可以被监听到
}

const CounterIns=new counter();
export {CounterIns};