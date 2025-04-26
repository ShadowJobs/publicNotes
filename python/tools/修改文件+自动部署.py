
import os
import re
import sys
import subprocess


def alter(file,old_str,new_str):
    "替换文件内容"
    file_data = ""
    with open(file, "r", encoding="utf-8") as f:
        for line in f:
            if old_str in line:
                line = line.replace(old_str,new_str)
            file_data += line
    with open(file,"w",encoding="utf-8") as f:
        f.write(file_data)

def alter2(file,old_str,new_str):
    """
    将替换的字符串写到一个新的文件中，然后将原文件删除，新文件改为原来文件的名字
    :param file: 文件路径
    :param old_str: 需要替换的字符串
    :param new_str: 替换的字符串
    :return: None
    """
    with open(file, "r", encoding="utf-8") as f1,open("%s.bak" % file, "w", encoding="utf-8") as f2:
        for line in f1:
            if old_str in line:
                line = line.replace(old_str, new_str)
            f2.write(line)
    os.remove(file)
    os.rename("%s.bak" % file, file)

def alter3(file,old_str,new_str):
    "3 使用正则表达式 替换文件内容 re.sub 方法替换"
    with open(file, "r", encoding="utf-8") as f1,open("%s.bak" % file, "w", encoding="utf-8") as f2:
        for line in f1:
            f2.write(re.sub(old_str,new_str,line))
    os.remove(file)
    os.rename("%s.bak" % file, file)

tag="123"
os.chdir("/Users/linying/work/frontent") #不能os.system("cd ...")
os.system("git pull")
os.system("pwd")
p=subprocess.Popen("""grep -rs "tag" online.yaml | awk '{print $3}'""", shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
oldTag=p.stdout.readlines()[0][0:-1].decode() #注意这里的读出来的值为b'adf\n'所以[0:-1]去掉\n,decode()去掉b''
alter("online.yaml",oldTag,tag)
os.system("git commit -am 'UPDATE:new front verion' ")
os.system("git push")
print("succc")