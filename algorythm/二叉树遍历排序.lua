
local t0={5,3,2,6,1,7,9,22}
local t2={}
function addToNode(node,x)-----将x加入到节点(保证 左<中<右)
	if not node.value then
		node.value=x
	else
		if x<node.value then
			if not node.left then node.left={} end 
			addToNode(node.left,x)
		else
			if not node.right then node.right={} end 
			addToNode(node.right,x)
		end
	end
end	
function build(t,tree)----构造树(保证 左<中<右)
	for i=1,#t do
		addToNode(tree,t[i])
	end
	return tree
end

function printTree(tree)----中序遍历输出树
	if tree.left then printTree(tree.left) end 
	if tree.value then print(tree.value) end 
	if tree.right then printTree(tree.right) end 
end

local t2=build(t0,{})
printTree(t2)