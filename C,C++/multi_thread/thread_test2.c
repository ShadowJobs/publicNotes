#include <stdio.h>
#include <pthread.h>
#include <unistd.h>
int x1=0;
pthread_mutex_t m_mutex;
void InternalThreadEntryFunc(void * x)
{
    while (1) {
//        lockf(<#int#>, <#int#>, off_t)
        pthread_mutex_lock( &m_mutex);
        x1++;
        printf("child %d \n",x1);
        fflush(stdout);
        pthread_mutex_unlock( &m_mutex);
        sleep(1);
    }
}
int main(int argc, const char * argv[]) {
    // insert code here...
    printf("Hello, World!\n");
    pthread_t _thread;
    pthread_mutex_init(&m_mutex, NULL);
    if (pthread_create(&_thread, NULL, InternalThreadEntryFunc,NULL) == 0){

        //        return true;
    }
    pthread_t _thread2;
    if (pthread_create(&_thread2, NULL, InternalThreadEntryFunc,NULL) == 0){
//        pthread_mutex_init(&m_mutex, NULL);
        //        return true;
    }
    
//    while (1) {
//        pthread_mutex_lock( &m_mutex);
//        x1--;
//        printf("parent %d " ,x1);
//        fflush(stdout);
//        pthread_mutex_unlock( &m_mutex);
////        sleep(0.11);
//    }
    sleep(10);
    return 0;
}
