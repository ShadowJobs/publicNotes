import { useEffect, useRef } from 'react';
import { message } from 'antd';
import { WebsocketUrl } from '@/global';
import { useModel } from 'umi';
import { Terminal } from 'xterm';

import 'xterm/css/xterm.css';

function WebSocketPage() {
  const termRef = useRef(null);
  const socketRef = useRef(null);
  const { initialState } = useModel('@@initialState');
  let inputCmd='';
  useEffect(() => {
    const term = new Terminal();

    term.open(termRef.current);
    term.write('Hello from xterm.js\r\n');
    
    socketRef.current = new WebSocket(WebsocketUrl);
    socketRef.current.onopen = () => {
      console.log('socket connected');
      socketRef.current.send(JSON.stringify({ type: 'shell-login', name: initialState?.currentUser?.name }))
    }
    socketRef.current.onmessage = (event) => {
      const messageObj = JSON.parse(event.data);
      if(messageObj.type==='error'){
        console.log(messageObj.message)
        message.error(messageObj.msg)
      }else if(messageObj.type === 'shell-output'){
        messageObj.output=messageObj.output.replace(/\n/g,'\r\n');
        term.write(messageObj.output+'\r\n');
      }else if(messageObj.type === 'shell-error'){
        term.write(messageObj.output+'\r\n');
      }
    };
    term.onData((data) => {
      term.write(data);
      inputCmd+=data;
      if(data === '\r'){
        socketRef.current.send(JSON.stringify({ type: 'shell-cmd', cmd: inputCmd.slice(0,-1) }));
        inputCmd='';
      }
    });
    return () => {
      term.dispose();
      socketRef.current.close();
    }

  }, []);

  return (<>
    <h1>Shell</h1>
    <div ref={termRef} style={{ minHeight: 200,height:"100%" }}></div>
  </>);
}

export default WebSocketPage;
