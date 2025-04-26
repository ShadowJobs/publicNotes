import { Button, Select } from "antd";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useModel } from "umi";
import io from 'socket.io-client';
import { VideoChartUrl } from '@/global';
;
const RtcWebApiVideoChat = ({ }) => {
  const { initialState } = useModel("@@initialState")
  const socketRef = useRef();
  const userVideo = useRef();
  const otherVideo = useRef();
  const [targetUser, setTargetUser] = useState()
  const st = useRef()
  const [onlienUsers, setOnlineUsers] = useState<{ user: string, time: string }[]>([])
  const [callState,setCallState]=useState<'calling'|'talking'|'idle'>('idle')
  const [callMeUsers,setCallMeUsers]=useState<{name:string,time:string}[]>([])
  const rtc=useRef()
  const myInfo=useRef()
  
  const openCamera = async() => {
    if (!st.current){
      const stream=await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      st.current = stream
      userVideo.current!.srcObject = stream;
      userVideo.current!.play();
    }
    return st.current
  }
  const startSocket = () => {
    console.log("create socket")
    let socket = io.connect(`${VideoChartUrl}/`, {
      reconnection: true,        // 是否允许自动重连
      reconnectionAttempts: 5    // 最大重连尝试次数
    });
    socketRef.current = socket
    socket.on("connect", (e) => {
      console.log("connect")
      console.log(socket.id)
      console.log(e)
      socket.emit("login_video_ws", { name: initialState?.currentUser?.name });
    })
    socket.on("reconnect", (attemptNumber) => {
      console.log("reconnect", attemptNumber)
      socket.emit("reconnect", { preId: socket.id });
    })
    socket.on("your_info",info=>{
      console.log("your_info",info)
      myInfo.current=(info)
    })
    socket.on("online_users", users => setOnlineUsers(users.filter(v=>v.name!=initialState?.currentUser?.name)))

    // 1v1聊天部分
    socket.on('1v1_recv_msgs',async (payload)=>{
      if(payload.type=="call"){
        setCallMeUsers(users=>{
          if(users.find(user=>user.name==payload.from.name))return users
          return [...users,payload.from]
        })
      }else if(payload.type=="reject"){
        setCallMeUsers(users=>users.filter(user=>user.name!=payload.from.name))
      }else if(payload.type=='accept'){
        setCallState('talking')
        // 交换sdp，编解码支持信息等
        rtc.current=new RTCPeerConnection({
          iceServers: [
              {
                  urls: 'stun:stun.l.google.com:19302'
              }
          ]
        })
        rtc.current.onicecandidateerror=(e)=>{
          console.log(e)
        }
        const stream=await openCamera() //这里虽然useEffect里已经openCamera了，但是这里还是要再open一次，否则还是会报错st.current is null
        rtc.current.addStream(stream)

        // safari不支持addStream，要用addTrack
        // stream.getTracks().forEach(track => rtc.current.addTrack(track, stream));

        // rtc.current.ontrack=e=>{
        //   if(!otherVideo.current.srcObject)
        //   {
        //     otherVideo.current.srcObject=e.streams[0]
        //     console.log(e.streams[0].getVideoTracks())
        //     otherVideo.current.play()
        //   }
        // }
        rtc.current.onicecandidate=(e)=>{
          if(e.candidate){
            socket.emit('1v1_send_msgs',{from:myInfo.current,to:payload.from,type:'ice',data:e.candidate})
          }
        }
        // 生成offer
        const offer= await rtc.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })
        await rtc.current.setLocalDescription(offer)
        socket.emit('1v1_send_msgs',{from:myInfo.current,to:payload.from,type:'offer',data:offer})

        rtc.current.onaddstream = (event: any) => {  
          setCallState('talking')
          // 拿到对方的视频流
          otherVideo.current.srcObject = event.stream;
          otherVideo.current!.play()
        };
      }else if(payload.type=='offer'){
        // 这里是接收方，所以还没有rtc，要先创建
        rtc.current=new RTCPeerConnection({
          iceServers: [
              {
                  urls: 'stun:stun.l.google.com:19302'
              }
          ]
        })

        rtc.current.onicecandidateerror=(e)=>{
          console.log(e)
        }
        const stream=await openCamera()
        rtc.current.addStream(stream)
        // stream.getTracks().forEach(track => rtc.current.addTrack(track, stream));
        rtc.current.onicecandidate = (e: any) => {
          if (e.candidate) {          
            // 向服务器发送candidate信息
            socket.emit('1v1_send_msgs',{from:myInfo.current,to:payload.from,type:'ice',data:e.candidate})
          }
        }

        rtc.current.onaddstream = (event: any) => {  
          setCallState('talking')
          // 拿到对方的视频流
          otherVideo.current.srcObject = event.stream;
          otherVideo.current!.play()
        };
        await rtc.current.setRemoteDescription(payload.data)
        
        // 生成answer 
        const answer=await rtc.current.createAnswer()
        await rtc.current.setLocalDescription(answer)
        socket.emit('1v1_send_msgs',{from:myInfo.current,to:payload.from,type:'answer',data:answer})
      }else if(payload.type=='answer'){
        await rtc.current.setRemoteDescription(payload.data)
        // 交换ice
      }else if(payload.type=='ice'){
       await rtc.current.addIceCandidate(payload.data)
      }
    })
  }
  useEffect(() => {
    startSocket()
    return () => {
      socketRef.current.disconnect()
      st.current?.getTracks().forEach(track => track.stop())
    }
  }, []);
  return <div>
    <div>目前仅支持同一个局域网内通话，暂未做safari浏览器支持，跨局域网视频需要买stun/turn服务，不去花那钱了</div>
    <div style={{display:"flex"}}>
      <video playsInline muted ref={userVideo} autoPlay style={{ flex:1 }} />
      <video playsInline muted ref={otherVideo} autoPlay style={{ flex:1 }} />
    </div>
    <br />
    选择呼叫的用户（一个浏览器只能登录一个用户）：<Select options={onlienUsers.map(user => ({ label: user.name, value: user.name }))} value={targetUser}
      style={{ width: 200 }}
      onChange={(user) => {setTargetUser(user)}} 
    />
    <br/>
    {callState=="idle" && <Button disabled={!targetUser} onClick={()=>{
      socketRef.current.emit("1v1_send_msgs", { from: myInfo.current,to:onlienUsers.find(v=>v.name==targetUser),type:"call" });
      setCallState("calling")
      openCamera()
    }}>呼叫</Button>}
    {callState=='calling' && <Button onClick={()=>{
    }}>取消</Button>}
    {callState=='talking' && <Button onClick={()=>{
      
    }}>挂断</Button>}
    {callState=='idle' && callMeUsers.map((user) => <div key={user.name} >
      {user.name}--{moment(user.time).format("YYYY-MM-DD HH:mm:ss")}
      <Button onClick={()=>{
        socketRef.current.emit("1v1_send_msgs", { from: myInfo.current,to:user,type:"accept" });
      }}>接受</Button>
      <Button onClick={()=>{
        socketRef.current.emit("1v1_send_msgs", { from: myInfo.current,to:user,type:"reject" });
      }}>拒绝</Button>
    </div>)}
  </div>
}

export default RtcWebApiVideoChat