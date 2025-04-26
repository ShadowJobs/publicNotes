// 格式化代码，每个tab用2个空格
const TestMesObjData={
  "code": 0,
  "data":[
    {
      "data": {
        "colors": {
          "absolute_position_xy_dt_traj": "green",
          "absolute_position_xy_gt_traj": "red"
        },
        "max_x": 1,
        "max_y": 2.953605059204573,
        "min_x": -0.32309820836751474,
        "min_y": 0,
        "points": [
          {
            "label": "absolute_position_xy_dt_traj",
            "time": 1706551713.669999,
            "x": -0.32281856327437203,
            "y": 0.007868343451709413,
            "link":"/user-group"
          },
          {
            "label": "absolute_position_xy_gt_traj",
            "time": 1706551714.669999,
            "x": -0.275128824141546,
            "y": 0.005043234083659237
          },
          {
            "label": "absolute_position_xy_dt_traj",
            "time": 1706551714.709998,
            "x": -0.3227865667448169,
            "y": 0.007868541217325112
          },
          {
            "label": "absolute_position_xy_gt_traj",
            "time": 1706551714.709998,
            "x": -0.27427019148891796,
            "y": 0.0053347552827535056
          }
        ],
        "tips": [
          "x",
          "y",
          "time",
          "label",
          'link'
        ],
        "width":0.2
      },
      "order": "A",
      "title": "ABSOLUTE_POSITION_XY_GT_DT_TRAJ",
      "type": "scatter",
      "x_label": "x",
      "y_label": "y",
      external:{
        filterKey:"time",
        highlightColor:"blue"
      }
    },
    {
      "data": [
        {
          "color": "#381BC2",
          "label": "rpe_seg1_err",
          "points": [
            {
              "x": 1695698873852,
              "y": 0.018759501453098574,
              "url":"https://www.qq.com"
            },
            {
              "x": 1695596733852,
              "y": 0.018596994480507376,
              "url":"https://www.baidu.com",
              "ptype":"url"
            },
          ]
        }
      ],
      "order": "B",
      "title": "imu_rpe_err_line",
      "type": "line",
      "x_label": "gyro_z(rad/s)",
      "y_label": "relative_position_err(m)",

      "external":{
        "filters":{ 
          "filter_type":"dt_source-filter",
          "visual_type":"线路级MPD",
        },
        xDate:true,
        annotaion:"noScale 可缩放",
        noScale:false,
        "sortHeaders":[],
        "pointSize":5
      } 
    },
    {
      "data": [
        {
          "color": "#381BC2",
          "label": "rpe_seg1_err",
          "points": [
            {
              "x": 0,
              "y": 0.018596994480507376,
              "url":"https://www.baidu.com",
              "ptype":"url"
            },
            {
              "x": 0.2,
              "y": 0.018759501453098574,
              "url":"https://www.qq.com"
            }
          ]
        },
        {
          "color": "#A9DD69",
          "label": "rpe_seg2_err",
          "points": [
            {
              "x": 0,
              "y": 0.013525539013246405
            },
            {
              "x": 0.2,
              "y": 0.011256280096404444
            }
          ]
        },
        {
          "color": "#A92F2B",
          "label": "rpe_seg5_err",
          "points": [
            {
              "x": 0,
              "y": 0.00677925089278731
            },
            {
              "x": 0.2,
              "y": 0.007647019390954798
            }
          ]
        },
        {
          "color": "#8B6FDA",
          "label": "rpe_seg10_err",
          "points": [
            {
              "x": 0,
              "y": 0.0038233503569700517
            },
            {
              "x": 0.2,
              "y": 0.002338505338254382
            }
          ]
        }
      ],
      "order": "B",
      "title": "imu_rpe_err_line",
      "type": "line",
      "x_label": "gyro_z(rad/s)",
      "y_label": "relative_position_err(m)",

      "external":{
        "filters":{ 
          "filter_type":"dt_source-filter",
          "visual_type":"线路级MPD",
        },
        annotaion:"noScale 可缩放",
        noScale:false,
        "sortHeaders":[],
        "pointSize":5,
        "xLabel": {
          "rotate":-1.57,
           "offsetX":-25,
           "offsetY":-10
       },
      } 
    },
    {
      "data": [
        {
          "color": "#381BC2",
          "label": "rpe_seg1_err",
          "points": [
            {
              "x": 0,
              "y": 1000,
              "url":"https://www.baidu.com",
              "ptype":"url"
            },
            {
              "x": 0.2,
              "y": 10000,
              "url":"https://www.qq.com"
            }
          ]
        },
        {
          "color": "#A9DD69",
          "label": "rpe_seg2_err",
          "points": [
            {
              "x": 0,
              "y": 2000
            },
            {
              "x": 0.2,
              "y":20000
            }
          ]
        },
        {
          "color": "#A92F2B",
          "label": "rpe_seg5_err",
          "points": [
            {
              "x": 0,
              "y": 10000000
            },
            {
              "x": 0.2,
              "y": 20000000
            }
          ]
        },
        {
          "color": "#8B6FDA",
          "label": "rpe_seg10_err",
          "points": [
            {
              "x": 0,
              "y": 1000000000
            },
            {
              "x": 0.2,
              "y": 2000000000
            }
          ]
        }
      ],
      "order": "B",
      "title": "imu_rpe_err_big_number",
      "type": "line",
      "x_label": "gyro_z(rad/s)",
      "y_label": "relative_position_err(m)",

      "external":{
        "annotation":"格式化万亿级数据",
        "filters":{ 
          "filter_type":"dt_source-filter",
          "visual_type":"线路级MPD"
        },
        useBigNumFormat:true,
        noScale:false,
        "sortHeaders":[],
        "pointSize":5,
        "xLabel": {
          "rotate":-1.57,
           "offsetX":-25,
           "offsetY":-10
       },
      } 
    },
    {
      category:null,
      type:"embeddedPage",
      title:"内嵌html iframe",
      external:{},
      data:{url:`/`}
    },
    {
      "category": null,
      "data": {
          "xAxis": {
              "type": "category",
              "data": ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
          },
          "yAxis": {"type": "value"},
          "series": [
              {
                  "data": [820,932,901,934,1290,1330,1320],
                  "type": "line",
              }
          ]
      },
      "external": {"span":12,"echartHeight":1000,"annotation":"echart折线图自定义高度",},
      "title": "Test echart",
      "type": "echart"
    },
    {
      //样例： https://echarts.apache.org/examples/zh/editor.html?c=custom-profile
      "type": "echart",
      "category": null,
      "title": "Profile",
      "data": {
          "tooltip": {},
          "title": {
              "text": "Profile",
              "left": "center"
          },
          "dataZoom": [
              {
                  "type": "slider",
                  "filterMode": "weakFilter",
                  "showDataShadow": false,
                  "top": 400,
                  "labelFormatter": ""
              },
              {
                  "type": "inside",
                  "filterMode": "weakFilter"
              }
          ],
          "grid": {
              "height": 300
          },
          "xAxis": {
              "min": 1733381020225,
              "scale": true
          },
          "yAxis": {
              "data": [
                  "categoryA",
                  "categoryB"
              ]
          },
          "series": [
              {
                  "type": "custom",
                  "renderItem": "(function (params, api) {    var categoryIndex = api.value(0);    var start = api.coord([api.value(1), categoryIndex]);    var end = api.coord([api.value(2), categoryIndex]);    var height = api.size([0, 1])[1] * 0.6;    var rectShape = ly_echarts.graphic.clipRectByRect({        x: start[0],        y: start[1] - height / 2,        width: end[0] - start[0],        height: height    }, {        x: params.coordSys.x,        y: params.coordSys.y,        width: params.coordSys.width,        height: params.coordSys.height    });    return (rectShape && {        type: 'rect',        transition: ['shape'],        shape: rectShape,        style: api.style()    });})",
                  "itemStyle": {
                      "opacity": 0.8
                  },
                  "encode": {
                      "x": [
                          1,
                          2
                      ],
                      "y": 0
                  },
                  "data": [
                      {
                          "name": "GPU",
                          "value": [
                              0,
                              1733381021761,
                              1733381029174,
                              7413
                          ],
                          "itemStyle": {
                              "normal": {
                                  "color": "#72b362"
                              }
                          }
                      },
                      {
                          "name": "GPU",
                          "value": [
                              0,
                              1733381030036,
                              1733381032810,
                              2774
                          ],
                          "itemStyle": {
                              "normal": {
                                  "color": "#72b362"
                              }
                          }
                      },
                      {
                          "name": "Listeners",
                          "value": [
                              0,
                              1733381033576,
                              1733381035784,
                              2208
                          ],
                          "itemStyle": {
                              "normal": {
                                  "color": "#e0bc78"
                              }
                          }
                      },
                      {
                          "name": "Documents",
                          "value": [
                              0,
                              1733381044692,
                              1733381051350,
                              6658
                          ],
                          "itemStyle": {
                              "normal": {
                                  "color": "#bd6d6c"
                              }
                          }
                      },
                      {
                          "name": "GPU",
                          "value": [
                              0,
                              1733381051519,
                              1733381053946,
                              2427
                          ],
                          "itemStyle": {
                              "normal": {
                                  "color": "#72b362"
                              }
                          }
                      },
                      {
                          "name": "Listeners",
                          "value": [
                              0,
                              1733381056034,
                              1733381058388,
                              2354
                          ],
                          "itemStyle": {
                              "normal": {
                                  "color": "#e0bc78"
                              }
                          }
                      },
                      {
                          "name": "Listeners",
                          "value": [
                              0,
                              1733381058419,
                              1733381062079,
                              3660
                          ],
                          "itemStyle": {
                              "normal": {
                                  "color": "#e0bc78"
                              }
                          }
                      },
                      {
                          "name": "GPU",
                          "value": [
                              1,
                              1733381020225,
                              1733381027370,
                              7145
                          ],
                          "itemStyle": {
                              "normal": {
                                  "color": "#72b362"
                              }
                          }
                      },
                      {
                          "name": "Documents",
                          "value": [
                              1,
                              1733381028156,
                              1733381028928,
                              772
                          ],
                          "itemStyle": {
                              "normal": {
                                  "color": "#bd6d6c"
                              }
                          }
                      },
                      {
                          "name": "Documents",
                          "value": [
                              1,
                              1733381030351,
                              1733381036191,
                              5840
                          ],
                          "itemStyle": {
                              "normal": {
                                  "color": "#bd6d6c"
                              }
                          }
                      },
                      {
                          "name": "Listeners",
                          "value": [
                              1,
                              1733381037419,
                              1733381042755,
                              5336
                          ],
                          "itemStyle": {
                              "normal": {
                                  "color": "#e0bc78"
                              }
                          }
                      },
                      {
                          "name": "Listeners",
                          "value": [
                              1,
                              1733381048033,
                              1733381053645,
                              5612
                          ],
                          "itemStyle": {
                              "normal": {
                                  "color": "#e0bc78"
                              }
                          }
                      }
                  ]
              }
          ]
      },
      "external": {},
      "widget_order": 0
    },
    {
      "category": null,
      "data": {
          "xAxis": {
              "type": "category",
              "data": ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
          },
          "yAxis": {"type": "value"},
          "series": [
              {
                  "data": [820,932,901,934,1290,1330,1320],
                  "type": "line",
              }
          ]
      },
      "external": {"span":12},
      "title": "Test",
      "type": "echart"
    },
    {
      "type": "image",
      "title": "res_normal_1677342459453452: 本次标定结果 | 实车标定结果",
      "file_path_list": [
        "/a.jpg",
        "/tang.jpg"
      ],
      "external": {}
    },
    {
      "category": null,
      "external": {span:24},
      "headers": [
        "value"
      ],
      "indicators": [
        "看板生成时间",
        "覆盖总车辆数",
        "在线标定总触发数",
        "监控总天数",
        "平均标定次数/天",
        "平均标定次数/车"
      ],
      "ranges": {},
      "title": "detruc 看板",
      "type": "table",
      "values": {
        "在线标定总触发数": {
          "value": 1404
        },
        "平均标定次数/天": {
          "value": 14.62
        },
        "平均标定次数/车": {
          "value": 17.12
        },
        "监控总天数": {
          "value": "json:{\"type\": \"link\",\"name\":\"baidu\",\"url\":\"http://www.baidu.com\"}",
        },
        "看板生成时间": {
          "value": "2022-11-24 14:33:19"
        },
        "覆盖总车辆数": {
          "value": 'json:{"type":"node","value":"ffddss","style":{"color":"yellow"}}'
        }
      },
      "withColor": []
    },
    {
      "external":{
        "span":24,
        "annotation":"旋转x轴，横条图有效果，（柱状图x轴不会自动按数字大小自动排序，全是按点出现的顺序来排的）",
        "xLabel": {
          "rotate":-1.17,
          "offsetX":-25,
          "offsetY":-10
        }
      },
      "type": "bar",
      "category": "PassRate",
      "title": "千寻月解算里程",
      "data": [
        {
          "value": 104.857,
          "color": "yellow",
          "label": "2022-07"
        },
        {
          "value": 25712.679,
          "label": "2022-08"
        },
        {
          "value": 46788.759,
          "label": "2022-09"
        },
        {
          "value": 47386.087,
          "color": "red",
          "label": "2022-10"
        },
        {
          "value": 9999.557,
          "color": "green",
          "label": "2022-11"
        },
        {
          "value": 7228.236,
          "color": "green",
          "label": "2022-12"
        },
        {
          "value": 2113.632,
          "color": "green",
          "label": "2023-01"
        }
      ],
      "horizontal": false,
      "x_label": "date",
      "y_label": "km"
    },
      {
        "title": "箱体图",
        "type": "box",
        "category": null,
        "data":{"data":[{"Species":"I. setosa","type":"SepalLength","value":5.1,"_bin":[4.3,4.8,5,5.2,5.8]},{"Species":"I. setosa","type":"SepalWidth","value":3.5,"_bin":[2.3,3.2,3.4,3.7,4.4]},
        {"Species":"I. setosa","type":"PetalLength","value":1.4,"_bin":[1,1.4,1.5,1.6,1.9]},{"Species":"I. setosa","type":"PetalWidth","value":0.2,"_bin":[0.1,0.2,0.2,0.3,0.6]},
        {"Species":"I. versicolor","type":"SepalLength","value":7,"_bin":[4.9,5.6,5.9,6.3,7]},{"Species":"I. versicolor","type":"SepalWidth","value":3.2,"_bin":[2,2.5,2.8,3,3.4]},{"Species":"I. versicolor","type":"PetalLength","value":4.7,"_bin":[3,4,4.35,4.6,5.1]},
        {"Species":"I. versicolor","type":"PetalWidth","value":1.4,"_bin":[1,1.2,1.3,1.5,1.8]},{"Species":"I. virginica","type":"SepalLength","value":6.3,"_bin":[4.9,6.2,6.5,6.9,7.9]},{"Species":"I. virginica","type":"SepalWidth","value":3.3,"_bin":[2.2,2.8,3,3.2,3.8]},
        {"Species":"I. virginica","type":"PetalLength","value":6,"_bin":[4.5,5.1,5.55,5.9,6.9]},{"Species":"I. virginica","type":"PetalWidth","value":2.5,"_bin":[1.4,1.8,2,2.3,2.5]}],"xField":"type","yField":"_bin","groupField":"Species"}
      },
      {
        "external":{"span":24},
        "category": null,
        "data": [
          {
            "color": "#FFCFD2",
            "label": "Suzhou",
            "value": 1116
          },
          {
            "color": "#FBF8CC",
            "label": "Shanghai",
            "value": 131
          },
          {
            "color": "#E9EDC9",
            "label": "Baoding",
            "value": 64
          },
          {
            "color": "#CFBAF0",
            "label": "Shenzhen",
            "value": 7
          },
          {
            "color": "#98F5E1",
            "label": "unknown",
            "value": 66
          },
          {
            "color": "#FFCFD2",
            "label": "Hangzhou",
            "value": 17
          },
          {
            "color": "#F1C0E8",
            "label": "Beijing",
            "value": 3
          }
        ],
        "title": "Distribution: city",
        "type": "pie"
      },
      {
        "category": null,
        "data": [
          {
            "color": "#98F5E1",
            "label": "3.1.0",
            "value": 1404
          }
        ],
        "external": {},
        "title": "Distribution: maf",
        "type": "pie"
      },
      {
        "category": null,
        "external": {id_name:"xxxx",styleHeaders:["车牌"],align:"align-center",id_width:200},
        "headers": [
          "url",
          "车牌",
          "失准情况",
          "失准传感器",
          "最近标定触发时间",
          "本周标定次数\n次数1",
          "次数2",
          "总标定次数"
        ],
        "indicators": [
          "458-detruc-MKZ_EQX940",
          "458-detruc-MKZ_AP6692",
          "458-detruc-RX5_EF36110",
          "458-detruc-RX5_EF02054",
          "458-detruc-MKZ_LMZ227",
          "458-detruc-MKZ_JLQ988",
          "458-detruc-MARVELR_054",
          "458-detruc-RX5_AGA3520",
          "458-detruc-MKZ_E684QL",
          "458-detruc-MKZ_UA5802",
          "458-detruc-RX5_AFB0732",
          "458-detruc-RX5_AFB3682",
          "458-detruc-MKZ_UAP750",
          "458-detruc-MKZ_NR0229",
          "458-detruc-MARVELR_034",
          "458-detruc-RX5_AGC3595",
        ],
        "ranges": {},
        "searchRange": ["总标定次数"],
        "searchSelect": [
          "车牌",
          "失准情况"
        ],
        "title": "车辆信息表",
        "type": "antTable",
        "values": {
          "458-detruc-MARVELR_034": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-MARVELR_034",
            "次数2": 0,
            "失准传感器": "camera_front_wide",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u8f7b\\u5fae\\u5931\\u51c6\", \"style\": {\"color\": \"#ffca3a\", \"backgroundColor\": \"yellow\"}}",
            "总标定次数": 1,
            "最近标定触发时间": "2022-09-13 14:09:25",
            "本周标定次数\n次数1": 0,
            "车牌": "MARVELR_034",
            "style":{"车牌":{color:"gray",backgroundColor:"yellow"}}
          },
          "458-detruc-MARVELR_054": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-MARVELR_054",
            "次数2": 6,
            "失准传感器": "camera_rear_fisheye, camera_front_fisheye",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u4e25\\u91cd\\u5931\\u51c6\", \"style\": {\"color\": \"#ff595e\", \"backgroundColor\": \"\"}}",
            "总标定次数": 33,
            "最近标定触发时间": "2022-11-22 11:23:17",
            "本周标定次数\n次数1": 2,
            "车牌": "MARVELR_054"
          },
          "458-detruc-MKZ_E684QL": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-MKZ_E684QL",
            "次数2": 5,
            "失准传感器": "lidar",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u4e25\\u91cd\\u5931\\u51c6\", \"style\": {\"color\": \"#ff595e\", \"backgroundColor\": \"\"}}",
            "总标定次数": 14,
            "最近标定触发时间": "2022-11-18 19:23:31",
            "本周标定次数\n次数1": 0,
            "车牌": "MKZ_E684QL"
          },
          "458-detruc-MKZ_EQX940": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-MKZ_EQX940",
            "次数2": 5,
            "失准传感器": "lidar",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u4e25\\u91cd\\u5931\\u51c6\", \"style\": {\"color\": \"#ff595e\", \"backgroundColor\": \"\"}}",
            "总标定次数": 40,
            "最近标定触发时间": "2022-11-22 16:30:26",
            "本周标定次数\n次数1": 10,
            "车牌": "MKZ_EQX940",
            // "colSpan":{"url":2,"车牌":0},
          },
          "458-detruc-MKZ_AP6692": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-MKZ_AP6692",
            "次数2": 0,
            "失准传感器": "camera_right_rear, camera_right_front, camera_rear_fisheye, camera_front_wide, camera_left_front, \ncamera_front_fisheye, camera_left_fisheye, camera_right_fisheye, camera_left_rear",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u4e25\\u91cd\\u5931\\u51c6\", \"style\": {\"color\": \"#ff595e\", \"backgroundColor\": \"\"}}",
            "总标定次数": 22,
            "最近标定触发时间": "2022-11-06 15:16:22",
            "本周标定次数\n次数1": 0,
            "车牌": "MKZ_AP6692",
            // "rowSpan":{"车牌":2}
          },
          "458-detruc-RX5_EF36110": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-RX5_EF36110",
            "次数2": 1,
            "失准传感器": "lidar",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u4e25\\u91cd\\u5931\\u51c6\", \"style\": {\"color\": \"#ff595e\", \"backgroundColor\": \"\"}}",
            "总标定次数": 3,
            "最近标定触发时间": "2022-11-22 14:04:10",
            "本周标定次数\n次数1": 2,
            "车牌": "RX5_EF36110",
            // "rowSpan":{"车牌":0}
          },
          
          "458-detruc-MKZ_JLQ988": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-MKZ_JLQ988",
            "次数2": 29,
            "失准传感器": "lidar",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u4e25\\u91cd\\u5931\\u51c6\", \"style\": {\"color\": \"#ff595e\", \"backgroundColor\": \"\"}}",
            "总标定次数": 79,
            "最近标定触发时间": "2022-11-22 17:46:09",
            "本周标定次数\n次数1": 25,
            "车牌": "MKZ_JLQ988"
          },
          "458-detruc-MKZ_LMZ227": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-MKZ_LMZ227",
            "次数2": 2,
            "失准传感器": "lidar",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u4e25\\u91cd\\u5931\\u51c6\", \"style\": {\"color\": \"#ff595e\", \"backgroundColor\": \"\"}}",
            "总标定次数": 17,
            "最近标定触发时间": "2022-11-16 11:33:38",
            "本周标定次数\n次数1": 0,
            "车牌": "MKZ_LMZ227"
          },
          "458-detruc-MKZ_NR0229": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-MKZ_NR0229",
            "次数2": 1,
            "失准传感器": "lidar",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u8f7b\\u5fae\\u5931\\u51c6\", \"style\": {\"color\": \"#ffca3a\", \"backgroundColor\": \"\"}}",
            "总标定次数": 7,
            "最近标定触发时间": "2022-11-22 17:01:48",
            "本周标定次数\n次数1": 3,
            "车牌": "MKZ_NR0229"
          },
          "458-detruc-MKZ_UA5802": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-MKZ_UA5802",
            "次数2": 1,
            "失准传感器": "camera_right_rear, camera_rear_fisheye, camera_left_fisheye, camera_right_fisheye",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u8f7b\\u5fae\\u5931\\u51c6\", \"style\": {\"color\": \"#ffca3a\", \"backgroundColor\": \"\"}}",
            "总标定次数": 15,
            "最近标定触发时间": "2022-11-22 20:15:28",
            "本周标定次数\n次数1": 1,
            "车牌": "MKZ_UA5802"
          },
          "458-detruc-MKZ_UAP750": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-MKZ_UAP750",
            "次数2": 2,
            "失准传感器": "camera_rear_fisheye, camera_left_rear, imu",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u8f7b\\u5fae\\u5931\\u51c6\", \"style\": {\"color\": \"#ffca3a\", \"backgroundColor\": \"\"}}",
            "总标定次数": 54,
            "最近标定触发时间": "2022-11-22 19:16:34",
            "本周标定次数\n次数1": 1,
            "车牌": "MKZ_UAP750"
          },
          "458-detruc-RX5_AFB0732": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-RX5_AFB0732",
            "次数2": 0,
            "失准传感器": "camera_left_rear",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u8f7b\\u5fae\\u5931\\u51c6\", \"style\": {\"color\": \"#ffca3a\", \"backgroundColor\": \"\"}}",
            "总标定次数": 2,
            "最近标定触发时间": "2022-08-30 14:35:58",
            "本周标定次数\n次数1": 0,
            "车牌": "RX5_AFB0732"
          },
          "458-detruc-RX5_AFB3682": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-RX5_AFB3682",
            "次数2": 0,
            "失准传感器": "camera_right_rear, camera_rear_fisheye, camera_left_rear",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u8f7b\\u5fae\\u5931\\u51c6\", \"style\": {\"color\": \"#ffca3a\", \"backgroundColor\": \"\"}}",
            "总标定次数": 3,
            "最近标定触发时间": "2022-09-29 15:18:08",
            "本周标定次数\n次数1": 0,
            "车牌": "RX5_AFB3682"
          },
          "458-detruc-RX5_AGA3520": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-RX5_AGA3520",
            "次数2": 6,
            "失准传感器": "lidar",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u4e25\\u91cd\\u5931\\u51c6\", \"style\": {\"color\": \"#ff595e\", \"backgroundColor\": \"\"}}",
            "总标定次数": 12,
            "最近标定触发时间": "2022-11-22 16:39:25",
            "本周标定次数\n次数1": 6,
            "车牌": "RX5_AGA3520"
          },
          "458-detruc-RX5_AGC3595": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-RX5_AGC3595",
            "次数2": 0,
            "失准传感器": "camera_rear_fisheye",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u8f7b\\u5fae\\u5931\\u51c6\", \"style\": {\"color\": \"#ffca3a\", \"backgroundColor\": \"\"}}",
            "总标定次数": 3,
            "最近标定触发时间": "2022-08-30 13:44:01",
            "本周标定次数\n次数1": 0,
            "车牌": "RX5_AGC3595"
          },
          "458-detruc-RX5_EF02054": {
            "url": "/applications/loc/second-result?task_id=458&project=detruc&key=458-detruc-RX5_EF02054",
            "次数2": 6,
            "失准传感器": "camera_right_rear, camera_right_front, camera_rear_fisheye, camera_front_wide, camera_left_front, camera_front_fisheye, camera_left_fisheye, camera_right_fisheye, camera_left_rear",
            "失准情况": "json:{\"type\": \"node\", \"value\": \"\\u4e25\\u91cd\\u5931\\u51c6\", \"style\": {\"color\": \"#ff595e\", \"backgroundColor\": \"\"}}",
            "总标定次数": 31,
            "最近标定触发时间": "2022-11-19 20:26:38",
            "本周标定次数\n次数1": 0,
            "车牌": "RX5_EF02054"
          },
        },
        "withColor": []
      }
    ],
  "message": "Success.",
  "task_id": 458
}
module.exports = {
    TestMesObjData
}