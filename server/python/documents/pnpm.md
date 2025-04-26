### 1，pnpm build --filter ly-utils 
主目录package.json里有"build": "tsc && vite build && pnpm --filter sub build"

ly-utils目录下有package.json里有"build": "tsc && vite build"

如果想只执行ly-utils里的build, 应该pnpm --filter ly-utils build，而不是 pnpm build --filter ly-utils

这个命令会执行build，然后将参数传递给pnpm build， 最后拼接成了> tsc && vite build && pnpm --filter sub build "--filter" "ly-utils"

也就是--filter要前置，但是 pnpm add lodash --filter ly-utils 却可以放到后面。

### 2，--filter 参数
生效的前提是pnpm-workspace.yaml里对应的路径，路径里里的包里，package.json里的name，是filter匹配的包名，否则不生效

### 3，pnpm install
将一个自己的包安装到同monorepo下的其他包里，有2种方式，修改package.json或者命令行方式：
#### 3.1，修改package.json
```json
"dependencies": {
    "ly-utils": "workspace:*"
}
```
然后执行pnpm install

#### 3.2，命令行方式
```shell
# 如果ly-utils里的package.json里name为ly-utils，可以直接执行
pnpm add ly-utils # 会将npm官方registry里的ly-utils安装到所有包里
pnpm add ly-utils --filter sub # 会将npm官方registry里的ly-utils安装到sub包里
pnpm add "ly-utils@workspace:*" --filter sub # 会将monorepo下的ly-utils安装到sub包里，注意有:和*的命令，要打引号
# 如果你确定包名就是 sdlin-utils，可直接执行
pnpm add sdlin-utils@workspace
# ly-utils是包名，不是 pnpm-workspace.yaml里packages里配的路径搜索名，如果ly-utils里的package.json里name是sdlin-utils，则需要修改
pnpm add "sdlin-utils@workspace:*" -w
pnpm add "sdlin-utils@workspace:*" --filter sub # 会将monorepo下的ly-utils安装到sub包里
```
### 4，pnpm remove
```shell
pnpm remove ly-utils # 会将npm官方registry里的ly-utils从所有包里移除
pnpm remove ly-utils --filter sub # 会将npm官方registry里的ly-utils从sub包里移除
```

### 5, ly-utils如何自动生成d.ts文件
```json
package.json里加上tsc
"scripts": {
    "build": "tsc && vite build",
}

```

### 6, pnpm-workspace.yaml
如果你的工作区配置非常基础，可能只用 package.json 就足够了。注意，并非所有的包管理工具都支持 pnpm-workspace.yaml 文件，但 "workspaces" 字段在如 npm 和 yarn 等其他包管理器中也有广泛支持。
```yaml
packages:
  - sub
  - complib/*
  - ly-utils
  - "!**/test/**" # 忽略test目录
```
请参阅最新的 [PNPM 文档](https://pnpm.io/workspaces) 获取最准确的信息。
