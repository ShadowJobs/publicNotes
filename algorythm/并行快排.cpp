#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <vector>
#include <iostream>
#include <time.h>
#include <mutex>
#include <thread>
#include "windows.h"
#include <sstream>

using namespace std; 
#define random(x) (rand() % (x))
struct tm *localtime(const time_t *timer);
#define MINNUM 4000 //С��4000����ʱ�򣬵�����cpu����
#define THREADNUM 400
#define CPUNUM 10
#define NESTING 1500
#include <iostream>

vector<int> getTestArr(int n=10000)
{
	vector<int> arr;
	for (int i = 1; i < n; i++)
	{
		arr.push_back(random(20000000));
	}
	return arr;
}
void printArr(vector<int> &arr)
{
	std::ostringstream buf;//��֤���߳��²�����
	int size = arr.size();
	for (int i = 0; i < size; i++)
	{
		if ((i + 1) % 15 == 0 && false)
			//printf("%d\n", arr[i]);
			buf << arr[i] << endl;
		else
			//printf("%d ", arr[i]);
			buf << arr[i] << " ";
	}
	//printf("\n");
	buf<<  endl;
	cout << buf.str() ;
}
void swap0(vector<int> &vec, int index, int index2 = 0)
{
	int tmp = vec[index2];
	vec[index2] = vec[index];
	vec[index] = tmp;
}
void quickSort(vector<int> &arr, int start,int end)
{
	int a = arr[start];
	int j = start + 1;
	for (int i = j; i <= end; i++)
	{
		if (arr[i] <= a)
		{
			if (i!=j) swap0(arr, i, j++);
			else j++;
		}
	}
	if (j>start+1)
	{
		swap0(arr, start, j - 1);
		if (j > start + 2)
		{
			int nextstart = start;
			int nextend = j - 2;
			while (arr[nextend] == arr[j - 1] && nextend>start)
				nextend--;
			if (nextstart != nextend)
			quickSort(arr, nextstart, nextend);
		}
	}
	if (j < end)
	{
		int nextstart = j;
		int nextend = end;
		while (arr[nextstart] == arr[j - 1] && nextstart<nextend)
			nextstart++;
		if (nextstart!=nextend)
		quickSort(arr, nextstart, nextend);
	}
}

bool checkEq(vector<int> &arr1, vector<int> &arr2)
{
	if (arr1.size() != arr2.size()) return false;
	for (int i = 0; i<arr1.size(); i++)
	{
		if (arr1[i] != arr2[i]) return false;
	}
	return true;
}

void parallelQuickSort(vector<int> &arr, int start, int end)
{
	static int threadn = 0;
	int a = arr[start];
	int j = start + 1;
	for (int i = j; i <= end; i++)
	{
		if (arr[i] <= a)
		{
			if (i != j) swap0(arr, i, j++);
			else j++;
		}
	}
	thread t1, t2;
	bool has1 = false;
	bool has2 = false;
	if (j>start + 1)
	{
		swap0(arr, start, j - 1);
	}
	if (j > start + 2)
	{
		int nextstart = start;
		int nextend = j - 2;
		while (arr[nextend] == arr[j - 1] && nextend>start)
			nextend--;
		if (j - 2 - start < MINNUM || threadn >= THREADNUM)
		{
			if (nextstart!=nextend)
			parallelQuickSort(arr, nextstart,nextend);
		}
		else
		{
			t1 = thread((parallelQuickSort), ref(arr), nextstart,nextend);
			threadn++;
			has1 = true;
		}
		//tarr->push_back(t1);
	}
	if (j < end)
	{
		//if (end - j<MINNUM) 
		int nextstart = j;
		int nextend = end;
		while (arr[nextstart] == arr[j - 1] && nextstart<nextend)
			nextstart++;
		if (nextstart != nextend)
		{
			if (true) //���߳̿��Լ������ã������½��߳�,����Ҳ����
				parallelQuickSort(arr, nextstart, nextend);
			else
			{
				has2 = true;
				t2 = thread((parallelQuickSort), ref(arr), j, end);
			}
		}
		//tarr->push_back(t2);

	}
	//**
	if (has1) t1.join();//join�����������������t1�ͱ��߳�ͬʱ��
	//if (has2) t2.join();
//*/
}


