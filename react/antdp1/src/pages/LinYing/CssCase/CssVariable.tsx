import { Button, Divider, Input, InputNumber, Select, Switch } from "antd";
import "./css-variable.css"
import React, { useEffect, useRef, useState } from "react";
import { generateRandomWords } from "@/utils";
import autoAnimate from "@formkit/auto-animate";

const PString = "Tacos actually microdosing, pour-over semiotics banjo chicharrones retro fanny pack portland everyday carry vinyl typewriter. "
const PString2 = "Cray food truck brunch, XOXO +1 keffiyeh pickled chambray waistcoat ennui. Organic small batch paleo 8-bit. Intelligentsia umami wayfarers pickled, asymmetrical kombucha letterpress kitsch leggings cold-pressed squid chartreuse put a bird on it. Listicle pickled man bun cornhole heirloom art party."
const ResizableLayout = () => {
  const [widths, setWidths] = useState(["calc((100% - 36px) / 3)", "calc((100% - 36px) / 3)", "calc((100% - 36px) / 3)"]);
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthsRef = useRef([]);

  const handleMouseDown = (index, event) => {
    startXRef.current = event.clientX;
    startWidthsRef.current = [...widths];
    const onMouseMove = (e) => handleMouseMove(index, e);
    const onMouseUp = () => handleMouseUp(onMouseMove, onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleMouseMove = (index, event) => {
    const dx = event.clientX - startXRef.current;
    const containerWidth = containerRef.current.offsetWidth - 54; // 减去3个18px的分隔栏宽度
    let newWidths = [...startWidthsRef.current];

    let deltaPercent = (dx / containerWidth) * 100;
    newWidths[index] = parseFloat(newWidths[index]) + deltaPercent + "%";
    newWidths[index+1] = parseFloat(newWidths[index+1]) - deltaPercent + "%";
    setWidths(newWidths);
  };

  const handleMouseUp = (onMouseMove, onMouseUp) => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  useEffect(() => {
    if(containerRef.current){
      const containerW = containerRef.current.offsetWidth;
      let oneW=((containerW-36)/3)/containerW*100+"%";
      setWidths([oneW,oneW,oneW]);
    }
  }, [containerRef.current]);
  return (
    <div className="container" ref={containerRef}>
      <div className="code-input" style={{ width: widths[0] }}>HTML{PString}</div>
      <div className="resizer" onMouseDown={(e) => handleMouseDown(0, e)} />
      <div className="code-input" style={{ width: widths[1] }}>CSS{PString}</div>
      <div className="resizer" onMouseDown={(e) => handleMouseDown(1, e)} />
      <div className="code-input" style={{ width: widths[2] }}>JS{PString2}</div>
    </div>
  );
};
const JustifyContentTest: React.FC<{}> = ({ }) => {
  const [justifyContent, setJustifyContent] = useState("flex-start")
  return <div className="gray-border">
    <Divider>调整justify-content主轴对齐，横向分布</Divider>
    <div>
      <Select style={{ width: 200 }} value={justifyContent} options={
        ["flex-start", "flex-end", "center", "space-between", "space-around"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setJustifyContent(v)}
      />
    </div>
    <div className="flex-layout" style={{ justifyContent }}>
      <div style={{ backgroundColor: "lightblue", }}>不设置width，则仅根据文字宽度来布局，左右布局</div>
      <div style={{ backgroundColor: "lightgreen" }}>b</div>
      <div style={{ backgroundColor: "lightyellow" }}>b</div>
    </div>
  </div>
}
const WidthTest: React.FC<{}> = ({ }) => {
  const [flex, setFlex] = useState([20, 20, 20])
  return <div className="gray-border">
    <Divider>调整flex值，横向比例</Divider>
    <div>
      <InputNumber style={{ width: 100 }} value={flex[0]} onChange={(v) => setFlex([v, flex[1], flex[2]])} />
      <InputNumber style={{ width: 100 }} value={flex[1]} onChange={(v) => setFlex([flex[0], v, flex[2]])} />
      <InputNumber style={{ width: 100 }} value={flex[2]} onChange={(v) => setFlex([flex[0], flex[1], v])} />
    </div>
    <div className="flex-layout" >
      <div style={{ backgroundColor: "lightblue", flex: flex[0] }}></div>
      <div style={{ backgroundColor: "lightgreen", flex: flex[1] }}>b</div>
      <div style={{ backgroundColor: "lightyellow", flex: flex[2] }}>b</div>
    </div>
  </div>
}

const OrderAndTextTest: React.FC<{}> = ({ }) => {
  const [textAlign, setTextAlign] = useState("left")
  const [lineHeight, setLineHeight] = useState(1)
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [wordSpacing, setWordSpacing] = useState(0)
  const [textDecoration, setTextDecoration] = useState("none")
  const [textTransform, setTextTransform] = useState("none")
  const cssAttrs = { textAlign, lineHeight, letterSpacing, wordSpacing, textDecoration, textTransform, flex: 1 }
  return <div className="gray-border">
    <Divider>测试order，text-align，line-height,letter-spacing,word-spacing,text-decoration,text-transform,white-space,text-indent</Divider>
    <div>
      textAlign：<Select style={{ width: 200 }} value={textAlign} options={
        ["left", "right", "center", "justify"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setTextAlign(v)}
      />
      lineHeight：<InputNumber style={{ width: 100 }} value={lineHeight} onChange={(v) => setLineHeight(v)} />
      letterSpacing：<InputNumber style={{ width: 100 }} value={letterSpacing} onChange={(v) => setLetterSpacing(v)} />
      wordSpacing：<InputNumber style={{ width: 100 }} value={wordSpacing} onChange={(v) => setWordSpacing(v)} />
      textDecoration：<Select style={{ width: 200 }} value={textDecoration} options={
        ["none", "underline", "overline", "line-through"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setTextDecoration(v)}
      />
      textTransform：<Select style={{ width: 200 }} value={textTransform} options={
        ["none", "capitalize", "uppercase", "lowercase"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setTextTransform(v)}
      />
    </div>
    <div className="flex-layout order">
      <div style={{ backgroundColor: "lightblue", order: 1, ...cssAttrs }}>a,order排序，b被放到了前面 a，c在b之后</div>

      <div style={{ backgroundColor: "lightgreen", order: 0, ...cssAttrs }}>b，虽然b的order是0,但是nth-child和first-child都是选的a，css不会改变html顺序</div>
      <div style={{ backgroundColor: "lightgreen", order: 2, ...cssAttrs }}>c word word</div>
    </div>
  </div>
}
const ParagraphTextTest: React.FC<{}> = ({ }) => {
  const [whiteSpace, setWhiteSpace] = useState("normal")
  const [verticalAlign, setVerticalAlign] = useState("baseline")
  const [wordBreak, setWordBreak] = useState("normal")
  const [wordWrap, setWordWrap] = useState("normal")
  const [overflow, setOverflow] = useState("visible")
  const [textOverflow, setTextOverflow] = useState("clip")
  const [textIndent, setTextIndent] = useState(0)

  const cssAttrs = { whiteSpace, textIndent, flex: 1, verticalAlign, wordBreak, wordWrap, overflow, textOverflow }
  return <div className="gray-border">
    <Divider>测试white-space,vertical-align,word-break,word-wrap,overflow,text-overflow</Divider>
    <div>

      whiteSpace：<Select style={{ width: 200 }} value={whiteSpace} options={
        ["normal", "nowrap", "pre", "pre-wrap", "pre-line"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setWhiteSpace(v)}
      />
      verticalAlign：<Select style={{ width: 200 }} value={verticalAlign} options={
        ["baseline", "sub", "super", "text-top", "text-bottom", "middle", "top", "bottom"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setVerticalAlign(v)}
      />
      wordBreak所有行都断词：<Select style={{ width: 200 }} value={wordBreak} options={
        ["normal", "break-all", "keep-all", "break-word"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setWordBreak(v)}
      />
      wordWrap仅检测最后一行(影响盒子大小)：<Select style={{ width: 200 }} value={wordWrap} options={
        ["normal", "break-word"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setWordWrap(v)}
      />
      overflow：<Select style={{ width: 200 }} value={overflow} options={
        ["visible", "hidden", "scroll", "auto"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setOverflow(v)}
      />
      textOverflow：<Select style={{ width: 200 }} value={textOverflow} options={
        ["clip", "ellipsis"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setTextOverflow(v)}
      />
      textIndent缩进：<InputNumber style={{ width: 100 }} value={textIndent} onChange={(v) => setTextIndent(v)} />
      {/* 调整弹性布局的flex属性，看看wordBreak的效果
      <Button onClick={() => {
        document.documentElement.style.setProperty('--third-color', 'blue');
      }}>修改</Button> */}

    </div>
    <div className="flex-layout">
      <div style={{ backgroundColor: "lightblue", ...cssAttrs, width: "30%" }}>直接调整wordBreak，会因为flex弹性布局，而导致第一段里的长单词自动撑大flexItem，所以要先调整flex的弹性
        {PString}{Array.from({ length: 150 }).map(v => 'a').join("")}</div>

      <div style={{ backgroundColor: "lightgreen", ...cssAttrs }}>b<span style={{fontSize:24,...cssAttrs}}>bbb</span></div>
      <div style={{ backgroundColor: "gray", ...cssAttrs }}>c word word</div>
    </div>
  </div>
}
const AlignItemsTest: React.FC<{}> = ({ }) => {
  const [alignItems, setAlignItems] = useState("flex-start")
  const [alignSelf, setAlignSelf] = useState("")
  return <div className="gray-border">
    <Divider>调整align-items交叉轴对齐，纵向对齐</Divider>
    <div>
      整体align<Select style={{ width: 200 }} value={alignItems} options={
        ["flex-start", "flex-end", "center", "baseline", "stretch"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setAlignItems(v)}
      />
      单独调整第一个<Select style={{ width: 200 }} value={alignSelf} options={
        ["flex-start", "flex-end", "center", "baseline", "stretch"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setAlignSelf(v)}
      />
    </div>
    <div className="flex-layout" style={{ alignItems }}>
      <p style={{ flex: 1, alignSelf }}>{PString}</p>
      <p style={{ flex: 1 }}>{PString}</p>
      <p style={{ flex: 1 }}>{PString}</p>
      <p style={{ flex: 1 }}>{PString}{PString2}</p>
    </div>
  </div>
}
const FlexWrapTest: React.FC<{}> = ({ }) => {
  const [flexWrap, setFlexWarp] = useState("nowrap")
  const [flexGrowShrink, setFlexGrowShrink] = useState({ flexGrow: 1, flexShrink: 1 })

  const [flexBasis, setFlexBasis] = useState(["auto","auto","auto"])
  const [flexGrows, setFlexGrows] = useState([undefined,undefined,undefined])
  const [flexShrinks, setFlexShrinks] = useState([undefined,undefined,undefined])
  return <div className="gray-border">
    <Divider>调整flex-wrap超出屏幕换行</Divider>
    nowrap不换行，wrap换行，wrap-reverse换行，但是顺序反过来.必须是flex值为绝对值（例如200px）才能换行。
    <br />对于换行后，第二行分布与第一行不对齐的问题，需要修改flex-grow和flex-shrink为0，才行
    <br />flex-grow: 主轴方向上如何“放大”。如果所有项目的flex-grow属性都相同，将等分剩余空间。如果一个项目的flex-grow为2，其他项目为1，那么第一个项目将获得剩余空间的两倍。
    <br />flex-shrink: 如何在主轴方向上“缩小”。如果所有项目的flex-shrink属性都相同，将在需要时等比例缩小。如果一个项目的flex-shrink为0，其他项目为1，那么在需要缩小时，第一个项目不会缩小。
    <br />flex-basis(直接写flex:200px也是basis): 这个属性定义了一个flex项目在主轴方向上的初始尺寸。它可以设定为普通的长度值（如20%, 5rem, etc），或者关键词auto表示按照项目的本来尺寸确定。
    <div>
      设置flex-wrap<Select style={{ width: 200 }} value={flexWrap} options={
        ["nowrap", "wrap", "wrap-reverse"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setFlexWarp(v)}
      />
      <span>
        设置flex-grow<InputNumber value={flexGrowShrink.flexGrow} onChange={(e) => setFlexGrowShrink({ ...flexGrowShrink, flexGrow: e })} />
        设置flex-shrink<InputNumber value={flexGrowShrink.flexShrink} style={{ width: 100 }} onChange={(e) => setFlexGrowShrink({ ...flexGrowShrink, flexShrink: e })} />
      </span>
    </div>
    <div className="flex-layout" style={{ flexWrap }}>
      {Array.from({ length: 9 }).map((v, i) => <p key={i} style={{ flex: "200px", ...flexGrowShrink, }}>{PString}</p>)}
      <p style={{ flex: "200px", ...flexGrowShrink }}>{PString}{PString2}</p>
    </div>
    <Divider/>
    <div>
      flex的取值为grow,shrink,basis: initial 是把 flex 元素重置为 Flexbox 的初始值，它相当于 flex: 0 1 auto 
      初始flex-basis为auto,即内容宽度,如果有width，会用width宽度，除非basis不是auto，优先级: basis&gt;width&gt;内容;
      <br/>其中内容如果是纯文字的，会按max-content <a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_flexible_box_layout/Controlling_ratios_of_flex_items_along_the_main_axis">文档</a>
      <br/>此时可以调整basis的值，看看效果(注意必须是数字或auto)
      <br />先调整basis为200,100,300，可看到宽度会变化，但是还是有剩余空间
      <br/>再调整第1个flex-grow 为1，可以看到刚才剩余的空间被第1个元素占用，再调整其他flex-grow的数字，剩余空间会按比例分配.
      <br />再看flex-shrink: 需先还原flex-grow为0,0,0,basis设置为500,1000,500，
      此时的shrink是默认值1,1,1，那么按1:1:1来缩小，来保证不超出屏幕，（但是会以500,1000,500的初始比例缩小，也就是说，缩小幅度相同,但缩小后的结果不是1:1:1）
      <br/>将shrink设置为0,0,0,则不会缩放，会看到超出屏幕的效果
      <br/>将basis调整为600,600,600，shrink调整为1,0,0，那么只有第一个会缩小，另2个都是600px,保证最终宽度不超出屏幕
      <InputNumber value={flexGrows[0]} onChange={(e) => setFlexGrows([e,flexGrows[1],flexGrows[2]])} />
      <InputNumber value={flexGrows[1]} onChange={(e) => setFlexGrows([flexGrows[0],e,flexGrows[2]])} />
      <InputNumber value={flexGrows[2]} onChange={(e) => setFlexGrows([flexGrows[0],flexGrows[1],e])} />
      flex-shrink：
      <InputNumber value={flexShrinks[0]} onChange={(e) => setFlexShrinks([e,flexShrinks[1],flexShrinks[2]])} />
      <InputNumber value={flexShrinks[1]} onChange={(e) => setFlexShrinks([flexShrinks[0],e,flexShrinks[2]])} />
      <InputNumber value={flexShrinks[2]} onChange={(e) => setFlexShrinks([flexShrinks[0],flexShrinks[1],e])} />
      flex-basis：
      <Input value={flexBasis[0]} onChange={(e) => setFlexBasis([e.target.value,flexBasis[1],flexBasis[2]])} style={{width:100}} />
      <Input value={flexBasis[1]} onChange={(e) => setFlexBasis([flexBasis[0],e.target.value,flexBasis[2]])} style={{width:100}} />
      <Input value={flexBasis[2]} onChange={(e) => setFlexBasis([flexBasis[0],flexBasis[1],e.target.value])} style={{width:100}} />
    </div>
    <div className="flex-layout">
      <div className="gray-border" style={{flexBasis:flexBasis[0]+"px",flexGrow:flexGrows[0],flexShrink:flexShrinks[0]}}>flex1</div>
      <div className="gray-border" style={{flexBasis:flexBasis[1]+"px",flexGrow:flexGrows[1],flexShrink:flexShrinks[1]}}>flex2</div>
      <div className="gray-border" style={{flexBasis:flexBasis[2]+"px",flexGrow:flexGrows[2],flexShrink:flexShrinks[2],width:100}}>flex3</div>
    </div>
  </div>
}

const AlignContentTest: React.FC<{}> = ({ }) => {
  const [alignContent, setAlignContent] = useState("flex-start")
  const [justifyContent, setjustifyContent] = useState("flex-start")
  const [gap, setGap] = useState(0)
  return <div className="gray-border">
    <Divider>调整align-content多根轴线的对齐方式+justifyContent</Divider>
    <div>必须多行，且必须先确定父容器大小,父必须为flex-wrap:wrap,子元素必须为固定大小，才能看到效果</div>
    <div>
      alignContent:<Select style={{ width: 200 }} value={alignContent} options={
        ["flex-start", "flex-end", "center", "space-between", "space-around", "stretch"].map(v => ({ label: v, value: v }))
      }
        onChange={(v) => setAlignContent(v)}
      />
      justifyContent<Select style={{ width: 200 }} value={justifyContent} options={
        ["flex-start", "flex-end", "center", "baseline", "stretch", "space-between", "space-around"].map(v => ({ label: v, value: v }))
      } onChange={(v) => setjustifyContent(v)}
      />
      gap:<InputNumber style={{ width: 100 }} value={gap} onChange={(e) => setGap(e)} /> (gap也可用row-gap和column-gap,grid中也可以用)
    </div>
    <div className="flex-layout" style={{ alignContent, justifyContent, flexWrap: "wrap", height: 600,gap }}>
      {Array.from({ length: 30 }).map((v, i) => <div key={i} style={{ width: 100, height: 100, backgroundColor: "lightblue", margin: 2 }}></div>)}
    </div>
  </div>
}
const OtherTest: React.FC<{}> = ({ }) => {
  return <div className="gray-border">
    <Divider>其他</Divider>
    <div className="flex-layout">
      <div style={{ backgroundColor: "lightblue", width: "100%" }}>3个宽度都为100%，则平均布局</div>
      <div style={{ backgroundColor: "lightgreen", width: "100%" }}>b</div>
      <div style={{ backgroundColor: "red", width: "50%" }}>本块如果设置width50%，则按100:100:50计算</div>
    </div>
    <div className="flex-layout">
      <div style={{ backgroundColor: "lightblue", width: "100%" }}>中间块宽40px,左右为100%，50%,则左右按2:1计算。但实际b块会被挤占(浏览器查看)</div>
      <div style={{ backgroundColor: "lightgreen", width: 40 }}>b</div>
      <div style={{ backgroundColor: "red", width: "50%" }}>本块如果设置width50%，则按100:100:50计算</div>
    </div>
    <div className="flex-layout">
      <div style={{ backgroundColor: "lightblue", flex: 2 }}>不用width,改用flex2:1+40px,b块能保持40px</div>
      <div style={{ backgroundColor: "lightgreen", width: 40 }}>b</div>
      <div style={{ backgroundColor: "red", flex: 1 }}>本块如果设置width50%，则按100:100:50计算</div>
    </div>
    <div className="flex-layout">
      <div style={{ flex: 1, backgroundColor: "lightblue" }}>弹性布局1:3，设置flex:1</div>
      <div style={{ flex: 3, backgroundColor: "lightgreen" }}>未设置的按文字长度计算，设置了flex的除去文字后的宽度按比例计算,无论是div还是span
        <br />如果本行超过1行，则会自动换行。不会挤占后面的元素
      </div>
      <span>a</span>
      <span>d</span>
      <div>b</div>
    </div>
    文字过长会超出父元素,因为没有检测到空格或者逗号等符号，浏览器认为是1个单词
    <div className="flex-layout">
      <p style={{ backgroundColor: "lightblue" }}>{Array.from({ length: 100 }).map(v => 'a').join("") + " ,fasdfsadfas"}</p>
      <p style={{ backgroundColor: "lightgreen" }}>{Array.from({ length: 100 }).map(v => 'b').join("")}</p>
      <p style={{ backgroundColor: "lightgray" }}>{Array.from({ length: 100 }).map(v => 'c').join("")}</p>
    </div>
  </div>
}

const GridDivs = () => {
  return <><div>One</div>
    <div>Two</div>
    <div>Three</div>
    <div>Four</div>
    <div>Five</div>
    <div>Six</div>
    <div>Seven</div></>
}
const GridTemplateColumnsTest: React.FC<{}> = ({ }) => {
  const [columnNum, setColumnNum] = useState(3)
  const [gridTemplateColumns, setGridTemplateColumns] = useState([1, 1, 1])
  const [gap, setGap] = useState(0)
  const [gridAutoRows, setGridAutoRows] = useState(40)
  return <div className="gray-border">
    <Divider>调整gridTemplateColumns,gap,gridAutoRows（列数，列宽，间距，行高）</Divider>
    <div>如果都为0，则按实际文字宽度计算和布局，不过一列依旧只放3个；
      <br />grid-template-columns:1fr 1fr 1fr;等价与repeat(3, 1fr);单位可以是fr或者px
      <br />repeat(2, 2fr 1fr)等价于 2fr 1fr 2fr 1fr。
    </div>
    <div>
      grid-template-columns列宽和列数:<InputNumber style={{ width: 100 }} value={columnNum} onChange={(e) => {
        setColumnNum(e)
        setGridTemplateColumns(Array.from({ length: e }).map(v => 1))
      }} />
      <br />各个列的fr数，列内布局:
      {Array.from({ length: columnNum }).map((v, i) => <span key={i}>
        <InputNumber style={{ width: 200 }} value={gridTemplateColumns[i]} onChange={(e) => {
          setGridTemplateColumns(gridTemplateColumns.map((v, idx) => i === idx ? e : v))
        }} />fr
      </span>)}
      <br />grid-gap:<InputNumber style={{ width: 100 }} value={gap} onChange={(e) => setGap(e)} />
      <br />grid-auto-rows,列高度默认为内容高度:<InputNumber style={{ width: 100 }} value={gridAutoRows} onChange={(e) => setGridAutoRows(e)} />
      这个属性还可以设置为max-content,min-content,auto,1fr,或者minmax(10px,auto),表示最低10，最高自动计算
    </div>
    <div className="grid-layout" style={{ gridTemplateColumns: gridTemplateColumns.join("fr ") + "fr", gap: gap, gridAutoRows }}>
      <GridDivs />
    </div>
  </div>
}
const GridAutoChangeLineTest: React.FC<{}> = ({ }) => {
  const obj = { gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gridAutoRows: " minmax(70px, auto)" }
  return <div className="gray-border">
    <Divider>根据窗口弹性自动换行</Divider>
    <div>
      {JSON.stringify(obj)}
      <div>auto-fill来替代确定的重复次数</div>
      <br />
    </div>
    <div className="grid-layout" style={obj}><GridDivs /></div>
  </div>
}
const GridAreaTest: React.FC<{}> = ({ }) => {
  return <div className=" gray-border">
    <h3>garea测试</h3>
    c会影响ab如果没有c那么ab会对齐显示,'.'可以表示空块
    <div className="grid-layout garea">
      <div style={{ gridArea: "a" }}>a</div>
      <div style={{ gridArea: "b" }}>b</div>
      <div style={{ gridArea: "c" }}>c</div>
    </div>
  </div>
}
const GridStartEndTest: React.FC<{}> = ({ }) => {
  const [gridRowStart, setGridRowStart] = useState(1)
  const [gridColumnStart, setGridColumnStart] = useState(1)
  const [gridColumnEnd, setGridColumnEnd] = useState(2)
  const [gridRowEnd, setGridRowEnd] = useState(2)
  return <div className="gray-border">
    <h3>grid-colum-start,end测试</h3>
    rowStart<InputNumber value={gridRowStart} onChange={(e) => setGridRowStart(e)} />
    rowEnd<InputNumber value={gridRowEnd} onChange={(e) => setGridRowEnd(e)} />
    columnStart<InputNumber value={gridColumnStart} onChange={(e) => setGridColumnStart(e)} />
    columnEnd<InputNumber value={gridColumnEnd} onChange={(e) => setGridColumnEnd(e)} />

    <div className="grid-layout" style={{ gridTemplateColumns: "repeat(6,1fr)" }}>
      <GridDivs />
      <GridDivs />
      <div style={{ gridColumnStart, gridColumnEnd, gridRowStart, gridRowEnd, backgroundColor: "lightblue" }}>a</div>
      <GridDivs />
      <GridDivs />
    </div>
  </div>
}
const ColumLayoutTest: React.FC<{}> = ({ }) => {
  const [columnStyles, setColumStyles] = useState({})
  const [randomWords,aa]=useState(generateRandomWords(2000))
  return <div className="gray-border">
    <h3>多列布局</h3>
    值得一提的是这条分割线本身并不占用宽度。它置于用 column-gap 创建的间隙内。如果需要更多空间，你需要增加 column-gap 的值。
    <div>
      <Button onClick={() => setColumStyles({ columnCount: 3 })}>设置3列</Button>
      <Button onClick={() => setColumStyles({ columnWidth: 200 })}>设置宽度，自动计算列数</Button>
      <Button onClick={() => setColumStyles({ columnCount: 3, columnGap: 20, columnRule: "4px dotted rgb(79, 185, 227)" })}>设置3列+间距+边框</Button>
      <Button onClick={() => {
        setColumStyles({})
      }}>重置</Button>
      <div style={columnStyles}>{randomWords}</div>
    </div>
  </div>
}
const ColumLayoutAvoidBreak: React.FC<{}> = ({ }) => {
  const [blockStyle, setBlockStyle] = useState({})
  const [randomWords,aa]=useState(generateRandomWords(200))
  const getBlock = () => {
    return <div style={blockStyle}>{randomWords}</div>
  }
  return <div className="gray-border">
    <h3>多列布局,有无折断</h3>
    <div>
      <Button onClick={() => setBlockStyle({
        backgroudColor: "rgb(207, 232, 220)",
        border: "2px solid rgb(79, 185, 227)", padding: 10, margin: "0 0 1em 0"
      })}>
        会折断的样式
      </Button>
      <Button onClick={() => setBlockStyle({
        backgroudColor: "rgb(207, 232, 220)", border: "2px solid rgb(79, 185, 227)",
        padding: 10, margin: "0 0 1em 0", breakInside: "avoid", pageBreakInside: "avoid"
      })}
      >
        不会折断的样式
      </Button>
      <Button onClick={() => {
        setBlockStyle({})
      }}>重置</Button>
      <div style={{ columnWidth: 250, columnGap: 20 }}>
        {Array.from({ length: 10 }).map((v, i) => <div key={i}>{getBlock()}</div>)}
      </div>
    </div>
  </div>
}
const CssVariable = () => {
  const [flexOpen, setFlexOpen] = useState(true)
  const [gridOpen, setGridOpen] = useState(true)
  const [multiColOpen, setMultiColOpen] = useState(true)
  const [varPart, setVarPart] = useState(true)
  const parent = useRef(null)
  //hook的使用方式： https://auto-animate.formkit.com/#usage-react
  useEffect(() => {
    parent.current && autoAnimate(parent.current)
  }, [parent])

  return <div ref={parent}>
    <ResizableLayout />

    <Divider>变量部分<Switch checked={varPart} onChange={e => setVarPart(e)} /></Divider>
    {varPart && <>
      <div>css变量,css条件，import，</div>
      <ul>
        <li>后定义的变量会覆盖先定义的，所以要控制css引入顺序</li>
        <li>局部的会覆盖全局的</li>
        <li>如果你在浏览器开发者工具中调试样式时，不能找到对应的变量，这可能是因为这个变量没有被应用到任何样式上，或者在当前的作用域中不存在</li>
      </ul>
      <div className="cv-first-row啊">拖动浏览器尺寸，当宽度小于500时，css的规则就会生效</div>
      <div className="import-test">css的import会产生请求，但是在antdp里打包时会自动打到一个css里，所以没产生请求</div>
      <div className="calculate">变量计算,计算后padding的值翻倍了</div>
      <div className="third">
        <Button onClick={() => {
          document.documentElement.style.setProperty('--third-color', 'blue');
        }}>修改</Button>
        点击按钮修改css变量
      </div>

      <div id="id1" className="cl1 cl2 vv">where伪类选择，权重0</div>
      <div id="id2" className="cla1 cla2 vv">使用多个#id2#id2或者.cla1.cla1来提升权重，可以避免使用!important</div>
      <div className="vv ab">not伪类选择，class含cl的都失效</div>
      <div id="id3">
        <div id="parent">
          <h1>直接定义的优先级高于从父节点集成的</h1>
        </div>
      </div>
    </>}
    <Divider>弹性布局<Switch checked={flexOpen} onChange={e => setFlexOpen(e)} /></Divider>
    {flexOpen && <>
      <div>flex属性有
        <li>flex-direction:column/row/column-reverse/row-reverse，默认row为横向排列；测试略</li>
        <li>flex: 1 200px;这表示“每个 flex 项将首先给出 200px 的可用空间(保底200)，然后，剩余的可用空间将根据分配的比例共享”</li>
      </div>
      <JustifyContentTest />
      <WidthTest />
      <OrderAndTextTest />
      <ParagraphTextTest />
      <FlexWrapTest />
      <AlignContentTest />
      <AlignItemsTest />
      <OtherTest />
    </>}
    <Divider>网格布局<Switch checked={gridOpen} onChange={e => setGridOpen(e)} /></Divider>
    {gridOpen && <>
      <GridTemplateColumnsTest />
      <GridAutoChangeLineTest />
      <GridAreaTest />
      <GridStartEndTest />
    </>}
    <Divider>多列布局<Switch checked={multiColOpen} onChange={e => setMultiColOpen(e)} /></Divider>
    {multiColOpen && <>
      <ColumLayoutTest />
      <ColumLayoutAvoidBreak />
    </>}
  </div>
}
export default CssVariable;