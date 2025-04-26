-- User: LinYing
-- Date: 2015/11/2
-- Time: 16:06
-- To change this template use File | Settings | File Templates.
classes={}
module(...,package.seeall)
Obj={}
function newindex(t,k,v)
--        local isFuc= type(v)=="function"
    if rawget(t,"isClass") then-----rawget()不会访问__index

--        if isFuc then
            rawset(t,k,v)-----设置t里k字段的值，类似于(但是不等于)t[k]=v,但是rawset不会访问__newindex字段。
            local env=getfenv(v)
            setfenv(v,setmetatable({super=t._SuperClass},{__index=env,__newindex = env}))
--        else
--            assert(false,"Try to access a class's field!")
--        end
    else
--        if isFuc then
--            assert(false,"define a function in a instance, class expected")
--        else
            rawset(t,k,v)
--        end
    end
end
Obj.__newindex=newindex
Obj.__index=Obj
--local function subClassError() assert(false,"Please create subClass by a Class,not a Instance")  end
function Obj.init(self)
end
function Obj.new(self,...)
    local instance={ }
    instance.subClass=1----------
    setmetatable(instance,self)
    instance:init(...)

    return instance
end

function Obj.subClass(self,className)
    if classes[className] then
        assert(false,"class redefine:"..tostring(className))
    end
    local cls={static={},isClass=true}
    classes[className]=cls
    cls._Name=className
    cls._SuperClass=self
    cls.__index=cls
    cls.__newindex=newindex
    setmetatable(cls,self)
    return cls
end

function Obj.removeSelf(self)
    classes[self._Name]=nil
end
_G.Obj=Obj