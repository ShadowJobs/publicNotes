export class IndexedDbManager {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private storeName: string = "";
  private version: number;
  private callback?: Function;

  constructor(dbName: string, version: number, initStoreName: string = "", callback?: Function) {
    this.dbName = dbName;
    this.version = version;
    this.setCurStore(initStoreName);
    this.callback = callback;
    this.init();
  }
  public get allStoreNames() {
    return this.db!.objectStoreNames;
  }
  // 在数据库初始化并打开之后，不允许再创建新的 object store。根据 IndexedDB 规范，你只能在处理 onupgradeneeded 事件时创建或删除对象存储（object stores）。
  private addStore(storeName: string) {
    if (!this.db!.objectStoreNames.contains(storeName)) {
      this.db!.createObjectStore(storeName, {
        keyPath: "id", //
        // autoIncrement: true // 自增的方式主键
      });
    }
  }
  public setCurStore(storeName: string) {
    if (storeName) this.storeName = storeName;
  }

  public async init() {
    return new Promise<void>((resolve, reject) => {
      let indexedDB = window.indexedDB // || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      console.log("version:", this.version);
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = (event: Event) => {
        reject(new Error(`Database error: ${(event.target as IDBOpenDBRequest).error}`));
      };
      
      // onsuccess 事件会在数据库被打开时触发, 在onupgradeneeded事件之后触发,所以回调放到这里
      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        console.log("Database opened successfully");
        this.callback?.(this.db);
        resolve();
      }
      // 打开，或者新建数据库时（version变化），会触发 onupgradeneeded 事件
      request.onupgradeneeded = (event: any) => {
        this.db = event.target.result;
        console.log("Database upgraded successfully");
        if (this.storeName) this.addStore(this.storeName);
        if (this.storeName) this.addStore("global");
      }
    });
  }
  public async get(keys: string) {
    return new Promise((resolve, reject) => {
      const _keys:string[] = typeof keys=="string" ? keys.split(","):Array.isArray(keys) ? keys : [keys];
      const request = this.db!.transaction([this.storeName], "readwrite").objectStore(this.storeName).get(_keys[0]);
      request.onerror = (event: Event) => {
        reject(new Error(`Database get error: ${(event.target as IDBOpenDBRequest).error}`));
      };
      request.onsuccess = (event: any) => {
        let result = event.target.result;
        if(_keys.length>1){
          for(let i=1;i<_keys.length;i++){
            result = result[_keys[i]];
          }
        }
        resolve(result);
      }
    });
  }
  public async set(value: any, key?: string) {
    return new Promise<void>((resolve, reject) => {
      const request = this.db!.transaction([this.storeName], "readwrite").objectStore(this.storeName).put(value, key);
      request.onerror = (event: Event) => {
        reject(new Error(`Database set error: ${(event.target as IDBOpenDBRequest).error}`));
      };
      request.onsuccess = (event: any) => { resolve(); }
    });
  }
  public async delete(key: string) {
    return new Promise<void>((resolve, reject) => {
      const request = this.db!.transaction([this.storeName], "readwrite").objectStore(this.storeName).delete(key);
      request.onerror = (event: Event) => {
        reject(new Error(`Database delete error: ${(event.target as IDBOpenDBRequest).error}`));
      };
      request.onsuccess = (event: any) => { resolve(); }
    });
  }
  public createIndex(indexName: string, keyPath: string, options?: IDBIndexParameters) {
    const objectStore = this.db!.transaction([this.storeName], "readwrite").objectStore(this.storeName);
    objectStore.createIndex(indexName, keyPath, options);
  }

  // -------------通过cursor遍历数据
  public async cursorGet(key?:string) {
    return new Promise((resolve, reject) => {
      const objectStore = this.db!.transaction([this.storeName], "readwrite").objectStore(this.storeName);
      const list: any[] = [];
      objectStore.openCursor(key).onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          // callback(cursor.value);
          list.push(cursor.value)
          cursor.continue();
        } else {
          resolve(list);
        }
      }
    });
  }
  // cursor+index
  public async cursorIndexGet(indexName: string, key: any) {
    return new Promise((resolve, reject) => {
      const objectStore = this.db!.transaction([this.storeName], "readwrite").objectStore(this.storeName);
      const index = objectStore.index(indexName);
      const list: any[] = [];
      index.openCursor(key).onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          list.push(cursor.value)
          cursor.continue();
        } else {
          resolve(list);
        }
      }
    });
  }
  // cursor+range
  public async cursorRangeGet(range: IDBKeyRange) {
    return new Promise((resolve, reject) => {
      const objectStore = this.db!.transaction([this.storeName], "readwrite").objectStore(this.storeName);
      const list: any[] = [];
      objectStore.openCursor(range).onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          list.push(cursor.value)
          cursor.continue();
        } else {
          resolve(list);
        }
      }
    });
  }
  public close() {
    this.db?.close();
  }
}
const idbm = new IndexedDbManager("form", 1, "form");
// window.idbm=idbm
export default idbm;
