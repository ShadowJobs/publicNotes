import Color from 'color';
// 瀑布流布局
const Waterfall: React.FC = () => {
  function getContrastColor(bgColor) {
    if (!bgColor) {
        return '';
    }

    // 如果背景颜色包含 "#"，则从第2个字符开始获取颜色值
    bgColor = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    
    const r = parseInt(bgColor.substring(0, 2), 16); // 获取红色
    const g = parseInt(bgColor.substring(2, 4), 16); // 获取绿色
    const b = parseInt(bgColor.substring(4, 6), 16); // 获取蓝色
    
    // 计算亮度
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // 根据亮度决定文字颜色，标准设定为 128，亮度大于此值使用黑色，否则使用白色
    return (brightness > 128) ? 'black' : 'white';
}

  const randomWidthHeightColorBlock = (idx) => {
    const width = 100;//Math.floor(Math.random()*100+50)
    const height = Math.floor(Math.random() * 100 + 50)
    const color = `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`
    const hexColor=Color(color).hex()
    return <div style={{ width, height, backgroundColor: color ,display:"block",color:getContrastColor(hexColor)}}>{idx}</div>

  }
  return <div>
    <div>方法1使用column-count,竖向排列</div>
    <div style={{ width: 400, height: 400, overflow: "scroll", }}>
      <div style={{
        columnCount: 3,
        columnGap: 20,
        columnRule: "1px solid #ccc",
        padding: 20,
        color:"white"
      }}>
        {Array.from({ length: 100 }).map((v, idx) => {
          return <div key={idx}>{randomWidthHeightColorBlock(idx)}</div>
        })}
      </div>
    </div>
    <div>方法2，使用grid+masonry，真正的瀑布流，横向排列，但只少数浏览器支持</div>
    <div style={{ width: 400, height: 400, overflow: "scroll", }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gridGap: 10,
        // padding: 20,
        gridTemplateRows:"masonry",
        color:"white"
      }}>
        {Array.from({ length: 100 }).map((v, idx) => {
          return randomWidthHeightColorBlock(idx)
        })}
      </div>
    </div>
  </div>
}
export default Waterfall