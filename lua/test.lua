debug.traceback("aaa");

function f1()
    print(debug.traceback("aaa2"))
    --print(debug.getinfo(1))
    print('ssssss')
end

function f2()
    f1()
end 

f2()
print("hhhhhh")

os.exit()