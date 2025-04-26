const socketIo = require('socket.io');
const express = require('express');

const app = express();
// const server = http.createServer(app);

// 带证书的写法
// const privateKey = fs.readFileSync('./path_to_your_key/key.pem', 'utf8');
// const certificate = fs.readFileSync('./path_to_your_cert/certificate.pem', 'utf8');
// const credentials = { key: privateKey, cert: certificate };
// const server = https.createServer(credentials)



const startPeerServer=()=>{
  const port=39001 //ssl通过nginx添加39000，再转发到这个端口
  const server=app.listen(port,(data)=>{
    console.log("start listen video chat ,port"+port); //每次修改本文件后，log都会自动输出
    console.log(data)
  })
  
  const io = socketIo(server,{
    cors:{ //这里必须单独再加一层cors，app的cors对本层不生效
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  });
  let onlineUsers = [];
  let rooms = {}
  const sockets={}
  // io.of('/my-namespace').on('connection')，那么它就不等同于io.sockets.on('connection')，因为后者只监听默认的"/"命名空间。
  io.on('connection', socket => {
    let curWsUser;
    socket.emit("rooms", rooms) //给自己发,当前以后的房间数
    socket.on("login_video_ws", user => {
      // 有可能是重连，或者页面刷新
      if (onlineUsers.find(u => u.name === user.name)) {
        curWsUser=onlineUsers.find(u => u.name === user.name)
        curWsUser.time=new Date().toLocaleString()
        curWsUser.sid=socket.id
        sockets[curWsUser.name]=socket
        return;
      }
      curWsUser={name:user.name,time:new Date().toLocaleString(),sid:socket.id}
      sockets[curWsUser.name]=socket
      onlineUsers.push(curWsUser)
      socket.emit("your_info", curWsUser)
      // 告诉前端，登录视频频道成功，这一步先省略了
      socket.emit("online_users", onlineUsers) //给自己发,当前已经在线的用户
      socket.broadcast.emit("online_users", onlineUsers);//给其他人发
    })
    let roomId;
    socket.on("create_room", info => {
      let currentRoom=onlineUsers.find(u=>u.name===curWsUser.name && u.roomName)
      if(currentRoom){
        socket.emit("is_in_room", currentRoom);
        return;
      }
      // io.sockets.adapter.rooms[info.roomName] //获取我的房间
      // 
      socket.join(info.roomName)
      roomId = Math.random().toString(36).slice(-8);
      let room={
        id:roomId,
        owner:curWsUser.name,
        createTime:new Date().toLocaleString(),
        name:info.roomName,
        allUsers:[{sid:socket.id,name:curWsUser.name}]
      }
      rooms[roomId] = room
      socket.emit("room_created", room);
      socket.broadcast.emit("room_created", room);//给其他人发
      let u=onlineUsers.find(u=>u.name===curWsUser.name)
      u.roomName=info.roomName
      u.roomId=roomId
    })
    socket.on("me_join_room", info => {
      // 我加入了一个room，需要给其他人发消息
      roomId = info.room.id;
      if(!rooms[roomId]) return //只做简单的判断，不考虑房间解散
      const length = rooms[roomId].allUsers.length;
      if(length === 4){
          socket.emit("room full");
          return;
      }
      rooms[roomId].allUsers.push({sid:socket.id,name:curWsUser.name});
      socket.join(info.room.name);//可以同时加入多个频道
      // const otherUsers = rooms[roomId].allUsers.filter(su => su.sid !== socket.id);
      // if(otherUsers) {
      //   socket.emit("all users", otherUsers);//给自己发
      //   otherUsers.forEach(su => {
      //     socket.to(su.sid).emit("user joined", {sid:socket.id,user:curWsUser.name});//给其他room发
      //   });
      // }
      let u=onlineUsers.find(u=>u.name===curWsUser.name)
      u.roomName=info.room.name
      u.roomId=roomId
      console.log(`user ${curWsUser.name} joined room ${roomId}, roomname ${info.room.name}`)
      socket.emit("all_room_users", rooms[roomId].allUsers);//告诉自己当前房间的所有人
      io.to(info.room.name).emit("user_joined_room", {sid:socket.id,user:curWsUser.name});//给其他人发,告诉其他人新用户加入了

    });
    socket.on("host_signal", payload => {
      // io.to(payload.roomName).emit("user joined", { sid: socket.id, user: payload.userToSignal.user, signalData: payload.signal });
    });
  
    socket.on("other_join_signal", payload => {
      io.to(payload.roomName).emit("user_join_with_signal", { sid: payload.sid, signalData: payload.signal,roomName:payload.roomName });
    });
  
    socket.on("returning signal", payload => {
      io.to(payload.userToSignal).emit("returning signal", payload);
    });
  
    socket.on("ice-candidate", incoming => {
      io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });
    socket.on("leave", () => {
      // socket.leave(roomId);
    })




    // 1对1视频消息，纯转发
    socket.on("1v1_send_msgs", (data) => {
      console.log("1v1_send_msgs",data)
      sockets[data.to?.name].emit("1v1_recv_msgs", {from:data.from,type:data.type,data:data.data})
    })
    
    
    
    socket.on("disconnect", (e) => {
      if(!curWsUser) return
      console.log("user disconnected");
      let u = onlineUsers.filter(u => u.name == curWsUser.name);
      onlineUsers = onlineUsers.filter(u => u.name !== curWsUser.name);
      let roomId=u.roomId
      if(!roomId) return;
      rooms[roomId].allUsers = rooms[roomId].allUsers.filter(su => su.sid !== socket.id);
      if(rooms[roomId].allUsers.length==0){
        socket.emit("room_dismissed", rooms[roomId]);
        delete rooms[roomId];
      }else{
        socket.emit("user_disconnected", {sid:socket.id,name:curWsUser.name});
        rooms[roomId].allUsers.forEach(su => {
          socket.to(su.sid).emit("user_disconnected", {sid:socket.id,name:curWsUser.name});//给其他人发
        });
      }

    })
  });
  return io
}

module.exports=startPeerServer