// 高德里显示可以点击的点
// 依赖的高德版本在document.ejs里，依赖的版本jsapi版本1.4.15，loca版本1.3.2

import { loadGaode } from "@/utils";
import { Button, Space } from "antd";
import { useEffect, useRef, useState } from "react"
import GaodeMergedMap from "./GaodeMergedMap";

const GaodeMap: React.FC = () => {
  const [map, setMap] = useState<any>()
  // const [winOpen,setWinOpen]=useState(false) //方法2：用useState来控制winOpen，这个的问题是，moveFunc里的winOpen和click里setWinOpen不是一个值，导致失效，所以用方法3
  const winPinned = useRef(false) //方法3，不会

  const mapResult = {
    "data": [
      {
        "data": {
          "colors": {
            "bluetype": "blue",
            "greentype": "green"
          },
          "points": [
            {
              "label": "greentype",
              "lat": 30.23557627612778,
              "lon": 120.22875856824594,
              "t": 1650373848.197394,
              "link": "https://www.baidu.com"
            },
            {
              "label": "greentype",
              "lat": 30.215597055612058,
              "lon": 120.22879711204617,
              "t": 1650373848.497396
            },
            {
              "label": "bluetype",
              "lat": 30.205630141295875,
              "lon": 120.22885878716548,
              "t": 1650373848.977403,
              "link": "https://www.baidu.com"
            },
            {
              "label": "greentype",
              "lat": 30.215649321314896,
              "lon": 120.22889471688984,
              "t": 1650373849.257408,
              "link": "https://www.baidu.com"
            },
            {
              "label": "bluetype",
              "lat": 30.2456714434218,
              "lon": 120.22893569533666,
              "t": 1650373849.57741,
              "link": "https://www.baidu.com"
            }
          ]
        },
        "func": "cmp"
      },
      {
        "data": {
          "colors": {
            "status_1": "orange",
            "status_2": "green"
          },
          "label": "status_tag_traj",
          "min_x": 120.22064695800002,
          "min_y": 30.216466079,
          "points": [
            {
              "label": "status_1",
              "lat": 30.217576338700002,
              "lon": 120.23349441689998,
              "t": 1650373842.006984,
              "link": "https://www.baidu.com"
            },
            {
              "label": "status_1",
              "lat": 30.2175779349,
              "lon": 120.21349666530002,
              "t": 1650373842.026984,
              "link": "https://www.baidu.com"
            },
            {
              "label": "status_2",
              "lat": 30.217579449500008,
              "lon": 120.2234988708,
              "t": 1650373842.046984,
              "link": "https://www.baidu.com"
            },
            {
              "label": "status_2",
              "lat": 30.2175810789,
              "lon": 120.25350105259999,
              "t": 1650373842.066984,
              "link": "https://www.baidu.com"
            }
          ],
          "width": 0.10942521849997888
        },
        "func": "LinYing"
      }
    ],
    "map_title": "map",
    "type": "map"
  }
  const [filterBtns, setFilterBtns] = useState<string[]>(mapResult.data.map(v => v.func))
  const refreshMap = (idx: number = 0) => {
    const _pointCenter = mapResult.data[idx].data.points[Math.floor(mapResult.data[idx].data.points.length / 2)]
    const center = mapResult.data[idx].data.center || [_pointCenter.lon, _pointCenter.lat]
    const mp = new AMap.Map('gaodemap', { resizeEnable: true, center: center, zoom: 13 })
    setMap(mp)
    // let winOpen=false //方法1：用局部变量来控制浮动框的固定，问题是：无法在外部用按钮点击来修改winOpen的值，因为要加入关闭按钮来控制，要用react，那么这个值必须用useState
    const moveFunc = (ev) => { // 事件类型 
      // if(winOpen) return //bug
      if (winPinned.current) return //已经固定了的浮窗，不再变化数值
      var rawData = ev.rawData; // 原始鼠标事件 
      var originalEvent = ev.originalEvent;
      openInfoWin(mp, originalEvent, rawData);
    }
    const _infoWin = new AMap.InfoWindow({
      autoMove: false,
      isCustom: true,  //使用自定义窗体
      offset: new AMap.Pixel(130, 100)
    })
    function closeInfoWin() { _infoWin.close(); }
    const infoDom = document.createElement('div');
    infoDom.className = 'info';

    const closeBtn = document.createElement('div');///加入一个点击按钮
    closeBtn.innerHTML = 'X';
    closeBtn.style.cssText = "position:absolute; top: 10px; right: 10px; cursor:pointer;";
    closeBtn.addEventListener("click", () => { //html的js按钮原始写法： 给按钮加点击事件
      winPinned.current = false
      closeInfoWin();
    });


    const _tableDom = document.createElement('table');
    infoDom.appendChild(_tableDom);
    infoDom.appendChild(closeBtn); // 将关闭按钮插入到信息窗口内
    _infoWin.setContent(infoDom);

    const layerDatas: any = {}
    const pTypes: string[] = Object.keys(mapResult.data[idx].data.colors)

    const openInfoWin = (map, event, content) => {
      var x = event.offsetX;
      var y = event.offsetY;
      var lngLat = map.containerToLngLat(new AMap.Pixel(x, y));
      var trStr = '';
      for (var name in content) {
        var val = content[name];
        trStr +=
          '<tr>' +
          '<td class="label" style="font-weight:bold;">' + name + ': </td>' +
          '<td>&nbsp;</td>' +
          '<td class="content">' + (name == "link" ? `<a href="${val}" target="_blank">GO</a>` : val) + '</td>' +
          '</tr>'
      }
      _tableDom.innerHTML = trStr;
      _infoWin.open(map, lngLat);
    }
    pTypes.map(tp => {
      layerDatas[tp] = { points: mapResult.data[idx].data.points.filter(v => v.label == tp), color: mapResult.data[idx].data.colors[tp] }
      var layer = new Loca.PointLayer({ eventSupport: true, map: mp });
      layer.on('mousemove', moveFunc);
      layer.on('click', (ev) => {
        // winOpen=!winOpen //方法1的写法问题：当点比较密集，有2个点重合时，这个click会执行2次，导致winOpen会先true，再false，等于没有点，所以改用方法2
        //setWinOpen(true)//方法2
        winPinned.current = true
        var rawData = ev.rawData; // 原始鼠标事件 
        var originalEvent = ev.originalEvent;
        openInfoWin(mp, originalEvent, rawData);
      });
      layer.on('mouseleave', () => {
        // if(!winOpen) //方法2的bug: 虽然click里已经set为true了，但是，这里的winOpen还是false，所以改用方法3 useRef
        if (!winPinned.current)
          closeInfoWin();
      });
      layer.setData(layerDatas[tp].points, {
        lnglat: (v: any) => {
          return [v.value.lon, v.value.lat];
        }
      });
      layer.setOptions({
        style: {
          radius: 5,
          color: layerDatas[tp].color,
          borderColor: layerDatas[tp].color,
          borderWidth: 1.5,
          opacity: 0.8
        },
        selectStyle: { radius: 7, color: layerDatas[tp].color }
      });
      layer.render();
    })
    return () => {
      mp.destroy()
    }
  }
  useEffect(()=>{
    if(!window.AMap){ loadGaode(refreshMap) }
    else refreshMap()
  }, [])
  return <div>
    <div id="gaodemap"></div>
    <div style={{ marginTop: 10 }}>
      <Space>
        {filterBtns.map(v => {
          return <Button key={v} onClick={() => {
            map.destroy()
            const idx = mapResult.data.findIndex(v2 => v2.func == v)
            refreshMap(idx)
          }}>{v}</Button>
        })}
      </Space>
    </div>

    <GaodeMergedMap maps={[mapResult,mapResult]}/>
  </div>
}
export default GaodeMap
