#!/bin/bash  
cd $1
for element in `ls .` #遍历文件夹
do  
    if [[ $element == *.zip ]]
    then 
        echo $element
        unzip -q $element 
    fi  
done
