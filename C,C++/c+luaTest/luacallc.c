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
	lua_pushcfunction(L, ot);//�����lua���õ�c����
	lua_setglobal(L, "mult");//lua�е����� mult�����ot/////////////ע���lua
	lua_pushstring(L, "5*6=");//�����lua���ַ���
	lua_setglobal(L, "aa");//lua�е�aa="5*6="
	//lua_setglobal(L, "ab");//��������趨һ��ֵ�������lua_pushstring���������ֵab���ǲ�ȷ����ջ��ֵ��
	printf("stackLen=%d", lua_gettop(L)); //���ڵ�����lua_setglobal����������ĳ���Ϊ0�����û������Ϊ2
	printf("stackLen=%d", lua_gettop(L));
}