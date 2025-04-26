class EventBus{
    constructor(){
        this.events = {};
    }
    on(eventName, callback){
        if(!this.events[eventName]){
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
        console.log("bus on"+eventName);
    }
    emit(eventName, ...args){
        if(this.events[eventName]){
            this.events[eventName].forEach(callback => {
                callback(...args);
            });
        }
    }
    off(eventName, callback){
        if(this.events[eventName]){
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
        console.log("event off"+eventName)
    }
}

export default new EventBus();