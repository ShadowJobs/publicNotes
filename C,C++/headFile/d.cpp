#include <iostream>
using namespace std;
int f(int &x)
{
    x=x+1;
    cout<<"f(x)"<<x<<endl;
    return x;
}
int main()
{
    int a,b;
    a=1;
    b=2;
    cout<<"a,b="<<a<<b<<endl;
    int *x=(int *)malloc(sizeof(int));
    int *y=&a;
    cout<<"y="<<*y<<x<<" "<<y<<endl;
    *x=*y;
    int &z=a;
    f(z);
    f(a);
    cout<<z<<" "<<a<<endl; 
    void *aa=&a;
    cout<<"aa"<<*((int *)aa)<<endl;
    return 1;
}
