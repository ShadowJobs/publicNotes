import React, { useEffect, useRef } from 'react';
import DPlayer from 'dplayer';
import { ExpressUrl, FrontendPre } from '@/global';
import { Button, Divider, Switch, message } from 'antd';

//官网：  https://dplayer.diygod.dev/zh/guide.html#special-thanks
const CacheType = "node-persist"
const VideoPlayer = ({ videos }) => {
  const playerContainerRef = useRef();
  const playerRef = useRef();
  const [vidx, setVidx] = React.useState(0);
  useEffect(() => {
    if (playerContainerRef.current) {
      const dp = new DPlayer({
        container: playerContainerRef.current,
        screenshot: true,
        // live:true,
        video: videos[vidx],
        danmaku: {
          id: 'demo',   // 比如视频的唯一标识符，用于存储和加载弹幕
          api: 'https://api.prprpr.me/dplayer/',  // 弹幕API地址
          user: 'DIYgod',
        },

      });
      playerRef.current = dp;
      dp.on('play', () => {
        message.info('play');
      })
      dp.on('fullscreen', () => {
        message.info('fullscreen');
      })
    }
  }, []);

  return <div>
    DPlayer库，缩略图，切换源，播放监听
    <br />浏览器缓存，express转发跨域(3种方式)，后端redis、node-cache内存缓存，后端本地缓存
    <div style={{ width: "80vw", height: "50vh" }} ref={playerContainerRef} />
    <Button onClick={() => { playerRef.current?.seek(4); }}>定位</Button>
    <Button onClick={() => {
      setVidx(pre => {
        let newidx = pre + 1;
        if (newidx >= videos.length) {
          newidx = 0;
        }
      });
      //方法一：使用官方接口切换，这种方式切换无法切换缩略图，
      // playerRef.current?.switchVideo(
      // {
      //     type:"auto",
      //     url: `${ExpressUrl}/proxy-ly/outer?cache=${CacheType}&url=${("https://vjs.zencdn.net/v/oceans.mp4")}`,
      //     // url: 'https://vjs.zencdn.net/v/oceans.mp4',
      //     pic: `${FrontendPre}/videos/bird.jpg`, //封面
      //     thumbnails: `${FrontendPre}/videos/bird.jpg`,
      // })

      //方法二：使用destroy方法销毁，然后重新创建
      playerRef.current?.destroy();
      playerRef.current = null;
      playerRef.current = new DPlayer({
        container: playerContainerRef.current,
        screenshot: true,
        video: videos[vidx],
      })
    }}>切换</Button>
  </div>
};

const VideoPlayerPage = () => {
  const [selfApi, setSelfApi] = React.useState(false);
  const [expInnerDivider, setExpInnerDivider] = React.useState(true);
  const [useProxy, setUseProxy] = React.useState(false);

  return <div>

    <Divider>
      使用代理
      <Switch checked={useProxy} onChange={e => setUseProxy(e)} />
    </Divider>
    {useProxy && <VideoPlayer videos={[
      {
        url: `${ExpressUrl}/proxy-ly/outer?cache=${CacheType}&url=${("http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4")}`,
        pic: `${FrontendPre}/videos/buck_bunny.jpg`, //封面
        thumbnails: `${FrontendPre}/videos/buck_bunny.jpg`,
        // 缩略图工具 https://github.com/MoePlayer/DPlayer-thumbnails
      },
      {
        url: `${ExpressUrl}/proxy-ly/outer?cache=${CacheType}&url=${("https://vjs.zencdn.net/v/oceans.mp4")}`,
        pic: `${FrontendPre}/videos/bird.jpg`, //封面
        thumbnails: `${FrontendPre}/videos/bird.jpg`,
      }
    ]} />}
    <Divider>使用自己的后端,自写分段接口<Switch checked={selfApi} onChange={e => setSelfApi(e)} /></Divider>
    {selfApi && <VideoPlayer videos={[
      {
        url: `${ExpressUrl}/proxy-ly/self/stream?vid=1`,
        pic: `${FrontendPre}/videos/buck_bunny.jpg`, //封面
        thumbnails: `${FrontendPre}/videos/buck_bunny.jpg`,
        // 缩略图工具 https://github.com/MoePlayer/DPlayer-thumbnails
      },]}
    />}
    <Divider>使用静态资源，express自带的分段功能
      <Switch checked={expInnerDivider} onChange={e => setExpInnerDivider(e)} />
    </Divider>
    {expInnerDivider && <VideoPlayer videos={[
      {
        url: `${ExpressUrl}/proxy-ly/staticv/stream?vid=1`,
        pic: `${FrontendPre}/videos/buck_bunny.jpg`, //封面
        thumbnails: `${FrontendPre}/videos/buck_bunny.jpg`,
        // 缩略图工具 https://github.com/MoePlayer/DPlayer-thumbnails
      },]}
    />}
  </div>
}
export default VideoPlayerPage;
