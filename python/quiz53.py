
for i in range(1, 10, 2):
    print(i);
class Solution(object):
    x=1
    def maxSubArray(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        len0=len(nums)
        if len0==1 : return nums[0];

class S2(Solution):
    mp={"2":'abc',"3":"def","4":"ghi","5":"jkl","6":"mno","7":"pqrs","8":"tuv","9":"wxyz"};
    dlen=0
            
    def letterCombinations(self, digits):
        """
        :type digits: str
        :rtype: List[str]
        """
        result=[]
        self.dlen=len(digits);
        if self.dlen==0: return result;
        chars=self.mp[digits[0]]
        for i in range(len(chars)):
            result.append(chars[i])
        if self.dlen==1: return result;
        for idx in range(1,len(digits)):
            chars = self.mp[digits[idx]];
            rlen=len(result)
            for i in range(len(chars)-1,-1,-1):
                for j in range(rlen):
                    if i==0:
                        result[j]+=chars[i];
                    else:
                        result.append(result[j] + chars[i])
        return result

x = S2();
x.letterCombinations("23")