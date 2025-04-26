local _G=_G
module(...,package.seeall)
function z() print("zzzzzzdddzzzz") end
a={}
a.x=10000
a.f1=function() _G.print(1) end
a.f2=function() _G.print(2) end
a.__index=a
b={}
b.f3=function() _G.print(3) end
b.__index=b
b.__add=function(x1,x2) return x1.x+x2.x end
_G.setmetatable(b,a)
c={}
c.f4=function() _G.print(4) end
-- c.x=10
_G.setmetatable(c,b)
d={}
d.x=20
_G.setmetatable(d,b)
for i,v in _G.pairs(c) do 
	if _G.rawget(c,i) then
	_G.print(i,v)
	end
end
local yyy=1
_G.a=_M
_G.c=c
print(a+c)
print(_M)