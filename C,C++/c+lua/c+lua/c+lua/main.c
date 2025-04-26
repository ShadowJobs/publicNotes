//
//  main.c
//  c+lua
//
//  Created by playcrab on 11/12/15.
//  Copyright (c) 2015年 playcrab. All rights reserved.
//

#include <stdio.h>
#include "lua.h"
#include "lualib.h"
#include "lauxlib.h"


int main(int argc, const char * argv[]) {
    // insert code here...
    lua_State * L=lua_open();
    luaL_openlibs(L);
    luaL_dostring(L, "local a={x=function(...)print(arg.n) print(arg[1])end} a.x(123)");
    printf("erro=%s"
           ,lua_tostring(L, -1));
    printf("Hello, World!\n");
    return 0;
}
