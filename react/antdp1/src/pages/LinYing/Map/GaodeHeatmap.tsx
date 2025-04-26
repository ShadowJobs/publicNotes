// 打开docoment.ejs里的这一样，即可显示。注意版本号：需要2.0版本的才能打开这种热力图
{/* <script type="text/javascript" src="https://webapi.amap.com/maps?v=2.0&key=xxxx"></script> */ }

import { loadGaode } from "@/utils";
import { Button } from "antd";
import { useEffect, useState } from "react"
// declare var Loca:any
const Gaode: React.FC = () => {
    const [heatmap, setheatmap] = useState()
    const [heatMapData, setHeatMapData] = useState([])
    useEffect(() => {
      const refreshMap=()=>{
        var map = new AMap.Map('gaodemap', {
            resizeEnable: true, center: [116.410588, 39.940089], zoom: 11
        })
        var heatmapData = [{ "lng": 116.191031, "lat": 39.988585, "count": 10 },
        { "lng": 116.389275, "lat": 39.925818, "count": 11 },
        { "lng": 116.287444, "lat": 39.810742, "count": 12 },
        { "lng": 116.481707, "lat": 39.940089, "count": 13 },
        { "lng": 116.410588, "lat": 39.880172, "count": 14 },
        { "lng": 116.394816, "lat": 39.91181, "count": 15 },
        { "lng": 116.416002, "lat": 39.952917, "count": 16 },
        { "lng": 116.39671, "lat": 39.924903, "count": 17 },
        { "lng": 116.180816, "lat": 39.957553, "count": 18 },
        { "lng": 116.382035, "lat": 39.874114, "count": 19 },
        { "lng": 116.316648, "lat": 39.914529, "count": 20 },
        { "lng": 116.395803, "lat": 39.908556, "count": 21 },
        { "lng": 116.74553, "lat": 39.875916, "count": 22 },
        { "lng": 116.352289, "lat": 39.916475, "count": 23 },
        { "lng": 116.441548, "lat": 39.878262, "count": 24 },
        { "lng": 116.318947, "lat": 39.942735, "count": 25 },
        { "lng": 116.382585, "lat": 39.941949, "count": 26 },
        { "lng": 116.42042, "lat": 39.884017, "count": 27 },
        { "lng": 116.31744, "lat": 39.892561, "count": 28 },
        { "lng": 116.407059, "lat": 39.912438, "count": 29 },
        { "lng": 116.412351, "lat": 39.888082, "count": 30 },
        { "lng": 116.444341, "lat": 39.915891, "count": 31 },
        { "lng": 116.335385, "lat": 39.741756, "count": 32 },
        { "lng": 116.3926, "lat": 40.008733, "count": 33 },
        { "lng": 116.389731, "lat": 39.92292, "count": 34 },
        { "lng": 116.413371, "lat": 39.874483, "count": 35 },
        { "lng": 116.199752, "lat": 39.911717, "count": 36 }]
        setHeatMapData([...heatmapData])
        //热力图-----
        map.plugin(["AMap.HeatMap"], function () {
            //初始化heatmap对象
            let heatmap0 = new AMap.HeatMap(map, {
                radius: 15, //给定半径
                opacity: [0.6, 1],
                gradient: {
                    0.1: 'white',
                    0.4: 'blue',
                    0.7: 'red'
                }
            });
            setheatmap(heatmap0)
            //设置数据集：该数据为北京部分“公园”数据
            heatmap0.setDataSet({
                data: heatmapData,
                max: 100
            });
        });
        map.plugin(["AMap.HeatMap"], function () {
            //初始化heatmap对象
            let heatmap0 = new AMap.HeatMap(map, {
                radius: 15, //给定半径
                opacity: [0.6, 1],
                gradient: {
                    0.1: 'yellow',
                    0.4: 'blue',
                    0.7: 'black'
                }
            });
            setheatmap(heatmap0)
            //设置数据集：该数据为北京部分“公园”数据
            heatmap0.setDataSet({
                data: heatmapData.map(v => { return { ...v, lat: v.lat + 0.1 } }),
                max: 100
            });
        });
        // 热力图-----
      }
      if(!window.AMap){ loadGaode(refreshMap) }
      else refreshMap()
    }, [])
    return <div>
        <div id="gaodemap"></div>
        {heatmap && <div>
            <Button className="btn" onClick={() => { heatmap.show() }}>显示热力图 </Button>
            <Button className="btn" onClick={() => {
                setHeatMapData(v => {
                    v = v.map(v2 => { v2.lat += 0.1; return v2 })
                    heatmap.setDataSet({ data: v, max: 100 })
                    return v
                })
            }}> 更新点
            </Button>
        </div>}
    </div>
}
export default Gaode
