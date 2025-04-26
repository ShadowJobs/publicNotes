//
//  Quiz7.cpp
//  LeetCode
//
//  Created by ShadowJobs on 2019/12/16.
//

#include "Quiz7.hpp"
#include <iostream>
using namespace std;
/**Q:颠倒一个数x
 解法:先转为正数，再去掉末尾的0
 然后根据位数逐个设置
 注意：-2147483648这个值转正数会溢出，提前判断返回 0
 R:time 0ms,100%,memory 84%
 
 其他解法一： 用long类型先处理
 解法二：打散成数组
 
 */
int Quiz7::reverse(int x){
    if(x==0 || x==-2147483648) return 0;
    bool isNegative=x<0;
    if(isNegative) x=-x;
    while(x%10==0) x=x/10; //去掉末尾的0
    //int的范围-2147483648 ， 2147483647 。
    //    int max=2147447412;//参照数，10位数的话，如果后5位比这个数的后5位大的话，颠倒后就会溢出。
    int remainder=x%10;
    if(x>1000000001)
        if(remainder>=3) return 0;
        else if(remainder==2)
        {
            remainder=(x/10)%10;
            if(remainder>1) return 0;
            else if(remainder==1)
            {
                remainder=(x/100)%10;
                if(remainder>4) return 0;
                else if(remainder==4){
                    remainder=(x/1000)%10;
                    if(remainder>7) return 0;
                    else if(remainder==7)
                    {
                        remainder=(x/10000)%10;
                        if(remainder>4) return 0;
                        else if(remainder==4)
                        { //2147447412，2147483647 (test: 1563847412)
                            remainder=(x/100000)%10;
                            if(remainder>8) return 0; //再返回，倒着检查后5位
                            else if(remainder==8)
                            {

                                remainder=(x/1000000)%10;
                                if(remainder>3) return 0;
                                else if(remainder==3)
                                {

                                    remainder=(x/10000000)%10;
                                    if(remainder>6) return 0;
                                    else if(remainder==6)
                                    {
                                        
                                        remainder=(x/100000000)%10;
                                        if(remainder>4) return 0;
                                        else if(remainder==4)
                                        {
                                            remainder=(x/1000000000)%10;
                                            if(remainder>1) return 0;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    int figures=1;
    if(x<10) ;
    else if(x<100) x      =(x%10)*10+x/10;
    else if(x<1000) x     =(x%10)*100+((x/10)%10)*10+x/100;
    else if(x<10000) x    =(x%10)*1000+((x/10)%10)*100+x/1000+((x/100)%10)*10;
    else if(x<100000) x   =(x%10)*10000+((x/10)%10)*1000+((x/100)%10)*100+x/10000+((x/1000)%10)*10;
    else if(x<1000000) x  =(x%10)*100000+((x/10)%10)*10000+((x/100)%10)*1000+
                     x/100000+((x/10000)%10)*10+((x/1000)%10)*100;
    else if(x<10000000) x =(x%10)*1000000+((x/10)%10)*100000+((x/100)%10)*10000+((x/1000)%10)*1000+
                   x/1000000+((x/100000)%10)*10+((x/10000)%10)*100;
    else if(x<100000000) x=(x%10)*10000000+((x/10)%10)*1000000+((x/100)%10)*100000+((x/1000)%10)*10000+
                   x/10000000+((x/1000000)%10)*10+((x/100000)%10)*100+((x/10000)%10)*1000;
    else if(x<1000000000)x=(x%10)*100000000+((x/10)%10)*10000000+((x/100)%10)*1000000+
        ((x/1000)%10)*100000+((x/10000)%10)*10000+x/100000000+((x/10000000)%10)*10
        +((x/1000000)%10)*100+((x/100000)%10)*1000;
    else x=(x%10)*1000000000+((x/10)%10)*100000000+((x/100)%10)*10000000+
        ((x/1000)%10)*1000000+((x/10000)%10)*100000+x/1000000000+((x/100000000)%10)*10
        +((x/10000000)%10)*100+((x/1000000)%10)*1000+((x/100000)%10)*10000;
            
    return isNegative?-x:x;
}

void Quiz7::execute(){
//    int x=-1+(1<<31);
//    x=-x-1;
//    cout<<x<<endl;
//    int a=1;
//    cout<<1e1<<endl;
//    long x=8589934592;
    //注意：这里不能用x=1<<33这样了，因为这个表达式的返回值是个int，所以返回值还是int，达不到预期效果
    //解决方法：直接写x=8589934592,或者先定义long int x=1;然后x=x<<33;如下。
    long x=1;
    x=x<<33;
    cout<<x<<endl;
//    cout<<reverse(0)<<endl;
//    cout<<reverse(1)<<endl;
//    cout<<reverse(12)<<endl;
//    cout<<reverse(123)<<endl;
//    cout<<reverse(12345)<<endl;
//    cout<<reverse(12305)<<endl;
//    cout<<reverse(12300)<<endl;
//    cout<<reverse(-2)<<endl;
//    cout<<reverse(-12)<<endl;
//    cout<<reverse(-124)<<endl;
//    cout<<reverse(-12456)<<endl;
//cout<<reverse(123456)<<endl;
//cout<<reverse(1234567)<<endl;
//cout<<reverse(12345678)<<endl;
//cout<<reverse(123456789)<<endl;
//    cout<<reverse( 123456789)<<endl;
//    cout<<reverse(-2147447412)<<endl;
//    cout<<reverse(2147447412)<<endl;
//    cout<<reverse(2147447411)<<endl;
//    cout<<reverse(2147447421)<<endl;
//    cout<<reverse(2147447413)<<endl;
//    cout<<reverse(2147447401)<<endl;
//    cout<<reverse(2147447402)<<endl;
//    cout<<reverse(2147447400)<<endl;
//cout<<reverse(2147447422)<<endl;
//cout<<reverse(-2147483648)<<endl;
//cout<<reverse(-2147483647)<<endl;
//cout<<reverse(1463847412)<<endl;
//cout<<reverse(1563847412)<<endl;
    
    
}
