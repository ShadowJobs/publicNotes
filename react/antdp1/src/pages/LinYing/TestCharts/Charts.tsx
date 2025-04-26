import React, { Fragment, useEffect,useCallback, useRef, useState } from 'react';
import { Line, Pie, Column, Bar,G2, Box, Scatter } from '@ant-design/charts';
import { Col, Collapse, Divider, Image, Row,Input, Space, Spin, Slider, Radio, Switch  } from 'antd';
import { LineConfig } from '@ant-design/charts/es/line';
import { PieConfig } from '@ant-design/charts/es/pie';
import { ColumnConfig } from '@ant-design/charts/es/column';
import { isNumber, max, min } from 'lodash';
import ReactJson from "react-json-view"
const { registerInteraction } = G2;
import _,{groupBy,forEach} from 'lodash';
import { formatNumber, safeReq } from '@/utils';
import { request } from 'umi';
import AnchorPop from './AnchorPop';
import ChartCard from './chartCard';
import { ExpressUrl, FrontendPre } from '@/global';
const ReactEcharts = React.lazy(() => import('echarts-for-react'));
export const MaxPageChartNum=6
export const OpenResultPage=true

function aisWheelDown(event) {
  event.gEvent.preventDefault();
  event.gEvent.stopPropagation();
  event.gEvent.originalEvent.preventDefault(); // 阻止 mousewheel 的默认行为
  event.gEvent.originalEvent.stopPropagation(); // 阻止 mousewheel 的默认行为
  return event.gEvent.originalEvent.deltaY > 0;
}
registerInteraction('view-zoom', {
  start: [
    {
      trigger: 'plot:mousewheel',
      isEnable(context) { 
        return aisWheelDown(context.event);
      },
      action: 'scale-zoom:zoomIn',
      throttle: { wait: 20, leading: true, trailing: false },
    },{
      trigger: 'plot:mousewheel',
      isEnable(context) {
        
        return !aisWheelDown(context.event);},

      action: 'scale-zoom:zoomOut',
      throttle: { wait: 20, leading: true, trailing: false },
    },
  ],
  rollback: [{ trigger: 'dblclick', action: ['scale-zoom:reset'] }],
});
registerInteraction('brush', {
  showEnable: [
    { trigger: 'plot:mouseenter', action: 'cursor:crosshair' },
    { trigger: 'plot:mouseleave', action: 'cursor:default' },
  ],
  start: [
    {
      trigger: 'plot:mousedown',
      action: ['brush:start', 'rect-mask:start', 'rect-mask:show'],
    },
  ],
  processing: [
    {
      trigger: 'plot:mousemove',
      action: ['rect-mask:resize'],
    },
  ],
  end: [
    {
      trigger: 'plot:mouseup',
      action: ['brush:filter', 'brush:end', 'rect-mask:end', 'rect-mask:hide'],
    },
  ],
  rollback: [{ trigger: 'dblclick', action: ['brush:reset'] }],
});
registerInteraction('view-drag', {
  showEnable: [
    { trigger: 'plot:mouseenter', action: 'cursor:move' },
    { trigger: 'plot:mouseleave', action: 'cursor:default' },
  ],
  start:[{trigger: 'plot:mousedown',action:"scale-translate:start"} ],
  processing: [{trigger: 'plot:mousemove',action:"scale-translate:translate"}],
  end: [{trigger: 'plot:mouseup',action:"scale-translate:end"}],
  rollback: [{ trigger: 'dblclick', action: ['scale-translate:reset'] }],
});
const commonTypes=['scatter','divider','html','image','map','table','antTable','line','pie','bar','StackArea','box','echart','json',
  'feishu','imageMerge','embeddedPage','nppKanban']
export const GetChartCards:React.FC<{category: string | null,resultData:any,team?:string}> = 
  ({category,resultData,team}) => {
  const initResults=category
    ? resultData.data?.filter((result) => result.category == category)
    : resultData.data;
  // const results=initResults
  const [results,setResults] = useState<any[]>([])
  const [loadIndex, setLoadIndex] = useState(MaxPageChartNum);
  const observerRef = useRef();
  const lastElRef = useCallback((node) => { // 观察最后一个元素
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setLoadIndex(prevIndex => prevIndex + 5); // 每次多加载5个
      }
    });
    if (node) observerRef.current.observe(node);
  },[]);
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <AnchorPop results={results} setResult={setResults} initResults={initResults} meta={{}} loadAll={()=>setLoadIndex(results.length)}/>
        <Row gutter={[32, 32]}>
          {results?.slice(0, OpenResultPage?loadIndex:results.length).map((result, index) => {
            return commonTypes.includes(result.type) ? <ChartCard result={result} key={result.title+index} team={team}/>:
              <Fragment key={result.title+index}/>
          })}
        </Row>
        {loadIndex < results.length && OpenResultPage && <div ref={lastElRef} style={{textAlign:"center"}}>
          <Spin style={{marginRight:10}}/>Loading more...
        </div>} 
    </Space>
  );
};

