local _G=_G
module("aaa")
function a()
	newfenv = {b1=_G}
	_G.setfenv(1, newfenv)----1是指当前函数，setfenv，设置当前函数的访问域，这样a()函数里就能直接访问newfenv里的值b1。lua里的继承可以这样设置super父类
	b1.print(1) 
end

function b()
	print(1)
end

a()
local meta={}
----setfenv的第二种写法，将函数作为参数，由于有第二行的module，所以b()里直接访问print会报错
----解决的方案1，用_G.print(),方案2，用setfenv()的方法，将print引进来，如下。meta里没有print，但meta里有metatable，所以会去__index里找。
_G.setfenv(b,meta)
local x=_G.setmetatable(meta,{__index=_G})
b()
_G.os.exit()