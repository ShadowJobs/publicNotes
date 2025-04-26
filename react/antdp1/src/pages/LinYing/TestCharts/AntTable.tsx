import ProTable from '@ant-design/pro-table';
import _ from 'lodash';
import { Button, Drawer, message, Popover, Slider,Tag, Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { ProFormSelect } from '@ant-design/pro-form';
import "./table.less"
import { request, useModel } from 'umi';
import { deepCopy, myTofix, toPercent } from '@/utils';
import ReactJson from 'react-json-view';
import { ActionType } from '@ant-design/pro-components';


const uniqueHeaders = (tableResult) => {
  const headers: string[] = [];
  Object.keys(tableResult.values).map((indicator) => {
    Object.keys(tableResult.values[indicator]).map((header) => {
      headers.push(header);
    });
  });
  return [...new Set(headers)];
};
export const generateSummaryTable=function(tableResult,filteredData?:any) {
  let summaryTable:any={
    "category": null,
    "headers": [ "TYPE", "count", "average score", "success rate", "green:yellow:red" ],
    "indicators": ["0","1","2"],
    "ranges": {},
    "title": "Summary",
    "type": "table",
    "values": {
        "0": {
            "TYPE": "total",
            "average score": 0,
            "count": 0,
            "green:yellow:red": "",
            "success rate": ""
        },
        "1": {
            "TYPE": "original plan",
        },
        "2": {
            "TYPE": "replan",
        }
    },
    "withColor": []
  }
  let org_plan_count:number=0;
  let replan_count:number=0;
  let org_g_count:number=0;
  let org_y_count:number=0;
  let org_r_count:number=0;
  let replan_g_count:number=0;
  let replan_y_count:number=0;
  let replan_r_count:number=0;
  let org_score:number=0;
  let replan_score:number=0;
  if(filteredData){
    filteredData.map(v=>{
      if(v.indicator.indexOf(":replan")!=-1) {
        replan_count+=1;
        if(v.score>=100) replan_g_count+=1
        else if(v.score>=60) replan_y_count+=1
        else replan_r_count+=1
        replan_score+=parseFloat(v.score)
      }else {
        org_plan_count+=1;
        if(v.score>=100) org_g_count+=1
        else if(v.score>=60) org_y_count+=1
        else org_r_count+=1
        org_score+=parseFloat(v.score)
      }
    })
  }else{
    tableResult.indicators.map(v=>{
      if(v.indexOf(":replan")!=-1) replan_count+=1;
      else org_plan_count+=1;
    })
    for(const [k,v] of Object.entries(tableResult.values)){
      if(k.indexOf(":replan")!=-1) {
        if(v.score>=100) replan_g_count+=1
        else if(v.score>=60) replan_y_count+=1
        else replan_r_count+=1
        replan_score+=parseFloat(v.score)
      } else {
        if(v.score>=100) org_g_count+=1
        else if(v.score>=60) org_y_count+=1
        else org_r_count+=1
        org_score+=parseFloat(v.score)
      }
    }
  }
  summaryTable.values['0']['count']= org_plan_count + replan_count
  summaryTable.values['0']['average score']= parseFloat(myTofix((org_score+replan_score)/(org_plan_count + replan_count) || 0))
  summaryTable.values['0']['success rate']=toPercent((org_g_count + org_y_count + replan_g_count + replan_y_count)/(org_plan_count + replan_count) || 0,2)
  summaryTable.values['0']['green:yellow:red']=`${org_g_count + replan_g_count}:${org_y_count + replan_y_count}:${org_r_count + replan_r_count}`

  summaryTable.values['1']['count']= org_plan_count
  summaryTable.values['1']['average score']= parseFloat(myTofix(org_score/org_plan_count || 0))
  summaryTable.values['1']['success rate']=toPercent((org_g_count + org_y_count)/org_plan_count || 0,2)
  summaryTable.values['1']['green:yellow:red']=`${org_g_count }:${org_y_count}:${org_r_count}`

  summaryTable.values['2']['count']= replan_count
  summaryTable.values['2']['average score']= parseFloat(myTofix(replan_score/replan_count || 0))
  summaryTable.values['2']['success rate']=toPercent((replan_g_count + replan_y_count)/replan_count || 0,2)
  summaryTable.values['2']['green:yellow:red']=`${replan_g_count}:${replan_y_count}:${replan_r_count}`
  return summaryTable
}
export const AntTable: React.FC<{ tableResult; isMerged: boolean}> = ({
  tableResult,
  isMerged,
}) => {
  const[tags,setTags]=useState<string[]>([])
  const {oriAggregation,setAggregation,generateSummary,oriAggregations,setAggregations}=useModel('aggregationModel')
  if (!Array.isArray(tableResult.indicators)) {
    message.error('indicators should be an array');
    return <></>;
  }
  const [data, setData] = useState<any[]>([])
  const headers: string[] = tableResult.headers ? tableResult.headers : uniqueHeaders(tableResult);
  const sortHeaders: string[] = tableResult.external?.sortHeaders || [];
  const hideHeaders: string[] = tableResult.external?.hideHeaders || [];  
  const styleHeaders: string[] = tableResult.external?.styleHeaders || [];
  const noPagination: string[] = tableResult.external?.noPagination;
  const externalBtns: any[] = tableResult.external?.buttons;
  const align: string= tableResult.external?.align || "";  
  const [drawerData,setDrawerData]=useState<any>()
  const onClose = () => {setDrawerData(undefined);}; 
  const tableRef = useRef<ActionType>();

  useEffect(()=>{
    tableRef.current?.reload();
  },[tableResult])
  const firstColumnName=tableResult.external?.id_name || "Event 名称"
  const [selected, setSelected] = useState<boolean[]>(new Array(tableResult.searchOption?.length || 0).fill(false) );
  const _data: any[] = []
  tableResult.indicators.map(k=>_data.push({
    indicator: k, ...tableResult.values[k]
  }))

  let searchRange:string[]=tableResult.searchRange || []
  let searchSelect:string[]=tableResult.searchSelect || []
  let searchRelate:{searchRange:string[],searchSelect:string[]}=tableResult.searchRelates || {searchRange:[],searchSelect:[]}
  const getTags=(dataArr:any[])=>{
    let headers:string[]=[]
    _.uniq(_data.map(v=>{
      Object.keys(v).map(k=>{
        if(k.indexOf("tags")==0 && v[k].length>0) 
          headers.push(v[k])
      })
    }).flat())
    return _.uniq(headers.flat())
  }
  const refreshFilters = (params?: any) => {
    if(!params) {
      setData(_data)
      setTags(getTags(_data))
      return ;
    }
    let filteredData=_data
    for (const [key, value] of Object.entries(params)) {
      if(key.indexOf('indicator')==0) filteredData=filteredData.filter(v=>v[key].indexOf(value)!=-1)
      else if(key.indexOf('tags')==0 && value && value.length>0) {
        filteredData=filteredData.filter(v=>{
          let hasTag=true;
          for(const tag of value) {
            if(!v[key].includes(tag)){hasTag=false;break;}
          }
          return hasTag;
        })
      }else{
        if(searchSelect.includes(key)){
          filteredData=filteredData.filter(v=>v[key]==value)
          if(isMerged && (searchRelate.searchSelect[key]!=undefined) ) {
            searchRelate.searchSelect[key].map((key2:string)=>{
              filteredData=filteredData.filter(v=>v[key2]==value)
            })
          }
        }else if(searchRange.indexOf(key)!=-1){
          filteredData=filteredData.filter(v=>v[key]>=value[0] && v[key]<=value[1])
          if(isMerged && searchRelate.searchRange[key]){
            searchRelate.searchRange[key].map((key2:string)=>{
              filteredData=filteredData.filter(v=>v[key2]>=value[0] && v[key2]<=value[1])
            })
          }
        }
      }
    }
    // filteredData[0].车牌=`json:{"type":"node","value":"RX5_EF04399","style":{"color":"red","backgroundColor":"#ebeb1b"}}`
    setData(filteredData)

    if(generateSummary){
      if(isMerged){
        const filteredIds=filteredData.map(v=>v.indicator)
        const copyAggs2=deepCopy(oriAggregations)
        for(const [key,value] of Object.entries(copyAggs2)){
          value.data=[...value.data.filter(v=>v.title!="Summary")]
        }
        Object.keys(copyAggs2).map((k, i) => {
          let agg=copyAggs2[k]
          let ids=[]
          agg.data[0].indicators.map(v=>{
            if(filteredIds.includes(v)) ids.push(v)
          })
          agg.data[0].indicators=ids

        })
        setAggregations(copyAggs2)
      }else{
        let summaryTable=generateSummaryTable(tableResult,filteredData)
        let copyAggs:any={...oriAggregation,data:[summaryTable,...oriAggregation.data]}
        setAggregation(copyAggs)
      }
    }
    setTags(getTags(filteredData))
    return filteredData.length
  }

  const filterButtonClicked=(searchOption:{key:string,trend?:string,type?:string},idx:number)=>{
    setSelected(pre=>{
      let result=[...pre]
      result[idx]=!result[idx]
      let filteredData=_data
      for(let i=0;i<result.length;i++){
        if(result[idx]){
          if(searchOption.trend)
            filteredData=filteredData.filter(v=>v[searchOption.key+"_"+searchOption.trend])
          else if(searchOption.type){ //仅base或仅对比
            const relatedHeaders:string=headers.filter(v=>v.indexOf(searchOption.key)==0 && v!=searchOption.key)
            const baseHeader:string=relatedHeaders.filter(v=>v.indexOf('Baseline')!=-1)
            const relatedHeader:string=relatedHeaders.filter(v=>v.indexOf('Baseline')==-1)
            filteredData=filteredData.filter(v=>{
              if(searchOption.type=='onlyBase'){
                return v[baseHeader] && (v[relatedHeader]==undefined || v[relatedHeader]=='-')
              }else 
                return (v[baseHeader]==undefined || v[baseHeader]=='-') && v[relatedHeader]
            })
          }
        }
      }
      setData(filteredData)
      if(generateSummary){
        if(isMerged){
          const filteredIds=filteredData.map(v=>v.indicator)
          const copyAggs2=deepCopy(oriAggregations)
          for(const [key,value] of Object.entries(copyAggs2)){
            value.data=[...value.data.filter(v=>v.title!="Summary")]
          }

          Object.keys(copyAggs2).map((k, i) => {
            let agg=copyAggs2[k]
            let ids=[]
            agg.data[0].indicators.map(v=>{
              if(filteredIds.includes(v)) ids.push(v)
            })
            agg.data[0].indicators=ids
          })
          setAggregations(copyAggs2)
        }else{
          let summaryTable=generateSummaryTable(tableResult,filteredData)
          let copyAggs:any={...oriAggregation,data:[summaryTable,...oriAggregation.data]}
          setAggregation(copyAggs)
        }
      }
      setTags(getTags(filteredData))
      return result
    })
  }
  const getColorClass=(d)=>{
    if(d==100) return "mes-value-with-green"
    else if(d>=60) return "mes-value-with-yellow"
    else return "mes-value-with-red"
  }
  const columns:any =[
    {
      title:firstColumnName,dataIndex:"indicator",className: `tableHead3 ${align}`,width:tableResult.external?.id_width,//colSize:1,
      onCell: () => ({ className: "prevent-click" }), hideInSearch: hideHeaders.includes("indicator") ? true : false
      //坑：合并单元格，antd旧版(4.18以前)写法是放到render里， 如下
        //   render:(value,row,index)=>{
        //     const obj={children:value,props:{}}
        //     obj.props.rowSpan=index%2==0?2:0
        //     return obj
        //   },
    },
    ...(headers.map((head:string) => ({
      title: head, dataIndex: head, className: "tableHead3",
      onCell:(row, index)=>{
        let className=`${align} `
        if(tableResult.withColor && tableResult.withColor.length>0 && head.indexOf(tableResult.withColor[0])!=-1){
          className+=getColorClass(row[head])+(head.indexOf("url")!=0?" prevent-click":"")
          return { className,style:{...(styleHeaders.includes(head)?row.style?.[head]:{})} }
        }
        if(typeof row[head]=="string" && ( row[head].startsWith("innerLink:")|| row[head].startsWith("json:"))){
          return { className ,style:{...(styleHeaders.includes(head)?row.style?.[head]:{})}}          
        }
        className+=head.indexOf("url")!=0?"prevent-click":""
        //这个rowspan主要是用来计算单元格是否合并行,colSpan是用来计算列合并的
        return ({ className ,colSpan:row.colSpan?.[head]!=undefined?row.colSpan?.[head]:1,rowSpan:row.rowSpan?.[head]!=undefined?row.rowSpan?.[head]:1,
          style:{...(styleHeaders.includes(head)?row.style?.[head]:{})}})
      },
      sorter: (sortHeaders && sortHeaders.includes(head))?(a, b) => a[head] - b[head]:undefined,
      render: head.indexOf("url")==0 ? (d, row) => {
        if (d !== undefined && d !== null) {
            return <a href={`${d}`} target="_blank">{("前往")} </a>
        }
        return d
      }:head.indexOf("tags")==0?(d,row)=>{
        return  <div>{d.sort && d.sort().map((v,idx)=>{return <Tag color="blue" key={idx}>{v}</Tag>})}</div>
      }:(_d,row)=>{
        const d=row[head]
        if(typeof d =="string"){
          if(d.startsWith("innerLink:")){ //站内url。需求：跳转到站内的一个页面，可能一个格子里有多个链接。所以用\n分割。
            const urls:string[]=d.slice(10,d.length).split("\n")
            return <div>
              {urls.filter(v=>Boolean(v)).map((v:string,idx:number)=>{
                return <a href={v} target="_blank" style={{display:"block"}} key={idx}>Link</a>
              })}
            </div>
          }else if(d.startsWith("json:")){
            const obj:any=JSON.parse(d.slice(5,d.length))
            if(obj.type=="node"){
              return <div style={obj.style}>{obj.value}</div>
            }else if(obj.type=='link'){
              return obj.url?<a href={obj.url} target="_blank" style={{display:"block"}}>{obj.name}</a>:"-"
            }else if(obj.type=='tip'){
              return <Tooltip title={obj.detail}>{obj.value}</Tooltip>
            }else if(obj.type=='pop'){
              return <Popover content={obj.content} title={obj.title}>{obj.value}</Popover>
            }else if(obj.type=='drawer'){
              return <Button type="link" onClick={()=>setDrawerData(obj)}>
                  {obj.value}
                </Button>
            }else if(obj.type=='json'){
              return <ReactJson collapsed={true} src={obj.detail} name={false} />
            }
            return <div></div>
          }
        }
        if(d==undefined) return <></>
        const [val, delta] = d.toString().split( '/splitchar/', );
          let idx=delta && (delta[delta.length-1]=="%" ? delta.length-1 : delta.length);
          return <div style={{whiteSpace: isMerged?'pre-wrap':'pre'}} >
            {val} 
            {delta !== undefined && (
              parseFloat(delta.substring(0, idx)) == 0?
                (<p className='anttable-p-value-neutral'>{delta}</p>):
              (parseFloat(delta.substring(0, idx)) > 0?
                (<p className='anttable-compare-up'>▲ {delta}</p>):
              (<p className='anttable-compare-down'>▼ {delta}</p>))
              )}
          </div>
      },
      search:(searchRange.indexOf(head)==-1 && searchSelect.indexOf(head)==-1 && (head.indexOf("tags")!=0 || head.indexOf("Baseline")!=-1))?false:undefined,
      valueType: searchSelect.indexOf(head)!=-1?"select":undefined,
      valueEnum: searchSelect.indexOf(head)!=-1?Object.fromEntries(_.uniq(_data.map(v=>v[head])).map(v=>{
        if(v?.startsWith?.("json:")) {
          const obj:any=JSON.parse(v.slice(5,v.length))
          return [v,obj.value]
        }
        return [v,v]
      })):undefined
      ,renderFormItem: searchRange.indexOf(head)!=-1? 
        (column, { type, defaultRender, ...rest }, form) => {
          if (type === 'form') { return null; }
          let minv=_.min(_data.map(v=>v[head]))
          let maxv=_.max(_data.map(v=>v[head]))
          return (
             <Slider name={head} range min={minv} max={maxv} defaultValue={[minv,maxv]}
              onChange={(v)=>{ form.setFields([{ name: head, value: v }]); }}/>
          )
        }:head.indexOf("tags")==0?(column, { type, defaultRender, ...rest }, form) => {
          if (type === 'form') { return null; }
          return (<ProFormSelect.SearchSelect placeholderAlign="left" mode="multiple"
            style={{verticalAlign:"left",textAlign:"left"}}
            placeholder=""
            options={tags.map((tag) => { return { value: tag, label: tag } })}
            fieldProps={{ labelInValue: false, }}
          />)
        }:undefined
    }))
  )]
  return (
        <div style={{width:"100%",overflow:"scroll"}}>
        {drawerData && <Drawer title={drawerData.title} placement={drawerData.placement} closable={false} onClose={onClose} 
          open={!!drawerData} key={drawerData.placement} size={drawerData.size}>
        </Drawer>}
        <ProTable columns={columns} dataSource={data} bordered rowKey="indicator" className='hoverNone'
          pagination={noPagination?false:{ pageSize: 10, }} 
          tableLayout="fixed"
          scroll={{x: 'max-content'}}          
          actionRef={tableRef}

          // rowClassName={(record,index)=>{ return index%2==0?"meRed":"meBlue" }}/>
          // {/* 隔行变色，通过变化rowClassName来控制 */}
          search={{ 
            collapsed: false, 
            className:`${tableResult.external?.breakLabel?"at-lb-mline":""}`, //控制label的换行
            span:tableResult.external?.tSearchSpan || {xs: 24,sm: 24,md: generateSummary?24:12,lg: generateSummary?24:12,
              xl: generateSummary?12:8,
              xxl: generateSummary?12:6,
            },
            labelWidth:tableResult.external?.labelWidth || 140, //自定义label宽度
          }}
          request={async (params: any) => {
            let len=refreshFilters(params)
            return { data: data, success: true, total: len }
          }}
          toolBarRender={
            () => {
              if(tableResult.searchOption){
                return tableResult.searchOption.map((v,idx)=>{
                  return v.trend?<Button key={idx} type={selected[idx]?'default':'primary'} onClick={()=>filterButtonClicked(v,idx)}>
                    {v.key+" "+v.trend}
                  </Button>
                  :v.type?<Button key={idx} type={selected[idx]?'default':'primary'} onClick={()=>filterButtonClicked(v,idx)}>
                    {v.key+" "+v.type}
                  </Button>
                  :<></>
                })
              }else if(externalBtns){
                return externalBtns.map((v,idx)=>{
                  return <Button key={idx} type={v.type} onClick={async ()=>{
                      await request<{ code: number; data?:[]; message?: string }>(
                        v.url,
                        {
                          method: v.method,
                          [v.method=="GET"?"params":"data"]:JSON.parse(v.params)
                        },
                      );
                    }}>
                    {v.name}
                  </Button>
                })
              }
              else return <></>
            }
          }
            columnsState={{defaultValue: Object.fromEntries(hideHeaders.map(v=>[v,{show:false}]))}}
        />
      </div>
  )
};

