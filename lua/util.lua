


--[[
    @desc Return a simple copy of some table.
]]
function simpleCopyOfTable(t, copy)
    return setmetatable(copy or {}, {__index = t})
end

-- @deprecated
function copyTab(st)
    return table.copy(st)
end

--[[
    @desc Display contents in the object.
    @param object Object to be dumped.
    @param label [optional]  The object name. String "class" is reserved for 
        internal use.
    @param maxNesting [optional]  The maximum nesting count.
]]
function dump(object, label, maxNesting, print)
    local dump_print = print or _G.print

    if type(maxNesting) ~= "number" then maxNesting = 99 end

    local lookup_table = {}
    local function _dump(object, prefix, label, indent, nest)
        if label == 'class' and type(object)=="table" then
            dump_print(string.format("%s%s = %s", 
                indent, tostring(label), object:className()..""))
            return
        end
        if type(object) ~= "table" then
            if type(object) == 'string' then
                object = string.gsub(object, '%%', '$');
            end
            dump_print(string.format("%s%s = %s", 
                indent, tostring(label), tostring(object)..""))
        elseif lookup_table[object]~=nil then
            local ref = lookup_table[object]
            dump_print(string.format("%s%s = *REF(%s)*", 
                indent, tostring(label), tostring(ref)))
        else
            local path = label
            if prefix~=nil then
                path = prefix.."."..tostring(label)
            end
            lookup_table[object] = path
            if nest > maxNesting then
                dump_print(string.format("%s%s = *MAX NESTING*", indent, label))
            else
                dump_print(string.format("%s%s = {", indent, tostring(label)))
                local indent2 = indent.."    " 
                for k, v in pairs(object) do
                    _dump(v, path, k, indent2, nest + 1)
                end
                dump_print(string.format("%s}", indent))
            end
        end
    end

    _dump(object, nil, label or "var", "- ", 1)
end

--[[
    @desc Convert byte number to human readable string.
    @param bytes Number of bytes.
    @return a string ends with "B"/"KB"/"MB".
]]
function byteToString(bytes)
    if bytes < 1024 then
        return string.format("%.2f", bytes) .. " B"
    end
    bytes = bytes / 1024;
    if bytes < 1024 then
        return string.format("%.2f", bytes) .. " KB"
    end
    bytes = bytes / 1024;
    return string.format("%.2f", bytes) .. " MB"
end

--[[
    @desc Print log message or write it to log file.
    @param level  The log level. Valid values are "debug", "info", "warning",
        "error", "server". Other values will be treated as "debug".
    @param fmt  The format string. @see string.format() for detail infomation.
    @param ...  Arguments used by `fmt`.
]]

function logTimeBegin(tag)
    AppInformation:getInstance():logTimeBegin(tag)
end


function logTimeEnd(tag,logs)
    logs = logs or tag
    AppInformation:getInstance():logTimeEnd(tag,logs)
end

function pclog(level, fmt, ...)
    local logger = require "utils.Logger"

    --只传1个参数的时候 直接打印log
    if fmt == nil then 
        if type(level) == "table" then 
           dump(level)
        else 
            logger:debug(level)
        end
        return
    end

    local msg = string.format(fmt, ...)
    level = string.lower(level)
    if level=="debug" then
        logger:debug(msg)
    elseif level=="info" then
        logger:info(msg)
    elseif level=="warning" then
        logger:warning(msg)
    elseif level=="error" then
        logger:error(msg)
    elseif level=="server" then
        logger:server(msg)
    else
        logger:debug("["..level.."]"..msg)
    end
end

--[[
function delayCallByFrame(delayFrameCount,target,func, ...)
    assert(func~= nil ,"delayCallByFrame func ==nil")
    local callTarget = target;
    local callFunc = func;
    local callParms = arg;
    local delayFrameCoutLocal = tonumber(delayFrameCount) or 1;
    local function doCallNextFrame(target,func,delayFrameCoutLocal)
        local animTickEntry;
        local function tick(time)
            delayFrameCoutLocal = delayFrameCoutLocal -1;
            if delayFrameCoutLocal<=0 then
                CCDirector:sharedDirector():getScheduler():unscheduleScriptEntry(animTickEntry)  ;
                animTickEntry = nil;
                if callTarget~=nil and type(callTarget)~= "number"then
                    if callTarget.isDisposed ~= true then
                        if callParms~= nil and callParms.n>0 then
                            callFunc(callTarget,unpack(callParms));
                        else
                            callFunc(callTarget);
                        end
                    end
                else
                    if callParms~= nil  and callParms.n>0 then
                        callFunc(unpack(callParms));
                    else
                        callFunc();
                    end
                end
            end
        end
        animTickEntry=  CCDirector:sharedDirector():getScheduler():scheduleScriptFunc(tick, 0, false)
    end
    doCallNextFrame(target,func,delayFrameCoutLocal);
end
--]]

