#!/bin/bash  
function getdir(){
	for element in `ls $1` #遍历文件夹
	do  
	    dir_or_file=$1"/"$element
	    if [ -d $dir_or_file ]
	    then 
	        # getdir $dir_or_file #循环遍历深层目录
	        : #跳过语句
	    else
	        array=(${dir_or_file//_/ })  
	        # echo ${array[1]}
	        if [ ${array[1]} == 1.png ]
	        then
	        	echo ${dir_or_file} ${1}/${array[1]}
	        	mv ${dir_or_file} ${1}/${array[1]}
	     
	        fi
			# for var in ${array[@]} #遍历数组
			# do
			#    echo $var
			# done 
	    fi  
	done
}

# getdir ${dir}1
for((i=1;i<=12;i++));  
do   
# mv 顶板_$i.png topBar$i.png; 
mv 顶板_${i}a.png topColor$i.png;  
# mv 返回按钮底板$i.png returnBtnBg$i.png; 
mv 关卡类型选择${i}_未解锁衬底.png itemLocked$i.png;  
# mv 关卡类型选择$i.png itemOpen$i.png;  
# mv 关卡图$i.png levelIcon$i.png;  
done 