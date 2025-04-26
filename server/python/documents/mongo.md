# 1 登录,常用命令：
```shell
#安装
brew install mongosh
#登录
mongosh mongodb://root:yinglin%40shadow@dsjkfaljsld.mongodb.rds.aliy.com:3717,dds-fasdf.mongodb.rds.aliyun.com:3717/mymongo?authSource=shadow&replicaSet=mgset-12321sdf&appname=mongodb-vscode+1.12.0
#执行后直接进入了shell，并且用了mymongo数据库
# 然后
// 首先，如果需要清空现有数据（谨慎使用）
db.dashboard_config.drop()

// 创建一个新的文档，使用一个固定的 _id
db.dashboard_config.insertOne({
  _id: "config", // 使用一个固定的 _id 便于后续更新
  dashboard_config: {
    MenuAppRoutes: [
      "DeepSeek R1 Chat「联网版」",
      "DeepSeek R1 Chat",
      "千问 AI Expert"
    ],
    DashboardApps: [
      "DeepSeek R1 Chat「联网版」",
      "Gemini 2.0 Thinking「联网版」"
    ]
  }
})

// 后续如果需要更新，可以使用这个命令
db.dashboard_config.updateOne(
  { _id: "config" },
  {
    $set: {
      "dashboard_config.MenuAppRoutes": [...],
      "dashboard_config.DashboardApps": [...]
    }
  }
)

// 查询命令
db.dashboard_config.findOne({ _id: "config" })

// 查看版本
db.version() 

```

# 2. 坑
- 更新带点的key，会导致层级错误，mongo会把点解析为层级，而不是字符串
```python
例如{data:{"a.b":1}} ,
title="a.b"    
update_path = f"data.{safe_title}"
    filter = {"_id": ConfigId}
    try:
        result = self.get_collection().update_one(
            filter,
            {"$set": {update_path: "xxx"}},
            upsert=True
        )
        return result
执行后，data变成了{"data": {"a": {"b": "xxx"}}},而不是{"data": {"a.b": "xxx"}}
所以为了避免这种情况，需要从第一个不含.的key获取全部内容，修改后，整体修改，所这里应该修噶整个data，而不是data.{safe_title}
```
