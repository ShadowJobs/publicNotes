// c+lua.cpp : �������̨Ӧ�ó������ڵ㡣
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
	lua_getglobal(L, "add");//��add.lua��ȥ��add����������Ҳ�������lua_call�����ҵ����ҵ��ķ�ʽ���ȼ����⣬��ֱ��ִֹͣ�У�����û���κδ�������һ��sum=...Ҳ��ִ��
	/*the first argument*/
	lua_pushnumber(L, x);
	/*the second argument*/
	lua_pushnumber(L, y);
	/*call the function with 2 arguments, return 1 result.*/
	int st = lua_pcall(L, 2, 1, 0);//���add.luaû��add����������lua_call��ֱ�ӹң����ϣ������Ե���lua_pcall���жϵ����Ƿ�ɹ�
	if (st != 0)
	{
		printf("error=%s\n", lua_tostring(L, -1));//lua_tostring �ܹ�ֱ��������һ��lua������Ϣ
		printf("error=%s\n", lua_tostring(L, -1));//lua_tostring �ܹ�ֱ��������һ��lua������Ϣ
		//lua_pop(L, 1);//�����������ȡ��������Ϣ���ֱ��ɾ��֮,��Ȼlua_tostring(L, -2)��ȡ����һ�ε��õĴ�����Ϣ��
		//printf("error=%s\n", lua_tostring(L, -1));//lua_tostring �ܹ�ֱ��������һ��lua������Ϣ�������Ѿ������ˣ��������Ϊnull
	}
	lua_settop(L, 0);//��ջ��ָ���Ƶ�ջ�ף������������ջ
	lua_getglobal(L, "add"); lua_pushnumber(L, x); lua_pushnumber(L, y);
	st = lua_pcall(L, 2, 1, 0);//�������pcall�Ͳ��ǵ���add�ˣ�Ҫ��������ã�������������һ�飺lua_getglobal(L, "add");lua_pushnumber(L, x);lua_pushnumber(L, y);��������ã����õ�λ�þͲ�ȷ��
	if (st != 0)
	{
		printf("error=%s\n", lua_tostring(L, -2));//lua_tostring �ܹ�ֱ��������һ��lua������Ϣ����Ϊ�ϴ�û����������-2��ȡ����һ�α�����Ϣ
		printf("error=%s\n", lua_tostring(L, -1));//lua_tostring �ܹ�ֱ��������һ��lua������Ϣ
		lua_pop(L, 1);//��������ȡ��������Ϣ���ֱ��ɾ��֮
		printf("error=%s\n", lua_tostring(L, -1));//lua_tostring �ܹ�ֱ��������һ��lua������Ϣ�������Ѿ������ˣ��������Ϊnull
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

