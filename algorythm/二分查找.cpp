#include <iostream>
#include <vector>

#include <stack>
using namespace std;
int start = -1;
int end2 = -1;
int binarySearch(vector<int> &nums, int target) {
	// write your code here
	if (start == -1) { end2 = nums.size()-1; start = end2 / 2; }
	if (nums[start]>target)
	{
		if (start >= end2) return -1;
		end2 = start - 1;
		start = end2/ 2;
		return binarySearch(nums, target);
	}
	else if (nums[start]<target)
	{
		if (start == end2) return -1;
		if (end2 - start == 1)
		{
			if (nums[end2] == target) return end2;
			else if (nums[start] == target) return start;
			else return -1;
		}
		start += (end2 - start) / 2;

		return binarySearch(nums, target);
	}
	else
	{
		int i = start;
		while (i >0 && nums[i] == target && nums[i-1] == target) i--;
		return i;

	}
}
int main()
{
	//vector<int> a({1, 4, 4, 5, 7, 7, 8, 9, 9, 10});
	vector<int> a({ 2, 6, 8, 13, 15, 17, 17, 18, 19, 20 });
	//cout << binarySearch(a, 1);
	//cout << binarySearch(a, 4);
	//cout << binarySearch(a, 5);
	//cout << binarySearch(a, 7);
	//cout << binarySearch(a, 10);
	cout << binarySearch(a, 15);
	system("pause");
}