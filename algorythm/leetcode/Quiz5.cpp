//
//  Quiz5.cpp
//  LeetCode
//
//  Created by ShadowJobs on 2019/12/13.
//

#include "Quiz5.hpp"
#include <iostream>
#include <unordered_map>

using namespace std;
#define Quiz5_Solution 2

/**
Q:最大回文串，截取s里，对称的最长子串
 */
#if Quiz5_Solution == 1
/**解法1：逐个遍历每一个字符s[i]，如果s[i+1]与s[i]或s[i-1]相等，则说明i这个点可能产生回文。
  这时逐个比较i左右的字符，直到1左右不等或2出现越界
  当然这只是i这个字符位置的最大回文，所以需逐个检查每一个字符
 优化：1，终止条件缩减：剩余字符数量不足以改变已经检查过的最大值时，可以直接放弃后续的比较。
 易漏点：出现aaaa这样的字符时，s[1]同时满足s[i+1]==s[i]和s[i+1]==s[i-1]两个条件，所以都要比较
 比较：解法一性能上最优，而且是我自己想出来的，易懂。复杂度是小于n*(n/2)的
  R:97% 16 ms, 8.8MB
 */
std::string Quiz5::longestPalindrome(std::string s){
    int len=s.length();
    int check=1;
    int max=1;
    int idx=0;
    for(int i=0;i<len;i++){
        if(len-i<max/2-2) break; //剩余的字符串长度已经小于max的一半，就算全部合格，也不会改变max的值，故pass
        if((i-1>=0 && s[i+1]==s[i-1]))
        {
            check=1;
            while(i-check>=0 && i+check<len && s[i-check]==s[i+check])
            {
                ++check;
            }
            if(check*2-1>max) {max=check*2-1;idx=i-check+1;}
        }
        if(s[i+1]==s[i]) //可能同时存在连续的aaa，这样既要检查奇数对称，又要检查偶数对称
        {
            check=1;
            while(i-check>=0 && i+1+check<len && s[i-check]==s[i+1+check])
            {
                ++check;
            }
            if(check*2>max) {max=check*2;idx=i-check+1;}
        }
    }
    return s.substr(idx,max);
}
#elif Quiz5_Solution==2
/**解法2：动态规划法
//经测试，提交会超时，超内存（后改用&引用h传值s，不会超内存）
//思路：start和end从字符串的两边向中心靠拢
//优点:此方法是从最长开始找，是递归的方法，所以超内存。网站上超时的串，因为不是回文串，所以几乎走了n*n，而第一种方法，在处理很长的回文串时，可能不如此方法快。
R: 308ms 17%, 8.9 MB,91.53% 使用isHuiwen3()
R: 828ms 5%, 8.8 MB,93.53% 使用isHuiwen2()
 */
int idx;

/**isHuiwen2的速度更快，因为map的操作耗时超过了isHuiwen的耗时，还有很多费操作，比如某个起终点根本不会被第二次用到，但是会被map记录
 ，而map记录时，由于数据量大，导致不停的触发加长操作，
 另外unordered_map比map快
 */
