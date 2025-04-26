//
//  Quiz3.cpp
//  LeetCode
//
//  Created by ShadowJobs on 2019/12/12.
//
//找字符串中最长的不重复子串长度
#include "Quiz3.hpp"
#include <iostream>
#include <map>
#include <unordered_map>
using namespace std;
//void makeNext(string P)
//{
//    int q,k;//q:模版字符串下标；k:最大前后缀长度
//    int m = P.length();//模版字符串长度
//    int next[30] = {0};//模版字符串的第一个字符的最大前后缀长度为0
//    for (q = 1,k = 0; q < m; ++q)//for循环，从第二个字符开始，依次计算每一个字符对应的next值
//    {
//        while(k > 0 && P[q] != P[k])//递归的求出P[0]···P[q]的最大的相同的前后缀长度k
//            k = next[k-1];          //不理解没关系看下面的分析，这个while循环是整段代码的精髓所在，确实不好理解
//        if (P[q] == P[k])//如果相等，那么最大相同前后缀长度加1
//        {
//            ++k;
//        }
//        next[q] = k;
//    }
////    string x="";
////    for(int i=0;i<m;i++) x=x+to_string(next[i]);
////    cout<<x<<endl;
//}
/**
 Q:找字符串中最长的不重复子串长度
 复杂度 小于o(2n)
 unordered_map可能更快（todo:如果s的范围是ASCII，则可以考虑数组，或许更快）
 哈希表里记录当前在检查的字符和他的下标。
 出现碰撞，假设2和6碰撞，则将碰撞点之前的字符（0，1，2的位置2个）删除，并且当前长度cur=cur-差值，
 每次cur的值改变时，都要更新max的值
 R: 40%, ? 此算法计算时只超过了40%的同行，不确定是哪里比较耗性能,可能是vector的操作
 */
int Quiz3::lengthOfLongestSubstring(string s){
    int len=s.length();
    if(len<2) return len;
//    map<char,int> m;
    unordered_map<char, int> m; //无序map更快些，因为红黑树还会查找一下，但是使用的空间会多一些（leetcode显示多10%）
    m[s[0]]=0;
    int max=1; //最大长度
    int cur=1; //当前所选范围内，未重合的最大长度
    int start=0; //范围内开始的下标
    int tmp=0; //临时的值，记录start
    unordered_map<char,int>::iterator it;
//    map<char,int>::iterator it=m.find(s[0]);
    for(int i=1;i<s.length();++i)
    {
        it = m.find(s[i]);
        if(it==m.end()){
            ++cur;
        }else{
            if(cur>max) {max=cur;} //这个值可能已经是最大值了
            cur=cur-(it->second-start); //修改当前长度，为当前值减去重合点到开始点的距离
            tmp=it->second+1; //这里先记录重合点，因为for里面会改变这个值。值为上一个重合点加1
            for(int j=it->second-1;j>=start;j--) //去掉的值，从哈希里也要去掉，防止后面的值找到错误的下标
            {
//                m[s[j]]=-1;
                m.erase(s[j]);
            }
            start=tmp; //开始位挪到重合点的下一位
        }
        m[s[i]]=i;
    }
    return max>cur?max:cur;
}
void Quiz3::execute(){
//    cout<<lengthOfLongestSubstring("aaaa")<<endl;
//    cout<<lengthOfLongestSubstring("sa")<<endl;
//    cout<<lengthOfLongestSubstring("abcdaefgh")<<endl;
//    cout<<lengthOfLongestSubstring("abcdaabuiop")<<endl;
//    makeNext("ABCDABDAB");
//cout<<lengthOfLongestSubstring("abaca")<<endl;
//cout<<lengthOfLongestSubstring("aaa")<<endl;
//cout<<lengthOfLongestSubstring("a")<<endl;
//cout<<lengthOfLongestSubstring("sa")<<endl;
//cout<<lengthOfLongestSubstring("aba")<<endl;
//cout<<lengthOfLongestSubstring("abcbcde")<<endl;
cout<<lengthOfLongestSubstring("abcbacde")<<endl;
cout<<lengthOfLongestSubstring("abcbae")<<endl;
}

