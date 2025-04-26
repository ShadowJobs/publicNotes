local str="3.2+(12+2.4*(10+3-2*1-(1))/3)*5-6/2"  ----v=100.2
local str='1-0*2435-6.1*(1+1)' ---11.2
local len=string.len(str)
--print(len)
function getPriority(s)
	if s=='(' or s==')' then 
		return 3
	elseif s=='*' or s=='/' then
		return 2
	elseif s=='+' or s=='-' then 
		return 1
	end			
end
function getStack()
	local Stack={len=0}
	function Stack:push(v)
		table.insert(self,v)
		self.len=self.len+1
	end
	function Stack:pop() 
		if self.len>0 then
			table.remove(self,self.len) 
			self.len=self.len-1
		end
	end 
	function Stack:top() 
		return self[self.len]
	end
	return Stack
end
function calculate(num1,num2,op)
	if op=='+' then return num1+num2 
	elseif op=='-' then return num1-num2 
	elseif op=='/' then return num1/num2 
	elseif op=='*' then return num1*num2 
	end
end	
function printStack(s,s2)
	local str1=''
	for i=1,s.len do
		str1=str1..s[i]..','
	end
	local str=''
	for i=1,s2.len do
		str=str..s2[i]..','
	end

	-- print('s='..str1..'  ----  '..str)
end		
function stackCheck(nums,ops,priority)
	local op=ops:top()
	if getPriority(op)==priority then
		local v2=nums:top()
		nums:pop()
		local v1=nums:top()
		nums:pop()
		nums:push(calculate(v1,v2,op))
		ops:pop()
	end
end	
function getWord(str)
	print(str)
	local i=1
	local len=string.len(str)
	local char=string.sub(str,i,i)
	local opStack=getStack()
	local numStack=getStack()
	while char and i<=len do
		local num=tonumber(char)
		local floatN	
		if num or char=='.' then
			if char=='.' then 
				if not num then num=0.0 end
				floatN=0.1 
			end 
			local j=i+1
			while j<=len do 
				local nextChar=string.sub(str,j,j)
				local nextNum=tonumber(nextChar)
				if nextNum then
					if floatN then 
						num=num+nextNum*floatN
						floatN=floatN/10
					else
						num=num*10+nextNum
					end
				elseif nextChar=='.' then
					floatN=0.1
				else 
					break
				end
				j=j+1
			end
			i=j-1
			-- print('num is'..num)
			numStack:push(num)
			stackCheck(numStack,opStack,2)
			--print('2')
			printStack(numStack,opStack)
		else
			-- print('char= '..char)
			printStack(numStack,opStack)
			if char==')' then
				printStack(numStack,opStack)
				local op
				while op~='(' do
					local v2=numStack:top()
					numStack:pop()
					op=opStack:top()
					opStack:pop()
					if op=='(' then
						numStack:push(v2)
						break;
					else
						local v1=numStack:top()
						numStack:pop()
						v2=calculate(v1,v2,op)
						numStack:push(v2)
					end
				end
				stackCheck(numStack,opStack,2)
			elseif getPriority(char)==1 then
				stackCheck(numStack,opStack,1)
				opStack:push(char)
			else 
				opStack:push(char)
			end
			printStack(numStack,opStack)
		end
		i=i+1
		char=string.sub(str,i,i)
	end
	local op= opStack:top()
	if opStack:top() then
		stackCheck(numStack,opStack,2)
		stackCheck(numStack,opStack,1)
		print(numStack:top())
	end
end 
getWord(str)
os.exit()
