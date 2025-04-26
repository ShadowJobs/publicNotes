//
//  Quiz2.hpp
//  LeetCode
//
//  Created by ShadowJobs on 2019/12/11.
//

#ifndef Quiz2_hpp
#define Quiz2_hpp

#include <stdio.h>
struct ListNode {
     int val;
     ListNode *next;
     ListNode(int x) : val(x), next(NULL) {}
};

class Quiz2 {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) ;
    void insertList(ListNode* l,int v);
    void execute();
};
#endif /* Quiz2_hpp */
