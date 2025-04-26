//#include "a.cpp"
#include "b.cpp"
#include <iostream>
#include <fstream>
using namespace std;
int c(){return 3;}
extern int x;
void copyfile()
{
    ifstream in("a.cpp");  
    ofstream out("acopy.txt");
    string x;
    while(getline(in,x))
        out<<x<<endl;  
}
int main()
{
    int a1=a();
    cout<<"a="<<a1<<"b="<<b()<<"x="<<x<<endl;
    copyfile();
    system("cat acopy.txt");
    return 1;
}
