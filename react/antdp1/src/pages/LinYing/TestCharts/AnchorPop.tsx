
////锚点菜单
//使用方法：摆按钮：<div style={{marginLeft:-100,marginTop:-50}}>
//<AnchorPop results={aggregations['0']?.data.map(v=>{return {anchor:v.title,title:v.title}})} /></div>
// 然后在需要锚点的<>里加上id属性，
import {  CloseCircleTwoTone } from "@ant-design/icons";
import { Affix, Anchor, BackTop, Button, Card, Popover, Select, Space } from "antd";
import _ from "lodash";
import { useEffect, useState } from "react";
const { Link } = Anchor;
const backTopStyle: React.CSSProperties = {
    height: 40,
    width: 40,
    lineHeight: '40px',
    borderRadius: 4,
    backgroundColor: '#1088e9',
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  };
const AnchorPop:React.FC<{results?:any[],setResult:Function,initResults:any[],loadAll:Function,meta:any}>=
({results,setResult,initResults,meta,loadAll})=>{  
    // meta={
    //     "filter_type":["dt_source-reloc","dt_source-egopose"],
    //     "visual_type":["线路级MPD"]
    //   }
    //   initResults.map(v=>{
    //     if(v.title.startsWith("[")) v.external={filters:{filter_type:v.title.slice(1,v.title.length-1).split(']')[0]}}
    //     if(v.title.startsWith("[")) v.external && (v.external.filters.visual_type=v.title.slice(1,v.title.length).split(']')[1])
    //   })
    const [visible, setVisible] = useState(false);
    const [selectedTypes,setSelectedTypes]=useState<string[]>([])
    const [selectedFilters,setSelectedFilters]=useState(meta || {}) //结构：{filter_type:["dt_source-filter"],visual_type:["线路级MPD"]}
    const typeOptions:string[]=_.uniq(initResults.map(v=>v.type))
    const hasFilter=initResults.some(v=>(v.external?.filters && Object.keys(v.external.filters).length>0))
    const userFilterKeys:string[]=_.uniq(initResults.filter(v=>Boolean(v.external?.filters)).map(v=>Object.keys(v.external.filters)).flat())

    const filterData=(userfilters:any,chartTypes:string[]=[])=>{
        let filteredResult:any[]=[...initResults]
        const filterKeys:string[]=Object.keys(userfilters || {}).filter(v=>userfilters[v].length>0) //用户输入的
        filterKeys.map(key=>{
            filteredResult=filteredResult.filter(v=>!v.external?.filters?.[key] || (userfilters[key].includes(v.external.filters[key])))
        })
        if(chartTypes.length>0){
            filteredResult=filteredResult.filter(v=>chartTypes.includes(v.type))
        }
        return filteredResult
    }
    
    useEffect(()=>{
        setResult(filterData(meta,[]))
    },[])
    useEffect(()=>{setResult(filterData(meta,[])) },[initResults])//这个监听控制reports部分的折线图等的刷新
    const getAnchorList=()=>{return results?.filter(v=>Boolean(v.title)) || []}
    return (<div style={{position:"relative",top:-15}}>
        <div style={{position:"absolute",top:0,left:0,zIndex:20}}>
        <Affix offsetTop={10}><div>
            <Space>
                {getAnchorList().length>0 &&<Button type="primary" onClick={()=>setVisible(v=>!v)}>Quick Links</Button>}
                {hasFilter && <Popover placement="bottom" content={<div>
                    {userFilterKeys.map(v=>{
                        return <div key={v}>
                            <span style={{display:"inline-block",width:90}}>{v}:</span>
                            <Select defaultValue={meta?.[v]} style={{width:300}} mode="multiple" allowClear onChange={val=>{
                                setSelectedFilters(pre=>{
                                    setResult(filterData({...pre,[v]:val},selectedTypes))
                                    return {...pre,[v]:val}
                                })
                            }}>
                                {_.uniq(initResults.filter(v2=>Boolean(v2.external?.filters)).map(v2=>v2.external.filters[v])).filter(v2=>Boolean(v2)).
                                    map(v2=><Select.Option key={v2} label={v2}>{v2}</Select.Option>)}
                            </Select>
                            <br/>
                            <br/>
                        </div>
                    })}
                    <div>
                        <span style={{display:"inline-block",width:90}}>ChartType:</span>
                        <Select style={{width:300}} mode="multiple" allowClear onChange={v=>{
                            setSelectedTypes(v)
                            setResult(filterData(selectedFilters,v))
                        }}>
                            {typeOptions.map(v=><Select.Option key={v} label={v}>{v}</Select.Option>)}
                        </Select>
                    </div>
                </div>} title="Filter charts"
                >
                    <Button type="primary">Filters</Button>
                </Popover>}
            </Space>
            {visible && <Card style={{height:"80vh",overflow:"scroll"}}>
                <Button icon={<CloseCircleTwoTone/>} type="text" style={{position:"absolute",right:20}} onClick={()=>{
                    setVisible(false)
                }}/>
                <Anchor onChange={()=>loadAll?.()}
                    onClick={(e)=>{
                        setVisible(false)
                    }} affix={false}>
                    {getAnchorList().map((result, index)=>{
                        return <Link href={"#"+encodeURIComponent(result.title)} title={result.title} key={index}/>
                    })}
                </Anchor>
                </Card>}
            </div>
        </Affix>
        <BackTop><div style={backTopStyle}>Top</div></BackTop>
    </div></div>

    )
  }

export default AnchorPop;