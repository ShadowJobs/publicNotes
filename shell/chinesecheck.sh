#!/bin/bash

# 检查目录里所有的.ts,.jsx,.tsx文件，提取出所有的汉字字符串，并写入文件
# 从命令行获取要检查的目录
directory_to_check=$1
echo "Checking directory: ${directory_to_check}"

# 定义要忽略的子目录列表
declare -a ignored_subdirs=("dir1" "dir2" "dir3")

# 创建 --exclude-dir 参数字符串
ignored_subdirs_param=""
for dir in "${ignored_subdirs[@]}"
do
  ignored_subdirs_param+="--exclude-dir=${dir} "
done

echo "Excluding directories: ${ignored_subdirs_param}"

# 寻找含有汉字的.ts,.jsx,.tsx文件，排除注释行，并且只返回包含汉字的行
grep_output=$(LC_ALL=C grep -r --include=\*.{ts,jsx,tsx} ${ignored_subdirs_param}"[\u4e00-\u9fa5]*\w*" $directory_to_check | grep -v "//" | grep "[\u4e00-\u9fa5]")

if [ -z "${grep_output}" ]
then
  echo "No Chinese characters found."
else
  # 使用 perl 提取匹配的汉字字符串，并去除重复
  perl_output=$(echo "${grep_output}" | perl -C -ne 'while (/([\x{4e00}-\x{9fa5}]+)/g) { print "\"$1\",\n"; }' | sort -u)

  echo "Extracted Chinese strings:"
  echo "${perl_output}"
  # 将结果保存为数组字符串并写入文件
  echo "[${perl_output}]" > output.txt
fi
