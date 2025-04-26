//
//  Quiz9.cpp
//  LeetCode
//
//  Created by ShadowJobs on 2019/12/18.
//
/**Q:检查是否为回文数
 解法：先算出位数，然后逐个位比较
 R:time 72%,mem 88%
 */
#include "Quiz9.hpp"
#include <iostream>
using namespace std;

bool Quiz9::isPalindrome(int x){
    if(x<0) return false;
    if(x<10) return true;
    if(x%10==0) return false;
    int wei=1;
    int x2=x;
    int maxr=1; //记录最高位代表的值，如22，最高位代表10，而345，最高位代表100；
    while((x2/=10)>0) {++wei;maxr*=10;} //这里记录下maxr的值，省一次循环；
//    cout<<"weishu="<<wei<<endl;
    int middle=wei/2;
    int low,high;
    for(int i=1;i<=middle;i++)
    {
        low=x%10;
        high=x/maxr;
        if(low!=high) return false;
        x=(x%maxr)/10;
        maxr/=100; //除以100，因为去掉头尾之后，少了2位
    }
    return true;
}
void Quiz9::execute(){
    cout<<isPalindrome(1)<<endl;
    cout<<isPalindrome(12)<<endl;
    cout<<isPalindrome(121)<<endl;
    cout<<isPalindrome(12121)<<endl;
    cout<<isPalindrome(1221)<<endl;
    cout<<isPalindrome(1234561)<<endl;
    cout<<isPalindrome(123454321)<<endl;
    cout<<isPalindrome(-121)<<endl;
    cout<<isPalindrome(10)<<endl;
}
