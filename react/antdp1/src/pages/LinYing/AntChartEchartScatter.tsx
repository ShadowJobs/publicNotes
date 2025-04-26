
import { Col, Row, Slider } from 'antd';
import { Scatter } from '@ant-design/charts';
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'; //使用scattergl必须引入
import React from 'react';
import { max, min, uniq } from 'lodash';


export function strTofixed(num:string,n:number=2){ //保留2位小数
  return num.slice(0,num.indexOf(".")+n+1);
}
export function getMousePosInElement(e:any,element:any){ //获取鼠标在某个元素内的相对位置
  let rect = element.getBoundingClientRect()
  let x = e.clientX - rect.left
  let y = e.clientY - rect.top
  return {x,y}
}
export const ScatterChart: React.FC<{ tableResult:any; }> 
= ({  }) => {
  const [scale,setScale] = React.useState(1);
  const [startDrag,setStartDrag] = React.useState(false);
  const [startPos,setStartPos] = React.useState<{x:number,y:number}>()
  const dragDiv = React.useRef<HTMLDivElement | null>(null);
  const tableResult={
    "category": null,
    "x_label": "x轴的标注", //展示在
    "y_label": "y轴的标注",
    "data":{
        "colors":{
            "label1":"green",
            "label2":"#00ff00"
        },
        "points": [
            {
                "label":"label1",
                "x": 39,
                "y": -0.4
            },
            {
                "label":"label2",
                "x": 319,
                "y": 6
            }
        ]
    },
    "title": "顶部标题",
    "type": "scatter",
    label:{ //每个点上展示的文字
      style: {
        fill: 'red',
        opacity: 0.6,
        fontSize: 24
      },
      rotate: true
    },
    legend: { //这个是点的分类，不展示可以直接传false
      layout: 'horizontal',
      position: 'right'//在右侧展示
    },
  }
  const data=tableResult.data
  const config = {
    appendPadding: 10,
    data:data.points,
    xField: 'x', yField: 'y',
    shape: 'square',size: 2,//点的大小形状
    colorField: 'label', // 部分图表使用 seriesField
    color: ({ label }) => data.colors[label],//定制颜色，只能针对一类一类的点
    yAxis: { nice: true, line: { style: { stroke: '#aaa', }, }, title:{text:tableResult.y_label} ,  //title:"x轴的标注", 展示x轴的下方
      label:{style: { opacity: 0.6, },rotate:0,formatter:v=>(v+"1")} //轴上标尺展示形式
    },
    height:800,
    xAxis: {
      grid: {
        line: {
          style: {
            stroke: '#eee', //中间的网格线的颜色
          },
        },
      },
      line: { style: {  stroke: '#aaa', }, },
      title:{text:tableResult.x_label},
      label:{style: { opacity: 0.6, },rotate:0,formatter:v=>strTofixed(v)}
    },
    meta: {
      [tableResult.x_label]: { type: 'linear' },
      [tableResult.y_label]: { type: 'linear' },
    },
    interactions: [{ type: 'tooltip', enable: false }] //关闭tooltip，可以提升性能

  };

  const onmousedown=(e)=>{
    setStartDrag(true)
    setStartPos({x:e.clientX+dragDiv.current.scrollLeft,y:e.clientY+dragDiv.current.scrollTop})
  }
  const onmousemove=(e)=>{
    if(startDrag){
      dragDiv.current.scrollTop=startPos.y-e.clientY
      dragDiv.current.scrollLeft=startPos.x-e.clientX
    }
  }
  const onmouseup=(e)=>{setStartDrag(false)}
  const onwheel=(e)=>{
    let delta=e.deltaY
    if(navigator.userAgent.indexOf("Mac OS X")==-1) delta=e.deltaY //系统兼容: 按住shift后mac下是deltaX，windows，linux是deltaY
    if(e.deltaY<0){
      if(scale<5 && dragDiv && dragDiv.current) {
        setScale(scale+0.5)
      }
    }else{
      if(scale>0.5 && dragDiv && dragDiv.current) {
        setScale(scale-0.5)
      }
    }
  }
  let option={
    tooltip: { trigger: 'axis', axisPointer: {
        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
    } },
    legend: {show:false},
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {type: 'value'}, // value表示x轴是值，所以如果想变成竖条图，只需交换x和y的type
    yAxis: { type: 'category',data:["good","bad"],
      show:false, // 关闭y轴 左边label
    }, //category表示y轴是分类
    height:100,
    series: [
      {
        name: '2011',
        type: 'bar',
        // barGap:"-100%", //柱子之间的间距，补充stack堆叠图的不足：堆叠图不能重合摆放，stack后两个柱子会上下摆，而本参数可以使2个柱子前后重叠，而不是上下堆叠
        data: [18203, 23489].map(v=>({value:v,label:{position:"insideLeft"}})), //将label放到柱子左对齐的位置
        label: { show: true, formatter: '{b}', }, //配合上面yAxis的show:false使用,将y轴的label放到条形图的右侧
        //{b}表示展示label，
      },
    ],
    color:['#0051DD','#ff7875'],
    // ,axisLine: { show: false }, 
    axisLabel: { show: false }, // 本参数好像是控制y轴左侧的距离
    // axisTick: { show: false },
    // splitLine: { show: false },
  }

  let pieOption  = {
    title: {
      text: 'Referer of a Website',
      subtext: 'Fake Data',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: 'Search Engine' },
          { value: 735, name: 'Direct' },
          { value: 580, name: 'Email' },
          { value: 1484, name: 'Union Ads' },
          { value: 300, name: 'Video Ads' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  return (
    <div className="page-home">
      <Row>
        <Col span={2}> <div style={{bottom:-5,position:"relative"}}>缩放：{scale}</div> </Col>
        <Col span={22}> <Slider min={0} max={5} defaultValue={1} value={scale} step={0.5} onChange={(v)=>{ setScale(v)}}/> </Col>
      </Row>
      <div style={{width:700,height:700 ,overflow:"scroll"}} ref={dragDiv} id={"llyy"}
        onMouseDown={onmousedown} onMouseMove={onmousemove} onMouseUp={onmouseup} //鼠标拖动移动div
        onWheel={onwheel} //滚动放大缩小
      >
        antcharts的散点图：
        <Scatter {...config} style={{width:`${scale*100}%`,height:`${scale*100}%`}}/>
        
        echarts的散点图： 
        在react中使用 npm i echarts  echarts-for-react 
        如果使用webgl散点图，npm i echarts-gl
        优势：1 ECharts的性能处理的较好，不卡，是逐步绘制的，一次绘制一部分点，瞬时吃内存也不明显
        2，ECharts可以使用scatterGL，用webgl的方式绘制，一次性提交，使用GPU计算。完全不卡，缺点是有些交互会失效
        注意ReactEcharts必须依赖echarts包，echarts-gl也是
        使用scattergl则必须引入import 'echarts-gl'; 
        <ReactEcharts style={{width:`${scale*100}%`,height:`${scale*100}%`}} 
          option = {{
            tooltip:{position:[10,10,]},
            xAxis: {min:min(config.data.map(d => d.x)),max:max(config.data.map(d => d.x))}, //x轴显示范围
            yAxis: {min:min(config.data.map(d => d.y)),max:max(config.data.map(d => d.y))}, //y轴显示范围
            color:["#00ff00","#ff0000"],
            series:uniq(config.data.map(d => d.label)).map(label => ({
                colorBy: 'series',
                symbolSize: 4,
                data: config.data.filter(v=>v.label==label).map(d => [d.x, d.y]),
                type: 'scatter',  //用webgl的方式：scatterGL，前提：import 'echarts-gl'; 效果：性能会提升几百倍，但是tooltip会失效
            }))
            
          }} 
        ></ReactEcharts>
      </div>

      <ReactEcharts style={{height:200}} option = { option } />
      <ReactEcharts style={{height:400,width:400}} option = { pieOption } />
      注意echarts的图必须指定宽高，如果不指定，那么条形图会特别高，而饼图会是0宽高，看不到
    </div>
  )
};

export default ScatterChart