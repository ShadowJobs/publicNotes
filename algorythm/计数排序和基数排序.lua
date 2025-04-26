local t0={9,5,6,11,24,1,2,44,67,43,18,99,32,4,43,22,56,79,72,11,20,8,3,2,7,}
--local t0={9,5,6,24,1,2,44,67,43,18,99,32,4,43,22,56,79,72,11,20,8,3,7,}
local n0=0
local n3=0
function swap(t,i,j)
	n0=n0+1
	local tmp=t[i]
	t[i]=t[j]
	t[j]=tmp
	log(t)
end
local n=0
function log(t)
	n=n+1
	local str=''..n..':'
	for i=1,#t do str=str..t[i]..',' end 
	print(str)
end
	
local t1={4,1,2,3,4,2,5,2,1}
function sort1(t) ----------------计数排序
	local r={}
	local max=0
	for i=1,#t do-------开始计数
		r[t[i]]=(r[t[i]] or 0) +1
		if t[i]>max then max=t[i] end ----记录最大值
	end
	for i=2,max do-------记录个数
		r[i]=(r[i] or 0)+(r[i-1] or 0)
	end
	local r2={}
	for i=#t,1,-1 do r2[r[t[i]]]=t[i] r[t[i]]=r[t[i]]-1 end ----倒序，写入
	return r2
end
local sortedt1=sort1(t1)
log(sortedt1)


----sort2(t2)-----基数排序略


print('exchange '..n0..' times');
print('1loop '..n3..' times')
log(t0)
os.exit()
