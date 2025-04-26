gnu的makefile和gcc命令使用实例，把gcc，gcc2,gcc3,gccso4个目录连起来看
设置动态链接库的路径用命令export DYLD_LIBRARY_PATH='/ly/c/gccso'
dyld报错时，可以man dyld查看他的参数
最后的生成文件是gcc2/a2ex
gcc里，生成libmain.a库和可执行的mainex
gcc2里连接所有的静态库，动态库，cpp文件生成a2ex
gcc3里生成liba3.a
gccso里生成so
编辑makefile时，不要用vi,vi的tab建被改成了4个空格