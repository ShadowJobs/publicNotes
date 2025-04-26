import {makeAutoObservable} from 'mobx';

class person{
    name="ly"
    constructor(){
        makeAutoObservable(this);
    }
    addName=()=>{ this.name+="a" }
}

const Person=new person();
export default Person;