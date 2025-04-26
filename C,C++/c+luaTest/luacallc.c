#include "lua.h"
extern lua_State * L;
static int ot(lua_State* ll)
{
	lua_Number x=lua_tonumber(ll, -1);
	lua_Number y = lua_tonumber(ll, -2);
	lua_pushnumber(ll, x * y);
	return 1;
}
void registgg()
{
	lua_settop(L, 0);
	printf("stackLen=%d", lua_gettop(L));
	lua_pushcfunction(L, ot);//定义给lua调用的c函数
	lua_setglobal(L, "mult");//lua中的名字 mult会调用ot/////////////注册给lua
	lua_pushstring(L, "5*6=");//定义给lua的字符串
	lua_setglobal(L, "aa");//lua中的aa="5*6="
	//lua_setglobal(L, "ab");//如果不先设定一个值（如调用lua_pushstring），则这个值ab会是不确定的栈顶值。
	printf("stackLen=%d", lua_gettop(L)); //由于调用了lua_setglobal，所以这里的长度为0，如果没掉，则为2
	printf("stackLen=%d", lua_gettop(L));
}