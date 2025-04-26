#include <stdio.h>
#include "pthread.h"
#include <math.h>
#include "unistd.h"
#include "stdlib.h"
FILE *file;
int i=1;
pthread_mutex_t mt;
#define SLEEP_T 0.00
#define num 150
//#define USE_MUTEX 1    //如果用了这个宏，那么thread0和1是交替出现的，因为两个线程是用的一个锁，互斥锁保证了快的线程在请求锁的时候，只能等另一个线程解锁才能执行mutex之间的代码，即使前一个线程在sleep；而如果不用这个宏，那么两个线程执行的顺序是随机的。
void *f1(a)
{
    while (i<num) {
#ifdef USE_MUTEX
        pthread_mutex_lock(&mt);
#endif
        i++;
        float z=1.0;
        int var=10000000;
        float x=rand()/(RAND_MAX/1.0);
        printf("rand=%f\n",x);
        if (x<0.5)
            var=10;//随机值，保证两个线程一定
        for(int j=1;j<var;j++)
        {
            z=sqrt(j)*sqrt(j);
            if(j==500000)
                sleep(SLEEP_T);
            z=sqrt(z);
        }
        fprintf(file, "thread=%d,fff%d\n",a,i);
#ifdef USE_MUTEX
        pthread_mutex_unlock(&mt);
#endif
    }
    return NULL;
}
void *f2()
{
    while (i<num) {
#ifdef USE_MUTEX
        pthread_mutex_lock(&mt);
#endif
        i++;
#ifdef USE_MUTEX
        pthread_mutex_unlock(&mt);
#endif
        printf("ffffffffff%d\n",i);
        sleep(SLEEP_T);
    }
    
    return NULL;

}
int main(int argc, const char * argv[]) {
    // insert code here...
    pthread_t t1,t2;
    srand(100);
    file=fopen("/ly/xcode/thread/a.txt", "w");
    pthread_mutex_init(&mt, NULL);
    
    pthread_create(&t1, NULL, f1, 1 );
    pthread_create(&t2, NULL, f1, 0 );
    
    sleep(5);
    pthread_join(t1, NULL);//如果注释掉这两行，那么分线程只会执行5秒，[因为上面是sleep(5)]
    pthread_join(t2, NULL);
    fclose(file);
    system("");
    return 0;
}
