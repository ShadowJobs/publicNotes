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

function sort(t,x,y)
	local j
	if x==y then 
		return 
	end 
    if x+1==y then
        if t[x+1]<t[y] then 
			swap(t,x+1,y);return ; 
		end 
    end
	for i=x+1,y do
		n3=n3+1
		if t[i]>t[x] then
			if not j then j=i end 
		else
			if j then 
				swap(t,i,j) 
				j=j+1
			end
        end 
	end
	if j then
        if j-1~=x then 
		    swap(t,x,j-1) 
        end
		if j-2>=x then sort(t,x,j-2) end 
		if y>=j then sort(t,j,y) end 
    else
		swap(t,x,y)
        sort(t,x,y-1)
	end 
end
sort(t0,1,#t0)
print('exchange '..n0..' times');
print('1loop '..n3..' times')
log(t0)