const getAnnotationConfgs = (annotation: Mynote.ApiAggLineAnnotation) => {
  const configs = {
    point: {
      type: 'dataMarker',
      position: [
        (annotation as Mynote.ApiDataMarkerAnnotation).x,
        (annotation as Mynote.ApiDataMarkerAnnotation).y,
      ],
      text: {
        content: annotation.label,
      },
      point: {
        style: {
          fill: '#fd961f',
          stroke: '#fd961f',
        },
      },
      autoAdjust: true,
    },
    vertical_line: {
      type: 'line',
      start: [(annotation as Mynote.ApiVerticalLineAnnotation).x, 'min'],
      end: [(annotation as Mynote.ApiVerticalLineAnnotation).x, 'max'],
      text: {
        content: annotation.label,
        position: 'right',
        style: { textAlign: 'right' },
      },
      style: {
        lineDash: [4, 4],
      },
      autoAdjust: true,
    },
    horizontal_line: {
      type: 'line',
      start: ['min', (annotation as Mynote.ApiHorizontalLineAnnotation).y],
      end: ['max', (annotation as Mynote.ApiHorizontalLineAnnotation).y],
      text: {
        content: annotation.label,
        position: 'right',
        style: { textAlign: 'right' },
      },
      style: {
        lineDash: [4, 4],
      },
      autoAdjust: true,
    },
  };

  return configs[annotation.type] ? configs[annotation.type] : {};
};

