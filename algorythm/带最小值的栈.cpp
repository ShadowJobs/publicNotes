#include <iostream>
#include <vector>

#include <stack>
using namespace std;
class MinStack {
public:
	MinStack() {
		// do intialization if necessary
	}

	stack<int> a1;
	stack<int> a2;
	/*
	* @param number: An integer
	* @return: nothing
	*/
	void push(int number) {
		// write your code here
		a1.push(number);
		if (a2.empty()) a2.push(number);
		else
		{
			if (a2.top()>=number)
				a2.push(number);
		}
	}

	/*
	* @return: An integer
	*/
	int pop() {
		// write your code here

		int peek = a1.top();
		a1.pop();
		if (a1.empty()){
			a2.pop();
			return peek;
		}
		if (peek==a2.top())
			a2.pop();
		cout << peek << " ";
		return peek;
	}

	/*
	* @return: An integer
	*/
	int min() {
		// write your code here
		cout << a2.top() << " ";
		return a2.top();
	}
};
int main(){
	MinStack x;

	/**1
	x.push(1);
	x.push(1);
	x.push(2);
	x.push(2);
	x.pop();
	x.push(1);
	x.pop();
	x.min();
	x.push(0);
	x.min();
	x.min();
	x.min();
*/

	
	x.push(3);
	x.push(2);
	x.push(1);
	x.min();
	x.pop();
		x.min();
		x.pop();
		x.min();

	
	/**2
	x.push(-1);
	x.push(-2);
	x.min();
	x.pop();
	x.push(-3);
	x.push(3);
	x.push(2);
	x.pop();
	x.pop();
	x.pop();
	x.pop();
	x.push(400);
	x.push(3);
	x.push(200);
	x.push(1);
	x.min();
	x.pop();
	x.min();
	*/
	system("pause");
	return 1;
	
}