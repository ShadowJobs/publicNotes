#include "../gcc/include/a.h"
#include "../gcc/include/b.h"
#include "../gcc/include/c.h"
#include "../gcc3/a3.h"
#include "../gccso/a4.h"
#include <stdio.h>
int fa2()
{
    int result=funcA()+funcB()+funcC()+a3()+a4();
    printf("%d",result);
    return result;
}
int main()
{
    fa2();   
}
