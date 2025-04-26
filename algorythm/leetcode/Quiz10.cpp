//
//  Quiz10.cpp
//  LeetCode
//
//  Created by ShadowJobs on 2019/12/18.
//

#include "Quiz10.hpp"
#include <iostream>

using namespace std;

bool Quiz10::isMatch(string s, string p){
    if (p.empty())
    {
        return s.empty();
    }
    int lenS=s.length(),lenP=p.length();
    if(lenS==0){
        for(int i=0;i<lenP;i++)
        {
            if((p[i]>='a' && p[i]<='z') || p[i]=='.') //出现需要匹配的字符
            {
                if(i+1==lenP) return false;
                else if(p[i+1]!='*') return false;
                else i++; //出现了一个字符 紧跟 一个*，可以直接跳2个字符
            }
        }
        return true;
    }
    else{
        
    }
    return false;
}
void Quiz10::execute(){
    string s="a";
    char c='a';
    cout<<(s[0]==c)<<endl;
    cout<<isMatch("aa", "a")<<endl;
    cout<<isMatch("aa", "a*")<<endl;
    cout<<isMatch("ab", ".*")<<endl;
    cout<<isMatch("aab", "c*a*b")<<endl;
    cout<<isMatch("mississippi", "mis*is*p*.")<<endl;
}
