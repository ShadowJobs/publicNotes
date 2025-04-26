#!/bin/bash  

for element in `ls $1` #遍历文件夹
do  
    echo $element
    mv $1/$element $1/road_$element
done