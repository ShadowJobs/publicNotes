import _ from "lodash";
import { Card, Col, Radio, Row, Switch } from "antd";
import { useEffect, useState } from "react"
import { getMapInfoWinStr, loadGaode } from "@/utils";
const GaodeMergedMap:React.FC<{maps:noteapi.AggGaodeMap[]}>=({maps})=>{
    const [drawedMaps,setDrawedMaps]=useState<any>([])
    maps.map(v=>v.data.sort((a,b)=>b.data.order-a.data.order))
    const filterTopBtns=_.uniq(maps.map(v=>v.data.map(v=>v.select_type)).flat()) //第一排按钮
    // mapResult.data.filter(v=>v.select_type==filterBtns2[0]).map(v=>v.func)
    const initBtns=_.uniq(maps.map(v0=>v0.data.filter(v=>v.select_type==filterTopBtns[0]).map(v=>v.func)).flat())
    const [filterBtns,setFilterBtns]=useState<string[]>(initBtns)
    const [selectFilterBtn,setSelectFilterBtn]=useState<string>(initBtns[0])
    const [layers,setLayers]=useState<any[]>([])
    const [relate,setRelate]=useState(true)
    let [tmin,tmax]=[3000000000,0]
    maps.map(mapResult=>mapResult.data.map(v=>{
        v.data.points.map(p=>{
            tmin=Math.min(tmin,p.t)
            tmax=Math.max(tmax,p.t)
        })
    }))

    const refreshMap=(idx:number=0,lastCenter:number[],lastZoom:number,midx:number)=>{
        const mapResult=maps[midx]
        if(!mapResult.data || mapResult.data.length==0 || !window.AMap) return 
        if(idx==-1){
            setLayers(pre=>{
                const newLayers=[...pre]
                newLayers[midx]=null
                return newLayers
            })
            return 
        }
        const _pointCenter=mapResult.data[idx].data.points[Math.floor(mapResult.data[idx].data.points.length/2)]
        const center=mapResult.data[idx].data.center || [_pointCenter.lon,_pointCenter.lat]
        const mp=new AMap.Map(`gaodemerge${midx}`,{ resizeEnable: true, center: lastCenter || center, zoom: lastZoom || 13 })
        AMap.plugin([
            'AMap.Scale',
        ], function(){
            mp.addControl(new AMap.Scale());
        });
        setDrawedMaps(pre=>{
            const newmaps=[...pre]
            newmaps[midx]=mp
            return newmaps
        })
        let winOpen=false
        const moveFunc=(ev)=>{ // 事件类型 
            var rawData = ev.rawData; // 原始鼠标事件 
            var originalEvent = ev.originalEvent;
            openInfoWin(mp, originalEvent, rawData);
        }
        const _infoWin=new AMap.InfoWindow({
            autoMove:false,
            isCustom: true,  //使用自定义窗体
            offset: new AMap.Pixel(130, 100)
        })
        function closeInfoWin() { _infoWin.close(); }
        const infoDom = document.createElement('div');
        infoDom.className = 'info';
        const _tableDom = document.createElement('table');
        infoDom.appendChild(_tableDom);
        _infoWin.setContent(infoDom);

        const layerDatas:any={}
        const pTypes:string[]=Object.keys(mapResult.data[idx].data.colors)
        // mapResult.data[idx].data.colors.map(v=>v.label)
        const openInfoWin=(map, event, content)=> {
            var x = event.offsetX;
            var y = event.offsetY;
            var lngLat = map.containerToLngLat(new AMap.Pixel(x, y));
            
            var trStr = getMapInfoWinStr(content)
            _tableDom.innerHTML = trStr;
            _infoWin.open(map, lngLat);
        }
        const _layers:any[]=[]
        pTypes.map((tp,idxx)=>{
            const cfg:any=mapResult.data[idx].data.colors[tp]
            // mapResult.data[idx].data.colors.find(v=>v.label==tp)
            layerDatas[tp]={points:mapResult.data[idx].data.points.filter(v=>v.label==tp)}
            const layer = new Loca.PointLayer({ eventSupport: true, map: mp,
                zIndex:cfg.level,  });
            layer.on('mousemove', moveFunc);
            layer.on('click', ()=>winOpen=!winOpen);
            layer.on('mouseleave', ()=>{ if(!winOpen) closeInfoWin();});
            layer.setData(layerDatas[tp].points, { lnglat: (v:any)=>{
                return [v.value.lon, v.value.lat];
            }});
            layer.setOptions({ 
                style: {   
                    radius: cfg.radius,     
                    color: cfg.color,     
                    borderColor: cfg.color,     
                    borderWidth: 1.5,     
                    opacity: 0.8 }, 
                selectStyle: {radius: cfg.radius*1.5,color: cfg.color }
            });
            layer.render();
            _layers.push({layer,tp})
        })
        setLayers(pre=>{
            const newLayers=[...pre]
            newLayers[midx]=_layers
            return newLayers
        })
        return ()=>{
            mp.destroy()
        }
    }

    useEffect(()=>{
        const aferLoad=()=>{
            maps.map((v,idx)=>{
                const idx0=v.data.findIndex(v2=>v2.select_type==filterTopBtns[0])
                if(idx0!=-1) refreshMap(idx0,null,null,idx)
            })
        }
        if(!window.AMap){ loadGaode(aferLoad) }
        else aferLoad()
    }, [])
    useEffect(()=>{
        maps.map((v,idx)=>{
            const idx0=v.data.findIndex(v2=>v2.select_type==filterTopBtns[0])
            if(idx0!=-1) refreshMap(idx0,null,null,idx)
        })
    },[relate])
    useEffect(()=>{
        drawedMaps.map(mp=>{
            const zoomFunc=(ev)=>{
                if(!relate) return 
                const beforeLevel=mp.getZoom()
                drawedMaps.map(v=>{
                    if(v.getZoom()!=beforeLevel) v.setZoom(beforeLevel)
                })
            }
            const centerFunc=(ev)=>{
                if(!relate) return 
                const beforeCenter=mp.getCenter()
                drawedMaps.map(v=>{
                    const vCenter=v.getCenter()
                    if(vCenter.lat!=beforeCenter.lat || vCenter.lng!=beforeCenter.lng) v.setCenter(beforeCenter)
                })
            }
            mp.off("zoomend",zoomFunc)
            mp.off("moveend",centerFunc)
            mp.on("zoomend",zoomFunc)
            mp.on("moveend",centerFunc)
        })
    },[drawedMaps])
    return <Card title={maps[0].map_title}>
        
        <Switch checked={relate} checkedChildren="联动" unCheckedChildren="" style={{float:"right",top:10}} onChange={(e)=>{
            setRelate(e)
        }} />
        <Row gutter={[10,5]}>
            {maps.map((v,idx)=><Col span={24/maps.length} key={idx}>
                {v.map_title+"  "+(idx==0?'Baseline':`任务${idx}`)}
                <div id={`gaodemerge${idx}`} key={idx} style={{width:"100%", height: "80vh"}}/>
            </Col>)}
        </Row>
        <div style={{marginTop:10}}>
            <Radio.Group style={{marginTop:10}} value={selectFilterBtn} buttonStyle="solid" onChange={(e)=>{
                const map=drawedMaps[0]
                const lastCenter=map.getCenter()
                const level=map.getZoom()
                drawedMaps.map(_map=>_map.destroy())
                maps.map((v,idx2)=>{
                    const idx=v.data.findIndex(v2=>v2.func==e.target.value)
                    refreshMap(idx,lastCenter,level,idx2)
                })
                setSelectFilterBtn(e.target.value)
            }}>
                {filterBtns.map(v=>{
                    return <Radio.Button style={{marginRight:10}} value={v} key={v}>{v}</Radio.Button>
                })}
            </Radio.Group>
        </div>
    </Card>
}
export default GaodeMergedMap
