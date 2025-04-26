

local asdf=require(arg[1])

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
        local result = ''
        if #d > 0 then --数组
            result=tabs.."["..'\n'
            for k,v in ipairs(d) do
                local key=''
                if type(k)=='number' then
                    key=getTabs(tab+1)
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
                
                if type(k)=='number' then
                    result=result..key..value..'\n'
                else
                    result=result..key..':'..value..'\n'
                end
            end
        else --集合
            result=tabs.."{"..'\n'
            for k,v in pairs(d) do
                local key=''
                if type(k)=='number' then
                    key=getTabs(tab+1)..'\"'..k..'\"'
                elseif type(k)=='string' then
                    key=getTabs(tab+1)..'\"'..k..'\"'
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
                
                if type(k)=='number' then
                    result=result..key..value..'\n'
                else
                    result=result..key..':'..value..'\n'
                end
            end
        end

        if #d > 0 then
            result=result..tabs.."],"..'\n'
        else
            result=result..tabs.."},"..'\n'
        end
        jsonResult=jsonResult..result
    else
        jsonResult=jsonResult..tostring(d)
    end
    return jsonResult
end


function isArrayTable(t)
    if type(t) ~= "table" then
        return false
    end
 
    local n = #t
    for i,v in pairs(t) do
        if type(i) ~= "number" then
            return false
        end
        
        if i > n then
            return false
        end 
    end
 
    return true 
end

function toJson(d)
    print(toJsonOri(d,0,''))
end
toJson(asdf)
os.exit()
