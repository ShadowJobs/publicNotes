local s1='BBC ABCDAB ABCDABCDABDAE'
local s2='ABCDABDA'

local s1="aabaacaabaaf"
local s2="aabaaf" -- 0,1,0,1,2,0

-- local s1="aabaacdecaabaaf"
-- local s2="aabaacdef" -- 0,1,0,1,2,0,0,0,0
function getNext(str)
	local next={0}
	local len=string.len(str)
	local i=1
	local j=2
	local num=0
	local lastEq
	while i<=len and j<=len do
		if string.sub(str,i,i)==string.sub(str,j,j) then 
			lastEq=true
			num=num+1
			next[j]=num
			i=i+1
		else
			if lastEq then num=0;lastEq=false end 
			next[j]=0
			i=1
		end 
		j=j+1
	end
	--bug num的值没有重置，next最后一个应为1
	return next
end
function kmp(str1,str2)
	local next=getNext(str2)
	local s1len=string.len(str1) 
	local s2len=string.len(str2)
	local i2=1
	for i1=1,s1len do 
		while string.sub(str2,i2,i2)~=string.sub(str1,i1,i1) and i2>1 do 
			i2=next[i2-1]+1
		end 
		if string.sub(str2,i2,i2)==string.sub(str1,i1,i1) then 
			i2=i2+1
		end
		if i2==s2len+1 then 
			return i1-s2len+1
		end
	end
	return -1
end

function printT(t)
	local result=""
	for k,v in ipairs(t) do result=result..v..',' end 
	print(result)
end
printT(getNext(s2))

print(kmp(s1,s2))

os.exit()