bool isHuiwen(string & s,int start,int end,unordered_map<int,bool> & m,int len){
    if(end-start<3) return s[start]==s[end]; //这里直接比较比map比较快，少执行2次哈希函数
    else{
        idx=start*len+end;
        if(m.find(idx)!=m.end()) return m[idx];
        if(s[start]==s[end])
        {
            if(isHuiwen(s, start+1, end-1 ,m ,len))
                m[idx]=true;
            else
                m[idx]=false;
            return m[idx];
        }
        else {
            m[idx]=false;
            return false;
        }
    }
}
//注意这里一定要使用引用& 传s的值，否则内存必超
bool isHuiwen2(string & s,int start,int end){
    if(end-start<3) return s[start]==s[end]; //这里直接比较比map比较快，少执行2次哈希函数
    else{
        if(s[start]==s[end]) return isHuiwen2(s, start+1, end-1);
        else return false;
    }
}
//3是2的非递归实现，内存会比2小，然并卵，提交还是超内存。
bool isHuiwen3(string & s,int start,int end){
    if(end-start<3) return s[start]==s[end]; //这里直接比较比map比较快，少执行2次哈希函数
    else{
        for(int i=0;start<end;++start,--end)
        {
            if(s[start]!=s[end]) return false;
        }
        return true;
    }
}
string Quiz5::longestPalindrome(string s){
    int len=s.length();
    if(len==1) return s;
    int start,end;
    int max=1;
    int objectiveStart=0;
//    unordered_map<int,bool> m;
    for(start=0;start<len;++start)
    {
        for(end=len-1;end>start;end--)
        {
            
            if(end-start+1<=max) break;
//            else if(isHuiwen(s, start,end,m,len) )
//            else if(isHuiwen2(s, start,end) )
            else if(isHuiwen3(s, start,end) )
            {
                max=end-start+1;
                objectiveStart=start;
                break;
                //因为end是不断减小的，如果end已经不影响max的值了，可以直接跳出内层循环
            }
        }
        if(max>=(len-1)-start+1) break;
    }
    return s.substr(objectiveStart,max);
}
#endif
void Quiz5::execute(){
    double dur;
    clock_t start,end;
    start = clock();
    
    
    cout<<longestPalindrome("a")<<endl;
    cout<<longestPalindrome("aa")<<endl;
cout<<longestPalindrome("aaaa")<<endl;
    cout<<longestPalindrome("aba")<<endl;
    cout<<longestPalindrome("abcaacb")<<endl;
    cout<<longestPalindrome("abcacb")<<endl;
    cout<<longestPalindrome("bcacba")<<endl;
cout<<longestPalindrome("abcacbad")<<endl;
cout<<longestPalindrome("dabcacba")<<endl;
cout<<longestPalindrome("babad")<<endl;
cout<<longestPalindrome("aaaaaaaaaaaaaaaaaaaaaaaa")<<endl;
cout<<longestPalindrome("aaaaaaaaacccccbbbbbbbbbbbbbbbcccccaaaaaaa")<<endl;
cout<<longestPalindrome("aaaaaaaaacccccbbbbbbbbbbbbbbbcccccaaaaaaa")<<endl;
cout<<longestPalindrome("aaaaaaaaacccccbbbbbbbbbbbbbbbcccccaaaaaaa")<<endl;
cout<<longestPalindrome("aaaaaaaaacccccbbbbbbbbbbbbbbbcccccaaaaaaa")<<endl;
cout<<longestPalindrome("aaaaaaaaacccccbbbbbbbbbbbbbbbcccccaaaaaaa")<<endl;
cout<<longestPalindrome("azwdzwmwcqzgcobeeiphemqbjtxzwkhiqpbrprocbppbxrnsxnwgikiaqutwpftbiinlnpyqstkiqzbggcsdzzjbrkfmhgtnbujzszxsycmvipjtktpebaafycngqasbbhxaeawwmkjcziybxowkaibqnndcjbsoehtamhspnidjylyisiaewmypfyiqtwlmejkpzlieolfdjnxntonnzfgcqlcfpoxcwqctalwrgwhvqvtrpwemxhirpgizjffqgntsmvzldpjfijdncexbwtxnmbnoykxshkqbounzrewkpqjxocvaufnhunsmsazgibxedtopnccriwcfzeomsrrangufkjfzipkmwfbmkarnyyrgdsooosgqlkzvorrrsaveuoxjeajvbdpgxlcrtqomliphnlehgrzgwujogxteyulphhuhwyoyvcxqatfkboahfqhjgujcaapoyqtsdqfwnijlkknuralezqmcryvkankszmzpgqutojoyzsnyfwsyeqqzrlhzbc")<<endl;
    cout<<longestPalindrome("zudfweormatjycujjirzjpyrmaxurectxrtqedmmgergwdvjmjtstdhcihacqnothgttgqfywcpgnuvwglvfiuxteopoyizgehkwuvvkqxbnufkcbodlhdmbqyghkojrgokpwdhtdrwmvdegwycecrgjvuexlguayzcammupgeskrvpthrmwqaqsdcgycdupykppiyhwzwcplivjnnvwhqkkxildtyjltklcokcrgqnnwzzeuqioyahqpuskkpbxhvzvqyhlegmoviogzwuiqahiouhnecjwysmtarjjdjqdrkljawzasriouuiqkcwwqsxifbndjmyprdozhwaoibpqrthpcjphgsfbeqrqqoqiqqdicvybzxhklehzzapbvcyleljawowluqgxxwlrymzojshlwkmzwpixgfjljkmwdtjeabgyrpbqyyykmoaqdambpkyyvukalbrzoyoufjqeftniddsfqnilxlplselqatdgjziphvrbokofvuerpsvqmzakbyzxtxvyanvjpfyvyiivqusfrsufjanmfibgrkwtiuoykiavpbqeyfsuteuxxjiyxvlvgmehycdvxdorpepmsinvmyzeqeiikajopqedyopirmhymozernxzaueljjrhcsofwyddkpnvcvzixdjknikyhzmstvbducjcoyoeoaqruuewclzqqqxzpgykrkygxnmlsrjudoaejxkipkgmcoqtxhelvsizgdwdyjwuumazxfstoaxeqqxoqezakdqjwpkrbldpcbbxexquqrznavcrprnydufsidakvrpuzgfisdxreldbqfizngtrilnbqboxwmwienlkmmiuifrvytukcqcpeqdwwucymgvyrektsnfijdcdoawbcwkkjkqwzffnuqituihjaklvthulmcjrhqcyzvekzqlxgddjoir")<<endl;
    
    end = clock();
    dur = (double)(end - start);
    printf("Use Time:%f\n",(dur/CLOCKS_PER_SEC)*1000);
}
