"""
release过程：

1. 确认在master分支，确认与远程仓库保持一致
2. 读取git现有tag
3. 根据参数和现有tag确认新version
4. 打tag，push

自定义tag过程：
1. 确认当前分支无更改，与远程代码一致
2. 打tag，push

"""
import os
import re
import sys
import subprocess

git_root = os.path.abspath(os.path.dirname(__file__))
GIT = "git -C %s %%s" % git_root


def check_clean_and_get_branch_name():
    diff = os.popen(GIT % "diff").read()
    if len(diff.strip()) != 0:
        return False, "commit local file first"
    p = subprocess.Popen(GIT % "branch -vv", shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)  
    for line in p.stdout.readlines():  
        line=str(line,'utf-8')
        if line.startswith("*"):
            subs = line.split()
            local_branch, remote_branch = subs[1], subs[3]
            print("local: %s, remote: %s" % (local_branch, remote_branch))
            p.wait()
            if ":" in remote_branch:
                return False, "sync local and remote branch first: %s, %s" % (local_branch, remote_branch)
            return True, local_branch
    return False, "parse [git branch -vv] command failed, make sure to support [git branch -vv]"


def generate_snapshot_tag(branch_name):
    prefix = branch_name.replace("/", "-")
    rev = os.popen(GIT % "rev-parse --short HEAD").read()
    return "%s-%s" % (prefix, rev.strip())


def new_version(t="s"):
    version_pattern = "(\\d+)\\.(\\d+)\\.(\\d+)"
    version = None
    for line in os.popen(GIT % "tag").readlines():
        m = re.match(version_pattern, line)
        if m:
            v0, v1, v2 = int(m.group(1)), int(m.group(2)), int(m.group(3))
            if version is None or v0 > version[0] or \
                (v0 == version[0] and v1 > version[1]) or \
                    (v0 == version[0] and v1 == version[1] and v2 > version[2]):
                version = [v0, v1, v2]
    if version is None:
        # tag中无版本信息
        return [0, 0, 0]

    if t == "b":
        # 更新大版本
        return [version[0]+1, 0, 0]
    elif t == "m":
        # 更新中版本
        return [version[0], version[1]+1, 0]
    else:
        return [version[0], version[1], version[2]+1]


def do_tag(tag):
    tag_command = GIT % ("tag -a %s -m \"%s\"" % (tag, "[atp release tool]: releasing %s" % tag))
    print("tag command: %s" % tag_command)
    if os.system(tag_command) > 0:
        return False, "do tag failed"
    print("tag done")
    push_command = GIT % ("push origin %s" % tag)
    print("push command: %s" % push_command)
    if os.system(push_command) > 0:
        return False, "push failed"
    return True, "ok"

def alter(file,old_str,new_str):
    file_data = ""
    with open(file, "r", encoding="utf-8") as f:
        for line in f:
            if old_str in line:
                line = line.replace(old_str,new_str)
            file_data += line
    with open(file,"w",encoding="utf-8") as f:
        f.write(file_data)

# 上述修改会将整个文件重写，这个更好
import fileinput
def alter_fileinput(file, old_str, new_str):
    with fileinput.input(files=(file,), inplace=True, encoding='utf-8') as f:
        for line in f:
            print(line.replace(old_str, new_str), end='')

# 使用示例
alter_fileinput("example.txt", "old", "new")

def release(t):
    print("git fetching...")
    if os.system(GIT % "fetch") > 0:
        print("git fetch failed: %s" % git_root, file=sys.stderr)
        return
    print("done")

    print("check if branch is clean...")
    is_clean, message = check_clean_and_get_branch_name()
    if not is_clean:
        print(message, file=sys.stderr)
        return
    print("done")
    if message == "master":
        version = new_version(t)
        print(version)
        tag = ".".join([str(item) for item in version])
    else:
        tag = generate_snapshot_tag(message)

    print("new tag: %s" % tag)
    ret, message = do_tag(tag)
    if not ret:
        print(message)
    print("release %s done" % tag)

    os.chdir("/Users/linying/work/cdPEP")
    os.system("git pull")
    os.system("pwd")
    p=subprocess.Popen("""grep -rs "tag" fe/prod.yaml | awk '{print $3}'""", shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    oldTag=p.stdout.readlines()[0][0:-1].decode()
    alter("fe/prod.yaml",oldTag,tag)
    alter("fe-eu/eu-prod.yaml",oldTag+"-eu",tag+"-eu")
    os.system("git commit -am 'UPDATE:new pep fe verion' ")
    os.system("git push")
    print("succc")


    



def main():
    release_type = "s"
    if len(sys.argv) > 1:
        if sys.argv[1] == "-b":
            release_type = "b"
        elif sys.argv[1] == "-m":
            release_type = "m"
    release(release_type)


if __name__ == "__main__":
    main()