export const LineChart: React.FC<{
  chart: MesAPI.AggLineChart;
  mouseover?:Function;
}> = ({ chart, mouseover }) => {
  const [autofitY, setAutofitY] = useState(true);
  const [enableScale, setEnableScale] = useState(false);  
  const extraTip=chart.external?.extraTip
  const acrossParams:any = chart.external?.acrossParams || {}
  const ref=useRef()
  const data = chart.data
    .map((line) => {
      return line.points.map((point) => {
        const r= {
          ...point,
          label: line.label,
          [chart.x_label]: point.x,
          [chart.y_label]: point.y,
        };
        extraTip?.map(v=>{r[v]=point[v]})
        return r
      });
    })
    .flat();

  const yData = chart.data.map((line) => line.points.map((point) => point.y)).flat(1);
  const yMin = min(yData)
  const yMax = max(yData)//Math.max.apply(Math, yData); 老的方法有内存占用过高，疑似有泄漏

  const annotations = chart.extra?.map((annotation) => getAnnotationConfgs(annotation));
  const config: LineConfig = {
    data,
    ...(chart.external?.pointSize?{point:{size:chart.external.pointSize}}:{}),
    xField: chart.x_label,
    yField: chart.y_label,
    seriesField: 'label',
    xAxis: {
      title: {
        text: chart.x_label,
      },
      label:{
        rotate:chart.external?.xLabel?.rotate || 0,
        offsetX:chart.external?.xLabel?.offsetX || 0,
        offsetY:chart.external?.xLabel?.offsetY || 0,
      }
    },
    yAxis: {
      title: {
        text: chart.y_label,
      },
      min: isNumber(chart.external?.yMin)?chart.external.yMin:(autofitY ? yMin : 0),
      max: isNumber(chart.external?.yMax)?chart.external.yMax:yMax,
      label:{
        rotate:chart.external?.yLabel?.rotate || 0,
        offsetX:chart.external?.yLabel?.offsetX || 0,
        offsetY:chart.external?.yLabel?.offsetY || 0,
      }
    },
    meta: {
      ...(chart.external?.xString?{}:{
        [chart.x_label]: { type: 'linear' },
        [chart.y_label]: { type: 'linear' },
      })
    },
    ...(chart.data.filter((line) => line.color !== undefined).length == chart.data.length && {
      color: chart.data.map((line) => line.color as string),
    }),
    ...(annotations && { annotations: annotations }),
    interactions: [
      // 这里从props传入noScale，如果将noScale放在本文件内，那么监听加上之后就无法移除，解决的办法是：
      // 在 <Line key={(enableScale.toString()+autofitY.toString())}>里加一个key，这样就能触发重新渲染，从而移除监听
      ...enableScale?[
        {type:"view-zoom"},
        {type:"view-drag"},
      ]:[],
    ],
    tooltip: extraTip?{
      fields: [chart.y_label,...(extraTip||[])],}
      :{},
    ...acrossParams
  };
  if(chart?.external?.closeAnimation) config.animation=false

  if(chart?.external?.useBigNumFormat){
    config.yAxis.label.formatter=(v)=>formatNumber(parseFloat(v))
  }

  const handleWheel = e => e.preventDefault()
  useEffect(()=>{
    ref.current?.addEventListener('wheel', handleWheel, { passive: false });
    return ()=>ref.current?.removeEventListener('wheel', handleWheel);
  },[])
  return (
    <div ref={ref}>

      <div>
        {("Y轴自适应：")}
        <Switch onChange={(checked) => setAutofitY(checked)} checked={autofitY}/>
        <span style={{marginLeft:10}}>{("缩放")}：</span>
        <Switch onChange={(checked) => setEnableScale(checked)} checked={enableScale}/>
      </div>
      <Line {...config} key={(enableScale.toString()+autofitY.toString())} onReady={(plot)=>{
        plot.on('element:click', (e) => {
          if(e.data.data.ptype=="url")
            e.data.data.url && window.open(e.data.data.url,"_blank")

        });
        plot.on('element:mouseover', (e) => {
          console.log(e);
          if(!Array.isArray(e.data.data)){
            mouseover?.(e.data.data.x)
          }
        });
      }}/>
  </div>)
};
export const LevelPie:React.FC<{chart:Mynote.ApiAggLevelPieChart}>=({chart})=> {
  const [data, setData] = useState(chart.data);
  const [crumbs, setCrumbs] = useState(['root']);
  const handleClick=(params)=> {
    if (params.children) {
      setData(params.children);
      setCrumbs(pre=>[...pre, params.label]);
    }
  }
  const getDataByCrumbs=(pathes:string[])=>{
    let d=[...chart.data]
    for(let i=1;i<pathes.length;++i){
      d=[...d.find(v=>v.label==pathes[i]).children]
    }
    return d
  }
  const handleCrumbClick=(index)=> {
    if(index==crumbs.length-1) return
    setData(getDataByCrumbs(crumbs.slice(0, index+1)));
    setCrumbs(pre=>pre.slice(0, index+1));
  }

  const config = {
    appendPadding: 10,
    data: data.map(item => ({ ...item, type: item.label })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    // innerRadius: 0.64,
    label: { type: 'inner', offset: '-50%', content: '{value}', style: { textAlign: 'center' }},
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
    statistic: { title: false, content: false },
    onReady(plot){
      plot.on('element:click',(event)=>{
        handleClick(event.data.data);
      })
    }
  };
  return (
    <div>
      {crumbs.map((crumb, index) => (
        <span style={{marginRight:5}} key={index} onClick={() => handleCrumbClick(index)}>
          <a>{crumb}</a> {index==crumbs.length-1?"":"|"}
        </span>
      ))}
      <Pie {...config} />
    </div>
  );
}
export const PieChart: React.FC<{ chart: Mynote.ApiAggPieChart }> = ({ chart }) => {
  const data = chart.data.map((pie) => {
    return {
      ...pie,
      type: pie.label,
      value: pie.value,
    };
  });

  const acrossParams:any = chart.external?.acrossParams || {}
  const config: PieConfig = {
    appendPadding: 10,
    data: data,
    angleField: 'value',
    colorField: 'type',
    ...(chart.data.filter((pie) => pie.color !== undefined).length == chart.data.length && {
      color: chart.data.map((pie) => pie.color as string),
    }),
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
    ...acrossParams
  };

  return <Pie {...config} onReady={(plot)=>{
    plot.on('element:click',(v)=>{
      if(chart.external?.clickType=="link"){
        v.data.data.url && window.open(v.data.data.url,"_blank")
      }
    })
  }}/>;
};

export const DividerChart: React.FC<{ chart: Mynote.ApiAggDividerChart }> = ({ chart }) => {
  return <Divider orientation={chart.orientation}>{chart.title}</Divider> 
};

//将长字符串折行显示
export function splitStr(str:string,len:number){
  let strArr = str.split("")
  let strLen = strArr.length
  let strArr2 = []
  let str2 = ""
  for(let i=0;i<strLen;i++){
    if(i%len==0&&i!=0){
      strArr2.push(str2)
      str2=""
    }
    str2+=strArr[i]
  }
  strArr2.push(str2)
  return strArr2.join("\n")
}
export const BarChart: React.FC<{ chart: Mynote.ApiAggBarChart,options:{isHorizontal:boolean} ,isMerged:boolean}> = ({ chart,options,isMerged }) => {
  if(options.isHorizontal){
    const data = chart.data.map((bar) => {
      const v= { 
        type: bar.label, 
        value: bar.value,
        mergedIdx:isMerged?bar.type:undefined ,
      };
      if(bar.stackField) v.stackField=bar.stackField
      return v
    });
    // isMerged=true
    // chart.external={isStack:true}
    const _config = {
      data,
      // data: [...(data.map((v,idx)=>({...v,stackField:"g1"}))),...(data.map((v,idx)=>({...v,stackField:"g2"})))],
      xField: 'value', yField: 'type',
      // seriesField: isMerged?'mergedIdx':"type",
      legend: { position: 'top-left' },
      // color:isMerged?undefined:chart.data[0]?.color,//老写法，只读了第一个的颜色，原因未知
      // yAxis: { label: { formatter: (v) => splitStr(v,20) } },
      xAxis: { title: { text: chart.x_label }, 
        label:{
          rotate:chart.external?.xLabel?.rotate || 0,
          offsetX:chart.external?.xLabel?.offsetX || 0,
          offsetY:chart.external?.xLabel?.offsetY || 0,
        }
      },
      yAxis: { title: { text: chart.y_label },
        label:{
          rotate:chart.external?.yLabel?.rotate || 0,
          offsetX:chart.external?.yLabel?.offsetX || 0,
          offsetY:chart.external?.yLabel?.offsetY || 0,
        }
      },
      axis:{position:"top",title:{text:"aaa",position:"start"}},
      barStyle:{ cursor: 'pointer', height:20, },
      // isGroup:isMerged?true:undefined,
      height:data.length*20<200?200:data.length*20,
    };
    if(isMerged){
      _config.isGroup=true;
      if(chart.external?.isStack){
        _config.isStack=true;
        _config.groupField="mergedIdx"
        _config.seriesField="stackField"
      }else{
        _config.seriesField="mergedIdx"
      }
    }else{
      if(chart.external?.isStack){
        _config.isStack=true;
      }else{
        if(chart.data?.[0]?.color) _config.color=chart.data?.map(v=>v?.color)//230331,改成数组？为啥原来只读了第一个的颜色？
      }
      if(chart.external?.isStack && !chart.data?.[0]?.color){
        _config.seriesField="stackField"
      } 
      if(chart.external?.isStack){
        if(!chart.data?.[0]?.color) _config.seriesField="stackField"
      }
      else if(chart.data?.[0].stackField)
        _config.seriesField="stackField"
    }
    // console.log(_config);
    
    return <div><Bar {..._config} /></div>
  }
  const data = chart.data.map((bar) => {
    return {
      type: bar.label,
      value: bar.value,
      mergedIdx:isMerged?bar.type:undefined,
      stackField:bar.stackField,
    };
  });

  const annotations = [];
  forEach(groupBy(data, 'type'), (values, k) => {
    const value = values.reduce((a, b) => a + b.value, 0);
    annotations.push({
      type: 'text',
      position: [k, value], //确保 position 是一个包含 x 和 y 值的数组，如 [k, value]，其中 k 是 x 轴的值，value 是 y 轴的值。
      content: `${value}`,
      style: {
        textBaseline: 'bottom',
        textAlign: 'center',
        fill: '#000', // 设置文本颜色
      },
      offsetY: -20, // 调整标注的垂直位置使用 offsetY 调整标注的垂直位置。
    });
  });
  const config: ColumnConfig = {
    data: data,
    // data: [...(data.map((v,idx)=>({...v,stackField:"g1"}))),...(data.map((v,idx)=>({...v,stackField:"g2"})))],
    xField: 'type',
    yField: 'value',
    xAxis: { title: { text: chart.x_label, }, },
    yAxis: { 
      title: { text: chart.y_label }, 
      min: isNumber(chart.external?.yMin)?chart.external.yMin:undefined,
      max: isNumber(chart.external?.yMax)?chart.external.yMax:undefined,
      // label: { formatter: (v) => splitStr(v,20) } , // 前面的label，分行显示,原理就是将长字符串拆成\n拼接的字符串，即可实现换行
      
    },
    ...(chart.data.filter((bar) => bar.color !== undefined).length == chart.data.length && {
      color: isMerged?undefined:chart.data.map((bar) => bar.color as string),
    }),

    columnStyle: { radius: [8, 8, 0, 0], }, //圆角柱子
    padding:[20,10,20,40] //整个柱形图的图像部分(canvas)的边距，
    //如果上面的label里position是top那么可能会出现文字超过边界，从而展示不全。这是就需要调整padding
    ,
    scrollbar: {
      type: 'horizontal',
    },
    label: { formatter:v=>Math.floor(v.value) }//显示整数,1.x版本写法，2.x 用text, 参考官网
  };
  // isMerged=true
  // chart.external={isStack:true}
  if(isMerged){
    config.isGroup=true;
    if(chart.external?.isStack){
      config.isStack=true;
      config.groupField="mergedIdx"
      config.seriesField="stackField"
    }else{
      config.seriesField="mergedIdx"
    }
  }else{
    if(chart.external?.isStack){
      config.isStack=true;
    }
    config.seriesField=data?.[0]?.stackField?"stackField":undefined
  }

  if(config.isStack) config.annotations=annotations //注意,单个柱子的图默认带了数字，如果是堆叠图，就需要自己加数字


  return <Column {...config} />;
};

const SinglImage: React.FC<{ url:string} >= ({ url }) => {
  const [realUrl,setRealUrl] = useState<string>()
  const getRealPath=async (url:string)=>{
    try {
      const result=(url)
      setRealUrl(result)
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(()=>{ getRealPath(url) },[])
  return realUrl?<Image width={300} height={300}
    src={realUrl}
    fallback="data:image/png;base64,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"
  />:<></>
}
export const LinImage: React.FC<{ tableResult: Mynote.ApiAggImageResult} > 
= ({ tableResult }) => {
  return <div>
      {tableResult.file_path_list.map((v,idx)=>(<SinglImage key={idx} url={FrontendPre+v}/>))}
  </div>
}

export const AntBox: React.FC<{result:Mynote.ApiAggBoxChart }> = ({result}) => {
  return (
      <Collapse defaultActiveKey={'1'}><Collapse.Panel header="" key='1'><div style={{width:"100%",overflow:"scroll"}}>
        <Box {...result.data}/>
      </div></Collapse.Panel></Collapse>
  )
};

export const CompareChart:React.FC<{result:{results:Mynote.ApiAggResult[]}}> = ({result}) => {
  const colSpan=24/result.results.length
  return (
      <Collapse defaultActiveKey={'1'}><Collapse.Panel header="" key='1'><div style={{width:"100%",overflow:"scroll"}}>
        <Row>
          {result.results?.map((cResult, index) => {
            return <Col span={colSpan} key={index}>
              {/* {[].includes(cResult.type) ? <ChartCard result={cResult} key={cResult.title+index} />:
              <Fragment key={cResult.title+index}/>} */}
            </Col>
          })}
        </Row>
      </div></Collapse.Panel></Collapse>
  )
};

export const ScatterChart:React.FC<{ tableResult: MesAPI.AggScatterResult;tips:string[]} >  = ({ tableResult,tips }) => {
  const colorArr=Object.entries(tableResult.data.colors)
  const _tips= tips || tableResult.data.tips || ['x','y','label','t']
  const timeKey=tableResult.external?.filterKey || "t"
  const discreteArr=_.uniq(tableResult.data.points.map(v=>v[timeKey])).sort((a,b)=>a-b)
  const [p,setP]=useState<number>()
  const [zoomData, setZoomData] = useState({
    xStart: 0,
    xEnd: 100,
    yStart: 0,
    yEnd: 100,
  });
  const zoomInfo=useRef() //直接使用useState，在zoomFunc中会有问题,echarts的zoom监听函数内不允许使用钩子，直接报错，所以这里先放到useRef里存着
  useEffect(()=>{
    setZoomData({...zoomInfo.current,}) //当滑块变化时，将zoomInfo.current的值赋给zoomData，这样图就不会还原成原始比例
  },[p])
  useEffect(()=>{
    zoomInfo.current={
      xStart: 0,
      xEnd: 100,
      yStart: 0,
      yEnd: 100,
    }
  },[])
  const zoomFunc=(e) => {
    // zoomfunc要处理滚动，圈选，拖动滑块三种缩放情况，并且还有拖动位移，和reset还原。
    if(e.batch){
      if(e.batch[0].dataZoomId=="dataZoomInsideX" || e.batch[0].dataZoomId=="dataZoomInsideY" || e.batch[0].start || e.batch[0].end){
        //滚动时，zoomId有值，reset时没有设置zoomid,可以通过start和end判断
        zoomInfo.current={
          xStart: e.batch[0].start,
          xEnd: e.batch[0].end,
        }
        if(e.batch[1]){ // 拖动移动时，只有batch[0]，所以这里判断一下
          zoomInfo.current={
            ...zoomInfo.current,
            yStart: e.batch[1].start,
            yEnd: e.batch[1].end,
          }
        }
      }else{//拖动圈选,没有start和end，只有startValue和endValue，所以要计算百分比
        zoomInfo.current={
          xStart:(e.batch[0].startValue-tableResult.data.min_x)/tableResult.data.width*100,
          xEnd:(e.batch[0].endValue-tableResult.data.min_x)/tableResult.data.width*100,
          yStart:(e.batch[1].startValue-tableResult.data.min_y)/tableResult.data.width*100,
          yEnd:(e.batch[1].endValue-tableResult.data.min_y)/tableResult.data.width*100,
        }
      }
    }else{//拖动滑块
      if(e.dataZoomId=="dataZoomX"){
        zoomInfo.current.xStart=e.start
        zoomInfo.current.xEnd=e.end
      }else if(e.dataZoomId=="dataZoomY"){
        zoomInfo.current.yStart=e.start
        zoomInfo.current.yEnd=e.end
      }
    }
  }
  return <>
    <React.Suspense fallback={<div>Loading...</div>}>
      <Slider min={discreteArr[0]} max={discreteArr[discreteArr.length - 1]} step={null}
        marks={discreteArr.reduce((acc, cur) => {
          acc[cur] = <span style={{display:"none"}}>{cur}</span>;
          return acc;
        }, {})}
        onChange={setP}
      />
      <ReactEcharts 
        onEvents={{dataZoom:zoomFunc,"click":(params:any,echarts:any)=>{
              console.log(params);
            }}}
        option = { {
          xAxis: {min:tableResult.data.min_x,max:tableResult.data.min_x+tableResult.data.width},
          yAxis: {min:tableResult.data.min_y,max:tableResult.data.min_y+tableResult.data.width},
          color: colorArr.map(v=>v[1]),
          legend:{
            data: colorArr.map(v=>v[0]),
            left: 'center',
          },
          series: [...colorArr.map(v=>v[0]).map(v=>({
              name:v,
              symbolSize:5,
              type:"scatter",
              data:tableResult.data.points.filter(v2=>v2.label==v).map(v2=>[v2.x,v2.y,v2]),
            }
          )),
          // 将滑块选择的点找出来，单独画一个series
          ...(p==undefined?[]:[{
            name:"selected",
            type:"scatter",
            symbolSize:10,
            data:tableResult.data.points.filter(v2=>v2[timeKey]==p).map(v2=>[v2.x,v2.y,v2]),
            itemStyle:{color:tableResult.external?.highlightColor || "purple"},
          }]),
          ],
          toolbox : {feature:{
            dataZoom:{show:true},
            dataView:{show:true,},
          }},
          dataZoom: [
            { type: 'slider', show: true, xAxisIndex: [0], start: zoomData.xStart, end: zoomData.xEnd, id:"dataZoomX" },
            { type: 'slider', show: true, yAxisIndex: [0], start: zoomData.yStart, end: zoomData.yEnd, id: 'dataZoomY' },
            { type: 'inside', xAxisIndex: [0], start: zoomData.xStart, end: zoomData.xEnd, id: "dataZoomInsideX" },
            { type: 'inside', yAxisIndex: [0], start: zoomData.yStart, end: zoomData.yEnd, id: 'dataZoomInsideY'}
            // 这里的start和end是百分比，0-100，并且是初始值，没有双向绑定，所以当滑块滑动时，虽然图会放大，但是这里的start和end并不会变化
          ],
          tooltip: {
            trigger: 'item', //如果是axis则是坐标轴触发，那么下面formatter返回的是个数组，每个元素是一个系列的item，如果是item触发，那么返回的是单个item
            axisPointer: {
              type: 'cross'
            },
            enterable: true,
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            textStyle: {
              color: '#000'
            },
            enterable: true,
            formatter: (v) => {
              return `<div style="width: 300px;overflow: visible;">
                  ${_tips.map(v2=>{
                    return (v2=="link")?`<a href="${v.data[2][v2]}" target="_blank">${v.data[2][v2]?"Link":""}</a><br/>`
                    :`<span style="width: 50px;display: inline-block;">${v2}</span>:<span style="margin-left:5px">${v.data[2][v2]}</span><br/>`
                  }).join("")}
              </div>`
            }
            // extraCssText: 'width: 170px'
          },
        }} style={{ height:710}} />
    </React.Suspense>
  </>
}

export const ScatterAntChart: React.FC<{ tableResult: MesAPI.AggScatterResult;} > 
= ({ tableResult }) => {
  const data=tableResult.data
  const tips=data.tips || ['x','y','label','t']
  const [clickLink,setClickLink] = useState<string>("")
  // data.points.map(v=>v.link="https://www.baidu.com")
// data.min_x=120.2;data.min_y=30.21;data.width=0.15
  const config = {
    appendPadding: 10,
    data:data.points,//.filter(v=>v.label=="Normal").sort((a,b)=>{ return a.x-b.x }),// .map(v=>({...v,x:parseFloat(v.x),y:parseFloat(v.y)})),
    xField: 'x', yField: 'y',
    size: 2,
    colorField: 'label', // 部分图表使用 seriesField
    color: ({ label }) => data.colors[label],
    yAxis: { nice: true, line: { style: { stroke: '#aaa', }, }, title:{text:tableResult.y_label} ,
      label:{style: { opacity: 0.6, },rotate:0,
        formatter:v=>strTofixed(v)
      },
      // ...(data.min_y==undefined?{}:{min:data.min_y,max:data.min_y+data.width,minLimit:data.min_y,maxLimit:data.min_y+data.width})
    },
    xAxis: {
      grid: {
        line: {
          style: {
            stroke: '#eee',
          },
        },
      },
      line: { style: {  stroke: '#aaa', }, },
      title:{text:tableResult.x_label},
      // ...(data.min_x==undefined?{}:{min:data.min_x,max:data.min_x+data.width,minLimit:data.min_x,maxLimit:data.min_x+data.width}),
      label:{ style: { opacity: 0.6, },rotate:0,
        formatter:v=>strTofixed(v)
      }
    },
    meta: {
      [tableResult.x_label]: { type: 'linear' },
      [tableResult.y_label]: { type: 'linear' },
    },
    tooltip:{fields:tips,domStyles:{
      "g2-tooltip-value":{width:"400px",overflow:"hidden"},
    },
  },
    // brush:{enabled:true},
    autoFit:false,
    interactions: [
      {type:"view-zoom"},
      {type:"view-drag"}
    ],
  };
  const onReadyColumn = (plot: any) => {
    plot.on('element:mousedown', (...args: any) => {
      const data = args[0].data?.data
      console.log(data);
      setClickLink(data.link)
    });
  };

  return (
    <div>
      {clickLink && <div>CLICKED LINK:<a href={clickLink} target="_blank">{clickLink}</a></div>}
      <div style={{width:700,height:700 ,overflow:"visible"}} 
        onMouseEnter={(e)=>{ document.body.style["overflow"]="hidden"}}
        onMouseLeave={(e)=>{ document.body.style["overflow"]="auto" }} >
        <Scatter {...config} onReady={onReadyColumn}/>
      </div>
    </div>
  )
};

export const MultAntScatter: React.FC<{ tableResult: MesAPI.AggMultScatterResult;} > 
= ({ tableResult }) => {
  const [clickLink,setClickLink] = useState<string>("")
  const filterTopBtns=_.uniq(tableResult.data.map(v=>v.filter_type)) //第一排按钮
  
  const [selectFilterBtn,setSelectFilterBtn]=useState<string>(filterTopBtns[0])
  const [pointsColors,setPointsColors]=useState<any>(tableResult.data.filter(v=>v.filter_type==filterTopBtns[0]))
  const [tips,setTips] = useState<string[]>(tableResult.data?.[0]?.tips || tableResult.tips || ['x','y','label','t'])  
  const config = {
    appendPadding: 10,
    xField: 'x', yField: 'y',
    size: 2,
    colorField: 'label', // 部分图表使用 seriesField
    // color: ({ label }) => data.colors[label],
    yAxis: { nice: true, line: { style: { stroke: '#aaa', }, }, title:{text:tableResult.y_label} ,
      label:{style: { opacity: 0.6, },rotate:0,formatter:v=>strTofixed(v)}
    },
    xAxis: {
      grid: {line: {style: {stroke: '#eee'}}},
      line: { style: {  stroke: '#aaa', }, },
      title:{text:tableResult.x_label},
      label:{ style: { opacity: 0.6, },rotate:0,formatter:v=>strTofixed(v)}
    },
    meta: {
      [tableResult.x_label]: { type: 'linear' },
      [tableResult.y_label]: { type: 'linear' },
    },
    tooltip:{fields:tips,domStyles:{"g2-tooltip-value":{width:"400px",overflow:"hidden"}}},
    autoFit:false,
    interactions: [
      {type:"view-zoom"},
      {type:"view-drag"}
    ],
  };
  const onReadyColumn = (plot: any) => {
    plot.on('element:mousedown', (...args: any) => {
      const data = args[0].data?.data
      console.log(data);
      setClickLink(data.link)
    });
  };

  return (
    <div>
        <Radio.Group style={{marginTop:10}} value={selectFilterBtn} buttonStyle="solid" onChange={(e)=>{
            setSelectFilterBtn(e.target.value)
            setPointsColors(tableResult.data.filter(v=>v.filter_type==e.target.value))
            setTips(tableResult.data.filter(v=>v.filter_type==e.target.value)[0]?.tips || tableResult.tips || ['x','y','label','t'])
        }}>
            {filterTopBtns.map(v=>{
                return <Radio.Button  value={v} key={v}>{v}</Radio.Button>
            })}
        </Radio.Group>
      {clickLink && <div>CLICKED LINK:<a href={clickLink} target="_blank">{clickLink}</a></div>}
      <Row>
        {pointsColors.map((v,idx)=><Col span={12} key={idx}>
            <div style={{ width:650,height:710, overflow:"visible",marginTop:14}} 
              onMouseEnter={(e)=>{ document.body.style["overflow"]="hidden"}}
              onMouseLeave={(e)=>{ document.body.style["overflow"]="auto" }} >
              {v.visual_type}
              <Scatter {...config} height={630} data={v.points} color={({ label }) => v.colors[label]} onReady={onReadyColumn}/>
            </div>
        </Col>)}
      </Row>
    </div>
  )
};

export const MultScatter:React.FC<{ tableResult: MesAPI.AggMultScatterResult;span?:number} > 
= ({ tableResult,span }) => {
  const filterTopBtns=_.uniq(tableResult.data.map(v=>v.filter_type)) //第一排按钮
  const [selectFilterBtn,setSelectFilterBtn]=useState<string>(filterTopBtns[0])
  const [pointsColors,setPointsColors]=useState<any>(tableResult.data.filter(v=>v.filter_type==filterTopBtns[0]))
  const [tips,setTips] = useState<string[]>(tableResult.data?.[0]?.tips || tableResult.tips || ['x','y','label','t'])

  return <div>
    <Radio.Group style={{marginTop:10}} value={selectFilterBtn} buttonStyle="solid" onChange={(e)=>{
        setSelectFilterBtn(e.target.value)
        setPointsColors(tableResult.data.filter(v=>v.filter_type==e.target.value))
        setTips(tableResult.data.filter(v=>v.filter_type==e.target.value)[0]?.tips || tableResult.tips || ['x','y','label','t'])
    }}>
        {filterTopBtns.map(v=>{
            return <Radio.Button  value={v} key={v}>{v}</Radio.Button>
        })}
    </Radio.Group>
    <Row>
      {pointsColors.map((v,idx)=><Col span={span || 12} key={idx}>
          <div style={{ width:650,height:710, overflow:"visible",marginBottom:70}}>
            {v.visual_type}
            <ScatterChart tableResult={{data:v,tips,external:tableResult.external}} />
          </div>
      </Col>)}
    </Row>
  </div>
}

const getWidthByNum=(n:number)=>{
  if(n<3) return 650
  else return 500
}
export const CompareMultScatter: React.FC<{ scatterResults:MesAPI.AggMultScatterResult[]}>
  = ({ scatterResults }) => {
  // const filterTopBtns=_.uniq(scatterResults.map(v0=>v0.data.map(v=>v.filter_type)).flat()) //第一排按钮
  // const [selectFilterBtn,setSelectFilterBtn]=useState<string>(filterTopBtns[0])
  // const [pointsColors,setPointsColors]=useState<any[]>(scatterResults.map(v=>v.data.filter(v2=>v2.filter_type==filterTopBtns[0])))
  return <div>
    {/* <Radio.Group style={{marginTop:10}} value={selectFilterBtn} buttonStyle="solid" onChange={(e)=>{
      setSelectFilterBtn(e.target.value)
      setPointsColors(scatterResults.map(v=>v.data.filter(v2=>v2.filter_type==e.target.value)))
    }}>
      {filterTopBtns.map(v=>{
        return <Radio.Button  value={v} key={v}>{v}</Radio.Button>
      })}
    </Radio.Group> */}
    <Row>
      {scatterResults.map((v,idx)=><Col span={24/scatterResults.length} key={idx}>
        {/*将原来的multScatter竖向排列， 几个任务对比就分成几列，每个multScatter占1列，必须是24的约数列 */}
        {/* {v.data.map((v2,idx2)=><div key={idx2} style={{  width:650,height:710, overflow:"visible",marginTop:14}}>
          {pointsColors[idx][idx2]?.visual_type+" "+v.taskNum}
          <ScatterChart tableResult={{data:v2,tips:v2.tips}} />
        </div>)} */}
        <MultScatter tableResult={{data:v.data,external:v.external}} span={24} />
      </Col>)}
    </Row>
  </div>
}

// 测试apa格式数据的格式是否正确的页面
const TestCharts:React.FC=()=>{
    const [mesStr,setMesStr]=useState("")
    const [TestMesObjData,setData]=useState()
    useEffect(()=>{
      safeReq(async()=>{
        return await request(`${ExpressUrl}/chart_data`)
      },res=>{
        setData(res)
      })
    },[])
    const getJson=(v:string)=>{
        try{
            const result=JSON.parse(v)
            return result
        }catch(e){
            return null
        }
    }
    return <div>
        ObjTest 示例:(数据来源于后端express项目，请先启动项目)
        <ReactJson src={TestMesObjData} name={false} collapsed={true} />
        <Input.TextArea value={mesStr} onChange={(v)=>setMesStr(v.target.value)} rows={5}/> 
        {mesStr && <GetChartCards category={null} resultData={getJson(mesStr)}/>}

    </div>
}
export default TestCharts