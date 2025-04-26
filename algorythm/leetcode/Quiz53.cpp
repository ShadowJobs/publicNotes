//
//  Quiz53.cpp
//  LeetCode
//
//  Created by ShadowJobs on 2019/12/20.
//

#include "Quiz53.hpp"
#include <iostream>
//#include <unordered_map>
#define Solution 3

using namespace std;
#if Solution==1
//直接计算
int getSum(vector<int>& nums,int start,int end){
    if(start==end) return nums[start];
    else
    {
        int result=nums[start];
        for(int i=start+1;i<=end;i++){
            result=result+nums[i];
        }
        return result;
    }
}
//递归1//递归的效率明显低于直接求和
int getSum2(vector<int>& nums,int start,int end){
    if(start==end) return nums[start];
    else if(end-start==1) return nums[start]+nums[end];
    else
    {
        return nums[end]+getSum2(nums,start,end-1);
    }
}
//思路：i，j为区间，遍历所有可能的i,j,找出最大值。
int Quiz53::maxSubArray(vector<int>& nums){
    int len=nums.size();
    int max=nums[0];
    int tmp=nums[0];
    for(int i=0;i<len;++i){
//        if(nums[i]>0) //优化1：从第一个不为负的数开始遍历，开头的负数可以直接丢弃。
            for(int j=i;j<len;++j)
            {
    //            tmp=getSum(nums, i, j);
                tmp=getSum2(nums, i, j);
                if(tmp>max)
                {
                    max=tmp;
                }
            }
    }
    return max;
}
#elif Solution==2
//复杂度n*(n+1)/2,是Solution1耗时的1/10
//思路：遍历i，从i开始，逐个相加后面的值，一次i的遍历，可以算出从以i为起点的子数组的最大值。
int Quiz53::maxSubArray(vector<int>& nums){
    int len=nums.size();
    int max=nums[0];
    int tmp=nums[0];
    int maxNagative=max;
    for(int i=0;i<len;++i){
        if(nums[i]>0) //优化1：从第一个不为负的数开始遍历，开头的负数可以直接丢弃。
        {
            tmp=0; //此方法更优，复杂度比solution1少一个数量级。因为solution存在大量的重复计算。
            //getSum(1,10)和getSum(1,11)的计算是2次独立的计算，本方法只计算1次1-10和，计算11的时候直接可以利用10的结果。
            for(int j=i;j<len;++j)
            {
                tmp=tmp+nums[j];
                if(tmp>max) max=tmp;
            }
        }else{
            //优化1会导致一个问题，就是如果全部是负数，那么，max的值会算成nums[0]，而实际上，有可能后面后稍微大点的负值
            //解决办法可以在这里用maxNagative记录最大的负值，或者去掉if(nums[i]>0)的优化
            if(maxNagative<nums[i]) maxNagative=nums[i];
        }
    }
    return max>maxNagative?max:maxNagative;
}
#elif Solution==3
/**思路，从正数开始遍历，计算累加值result，并和最大值max比较后记录到max里，遇到第一个负数串后，比较result+负数串 的和是正还是负，
 如果正，则保留2段值，继续往后遍历
 如果负，则直接丢弃到此为止的所有数，从下一个点开始计算。因为，
 */
//此函数返回从start开始，第一个正数串或负数串的值，并记录end索引.start可能会越界，越界表示结束
int getSumWithStart(vector<int>& nums,int * start,int len){
    bool positive=nums[*start]>0; //外层已经保证start处不为0，所以不考虑0
    int result=0;
    int i=*start;
    for(;i<len;i++) {
        if((nums[i]>=0)==positive) result+=nums[i];
        else {
            *start=i; //start置为第一个不同符号的数的索引
            break;
        }
    }
    if(i>=len-1 && positive==(nums[i]>=0)) *start=len;
    return result;
}
int Quiz53::maxSubArray(vector<int>& nums){
    int len=nums.size();
    int i=0;
    int maxNagative=nums[0];
    while(i<len && nums[i]<=0) //此段循环为找第一个为正数的值，但有可能全是负数或0，所以这里还要判断最大的数
    {
        if(maxNagative<nums[i]) maxNagative=nums[i];
        ++i;
    }
    if(i==len) return maxNagative; //全为负数，则直接返回最大的一个
    
    int max=getSumWithStart(nums, &i, len); //max初始化为第一个正数串的和
    int tmp=0,tmp2=0;
    while(i<len){ //每次循环，都是往后找一个负数串和一个正数串。并比较3个串，（max，tmp,tmp2)取最大
        tmp=getSumWithStart(nums, &i, len); //tmp一定是负的
        if(i==len) break;
        tmp2=getSumWithStart(nums, &i, len); //tmp2一定是正的。
        int sum=max+tmp+tmp2;
        if(sum>max) max=sum;
        if(tmp2>max) max=tmp2;
    }
    
    return max;
}
#endif
void Quiz53::execute(){
//    int x=1;
//    int *y=&x;
//    cout<<*y<<endl;
//    *y=5;
//    cout<<*y<<endl;
    vector<vector<int>> v;
//    v.push_back({1,2,3,-7,9});
    v.push_back({-2,1,-3,4,-1,2,1,-5,4,-1,2,1,-5,4,1,-3,4,-1,2});
    v.push_back({-2,1,-3,4,-1,2,1,-5,4,-1,2,1,-5,4,1,-3,4,-1,2,-2,1,-3,4,-1,2,1,-5,4,-1,2,
        1,-5,4,1,-3,4,-1,2-2,1,-3,4,-1,2,1,-5,4,-1,2,1,-5,4,1,-3,4,-1,2});
    v.push_back({-2,-3,-4,-5,-6,-1});
    v.push_back({-2,-3,-4,-5,-1,-2});
    
    double dur;
    clock_t start,end;
    start = clock();
    for(int i=0;i<v.size();i++)
        cout<<maxSubArray(v[i])<<endl;
    end = clock();
    dur = (double)(end - start);
    printf("Use Time:%f\n",(dur/CLOCKS_PER_SEC)*1000);
}
