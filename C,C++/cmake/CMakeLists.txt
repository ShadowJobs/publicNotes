cmake_minimum_required(VERSION 3.0.0)
set(CMAKE_C_COMPILER /usr/bin/gcc)
set(CMAKE_CXX_COMPILER /usr/bin/g++) # 指定编译器，mac上如果没有装xcode，缺少这2句会报错。而且位置必须在project语句之前
project(testCmake)
add_executable(cmake1.exe cmake1.cpp) #生成可执行文件
add_library(cmake1 cmake1.cpp) #生成静态库
