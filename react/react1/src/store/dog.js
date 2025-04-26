import {makeAutoObservable} from 'mobx';

class dog{
    name="wzy"
    constructor(){
        makeAutoObservable(this);
    }
    addName=()=>{ this.name+="d" }
}

const Dog=new dog();
export default Dog;