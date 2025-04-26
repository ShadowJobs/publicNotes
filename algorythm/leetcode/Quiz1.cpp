//
//  Quiz1.cpp
//  LeetCode
//
//  Created by ShadowJobs on 2019/12/10.
//
/**Q:找去nums里，a+b=target的下标
解法：用哈希表记录已经检测过的值，每次判断a时，检查target-a是否在表里，有则直接返回
 R: 90%
 */
#include "Quiz1.hpp"
#include <iostream>
#include <map>
using namespace std;
vector<int> Quiz1::twoSum(vector<int> &nums, int target)
{
    vector<int> result;
    map<int,int> m; //用哈希表记录已经检测过的值，每次判断a时，检查target-a是否在表里，有则直接返回
    m.insert(pair<int,int>(nums[0],0));
    m.insert(pair<int,int>(nums[1],1));
    if(nums[0]+nums[1]==target) return {0,1};
    for(int i=2;i<nums.size();i++)
    {
        if(m.find(target-nums[i])!=m.end())
        {
            return {i,m.find(target-nums[i])->second};
        }else{
            m[nums[i]]=i;
        }
    }
    return result;
}
void Quiz1::execute(){
    std::vector<int> v1={11,6,7,1,9,11,3,4};
    std::vector<int> v2=this->twoSum(v1, 4);
    cout<<v2[0]<<v2[1]<<endl;
}
