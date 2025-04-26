import { useEffect, useState, useRef, Fragment } from 'react';
import { Input, Button, List, message, Tag, Select } from 'antd';
import { WebsocketUrl } from '@/global';
import { useModel } from 'umi';

function WebSocketPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const [to, setTo] = useState('all')
  const socketRef = useRef(null);
  const { initialState } = useModel('@@initialState');

  useEffect(() => {
    socketRef.current = new WebSocket(WebsocketUrl);
    socketRef.current.onopen = () => {
      console.log('socket connected');
      socketRef.current.send(JSON.stringify({ type: 'login', name: initialState?.currentUser?.name }))
    }
    socketRef.current.onmessage = (event) => {
      const messageObj = JSON.parse(event.data);
      if (messageObj.type === 'user_list') {
        // 如果是用户列表消息，更新 users 状态
        setUsers(messageObj.users);
      } else if(messageObj.type==='error'){
        console.log(messageObj.message)
        message.error(messageObj.msg)
      }else {
        const formattedMessage = `${messageObj.from}对${messageObj.to}(${messageObj.timestamp})说: ${messageObj.message}`;
        setMessages((prevMessages) => [...prevMessages, formattedMessage]);
      }
    };
    return () => {
      socketRef.current.close();
    };
  }, []);

  const handleSend = () => {
    if (socketRef.current && input) {
      const messageObj = { from: initialState?.currentUser.name, to, message: input, type: 'message' };
      socketRef.current.send(JSON.stringify(messageObj));
      setInput('');
    }
  };

  return (<>
    <h1>{initialState?.currentUser.name} 进入聊天室</h1>
    在线用户:
    {users.map((user) => <Fragment key={user.name} >
    <Tag style={{marginLeft:10}}>
      {user.gender?.toLowerCase()=="m"?
        <img style={{width:18,height:18}} src="/pics/male.svg"/>:<img style={{width:18,height:18}} src="/pics/female.svg"/>
      }
      {user.name}
    </Tag>
    </Fragment>)}
    
    <List style={{ minHeight: 200 }} dataSource={messages} renderItem={(item) => <List.Item>{item}</List.Item>} />
    <div style={{ display: "flex" }}>
      To:<Select size="small" options={[...users,{name:'all'}].map(user=>({label:user.name,value:user.name}))} value={to} onChange={setTo} style={{width:200}}/>
      Message:<Input size='small' value={input} onChange={(e) => setInput(e.target.value)} onPressEnter={handleSend} />
      <Button size='small' onClick={handleSend}>Send</Button>
    </div>
  </>);
}

export default WebSocketPage;
