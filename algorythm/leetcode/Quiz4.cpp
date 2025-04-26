//
//  Quiz4.cpp
//  LeetCode
//
//  Created by ShadowJobs on 2019/12/13.
//
/**Q:两个数组的中位数
思路，合并2个数组，
 优化：1然后取下标len/2的地方即可.大于len/2后的值均可抛弃
 2，但是合并会产生较大的性能问题。
所以只需记录第len/2位置附近的2个值即可。不需求出合并后的数组值.
 复杂度：o((m+n)/2)
 R:97%
 */
#include "Quiz4.hpp"
#include <iostream>
using namespace std;

double Quiz4::findMedianSortedArrays(std::vector<int>& nums1, std::vector<int>& nums2){
    long sz1=nums1.size();
    long sz2=nums2.size();
    int start,end;
    if(sz1==0){
        if(sz2==1) return nums2[0]*1.0;
        else if(sz2%2==0){
            return (nums2[sz2/2-1]+nums2[sz2/2])/2.0;
        }else{
            return nums2[sz2/2]*1.0;
        }
    }else if(sz2==0){
        if(sz1==1) return nums1[0];
        else if(sz1%2==0){
            return (nums1[sz1/2-1]+nums1[sz1/2])/2.0;
        }else{
            return nums1[sz1/2];
        }
    }else if(sz1==1 && sz2==1){
        return (nums1[0]+nums2[0])/2.0;
    }else{
        if(nums1[0]==nums1[sz1-1] && nums2[0]==nums2[sz2-1]){//两个数组里，每一个里都是各自重复元素
            if(sz1==sz2) return (nums1[0]+nums2[0])/2.0;
            else return sz1>sz2?nums1[0]:nums2[0];
        }else{//至少有一个数组里不是重复元素
            //判断顺序，大到小还是小到大。数组可能有重复数字，所以不能只看一个数组，要同时比较两个数组的头尾来判断。
            bool sort=true;//true为从小到大
            if(nums1[0]==nums1[sz1-1]) sort=nums2[0]<nums2[sz2-1];
            else sort=nums1[0]<nums1[sz1-1];
            int i=0,j=0;
            int endidx=sz1+sz2;
            bool isOdd = endidx%2==1;
            if(isOdd) endidx=endidx/2;
            else endidx=endidx/2;
            //新的数组只保留原2个数组长度和的一半（后面的不需要计算就可以求出结果），
            //记录endidx，是最后一个元素所在的idx
            int final1=nums1[0],final2=nums1[0]; //最后倒数的2个数
//            vector<int> result(endidx); //这个result可能根本不需要,因为最终参与计算只是1或2个数
            int idx=-1;
            if(sort)
            {
                while(i<sz1 && j<sz2 && idx<=endidx)
                {
                    ++idx;
                    if(nums1[i]<nums2[j])
                    {
//                        result[idx]=nums1[i];
                        if(idx==endidx-1) final1=nums1[i];
                        else if(idx==endidx) {final2=nums1[i];break;}
                        ++i;
                    }else
                    {
//                        result[idx]=nums2[j];
                        if(idx==endidx-1) final1=nums2[j];
                        else if(idx==endidx) {final2=nums2[j];break;}
                        ++j;
                    }
                }
                if(idx<endidx)
                {
                    if(i<sz1)
                        for(;i<sz1;++i)
                        {
                            ++idx;
        //                    result[idx]=nums1[i];
                            if(idx==endidx-1) final1=nums1[i];
                            else if(idx==endidx) final2=nums1[i];
                            
                        }
                    else if(j<sz2) for(;j<sz2;++j)
                    {
                        ++idx;
    //                    result[idx]=nums2[j];
                        if(idx==endidx-1) final1=nums2[j];
                        else if(idx==endidx) final2=nums2[j];
                    }
                }
            }
            else{ //从大到小，题目里没要求
//                while(i<sz1 && j<sz2)
//                {
//                    if(nums1[i]>nums2[j])
//                    {
//                        result[idx]=nums1[i];
//                        ++i;
//                    }else
//                    {
//                        result[idx]=nums2[j];
//                        ++j;
//                    }
//                    ++idx;
//                }
//                if(i<sz1) for(;i<sz1;++i,++idx) result[idx]=nums1[i];
//                else if(j<sz2) for(;j<sz2;++j,++idx)result[idx]=nums2[j];
            }
            return isOdd?final2:(final1+final2)/2.0;
//            if(idx%2==0){
//                return (result[idx/2-1]+result[idx/2])/2.0;
//            }else{
//                return result[idx/2];
//            }
        }
    }
    return 1;
}

void Quiz4::execute(){
    vector<vector<int>> arr={
//        {1},{1}, //2个1组
//        {1},{},
//        {1,2},{1},
//        {1,1},{2,2},
//        {8},{1,2,4,6,7,9},
//        {8},{9,7,6,5,4},
//        {8,7,1},{9,7,6,5,4},
        {1,2},{3,4},
//        {4,5,6,8,9},{}
    };
    for(int i=0;i<arr.size();i+=2)
        cout<<findMedianSortedArrays(arr[i],arr[i+1])<<endl;
}
