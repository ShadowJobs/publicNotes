# 示例1，调用/doc/file-list, /doc/file/:filename
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "EAT Query",
    "description": "",
    "version": "v1.0.0"
  },
  "servers": [
    {
      "url": "https://shadowjobs.xyccstudio.cn"
    }
  ],
  "paths": {
    "/api-python/doc/file-list": {
      "get": {
        "description": "获取markdown文件列表",
        "operationId": "GetMdFileList",
        "parameters": [
          {
            "name": "filename",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "deprecated": false
      }
    },
    "/api-python/doc/file/{filename}": {
      "get": {
        "description": "获取指定markdown文件内容",
        "operationId": "GetMdFileContent",
        "parameters": [
          {
            "name": "filename",
            "in": "path",
            "required": true,
            "description": "markdown文件名称，例如：vite.md",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "成功获取文件内容",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string",
                      "description": "markdown文件内容"
                    }
                  }
                },
                "example": {
                  "data": "# vite与webpack的区别\n- 开发使用esbuild，快，打包使用rollup，解决兼容性问题\n- nobundle , vite不会打包，而是使用esbuild实时编译\n- 只针对webraw"
                }
              }
            }
          },
          "404": {
            "description": "文件不存在"
          }
        }
      }
    }
  }
}
```