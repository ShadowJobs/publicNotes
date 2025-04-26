//
//  Quiz6.cpp
//  LeetCode
//
//  Created by ShadowJobs on 2019/12/16.
//

#include "Quiz6.hpp"
#include <iostream>
using namespace std;
/**
 Q:将字符串z字形显示后，输出新字符串。
 解法：
 将竖行作为分隔，将竖行和一个斜行分成1组，竖行长numRows,斜行长numRows-2 （-2是因为斜行要去掉第一行和最后一行）
 则每组长度sectionLen为一个numRows+numRows-2
 总长度/sectionLen得到组数column和余数
 
 第一行和最后一行单独处理
 中间行根据除数余数可以得出最终值
 
 R：time 96%，memory 98%
 */
string Quiz6::convert(string s, int numRows){
    if(numRows==1) return s;
    else
    {
        long len=s.length();
        if(numRows>=len) return s;
        else{
            int sectionLen=numRows+numRows-2; //以一个z做一个分段
            int remainder=len%sectionLen;
            int column=(len-remainder)/sectionLen; //分为多少段
            int rowLen=1;
            string result(len,'a');
            int idx=0;
            for(int i=0;i<numRows;++i)
            {
                if( i == 0 ) {
                    rowLen = column+(remainder>0?1:0);
                    for(int j=0;j<rowLen;++j)
                    {
                        result[j]=s[j*sectionLen];
                    }
                    idx=rowLen;
                }
                else if(i==numRows-1) {
                    rowLen = column+(remainder>=numRows?1:0);
                    for(int j=0;j<rowLen;++j,++idx)
                    {
                        result[idx]=s[j*sectionLen+numRows-1];
                    }
                }else{
//                    rowLen=column*2+((remainder>=i+1)?1:0)+((remainder>=numRows*2-(i+1))?1:0);
                    for(int j=0;j<column;++j)
                    {
                        result[idx++]=s[j*sectionLen+i];
//                        result[idx++]=s[j*sectionLen+numRows-1+numRows-(i+1)];
                        result[idx++]=s[j*sectionLen+numRows*2-2-i];
                    }
                    if(remainder>=i+1)
                    {
                        result[idx++]=s[column*sectionLen+i];
                        if(remainder>=numRows*2-(i+1))
                            result[idx++]=s[column*sectionLen+numRows*2-2-i];
                    }
                }
            }
            return result;
        }
    }
}
void Quiz6::execute(){
//    string s(10,'c');
//    cout<<s<<endl;
    cout<<convert("abcdefghijklmnopqrstuvwxyz", 1)<<endl;
    cout<<convert("abcdefghijklmnopqrstuvwxyz", 2)<<endl;
    cout<<convert("abcdefghijklmnopqrstuvwxyz", 3)<<endl;
    cout<<convert("abcdefghijklmnopqrstuvwxyz", 4)<<endl;
    cout<<convert("abcdefghijklmnopqrstuvwxyz", 5)<<endl;
}
