const DB_NAME = 'DownloadManager';
const STORE_NAME = 'FileChunks';

export const indexedDBManager = {
  async openDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(STORE_NAME);
      };
    });
  },

  async saveChunk(fileId: number, chunkIndex: number, chunk: any) {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(chunk, `${fileId}-${chunkIndex}`);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async getChunk(fileId: number, chunkIndex: number) {
    const db = await this.openDB();
    return new Promise<any | undefined>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(`${fileId}-${chunkIndex}`);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },
  async getAllChunks(fileId: number) {
    const db = await this.openDB();
    return new Promise<{ key: string, value: Blob }[]>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const chunks: { key: string, value: Blob }[] = [];
      
      const request = store.openCursor();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (cursor.key.toString().startsWith(`${fileId}-`)) {
            chunks.push({ key: cursor.key.toString(), value: cursor.value });
          }
          cursor.continue();
        } else {
          // 排序确保块按正确顺序返回
          chunks.sort((a, b) => {
            const aIndex = parseInt(a.key.split('-')[1]);
            const bIndex = parseInt(b.key.split('-')[1]);
            return aIndex - bIndex;
          });
          resolve(chunks);
        }
      };
    });
  },

  async clearFileChunks(fileId: number) {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          if (cursor.key.toString().startsWith(`${fileId}-`)) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  },
};