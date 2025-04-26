export default {
  /**
   * 获取包含所有 cookie 键值对的对象
   * @returns 含有 cookie 键值对的对象
   */
  getAll(): Record<string, string> {
    return Object.fromEntries(document.cookie.split("; ").map((it) => it.split("=")));
  },
  /**
   * 根据 key 获取 cookie 的值
   * @param key - 要获取的 cookie 的 key
   * @returns 获取到的 cookie 的值，若不存在则返回 null
   */
  get(key: string): string | null {
    return this.getAll()[key] ?? null;
  }
};
