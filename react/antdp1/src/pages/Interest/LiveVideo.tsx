import React, { useEffect, useRef, useState } from 'react';
import { Button, } from 'antd';

const LiveVideo = () => {
  const _stream=useRef()
  useEffect(()=>{
    return () => {
      _stream.current?.getTracks().forEach(track => track.stop())
    }
  }, []);
  return <div style={{display:"grid",placeItems:"center"}}>
    待开发
    <Button onClick={()=>{
      navigator.mediaDevices.getUserMedia({ video: true })  
      .then(stream => {  
        const video = document.getElementById('video');  
        video.srcObject = stream;  
        _stream.current=(stream)
        video.play();  
      })  
      .catch(err => { console.log(err); });  
    }}>开启摄像头</Button>
    <video id="video" autoplay></video>  
  </div>
}
export default LiveVideo;
