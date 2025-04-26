// c+lua.cpp : 定义控制台应用程序的入口点。
//

#include        <stdio.h>
#include        "lua.h"
#include        "lualib.h"
#include        "lauxlib.h"
#ifdef __cplusplus

#include "luacallc.c"
#endif // __cplusplus
/*the lua interpreter*/
lua_State* L;
int
luaadd(int x, int y)
{
	int sum;
	/*the function name*/
	lua_getglobal(L, "add");//到add.lua里去找add方法，如果找不到，在lua_call那里会挂掉（挂掉的方式还比价特殊，是直接停止执行，而且没有任何错，并且下一句sum=...也不执行
	/*the first argument*/
	lua_pushnumber(L, x);
	/*the second argument*/
	lua_pushnumber(L, y);
	/*call the function with 2 arguments, return 1 result.*/
	int st = lua_pcall(L, 2, 1, 0);//如果add.lua没有add方法，调用lua_call会直接挂（见上），所以调用lua_pcall能判断调用是否成功
	if (st != 0)
	{
		printf("error=%s\n", lua_tostring(L, -1));//lua_tostring 能够直接输出最后一次lua错误信息
		printf("error=%s\n", lua_tostring(L, -1));//lua_tostring 能够直接输出最后一次lua错误信息
		//lua_pop(L, 1);//最好配合这个，取出报错信息后就直接删除之,不然lua_tostring(L, -2)能取到上一次调用的错误信息。
		//printf("error=%s\n", lua_tostring(L, -1));//lua_tostring 能够直接输出最后一次lua错误信息，由于已经弹出了，所以这次为null
	}
	lua_settop(L, 0);//把栈的指针移到栈底，就是清空整个栈
	lua_getglobal(L, "add"); lua_pushnumber(L, x); lua_pushnumber(L, y);
	st = lua_pcall(L, 2, 1, 0);//主次这次pcall就不是调用add了，要想继续调用，必须重新设置一遍：lua_getglobal(L, "add");lua_pushnumber(L, x);lua_pushnumber(L, y);如果不设置，调用的位置就不确定
	if (st != 0)
	{
		printf("error=%s\n", lua_tostring(L, -2));//lua_tostring 能够直接输出最后一次lua错误信息，因为上次没弹出，所以-2能取出上一次报错信息
		printf("error=%s\n", lua_tostring(L, -1));//lua_tostring 能够直接输出最后一次lua错误信息
		lua_pop(L, 1);//配合这个，取出报错信息后就直接删除之
		printf("error=%s\n", lua_tostring(L, -1));//lua_tostring 能够直接输出最后一次lua错误信息，由于已经弹出了，所以这次为null
	}
	/*get the result.*/
	sum = (int)lua_tonumber(L, -1);
	/*cleanup the return*/
	lua_pop(L, 1);
	return sum;
}

int main(int argc, char *argv[])
{
	int sum;
	/*initialize Lua*/
	L = lua_open();
	/*load Lua base libraries*/
	luaopen_base(L);
	/*load the script*/
	//lua_pushnumber(L,)
	//luaL_dofile(L, "add.lua");
	luaopen_table(L);
	luaopen_debug(L);
	/*call the add function*/
	int ca = 2;
	if (ca == 1)
	{
		luaL_dofile(L, "add.lua");
		sum = luaadd(10, 15);
		/*print the result*/
		printf("The sum is %d \n", sum);
	}
	else{
		registgg();
		luaL_dofile(L, "a.lua");

		lua_getglobal(L, "zz");
		if (lua_isnumber(L,-1))
			printf("zz=%d\n", lua_tonumber(L, -1));
		printf("--------------");
		int i;
		int top = lua_gettop(L);
		for (i = 1; i <= top; i++) {  /* repeat for each level */
			int t = lua_type(L, i);
			printf("\n");
			switch (t) {
			case LUA_TSTRING:  /* strings */
				printf("`%s'", lua_tostring(L, i));
				break;

			case LUA_TBOOLEAN:  /* booleans */
				printf(lua_toboolean(L, i) ? "true" : "false");
				break;

			case LUA_TNUMBER:  /* numbers */
				printf("%g", lua_tonumber(L, i));
				break;

			default:  /* other values */
				printf("%s", lua_typename(L, t));
				break;

			}
			printf("  ");  /* put a separator */
		}
	}
	/*cleanup Lua*/
	lua_close(L);
	system("pause");
	return 0;
}

