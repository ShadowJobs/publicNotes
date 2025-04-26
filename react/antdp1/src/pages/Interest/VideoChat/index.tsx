import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { ExpressUrl } from '@/global';
import { useModel } from 'umi';
import moment from 'moment';
import { Button, Input, Modal, Select, message } from 'antd';
import RtcWebApiVideoChat from './RtcWebApiVideoChat'; // RTC

function Video({ peer }) {
  const ref = useRef();
  useEffect(() => {
    if (peer) {
      peer.on('stream', function (stream) {
        // 将媒体流附加到'video'元素上
        if (ref.current) {
          ref.current.srcObject = stream;
        }
      });
    }
  }, [peer]);
  return <video playsInline autoPlay ref={ref} />
}

const PeerVideoChat = () => {
  const [peers, setPeers] = useState([]);
  const { initialState } = useModel("@@initialState")
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const [currentRoom, setCurrentRoom] = useState()
  const [roomName, setRoomName] = useState("myroom")
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [allRooms, setAllRooms] = useState({})
  const [mySignal, setMySignal] = useState()
  const st = useRef()
  const [onlienUsers, setOnlineUsers] = useState<{ user: string, time: string }[]>([])
  const openCamera = () => {
    if (!st.current)
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        st.current = stream
        userVideo.current.srcObject = stream;
      })
  }
  function createPeer(roomName, stream) {
    const peer = new Peer({
      initiator: true,// 如果设置为true，则这个peer会成为连接的发起者（即生成并发送offer）。如果设置为false，则这个peer将等待接收到远端peer的offer。
      trickle: false,
      stream,
    });
    // 客户端创建了peer后，将peer的信号发送给服务端，会主动生成一条signal信号，这条信号需要在下面的监听里发给服务端，服务端需要再转发给目标客户端
    peer.on("signal", signal => {
      console.log(signal);
      // socketRef.current.emit("host_signal", { roomName, signal })
      setMySignal(signal)
    })
    return peer;
  }

  function addPeer(roomName, sid, stream, signalData) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });
    peer.on("signal", signal => {
      // 建立了peer，得到signal后，将signal发送给服务端，服务端需要再转发给目标客户端
      socketRef.current.emit("other_join_signal", { roomName, sid, signal })
    })
    peer.signal(signalData)
    return peer;
  }
  const startSocket = () => {
    let socket = io.connect(`${ExpressUrl}/`, {
      reconnection: true,        // 是否允许自动重连
      reconnectionAttempts: 5    // 最大重连尝试次数
    });
    socketRef.current = socket
    socket.emit("login_video_ws", { name: initialState?.currentUser?.name });

    socket.on("connect", () => {
      console.log("connect")
      socket.emit("login_video_ws", { name: initialState?.currentUser?.name });
    })
    socket.on("reconnect", (attemptNumber) => {
      console.log("reconnect", attemptNumber)
      socket.emit("reconnect", { preId: socket.id });
    })

    socket.on("rooms", rooms => setAllRooms(rooms))
    socket.on("online_users", users => setOnlineUsers(users.filter(v=>v.name!=initialState?.currentUser?.name)))
    socket.on("room_created", (room) => {
      if (room.owner == initialState?.currentUser?.name) {
        setCurrentRoom(room)
        createPeer(room.name, st.current);
      }
      setAllRooms(allRooms => ({ ...allRooms, [room.id]: room }))
    })
    socket.on("is_in_room", (room) => { message.error("已经在房间" + room.roomName + "中") })

    socket.on("all_room_users", users => {
      // 我加入别人的room后，收到的消息，此时开始建立自己的peers
      const peers = [];
      users.filter(v => v.name != initialState?.currentUser?.name).forEach(user => {
        // const peer = createPeer(user, socket.id, stream);
        const peer = addPeer(currentRoom.name, user.sid, st.current, mySignal);
        peersRef.current.push({
          peerID: user.sid,
          peer,
        })
        peers.push(peer);
      })
      setPeers(peers);
    })

    socket.on("user_join_with_signal", payload => {
      const peer = addPeer(payload.roomName, payload.sid, payload.signalData);
      peersRef.current.push({
        peerID: payload.sid,
        peer,
      });
      setPeers(peers => [...peers, peer]);
    })
    socket.on("user joined", payload => {
      // 有别人加入我所在的room，也要加peer
      const peer = addPeer(payload.signalData, payload.sid, st.current);
      peersRef.current.push({
        peerID: payload.sid,
        peer,
      });
      setPeers(users => [...users, peer]);
    });

    socket.on("receiving returned signal", payload => {
      const item = peersRef.current.find(p => p.peerID === payload.id);
      item.peer.signal(payload.signal);
    });
  }
  useEffect(() => {
    startSocket()
    return () => {
      socketRef.current.disconnect()
      st.current?.getTracks().forEach(track => track.stop())
    }
  }, []);


  return (
    <div>
      <Modal title="创建房间" open={openCreateModal} onCancel={() => setOpenCreateModal(false)} onOk={() => {
        if (!!roomName) {
          socketRef.current.emit("create_room", { roomName });
          setOpenCreateModal(false)
          openCamera()
        }
      }}>
        <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} />
      </Modal>
      <video playsInline muted ref={userVideo} autoPlay style={{ width: 50, height: 50 }} />
      <br />
      onlineUsers:
      {onlienUsers.map((user) => <div key={user.user} >
        {user.user}--{moment(user.time).format("YYYY-MM-DD HH:mm:ss")}
      </div>)}
      <br />
      <Button onClick={() => { setOpenCreateModal(true) }}>创建房间</Button>
      <Select options={Object.keys(allRooms || {}).map(roomId => ({ label: allRooms[roomId].name, value: allRooms[roomId] }))} value={currentRoom}
        style={{ width: 200 }}
        onChange={(room) => {
          setCurrentRoom(room)
          openCamera()
          socketRef.current.emit("me_join_room", { name: initialState?.currentUser?.name, room });
        }} />
      {peers.map((peer, index) => {
        return (
          <Video key={index} peer={peer} />
        );
      })}
    </div>
  );
};

const VideoChat = () => {
  const [type, setType] = useState("rtc")
  return (
    <div>
      <Select disabled value={type} onChange={(value) => setType(value)}>
        <Select.Option value="rtc">RTC</Select.Option>
        <Select.Option value="peer">Peer</Select.Option>
      </Select>
      {type == "rtc" ? <RtcWebApiVideoChat /> : <PeerVideoChat />}
    </div>
  );
}

export default VideoChat;
