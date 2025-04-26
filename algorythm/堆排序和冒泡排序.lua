local t0={9,5,6,8,3,2,7}
function swap(t,i,j)
	local tmp=t[i]
	t[i]=t[j]
	t[j]=tmp
end
function log(t)
	local str=''
	for i=1,#t do str=str..t[i]..',' end 
	print(str)
end
function check(t,i,len)
	local left,right=t[i*2],t[i*2+1]
	local idx=i
	if i*2<len and left and left>t[idx] then idx=i*2 end 
	if i*2+1<len and right and right>t[idx] then idx=i*2+1 end 
	if idx~=i then
		swap(t,idx,i)
		check(t,idx,len)
		log(t)
	end
end
for i=math.floor((#t0)/2),1,-1 do
	check(t0,i,#t0)
end
print('step2')
for i=#t0,1,-1 do
	swap(t0,i,1)
	check(t0,1,i)
end
for i=1,#t0 do print(t0[i]) end