struct v{
	int start;
	int end;
};
vector<struct v *> taskArr;
int cpuFinishCount = 0;
mutex mtx;
mutex mtx2;
void parallelQuickSortWithPool1(vector<int> &arr, int callCnt, int st = -1, int ed = -1)
{
	//c++11 ����߳��ڱ���Ϊ thread_local ����__thread(mac�²�����������)������vs��2015��ʼ��֧�֣�����win���� __declspec (thread)�����Ǿ����ԣ�������Ч
	//static __declspec (thread) int regressionCnt = 0;//��Ч����Ϊֻ��һ���߳����õ��������߳�����
	//regressionCnt++;
	//cout << "id=" << std::this_thread::get_id() << ',' << "regressionCnt=" << regressionCnt << endl;
	callCnt++;
	bool loop = true;
	while (loop){
		//mtx2.lock();
		if (cpuFinishCount <= 0)
		{
			//mtx2.unlock();
			//cout << "id=" << std::this_thread::get_id() << " is breaked"<<endl;
			//printf("id=%d is breaked\n", std::this_thread::get_id());
			//printArr(arr);
			break;
		}
		//mtx2.unlock();
		if (st != -1 || mtx.try_lock()>0)
		{
			int start, end;
			if (st!=-1)
			{ 
				start = st; end = ed;
				loop = false;//�Ӱ�����Ϊ©����һ�䣬���˰����
			}
			else{
				if (taskArr.size() == 0){
					mtx.unlock(); 
					break;	//�������break
					//continue;
				}
				auto task = taskArr[taskArr.size() - 1];
				taskArr.pop_back();
				mtx.unlock();
				start = task->start;
				end = task->end;
				callCnt = 0;
				//free(task);//???����ᱨ����ע��
			}
			int a = arr[start];
			int j = start + 1;
			for (int i = j; i <= end; i++)
			{
				if (arr[i] <= a)
				{
					if (i != j) swap0(arr, i, j++);
					else j++;
				}
			}
			if (j > start + 1)
			{
				swap0(arr, start, j - 1);
			}
			//cout << "id=" << std::this_thread::get_id() << ','<<"start,end="<< start<<","<<end<<endl;
			//printf("id=%d , ", std::this_thread::get_id());
			//printf("start=%d ,end=%d\n", start, end);
			//printArr(arr);
			auto id = std::this_thread::get_id();
			bool has2 = j > start + 2 && j < end;
			if (j > start + 2)
			{
				//mtx2.lock();
				cpuFinishCount++;
				//mtx2.unlock();

				int nextstart = start;
				int nextend = j - 2;
				while (arr[nextend] == arr[j - 1] && nextend>start)//ȥ�أ��ظ���ͬ��ֱ��������
					nextend--;

				if (nextstart != nextend)
				{
					if (has2 || callCnt > NESTING)
					{
						auto v0 = (struct v *)malloc(sizeof(struct v*));
						v0->start = nextstart;
						v0->end = nextend;
						//mtx.lock();
						taskArr.push_back(move(v0));
						//mtx.unlock();						
					}
					else
					{
						parallelQuickSortWithPool1(arr, callCnt, nextstart, nextend);
					}
				}
			}
			if (j < end)
			{
				//mtx2.lock();
				cpuFinishCount++;
				//mtx2.unlock();
				int nextstart= j ;
				int nextend= end;
				while (arr[nextstart] == arr[j - 1] && nextstart<nextend) 
					nextstart++;
				if (nextstart != nextend)
				{
					if (callCnt>NESTING)
					{
						auto v0 = (struct v *)malloc(sizeof(struct v*));
						v0->start = nextstart;
						v0->end = nextend;
						//mtx.lock();
						taskArr.push_back(v0);
						//mtx.unlock();
					}
					else
						parallelQuickSortWithPool1(arr, callCnt, nextstart, nextend);
				}
			}
			//mtx2.lock();
			cpuFinishCount--;
			//mtx2.unlock();
			st = -1; ed = -1;
			//����ʱ������Ϊ-1����ʾ�´�ѭ�������taskArr��ȡ���񣬷����´ν���ʱ�Ծɻ��start-end����Ѿ��ź����ֵ������һ�Σ�
			//Ȼ��cpuFinishCount-1�������ᵼ�¿�ͷ��break,�Ӷ��������
		}
		Sleep(0);
	}
}

void threadPoolQS(vector<int> &arr)
{

	int arrLen = arr.size();	
	auto v0 = (struct v *)malloc(sizeof(struct v*));
	v0->start = 0;
	v0->end = arr.size() - 1;
	cpuFinishCount++;
	vector<std::thread> threadArr;
	clock_t a1 = clock();
	taskArr.push_back(v0);
	for (int i = 0; i < CPUNUM; i++)
	{
		thread x(parallelQuickSortWithPool1,ref(arr),0,-1,-1);
		threadArr.push_back(std::move(x));//vector����̱߳���move��Ҳ���Բ���vector������
	}
	for (int i = 0; i < CPUNUM; i++)
		threadArr[i].join();
	clock_t b1 = clock();
	printf("parallel quick sort with thread pool: cost %f s\n", (double)(b1 - a1) / CLOCKS_PER_SEC);
}
int main()
{
	int x[] = { 9, 5, 6, 11, 24, 1, 2, 44, 67, 43, 18, 99, 32, 4, 43, 22, 56, 79, 72, 11, 20, 8, 3, 2, 7 };
	//vector<int> arr1(x, x + 25);
	vector<int> arr1 = getTestArr(2000000);
	vector<int> arr2(arr1);
	vector<int> arr3(arr1);
	vector<int> arr4(arr1);

	clock_t a = clock();
	quickSort(arr2, 0, arr2.size() - 1);
	clock_t b = clock();
	printf("quick sort: cost %f s\n", (double)(b - a) / CLOCKS_PER_SEC);

	clock_t a1 = clock();
	parallelQuickSort(ref(arr3), 0, arr3.size() - 1);
	clock_t b1 = clock();
	cout << "arr2==arr3 is " << (checkEq(arr2, arr3) ? 1 : -1) << endl;
	printf("parallel quick sort: cost %f s\n", (double)(b1 - a1) / CLOCKS_PER_SEC);

	//cout << std::this_thread::get_id() << endl;
	threadPoolQS(ref(arr4));

	//cout << "arr1==arr2 is " << (checkEq(arr1, arr2) ? 1 : -1) << endl;
	cout << "arr4==arr3 is " << (checkEq(arr4, arr3) ? 1 : -1) << endl;
	system("pause");
	return 1;

}