function delayCallByTime(delayTime,target,func, ...)
    assert(func~= nil ,"delayCallByFrame func is nil")
    local callTarget = target;
    local callFunc = func;
    local callParms = arg;
    local function doCallNextTime()
        local animTickEntry;
        local function timeUp(time)
            if  animTickEntry ~= nil then
                cc.Director:getInstance():getScheduler():unscheduleScriptEntry(animTickEntry)  ;
                animTickEntry = nil;
                if callTarget~=nil and type(callTarget)~= "number"then
                    if callTarget.isDisposed ~= true then
                        if callParms~= nil and callParms.n>0 then
                            callFunc(callTarget,unpack(callParms));
                        else
                            callFunc(callTarget);
                        end
                    end
                else
                    if callParms~= nil  and callParms.n>0 then
                        callFunc(unpack(callParms));
                    else
                        callFunc();
                    end
                end
            end
        end
        animTickEntry= cc.Director:getInstance():getScheduler():scheduleScriptFunc(timeUp, delayTime*0.001, false)
    end
    doCallNextTime(target,func,delayTime);
end

----------------------------------------
-- @desc 返回将某函数前面一部分参数固定得到的新函数
-- @see Currying(http://zh.wikipedia.org/wiki/Currying)
----------------------------------------
--[[
    @desc Bind first several parameters to a function. Consider its bindN()
    variations if possible.
    @param f The target function.
    @param ... The first several parameters to be binded.

    XXX I merge two variable arguments using pure Lua code. This can also be
    done using C APIs. The latter may be more efficient (not tested yet). Here's
    an example:
    @see https://github.com/moteus/lua-vararg/blob/master/vararg.c
    Then bind() may be like this:
    function bind(f, ...)
        local p = va.pack(...)
        return function (...)
            return f(va.concat(p, va.pack(...)))
        end
    end
]]
function bind(f, ...)
    local prev_args = {...}
    local argc = select("#", ...)
    return function (...)
        local args = {unpack(prev_args, 1, argc)}
        local args2 = {...}
        local argc2 = select("#", ...)
        for i=1,argc2 do
            args[argc+i] = args2[i]
        end
        return f(unpack(args, 1, argc+argc2))
    end
end

--[[
    @desc bindN variations of bind() method.
]]
function bind1(f, arg1)
    return function (...)
        return f(arg1, ...)
    end
end

function bind2(f, arg1, arg2)
    return function (...)
        return f(arg1, arg2, ...)
    end
end

function bind3(f, arg1, arg2, arg3)
    return function (...)
        return f(arg1, arg2, arg3, ...)
    end
end

function bind4(f, arg1, arg2, arg3, arg4)
    return function (...)
        return f(arg1, arg2, arg3, arg4, ...)
    end
end

function bind5(f, arg1, arg2, arg3, arg4, arg5)
    return function (...)
        return f(arg1, arg2, arg3, arg4, arg5, ...)
    end
end

--[[
    @desc Return a new function that returns the same results as f but 
        memorizes them.
]]
function memorize(f)
    local mem = {} -- memoizing table
    setmetatable(mem, {mode = "kv"}) -- make it weak
    return function (x)
        local r = mem[x]
        if r==nil then
            r = f(x)
            mem[x] = r
        end
        return r
    end
end

--[[
    @desc Construct an easy iterator.
]]
function easyIterator(f, s, var)
    if f==nil then
        return nil
    end
    local _s, _var = s, var
    return function ()
        local results = {f(_s, _var)}
        _var = results[1]
        return unpack(results)
    end
end

--[[
    @desc Return the first element.
]]
function firstOf(f, s, var)
    local _, elem = easyIterator(f, s, var)()
    return elem
end

--[[
    @desc 整数转中文字符串. TODO:support more than 1000
    @param num 数字 (0到100之间)
    @return 中文
]]
local kCnStrArr = {"一", "二", "三", "四", "五", "六", "七", "八", "九", [0]=""};
function intNumToCnString(num)
    if num and num>0 and num<100 then
        local d1 = num%10
        local d2 = (num-d1)*0.1
        return (d2>=1 and ((d2>1 and kCnStrArr[d2] or "").."十") or "")..kCnStrArr[d1]
    elseif num==0 then
        return "零"
    else
        return ""
    end
end

--[[
    @desc   字符串格式颜色，转为程序用颜色
            e.g  #ffffff --> ccc3(255,255,255)
]]
function stringToColor(str)
    local str_r = "0x"..string.sub(str, 2,3)
    local str_g = "0x"..string.sub(str, 4,5)
    local str_b = "0x"..string.sub(str, 6,7)

    local r = string.format("%d", tonumber(str_r))
    local g = string.format("%d", tonumber(str_g))
    local b = string.format("%d", tonumber(str_b))
    
    return ccc3(r,g,b)
end

-- --[[
--     @获取国际计数法表示
--     @param num 数字
-- ]]
-- function getInternationalDesc(num)
--     if num ~= nil then
--         local isNegative = (num < 0)
--         num = math.abs(num)
--         local str = ""
--         repeat
--             local modeNum = num%1000
--             num = math.floor(num/1000)
--             if num ~= 0 then
--                 str = ","..string.format("%03d",modeNum)..str
--             else
--                 str = tostring(modeNum)..str
--             end
--         until num == 0
--         return isNegative and ("-"..str) or str
--     end
-- end


--B在A的内层，要将B移动到某个点P，
--本函数计算B移动到P点时，A需要如何设置位置偏移
--tarX,tarY,为外层传入的B的目标位置
function locateByInsideUi(tarX,tarY,view,insideUi)
    local x,y=insideUi:getPosition()
    local parentX,parentY=view:getPosition()
    local targetPosX,targetPosY=parentX+x,parentY+y
    local offsetX,offsetY=tarX-targetPosX,tarY-targetPosY
    view:setPosition(parentX+offsetX,parentY+offsetY)
end

function tostr(d)
    local typ=type(d)
    if typ=='number' then
        return tostring(d)..'\n'
    elseif typ=='string' then
        return '"'..d..'"'
    elseif typ=='table' then
        local result="{"..'\n'
        for k,v in pairs(d) do
            result=result..tostr(k)..':'..tostr(v)..','..'\n'
        end
        result=string.sub(result,1,-2)

        return result.."}"..'\n'
    elseif typ=='function' then
        return tostring(typ)..'\n'
    elseif typ=='userdata' then
        return tostring(typ)..'\n'
    elseif typ=='thread' then
        return tostring(typ)..'\n'
    elseif typ=='nil' then
        return 'nil'..'\n'
    elseif typ=='boolean' then
        return ''..tostring(d)..'\n'
    else
        return typ..'\n'
    end
    return "empty data *************"..'\n'
end


-----截屏，todo 底层方法待修改
function SaveImageToPngByNode(fileName,node)
    local fullpath
    if CCFileUtils.getWriteablePath then
        fullpath = CCFileUtils:getWriteablePath()..fileName;
    elseif CCFileUtils.sharedFileUtils then
        fullpath = CCFileUtils:sharedFileUtils():getWritablePath()..fileName;
    else
        fullpath='sdcard/'..fileName
    end
    if node then
        local size = node:getBoundRect().size
        local screen
        if CCRenderTexture.create~= nil then
            screen = CCRenderTexture:create(size.width, size.height);
        elseif CCRenderTexture.renderTextureWithWidthAndHeight ~= nil then
            screen = CCRenderTexture:renderTextureWithWidthAndHeight(size.width, size.height);
        else
            return nil
        end
        screen:begin();
        node:visit();
        screen:endToLua()
        if screen.saveToFile then
            screen:saveToFile(fileName, kCCImageFormatPNG);
        elseif screen.saveBuffer then
            if not screen:saveBuffer(kCCImageFormatPNG,fileName,0,0,size.width*2,size.height*2) then
                return nil
            end
        else
            return nil
        end
    else
        local size = CCDirector:sharedDirector():getWinSize();
        local screen
        if CCRenderTexture.create~= nil then
            screen = CCRenderTexture:create(size.width, size.height);
        elseif CCRenderTexture.renderTextureWithWidthAndHeight ~= nil then
            screen = CCRenderTexture:renderTextureWithWidthAndHeight(size.width, size.height);
        else
            return nil
        end
        local scene = CCDirector:sharedDirector():getRunningScene();
        screen:begin();
        scene:visit();
        screen:endToLua()
        if screen.saveToFile then
            screen:saveToFile(fileName, kCCImageFormatPNG);
        elseif screen.saveBuffer then
            if not screen:saveBuffer(kCCImageFormatPNG,fileName,0,0,size.width*2,size.height*2) then
                return nil
            end
        else
            return nil
        end
    end
    return fullpath
end

--todo 新的报错地址和方式待修改
function pushLuaErrorInfoNew(post_info)
    post_info = post_info .. (debug and tostring(debug.traceback() or "nodebug"))
    NetManager.post(AppInformation:getInstance().error_submit_url,{
        function_name="gameupdater",
        error_message='checked info:'..tostring(post_info),
        app_platform=GameStatic.app_platform,
        version=tostring(AppInformation:getInstance().currentVersion),
        pid=GameStatic.pid,
        uid=GameStatic.uid,
        section_id=GameStatic.sectionId
    })
    return iserror
end


--todo 调用调试
function testlua(event)
    --[[
    -- tips ： to test easy android use sdCard root path ,ios use document path
    -- ]]
    if GameStatic.os_platform == "win32" then
--        self:dispatch(TipEvent:new(EVT_TOP_TIP_SHOW,{msg="use dynamicTest.lua"}))
    elseif GameStatic.os_platform == "ios" then
        local path

        if CCFileUtils.getWriteablePath then
            path =string.sub(CCFileUtils:getWriteablePath()..'test',2)
        elseif CCFileUtils.sharedFileUtils then
            path =string.sub(CCFileUtils:sharedFileUtils():getWritablePath()..'test',2)
        end

        package.loaded[path]=nil
        require(path)
    elseif GameStatic.os_platform == "android" then
        --there used the path android sdCard root path
        local path = 'sdcard/test'
        package.loaded[path]=nil
        require(path)
    else
        local path = 'sdcard/test'
        package.loaded[path]=nil
        require(path)
    end
end

--todo 后台调试
function onClickDebug2(self,event)
    local savedApiUrl=GameStatic.ApiUrl
    local oldApiParam=GameStatic.ApiParam
    GameStatic.use_custom_version_param = true
    GameStatic.ApiUrl='http://dev1.ares.playcrab-inc.com//ares/vms/index.php'
    GameStatic.ApiParam={
        mod='api',
        ver='debugPatch',
        platform='dev',
        config='dev'
    }
    self.userServer = self.injector:getInstance(UserServer)
    self.userServer:getDebugPatch()
    self:test()
    GameStatic.ApiUrl=savedApiUrl
    GameStatic.ApiParam=oldApiParam
    GameStatic.use_custom_version_param = false
end


function getTabs(num)
    local result=''
    for i=1,num do
        result=result..'    '
    end
    return result
end
function toJsonOri(d,tab,jsonResult)
    local typ=type(d)
    local tabs=getTabs(tab)
    if typ=='number' then
        jsonResult=jsonResult..tabs..d
    elseif typ=='string' then
        jsonResult=jsonResult..tabs..'\"'..d..'\"'
    elseif typ=='function' then
    elseif typ=='table' then
        local result=tabs.."{"..'\n'
        for k,v in pairs(d) do
            local key=''
            if type(k)=='number' then
                key=getTabs(tab+1)..'['..k..']'
            elseif type(k)=='string' then
                key=getTabs(tab+1)..k
            else
                key=getTabs(tab+1)..tostring(k)
            end
            local value=''
            if type(v)=='number' then
                value=value..v..','
            elseif type(v)=='string' then
                value=value..'\"'..v..'\"'..','
            elseif type(v)=='boolean' then
                value=value..tostring(v)..','
            else
                value=value..'\n'..toJsonOri(v,tab+1,'')
            end
            result=result..key..'='..value..'\n'
        end
        result=result..tabs.."},"..'\n'

        jsonResult=jsonResult..result
    else
        jsonResult=jsonResult..tostring(d)
    end
    return jsonResult
end
function toJson(d)
    return toJsonOri(d,0,'')
end
