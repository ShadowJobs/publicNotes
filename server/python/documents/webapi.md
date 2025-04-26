# indexedDB
## 坑1 
在数据库初始化并打开之后，不允许再创建新的 object store。根据 IndexedDB 规范，你只能在处理 onupgradeneeded 事件时创建或删除对象存储（object stores）。

## put方法的第二个参数
在IndexedDB的`put`方法中，第二个参数是用来指定记录的键（key）的。这是可选的，只有当你的对象存储（object store）没有使用内联键（in-line keys），也就是说你没有在创建对象存储时指定`keyPath`属性，或者你希望覆盖自动生成的键时才会使用。

如果对象存储被创建时：

- **指定了 `keyPath`**：那么每个存储对象都应该包含一个与`keyPath`相同名称的属性，这个属性值将作为键。
- **未指定 `keyPath`** 且设置了 `autoIncrement: true`：那么数据库会自动为每个新对象生成一个唯一的递增键。
- **既没有指定 `keyPath` 也没有设置 `autoIncrement`**：这种情况下必须在调用`add`或`put`方法时提供键作为第二个参数。

总结：

- **有 `keyPath`**：不要提供`put`的第二个参数，因为对象已经包含了键信息。
- **无 `keyPath`**：需要提供`put`的第二个参数作为键。

比如，假设有以下两种对象存储：

1. 对象存储A使用了内联键：
   ```javascript
   db.createObjectStore("storeA", { keyPath: "id" });
   ```

2. 对象存储B没有指定键路径：
   ```javascript
   db.createObjectStore("storeB");
   ```

对于对象存储A，你在使用`put`时直接传入对象即可：
```javascript
objectStoreA.put({ id: "someId", otherProperty: "value" });
```

对于对象存储B，你需要传入对象和键：
```javascript
objectStoreB.put({ otherProperty: "value" }, "someId");
```

在你的原始问题中，由于`addStore`方法定义了内联键（`keyPath: "id"`），所以不能在调用`put`方法时再提供键作为第二个参数。