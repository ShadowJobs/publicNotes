import React, { useState } from 'react';
import { Col, Collapse, Input, Popover, Switch } from 'antd';
import { LineChart, PieChart, BarChart, ScatterChart, DividerChart, LinImage, AntBox, } from './Charts';
import SelfTable from './Table2';
import { DownloadOutlined, DownOutlined } from '@ant-design/icons';
import { AntTable } from './AntTable';
import { addPreSum, downloadData } from '@/utils';
const ReactEcharts = React.lazy(() => import('echarts-for-react'));

import * as echarts from "echarts"

window.ly_echarts= echarts //这样可以将renderItem通过window传递给echarts的option
export const loopTransJsonFunc=(data:any)=>{
    if(typeof data==="object" && data!==null){
      Object.keys(data).map(v=>{
          if(typeof data[v]==="string" && data[v].includes("function")){
            // 坑： 将所有的字符串function转换为实际的function，注意定义的function不是有()的，例如eval("(function(a,b){return a+b})")是可以的，必须将function用()包裹起来,否则拿不到
              data[v]=eval(`(${data[v]})`)
          }else if(typeof data[v]==="object" && data[v]!==null){
            loopTransJsonFunc(data[v])
          }else if(Array.isArray(data[v])){
            data[v].map((v0:any)=>loopTransJsonFunc(v0))
          }
      })
    }
}
const HalfColTypes=["scatter",'echart','json','line','pie','bar','StackArea','box']

export const FreeEchart:React.FC<{result:Mynote.AggFreeEchart}>=({result})=>{
  const customizeFuncs={
    "customize_adas_1":function (params) {
      const tip = params[0].data.tip;
      return `x: ${params[0].name}<br>${params[0].marker}y: ${params[0].value}<br>提示: ${tip}`;
    }
  }

  loopTransJsonFunc(result)
  return <div style={{}}>{result.data &&
      <React.Suspense fallback={<div>Loading...</div>}>
      <ReactEcharts option = { {...result.data,
        toolbox : {feature:{dataZoom:{show:true}}},
        tooltip : result.data.tooltip?
          {
            ...result.data.tooltip,
            formatter:result.data.tooltip.func?customizeFuncs[result.data.tooltip.func]:undefined
          }:{show:true,trigger:'axis'}
      }}
      style={{
        height:result.external?.echartHeight?(result.external.echartHeight):500,
        width:result.external?.echartWidth?(result.external.echartWidth):undefined,
      }}
      />
      </React.Suspense>
  }</div>
}
const ChartCard: React.FC<{ result: Mynote.ApiAggResult; isMerged?: boolean,team?:string}> = ({
  result,team,isMerged = false,
}) => {
  const [isHorizontal, setIsHorizontal] = useState(result.horizontal?true:false);
  if(result.type=='feishu' && !result.content?.body?.blocks?.[0]?.preSum){
    addPreSum(result.content)
  }
  const reportMap = {
    line: <LineChart chart={result as Mynote.ApiAggLineChart} />,
    pie: <PieChart chart={result as Mynote.ApiAggPieChart} />,
    bar: <BarChart chart={result as Mynote.ApiAggBarChart}  options={{ isHorizontal}} isMerged={isMerged}/>,
    table: <SelfTable tableResult={result as Mynote.ApiAggTableResult} isMerged={isMerged}/>,
    antTable: <AntTable tableResult={result as Mynote.ApiAggAntTableResult} isMerged={isMerged}/>,
    box: <AntBox result={result as Mynote.ApiAggBoxChart} />,
    scatter: <ScatterChart tableResult={result as Mynote.ApiAggScatterResult}/>,
    divider: <DividerChart chart={result as Mynote.ApiAggDividerChart} />,
    html: (result.content?.map?.((v,idx)=>(<iframe title="resg" srcDoc={v} key={idx}
      style={{ width: '100%', border: '0px', height: '300px' }}
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      scrolling="auto"
    />))),
    no_show: <></>,
    image: <LinImage tableResult={result as Mynote.ApiAggImageResult}/>,
    echart:<FreeEchart result={result as Mynote.ApiAggFreeEchart}/>,
    embeddedPage:<iframe src={result?.data?.url} width={"100%"} height={300}/>,
  };
  const downloadIcon=(
    <DownloadOutlined
      onClick={() => {
        // const csv: (number | string)[] = [];
        const table = result as Mynote.ApiAggTableResult;
        const _data: any[] = []
          table.indicators.map(k=>{
            const el={indicator: k, ...table.values[k]}
            if(table.values[k].url && !table.values[k].url.startsWith("http")){
              el.url=`${window.location.origin}${table.values[k].url}`
            }
            _data.push(el)
        })
        downloadData(_data)
        // console.log(table.values);
        // let headers = table.headers;
        // if (!headers) {
        //   headers = [];
        //   table.indicators.map((indicator) => {
        //     Object.keys(table.values[indicator]).map((header) =>
        //       (headers as string[]).push(header),
        //     );
        //   });
        //   headers = [...new Set(headers)];
        // }
        // csv.push(['', ...headers].join(','));
        // table.indicators.map((indicator) => {
        //   const row: (string | number)[] = [indicator];
        //   (headers as string[]).map((header) => {
        //     // row.push(table.values[indicator][header]);
        //     let d=table.values[indicator][header]
        //     if(d?.indexOf?.("http")==0){
        //       row.push(`${window.location.origin}/${d}`)
        //     }else {
        //       if(d?.replace) row.push(d.replaceAll(',','，'))
        //       else row.push(d)
        //     }
        //   });
        //   csv.push(row.join(','));
        // });
        // const csvStr = csv.join('\n');
        // const filename = `${table.title}.csv`;
        // const link = document.createElement('a');
        // link.style.display = 'none';
        // link.setAttribute('target', '_blank');
        // link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvStr));
        // link.setAttribute('download', filename);
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
      }}
    />
  )
  const extraMap = {
    bar:(
      <Popover placement="bottom"
        content={
          <div>
            {isHorizontal?('横向'):('纵向')}
            <Switch onChange={(checked) => setIsHorizontal(checked)} checked={isHorizontal}/>
          </div>
        }
        trigger="hover"
      >
        <DownOutlined />
      </Popover>
    ),
    table: downloadIcon,
    antTable: downloadIcon,
  };
  if(result.type === 'divider'){
    return(reportMap[result.type])
  }
  let span=24
  if(result.external?.span) span=result.external.span
  else{
    if(HalfColTypes.includes(result.type)) span=12
  }
  return (
    <Col xs={{ span: 24 }} xxl={{ span: span }}>
    <Collapse defaultActiveKey={result.external?.collapsed?'':"1"} ><Collapse.Panel collapsible="header" id={encodeURIComponent(result.title || result.map_title)} header={result.type === 'json' ? '' : (result.title || result.map_title || "-")}
        extra={extraMap[result.type]} 
        key='1'><div style={{width:"100%"}}>
        <div>{result.external?.annotation}</div>
        {reportMap[result.type] || <Input.TextArea value={JSON.stringify(result.data,null,2)} />}
      </div></Collapse.Panel></Collapse>
    </Col>
  );
};

export default ChartCard;
