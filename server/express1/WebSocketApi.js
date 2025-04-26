const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const db = require("./db/mysql_con")
const MAX_CONNECTIONS = 20; // 设置你的最大连接数
const MAX_MESSAGE_SIZE = 500;
const MAX_MESSAGES_PER_SECOND = 5; // 每秒最大消息数
let connectionCount = 0;

// 通过中间件的方式，可以共用端口，将/wss-req的请求转到websocket接口,目前是用nginx做的
// app.use('/wss-req', createProxyMiddleware({
//   target: 'http://localhost:5000', 
//   ws: true,
//   router: function(req) {
//     return {
//       target: 'ws://localhost:5000',
//     };
//   },
// }));
// 但是注意要加upgrade处理
// server.on('upgrade', (request, socket, head) => {
//   const pathname = url.parse(request.url).pathname;
//   if (pathname === '/wss-req') {
//     wss.handleUpgrade(request, socket, head, function done(ws) {
//       wss.emit('connection', ws, request);
//     });
//   } else {
//     socket.destroy();
//   }
// });
function argsSafetyCheck(args) {
  // 定义非法字符和模式的列表
  const forbiddenPatterns = [
    /&/, /;/, /\|/, /&&/, />/, /</, /\*/, /`/, /\\/, /\$\(.*\)/
  ];
  for (const arg of args) {
    // 如果参数是一个选项（以"-"开头），则进一步验证
    if (arg.startsWith('-')) {
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(arg)) {
          return false; // 如果任一参数匹配到非法模式，返回false
        }
      }

      // 对参数长度进行限制
      if (arg.length > 122) {
        return false;
      }
    } else {
      // 如果参数被认为是文件或目录路径，做简单的路径合法性检查
      if (/^\.\.?($|\/)|\/\.\.?($|\/)/.test(arg)) {
        // 防止使用'.' '..' 进行目录遍历
        return false;
      }
      // 检查路径是否包含不允许的特殊字符
      if (/[&;`|*<>^]/.test(arg)) {
        return false;
      }
      // 可以增加额外的逻辑来验证路径是否在允许的目录内
    }
  }
  return true;
}
function executeCommand(command, args, ws) {
  const { exec } = require('child_process');
  try {
    exec(command + ' ' + args.join(' '), (error, stdout, stderr) => {
      if (error) {
        ws.send(JSON.stringify({ output: error.message, type: "shell-error" }));
        return;
      }
      if (stderr) {
        ws.send(JSON.stringify({ output: stderr, type: "shell-stderr" }));
        return;
      }
      ws.send(JSON.stringify({ output: stdout, type: "shell-output" }));
    });
  } catch (error) {
    ws.send(JSON.stringify({ output: error.message, type: "shell-error" }));
  }
}
function startWebsocket() {
  const clients = new Map(); // Map of userName -> WebSocket
  function broadcastUserList() {
    const userList = Array.from(clients.keys());
    if (userList.length > 0) {
      db.query('SELECT id,name,gender FROM user where name in (?)', [userList], (error, results) => {
        if (error) {
          console.log(error)
          return;
        }
        console.log(results)
        const messageObj = { type: 'user_list', users: results };
        const message = JSON.stringify(messageObj);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });
    }
  }
  function handleMessage(messageObj) {
    const timestamp = new Date().toISOString();
    const messageWithTimestamp = JSON.stringify({ ...messageObj, timestamp });
    if (messageObj.to === 'all') {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageWithTimestamp); // 发送带有时间戳的消息
        }
      });
    } else if (clients.has(messageObj.to)) {
      const client = clients.get(messageObj.to);
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageWithTimestamp);
      }
    }
  }
  wss.on('connection', (ws) => {
    if (connectionCount >= MAX_CONNECTIONS) {
      ws.send(JSON.stringify({ msg: '超出最大连接数。Too many connections.', type: "error" }));
      ws.close();
      return;
    }
    connectionCount++;
    let messageCount = 0;
    let lastResetTime = Date.now();
    let userName = null;
    ws.on('message', (message) => {
      if (message.length > MAX_MESSAGE_SIZE) {
        ws.send(JSON.stringify({ msg: 'string too long. 消息过长', type: "error" }));
        return;
      }
      const now = Date.now();
      // 如果上次重置距现在已经超过1秒，则重置计数器和时间戳
      if (now - lastResetTime >= 1000) {
        messageCount = 0;
        lastResetTime = now;
      }
      messageCount++;
      if (messageCount > MAX_MESSAGES_PER_SECOND) {
        ws.send(JSON.stringify({ msg: '超出每秒最大消息数，断开链接。Too many messages per second.', type: "error" }));
        ws.close();
        return;
      }
      const messageObj = JSON.parse(message);
      if (messageObj.type === 'login') {
        userName = messageObj.name;
        clients.set(userName, ws);
        broadcastUserList();
      } else if (messageObj.type === 'shell-cmd') {
        let cmd = messageObj.cmd;
        let baseCmd = cmd.split(" ")[0];
        const validCmds = ['cmd', 'ls', 'pwd', 'echo', 'clear', 'whoami', 'date'];
        if (!validCmds.includes(baseCmd)) {
          ws.send(JSON.stringify({ output: "No privilege Command: " + baseCmd, type: "shell-error" }));
          return;
        }

        // 确保只传递参数，而不是链式命令
        // 比如禁止 "cmd && another-cmd" 或 "cmd; another-cmd"
        const args = cmd.split(" ").slice(1).filter(arg => !arg.includes('&&') && !arg.includes(';'));

        // 安全措施：每个命令都应该指向特定的处理程序
        switch (baseCmd) {
          case 'ls':
          case 'pwd':
          case 'whoami':
          case 'date':
            executeCommand(baseCmd, args, ws);
            break;
          case 'cmd':
          case 'echo':
          case 'clear':
            // 这些命令要小心处理，确保没有危险的参数
            if (argsSafetyCheck(args)) {
              executeCommand(baseCmd, args, ws);
            } else {
              ws.send(JSON.stringify({ output: "Unsafe arguments.", type: "shell-error" }));
            }
            break;
          default:
            ws.send(JSON.stringify({ output: "Command not supported: " + baseCmd, type: "shell-error" }));
            break;
        }
      } else if (messageObj.type === 'message') {
        handleMessage(messageObj);
      }
    });

    ws.on('close', () => {
      connectionCount--;
      clients.delete(userName);
      broadcastUserList();
    });
  });

  server.listen(5005, () => {
    console.log('Listening websocket on http://localhost:5005');
  });
}
module.exports = {
  startWebsocket,
  wss
}