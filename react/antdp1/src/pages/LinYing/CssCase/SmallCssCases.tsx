import { Col, Row } from "antd"
import "./small-css.css"
const SmallCssCases: React.FC = () => {
  return <div>
    <Row>
      <Col span={12}>
    <div>
    {/* 方法1，textShadow 文字描边css */}
    <div style={{ color: "blue", fontSize: 40, textShadow: "0 0 3px red,0 0 3px red,0 0 3px red,0 0 3px red" }}>文字描边1</div>
    {/* 方法2 webkitTextStroke 文字描边css */}
    <div style={{ color: "blue", fontWeight: "bold", fontSize: 40, WebkitTextStroke: "1px red" }}>文字描边2</div>
    <div style={{ color: "blue", fontSize: 40, filter: "blur(3px)" }}>文字模糊</div>
    <div style={{ color: "blue", fontSize: 40, filter: "grayscale(1)" }}>文字灰度</div>
    <div style={{ color: "blue", fontSize: 40, filter: "sepia(1)" }}>文字褐色</div>
    <div style={{ color: "blue", fontSize: 40, filter: "invert(1)" }}>文字反色</div>
    <div style={{ color: "blue", fontSize: 40, filter: "opacity(0.5)" }}>文字透明度</div>
    <div style={{ color: "blue", fontSize: 40, filter: "contrast(200%)" }}>文字对比度</div>
    <div style={{ color: "blue", fontSize: 40, filter: "brightness(200%)" }}>文字亮度</div>
    </div>
    <div>
      <div>w3c<a href="https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Building_blocks/Cascade_and_inheritance">官网</a>css权重示例</div>
      <div>标签权重1，类10，ID 100{" 标签内定义的<div style=....>的权重1000"}</div>
      <div id="outer" className="container xd">
        <div id="inner" className="container">
          <ul>
            <li className="nav"><a href="#">One</a></li>
            <li className="nav"><a href="#">Two</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div>
      <p style={{color:"white"}}>测试块</p>
    </div>
    </Col>
    <Col span={12}>
      height+margin和line-height的区别
      <div className="test-line-height">lineHeight单行</div>
      <div className="test-height">height单行</div>
      {/* 测试块 */}
      <div className="test-line-height">lineHeight多行多行多行多行多行多行多行</div>
      <div className="test-height">height多行多行多行多行多行多行多行多行多行行多行多行多行多行多行行多行多行多行多行多行</div>

    </Col>
  </Row>
  </div>
}
export default SmallCssCases