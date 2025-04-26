//
//  Quiz2.cpp
//  LeetCode
//
//  Created by ShadowJobs on 2019/12/11.
//
/**Q:两个长数相加。
//result的初始值为有2个节点的链表，后面插值时，往这两个节点的中间插，并且每次都是在头部插，实现链表的倒序
//复杂的o(n)
 R:90%
 */
#include "Quiz2.hpp"
#include <iostream>
#include <vector>
using namespace std;
//#include <

ListNode* Quiz2::addTwoNumbers(ListNode* l1, ListNode* l2)
{
    ListNode * p1=l1;
    ListNode * p2=l2;
    ListNode * result=new ListNode(0);
    ListNode * end=new ListNode(0);
    result->next=end;
    //result的初始值为有2个节点的链表，后面插值时，往这两个节点的中间插，并且每次都是在头部插，实现链表的倒序
    //复杂的o(n)
    bool isFirst=true;
    while(p2) //while里处理有限的位数相加
    {
        p1->val=p1->val+p2->val;
        bool jinwei=p1->val>9;
        if(jinwei) p1->val-=10;
        insertList(result, p1->val);
        if(isFirst)
        {
            result->next->next=nullptr;
            isFirst=false;
        }
        if(!p1->next)
        {
            if(p2->next)
            {
                p1->next=p2->next; //p1短，直接接上p2
                if(jinwei) ++(p1->next->val);
            }
            else if(jinwei)
            {
                p1->next=new ListNode(1);
            }
            p1=p1->next;
            break;
        }
        if(jinwei) ++(p1->next->val);
        p1=p1->next;
        p2=p2->next;
    }
    while(p1)//处理进位
    {
        if(p1->val>9){
            p1->val-=10;
            if(p1->next)
            {
                ++(p1->next->val);
            }
            else
            {
                p1->next=new ListNode(1);
            }
        }
        insertList(result, p1->val);
        p1=p1->next;
    }
    result=result->next;
    
    return l1;
//    return result; //提升难度则用result ，将结果翻转显示，leetCode上的要求结果还是逆向显示的，所以不用翻转
}

void Quiz2::insertList(ListNode* l,int v)
{
    ListNode * tmp=l->next;
    l->next=new ListNode(v);
    l->next->next=tmp;
}
ListNode * getList(vector<int> a){
    ListNode * l=new ListNode(a[0]);
    ListNode *p=l;
    for(int i=1;i<a.size();i++)
    {
        p->next=new ListNode(a[i]);
        p=p->next;
    }
    return l;
}
void Quiz2::execute()
{
    /**测试数据 {0}+{0}
     {9}+{9}
     {9,9}+{9}
     {1}+{9,9,9,9,9}
    */
    std::vector<int> a1={9,9,9,9,9};
    std::vector<int> a2={1};
    
    ListNode * list = addTwoNumbers(getList(a1),getList(a2));
    while(list)
    {
        cout<<list->val<<endl;
        list=list->next;
    }
}
