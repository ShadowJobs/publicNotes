# 常用git命令

git cherry-pick a8a3de0953     检出某次提交

使用 git cherry-pick 多个连续commit的注意点： 
0. 使用两个点（..）来指明commit的区间。 
1. git cherry-pick A..B 中，A的commit应该在B之前。 
2. 默认的选取范围不包含A但包含B，类似于数学上开闭区间 (A,B]。 
3. 若要包含A，请使用git cherry-pick A^..B，即可做到 [A,B]。
"git cherry-pick (--continue | --quit | --abort)"继续，取消

git merge --squash another   把another分支上的内容合并过来，但是不记录another上的提交记录

git重置远程地址
git remote set-url origin [url]

git submodule add git://github.com/chneukirchen/rack.git rack 将另一个项目当成本项目的子模块，放到rack目录里

git clone带子模块的项目时，子模块不会直接下载下来，必须执行

git submodule init

git submodule update
两条命令，才能更下来
每次更新也要用git submodule update
子模块相关文章 https://git-scm.com/book/zh/v1/Git-%E5%B7%A5%E5%85%B7-%E5%AD%90%E6%A8%A1%E5%9D%97
有时候不小心add了一个文件，又不想提交了，那就 git rm --cached xxx
修改了某个文件，不想要了，可以：git checkout HEAD xxxx，就把这个文件回滚到本地最新一次提交的状态。
要看某个加入缓存的但没有提交的文件，和提交之前的区别，也是用git diff --cached xxxx

git remote -v 查看远程地址
```
git add之后怎么后退？
git reset --mixed可以撤销git add误加的文件，但是修改会保留（即退回到git add之前的状态）
用git add -i,根据提示输入3或者r。
git add -i的6:patch跟直接使用git format-patch的用法不一样，add的patch专指提交时的patch，可以选择提交哪个代码块。
git stash apply stash@{2} 选择使用哪一个缓存stash,第四个值不指定就默认为最近一个
git stash drop stash@{0} 删除，apply并不会删除stash，用完还在，想删除要drop
git format-patch 创建patch文件 使用文档https://blog.csdn.net/liuhaomatou/article/details/54410361
git reset 后+commit id，撤销本地的commit修改，但是保留修改代码（即退回到add和commit之前的状态）
git reset --hard退回，并且不保留内容，1）执行后会撤销所有未commit过的修改，2）已经commit过的信息不会变化，3）如果reset之前有新的文件，但不在git里，也不会变化，依然存在。4)如果再往回退，需要加commid的id，假设本地有1个commit，id为cm1，服务端最后一次commit id为cm2，那么git reset --hard cm2会直接删除本地的cm1，假如服务端再上一次的commit id 为cm3，那么git reset --hard cm3会将本地退回到cm3,但是可以用git pull再把本地更新到cm2 
git revert HEAD 则会撤销本地的最近一次commit的修改，并且按照一次新的提交重新commit（相当于git帮我们把代码改回去再commit了）,也可以加指定id，撤销那次提交的所有内容。
远程代码如何回退？两步：
1，先将本地代码回退到某一个id，此时再git st会看到本地分支已经是bebind的状态了： git reset --hard 1a27cf57d8fbb4d8a47e0cffa53609de3e07027a 
2，将远程代码设定到当前id，本命令会将远程代码定位成跟本地一样的id：git push origin HEAD --force 
注意：如果有其他人已经更到了错误的代码，即时远程分支已经回退了，他本地的分支还是不会变，必须也reset --hard id或者删除他电脑上本地的分支，再checkout
完全覆盖另一个分支：方法１，git push origin develop:master -f
就可以把本地的develop分支强制(-f)推送到远程master
方法２，git checkout master // 切换到旧的分支
git reset –hard develop // 将本地的旧分支 master 重置成 develop
git push origin master –force // 再推送到远程仓库
合并commit记录：

git rebase -i HEAD~3  //这会打开一个编辑器，如下
pick e43a6b3 Message for commit 1
pick 7f654d7 Message for commit 2
pick 3c9093c Message for commit 3
此时把第2，3行的pick改成squash或者s，然后保存
git push origin branchname --force 
这可能会对其他从这个仓库拉取代码的人产生影响，因此最好只对尚未与别人分享的分支执行这一操作。
还可以使用 --force-with-lease 选项，它可以在远程分支没有被其他人更新时才强制推送。
```

误将文件提交进了git，再想ignore就不生效了，必须加ignore的同时，执行git rm --cached package-lock.json
，再commit,再push，才会生效

diff
对比2个分支： git diff branch1..branch2

git log 命令可以帮助你比较两个分支的提交历史，找到哪些提交是不同的。
git log branch1..branch2
综合比较：如果你想要查看更概述的比较，包括修改的文件数量、新增/删除行数等，可以使用 --stat 选项：

git diff --stat branch1 branch2
图形化比较 gitk branch1 branch2
比较文件 git diff branch1 branch2 -- path/to/file 

# github仓库和公司内的仓库代码同步：
1. 首先，添加 GitHub 仓库作为新的远程仓库（我们给它取名为 upstream）：
```bash
git remote add upstream git@github.com:langgenius/dify.git
```

2. 从 GitHub 仓库获取最新代码：
```bash
git fetch upstream
```

4. 执行 cherry-pick：
```bash
git cherry-pick 3112b74
```

5. 如果有冲突，解决冲突后：
```bash
git add .
git cherry-pick --continue
```

6. 提交到你司的内部仓库：
```bash
git push origin HEAD:你的分支名
# 如果公司仓库已有分支，就直接 git push
```

7. 如果之后不再需要 GitHub 仓库的连接，可以删除它：
```bash
git remote remove upstream
```

# 先用了官方的git仓库，修改后想保存到自己的fork仓库
- 先删除远程的fork仓库：git remote remove origin
- 添加自己的fork仓库：git remote add origin git@github.com:ShadowJobs/dify.git
- 如果要再更新远端内容，可以按照上一节”github仓库和公司内的仓库代码同步“的add upstream方法，不过多个修改不必一个个的cherry-pick, 可以直接合并，用 git merge upstream/master

# 禁用verify
git commit -m "UPDATE:Share error" --no-verify
可以跳过pre-commit的检查