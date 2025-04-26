import React, { useEffect, useRef, useState } from 'react';
const TestBirdData = {
  gtEntries: [
    //dd3d带nearest的,,
    {
      "data": {
        "bbox_2d": {
          "b": 226.2177775,
          "l": 235.5758275,
          "r": 285.6082525,
          "t": 165.6667825
        },
        "bbox_3d": [
          [
            4.989721837542881,
            6.2720276351995174
          ],
          [
            4.987575051894586,
            5.441183008690962
          ],
          [
            6.751852162457119,
            5.436624364800483
          ],
          [
            6.753998948105414,
            6.2674689913090385
          ]
        ],
        "center_2d": {
          "x": 260.59204,
          "y": 195.94228
        },
        "center_3d": {
          "x": 5.870787,
          "y": 5.854326
        },
        "center_3d_x": 5.870787,
        "center_3d_y": 5.854326,
        "distance": 8.290915083007727,
        "heading": 3.1390088,
        "label": "VRU",
        "max_size": 1.764283,
        "nearest_line_point1": [
          4.987575051894586,
          5.441183008690962
        ],
        "nearest_line_point2": [
          6.751852162457119,
          5.436624364800483
        ],
        "nearest_point": 7.3812178827310415,
        "occlusion_ratio": -2,
        "size_2d": {
          "x": 50.032425,
          "y": 60.550995
        },
        "size_3d": {
          "x": 0.8308474,
          "y": 1.5016786,
          "z": 1.764283
        },
        "size_length": 1.764283,
        "size_width": 0.8308474,
        "width_2d": 50.032425
      },
      "feature": "dd3d",
      "ignore": false,
      "match_info": {
        "fn": false,
        "fp": false,
        "matched": true,
        "matched_idx": 6,
        "matched_score": 0.7458367347717285,
        "matching_rate": 0.9468371181382811,
        "road_lane_match": false,
        "tp": true
      },
      "metrics": {
      },
      "source": "gt",
      "source_id": 0,
    },
  ],
  dtEntries: {
    'x': [{
      "camera": "rear_fisheye",
      "car_type": "EP",
      "data": {
        "bbox_2d": {
          "b": 227.8050994873047,
          "l": 236.1934051513672,
          "r": 285.3305969238281,
          "t": 166.33837890625
        },
        "bbox_3d": [
          [
            4.978964675617256,
            6.194609183076408
          ],
          [
            5.022386240171598,
            5.300944802547094
          ],
          [
            7.077561508464775,
            5.400802117582772
          ],
          [
            7.034139943910433,
            6.294466498112086
          ]
        ],
        "center_2d": {
          "x": 260.76200103759766,
          "y": 197.07173919677734
        },
        "center_3d": {
          "x": 6.028263092041016,
          "y": 5.79770565032959
        },
        "center_3d_x": 6.028263092041016,
        "center_3d_y": 5.79770565032959,
        "distance": 8.363811733577434,
        "heading": 3.0930426120758057,
        "label": "VRU",
        "max_size": 2.0575997829437256,
        "nearest_line_point1": [
          5.022386240171598,
          5.300944802547094
        ],
        "nearest_line_point2": [
          7.077561508464775,
          5.400802117582772
        ],
        "nearest_point": 7.302354370003969,
        "score": 0.7458367347717285,
        "size_2d": {
          "x": 49.13719177246094,
          "y": 61.46672058105469
        },
        "size_3d": {
          "height": 1.5,
          "length": 2.0575997829437256,
          "width": 0.8947186470031738
        },
        "size_length": 2.0575997829437256,
        "size_width": 0.8947186470031738,
        "width_2d": 49.13719177246094
      },
      "feature": "dd3d",
      "homo_type": "UNHOMO",
      "ignore": false,
      "label": "VRU",
      "match_info": {
        "fn": false,
        "fp": false,
        "matched": true,
        "matched_idx": 0,
        "matching_rate": 0.9468371181382811,
        "road_lane_match": false,
        "tp": true
      },
      "score": 0.7458367347717285,
      "source": "dt",
      "source_id": 6,
    },

    // lane_3d
    {
      "data": {
        "line_points_3d": [
          [
            -1.8165493279733254,
            1.519212220835945,
            4.577213764190674
          ],
          [
            -1.7848031754651819,
            1.4930336323342366,
            4.556641101837158
          ],
          [
            -1.8060097120876086,
            1.5104025205082245,
            4.669504642486572
          ],
          [
            -1.8022889539727223,
            1.50802637228704,
            4.723694801330566
          ],
          [
            -1.7755126769729508,
            1.4865559372078934,
            4.718478679656982
          ],
          [
            -1.7417876715027367,
            1.5049589030323822,
            7.21260404586792
          ],
          [
            -1.5436351392199914,
            1.474481718556332,
            11.749601364135742
          ],
          [
            -1.4981368022327235,
            1.4451361504400635,
            11.847543716430664
          ],
          [
            -1.5267895948241457,
            1.4878129286827873,
            12.558443069458008
          ],
          [
            -1.459354089202642,
            1.4471484594008963,
            12.588149070739746
          ],
          [
            -1.4043172903535717,
            1.4113391276589686,
            12.661515235900879
          ],
          [
            -1.4188974199695623,
            1.4481238419504532,
            13.411293029785156
          ],
          [
            -0.873964768738628,
            1.440627547070796,
            22.827299118041992
          ],
          [
            -0.7575956236974655,
            1.409276139291383,
            23.611698150634766
          ],
          [
            -0.6617669105926054,
            1.3827654302717431,
            24.575353622436523
          ],
          [
            -0.6754007047284276,
            1.3835372453232457,
            26.176239013671875
          ],
          [
            -0.8026154665823629,
            1.3786709568033073,
            27.880807876586914
          ],
          [
            -0.7591023359121446,
            1.3664608033287984,
            29.683427810668945
          ]
        ],
      },
      "feature": "lane_3d",
      "height": 288,
      "ignore": false,
      "score": 0.7222574949264526,
      "source": "dt",
      "source_id": 2,
      "width": 512
    }
    ]
  }
}

export const useRefWidth = (ref: React.MutableRefObject<HTMLDivElement | null>) => {
  const [width, setWidth] = useState<number>(1);
  useEffect(() => {
    const handleResize = () => setWidth(ref.current!.offsetWidth);
    window.addEventListener("resize", handleResize);
    handleResize()
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return { width: width, setWidth: setWidth };
}

const BirdViewer: React.FC<{showGrid:boolean}> = ({showGrid=true}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widthRef = useRefWidth(containerRef);
  const canvasWidth = widthRef.width;
  const canvasHeight = canvasWidth;
  const entryGroup = TestBirdData
  const [scale, setScale] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const ctx = canvasRef.current?.getContext('2d')!;
  var cScale = 30;
  var cXMax = 25;
  var cXMin = -5;
  var cYMax = 15;

  const point3DtoBV = (x: number, y: number) => {
    const point = { x: 0, y: 0 };
    const ratio = (canvasWidth / cScale) * scale;
    const originX = ratio * cYMax + offsetX;
    const originY = ratio * cXMax + offsetY;
    point.x = originX - y * ratio;
    point.y = originY - x * ratio;
    return point;
  };

  const drawBVBaseLine = () => {
    ctx.font = 'bold 14px serif';
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    const xMin = cXMin;
    const xMax = cXMax;
    const yMax = cYMax;
    if(showGrid){
      for (let i = xMin; i <= xMax; i += 5) {
        const p = point3DtoBV(i, 0);
        console.log(p.y+12);
        
        ctx.fillText(i + 'm', 3, p.y + 12);
        if(showGrid){
          ctx.beginPath();
          ctx.moveTo(0, p.y);
          ctx.lineTo(canvasWidth, p.y);}
          ctx.stroke();
        }
      
      for (let i = -yMax; i <= yMax; i += 5) {
        const p = point3DtoBV(-5, i);
        ctx.fillText(i + 'm', p.x, p.y>canvasHeight?canvasHeight:p.y);
        if(showGrid){
          ctx.beginPath();
          ctx.moveTo(p.x, 0);
          ctx.lineTo(p.x, canvasHeight);
          ctx.stroke();
        }
      }
      const p_center = point3DtoBV(0, 0);
      ctx.beginPath();
      ctx.arc(p_center.x, p_center.y, 5, 0, 2 * Math.PI, true);
      ctx.closePath();
    }
    ctx.fill();
  };

  const drawZoomNearestLines = (bboxInstance: object) => {
    if (
      bboxInstance['data']['nearest_line_point1'] == null ||
      bboxInstance['data']['nearest_line_point2'] == null
    )
      return;
    const nlp1 = {
      x: bboxInstance['data']['nearest_line_point1'][0],
      y: bboxInstance['data']['nearest_line_point1'][1],
    };
    const nlp2 = {
      x: bboxInstance['data']['nearest_line_point2'][0],
      y: bboxInstance['data']['nearest_line_point2'][1],
    };
    const color = 'yellow';
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = bboxInstance.vis_info?.line_width || 2;
    const nlp3d1 = point3DtoBV(nlp1.x, nlp1.y);
    const nlp3d2 = point3DtoBV(nlp2.x, nlp2.y);
    ctx.moveTo(nlp3d1.x, nlp3d1.y);
    ctx.lineTo(nlp3d2.x, nlp3d2.y);
    ctx.stroke();
    ctx.closePath();

    if (bboxInstance['source'] == 'gt') {
      const offsetX = nlp1.x - nlp2.x;
      const offsetY = nlp1.y - nlp2.y;
      const length = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      const sineX = offsetX / length;
      const sineY = offsetY / length;
      const extendedLength = 2;
      const extended1 = { x: nlp1.x + extendedLength * sineX, y: nlp1.y + extendedLength * sineY };
      const extended2 = { x: nlp2.x - extendedLength * sineX, y: nlp2.y - extendedLength * sineY };

      const extended3d1 = point3DtoBV(extended1.x, extended1.y);
      const extended3d2 = point3DtoBV(extended2.x, extended2.y);

      ctx.beginPath();
      ctx.setLineDash([1, 1]);
      ctx.moveTo(nlp3d1.x, nlp3d1.y);
      ctx.lineTo(extended3d1.x, extended3d1.y);
      ctx.moveTo(nlp3d2.x, nlp3d2.y);
      ctx.lineTo(extended3d2.x, extended3d2.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.closePath();
    }

    if (bboxInstance['source'] == 'dt' && bboxInstance['match_info']['matched']) {
      const gtInstance = entryGroup.gtEntries[bboxInstance['match_info']['matched_idx']];
      if(!gtInstance || !gtInstance['data']['nearest_line_point1'] || !gtInstance['data']['nearest_line_point2'])
        return
      const gtNlp1 = {
        x: gtInstance['data']['nearest_line_point1'][0],
        y: gtInstance['data']['nearest_line_point1'][1],
      };
      const gtNlp2 = {
        x: gtInstance['data']['nearest_line_point2'][0],
        y: gtInstance['data']['nearest_line_point2'][1],
      };
      const intersection1 = calculateIntersection(gtNlp1, gtNlp2, nlp1);
      const intersection2 = calculateIntersection(gtNlp1, gtNlp2, nlp2);

      const intersection3d1 = point3DtoBV(intersection1.x, intersection1.y);
      const intersection3d2 = point3DtoBV(intersection2.x, intersection2.y);

      const distance1 = Math.sqrt(
        Math.pow(intersection1.x - nlp1.x, 2) + Math.pow(intersection1.y - nlp1.y, 2),
      );
      const distance2 = Math.sqrt(
        Math.pow(intersection2.x - nlp2.x, 2) + Math.pow(intersection2.y - nlp2.y, 2),
      );
      const midpoint =
        distance1 > distance2
          ? {
              x: nlp1.x + (intersection1.x - nlp1.x) / 2,
              y: nlp1.y + (intersection1.y - nlp1.y) / 2,
            }
          : {
              x: nlp2.x + (intersection2.x - nlp2.x) / 2,
              y: nlp2.y + (intersection2.y - nlp2.y) / 2,
            };
      const midpoint3d = point3DtoBV(midpoint.x, midpoint.y);

      ctx.beginPath();
      ctx.setLineDash([2, 2]);
      ctx.moveTo(intersection3d1.x, intersection3d1.y);
      ctx.lineTo(nlp3d1.x, nlp3d1.y);
      ctx.moveTo(intersection3d2.x, intersection3d2.y);
      ctx.lineTo(nlp3d2.x, nlp3d2.y);
      if (distance1 > distance2) {
        ctx.fillText(distance1.toFixed(2).toString(), midpoint3d.x + 3, midpoint3d.y - 3, 40);
      } else {
        ctx.fillText(distance2.toFixed(2).toString(), midpoint3d.x + 3, midpoint3d.y - 3, 40);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.closePath();
    }
  };
  const drawInstance = (instance: object, index: number, groupIndex?: number) => {
    const feature = instance['feature'];
    if (feature == 'dd3d' || feature == 'static_od' || feature == 'traffic_light' || feature == 'dd3d_vru'
    || feature == 'od_seq') {
      drawBbox3D(instance, index, groupIndex);
    }
    if(feature=='lane_3d' || feature=='ddld_event'){
      drawLane3D(instance, index, groupIndex);
    }

    if(scale>1){
      if (feature == 'dd3d' || feature == 'od_seq' || feature == 'dd3d_vru') {
        drawZoomNearestLines(instance);
      }
    }
  };

  const drawAllDataEntries = () => {
    entryGroup.gtEntries.map((instance, i) => {
        drawInstance(instance, i);
    });
    Object.keys(entryGroup.dtEntries).map((key, index) => {
      entryGroup.dtEntries[key].map((instance, i) => {
          drawInstance(instance, i, index);
      });
    });
  };

  const calculateIntersection = (
    pointA: { x: number; y: number },
    pointB: { x: number; y: number },
    pointC: { x: number; y: number },
  ) => {
    let intersection = { x: 0, y: 0 };
    if (pointA.x == pointB.x) {
      intersection.x = pointA.x;
      intersection.y = pointC.y;
    } else if (pointA.y == pointB.y) {
      intersection.x = pointC.x;
      intersection.y = pointA.y;
    } else {
      const gradientOfAB = (pointA.y - pointB.y) / (pointA.x - pointB.x);
      const interceptOfAB = pointA.y - gradientOfAB * pointA.x;

      const gradientOfCD = -1 / gradientOfAB;
      const interceptOfCD = pointC.y - gradientOfCD * pointC.x;

      intersection.x = (interceptOfAB - interceptOfCD) / (gradientOfCD - gradientOfAB);
      intersection.y = gradientOfCD * intersection.x + interceptOfCD;
    }
    return intersection;
  };

  const drawBbox3D = (bboxInstance: object, index: number, groupIndex?: number) => {
    if (bboxInstance['data']['bbox_3d'] == null) return;
    const bbox = bboxInstance['data']['bbox_3d'];
    const color ='blue'
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    bbox.forEach((p: Int32Array, i: number) => {
      const p3d = point3DtoBV(p[0], p[1]);
      const x = p3d.x;
      const y = p3d.y;
      if (i == 3) ctx.fillText(index.toString(), x, y - 5, 40);
      i == 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    const p3d1 = point3DtoBV(bbox[0][0], bbox[0][1]);
    ctx.lineTo(p3d1.x, p3d1.y);
    ctx.stroke();
    ctx.closePath();
  };

  const drawLane3D = (laneInstance: object, index: number, groupIndex?: number,withZoom:boolean=false) => {
    if (laneInstance['data']['line_points_3d'] == null) return;
    const lane = laneInstance['data']['line_points_3d'];
    
    const color ='blue'
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = laneInstance.vis_info?.line_width || 2;
    lane.forEach((p: Int32Array, i: number) => {
      let p3d = point3DtoBV(p[2], -p[0]);
      const x = p3d.x;
      const y = p3d.y;
      if (i == 3) ctx.fillText(index.toString(), x, y - 5, 40);
      i == 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.closePath();
  };

  const calculateDistance = () => {
    var xMax = cXMax;
    var xMin = cXMin;
    var yMax = cYMax;
    if(entryGroup.isLane3d) {
      xMax = 20;
      xMin = -20
      yMax = 30
    }
    entryGroup.gtEntries.map((instance, i) => {
        if (instance['data']['bbox_3d'] != null) {
          const bbox = instance['data']['bbox_3d'];
          bbox.forEach((p: Int32Array) => {
            xMax = Math.max(p[0], xMax);
            xMin = Math.min(p[0], xMin);
            yMax = Math.max(Math.abs(p[1]), yMax);
          });
        }
        if (instance['data']['line_points_3d'] != null) {
          const line = instance['data']['line_points_3d'];
          if(line.length>0){
            line.forEach(v => {
              xMax = Math.max(v[0], xMax);
              xMin = Math.min(v[0], xMin);
              yMax = Math.max(Math.abs(v[2]), yMax);
            });
          }
        }
    });
    Object.keys(entryGroup.dtEntries).map((key) => {
      entryGroup.dtEntries[key].map((instance, i) => {
          if (instance['data']['bbox_3d'] != null) {
            const bbox = instance['data']['bbox_3d'];
            bbox.forEach((p: Int32Array) => {
              xMax = Math.max(p[0], xMax);
              xMin = Math.min(p[0], xMin);
              yMax = Math.max(Math.abs(p[1]), yMax);
            });
          }
          if (instance['data']['line_points_3d'] != null) {
            const line = instance['data']['line_points_3d'];
            if(line.length>0){
              line.forEach((v:number[]) => {
                xMax = Math.max(v[0], xMax);
                xMin = Math.min(v[0], xMin);
                yMax = Math.max(Math.abs(v[2]), yMax);
              });
            }
          }
      });
    });
    if(entryGroup.isLane3d) xMin=-xMax
    xMax = Math.ceil(xMax / 5) * 5;
    xMin = xMin>0?Math.ceil(xMin / 5) * 5:Math.floor(xMin / 5) * 5;
    yMax = Math.ceil(yMax / 5) * 5;
    const xScale = xMax + Math.abs(xMin);
    const yScale = yMax * (entryGroup.isLane3d?1.3:2);
    if (xScale >= yScale) {
      cScale = xScale;
      cXMax = xMax;
      cXMin = xMin;
      cYMax = cScale / 2;
    } else {
      cScale = yScale;
      cXMax = xMax + yScale - xScale;
      cXMin = xMin;
      cYMax = cScale / 2;
    }
  };

  const drawWorld = () => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasWidth;
      canvasRef.current.height = canvasHeight;
      if (ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#30302F';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        calculateDistance();
        drawBVBaseLine();
        drawAllDataEntries();
      }
    }
  };

const handleZoomIn = () => {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  setScale(prevScale => prevScale * 1.1);
  setOffsetX(prevOffsetX => 1.1 * (prevOffsetX - centerX) + centerX);
  setOffsetY(prevOffsetY => 1.1 * (prevOffsetY - centerY) + centerY);
};

const handleZoomOut = () => {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  setScale(prevScale => Math.max(prevScale / 1.1, 1));
  setOffsetX(prevOffsetX => (prevOffsetX - centerX) / 1.1 + centerX);
  setOffsetY(prevOffsetY => (prevOffsetY - centerY) / 1.1 + centerY);
};

  const handleReset = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleMouseDown = (event: MouseEvent) => {
    const dragStart = { x: event.clientX, y: event.clientY };
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragStart.x;
      const dy = moveEvent.clientY - dragStart.y;
      setOffsetX(prevOffsetX => prevOffsetX + dx);
      setOffsetY(prevOffsetY => prevOffsetY + dy);
      dragStart.x = moveEvent.clientX;
      dragStart.y = moveEvent.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', handleMouseMove);
    }, { once: true });
  };

  const handleWheel = (event: WheelEvent) => {
    const scaleChange = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    //这里不要直接调用handleZoomIn，因为要以鼠标为中心点，所以要计算坐标
    const rect = (event.target as Element).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setScale(prevScale => prevScale * scaleChange);
    setOffsetX(prevOffsetX => scaleChange * (prevOffsetX - x) + x); //这里保证缩放以鼠标为中心点
    setOffsetY(prevOffsetY => scaleChange * (prevOffsetY - y) + y);
    event.preventDefault(); //防止屏幕滚动
  };
  
  useEffect(() => {
    if (containerRef.current) {
      widthRef.setWidth(containerRef.current.offsetWidth);
    }
  }, [containerRef.current?.getBoundingClientRect().x]);

  useEffect(() => {
    drawWorld();
  }, [canvasWidth]);

  drawWorld();

  const preventScrollPropagation = (event: WheelEvent) => {
    if (event.target === canvasRef.current) {
      event.stopPropagation();
    }
  };

  useEffect(() => {
    if (containerRef.current && canvasRef.current) {
      containerRef.current.addEventListener('wheel', handleWheel, { passive: false });
      // containerRef.current.addEventListener('wheel', preventScrollPropagation, { passive: false }); //如果滚动时带动了整个页面的滚动，可以试试打开这一行注释
      canvasRef.current.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      if (containerRef.current && canvasRef.current) {
        containerRef.current.removeEventListener('wheel', handleWheel);
        // containerRef.current.removeEventListener('wheel', preventScrollPropagation);
        canvasRef.current.removeEventListener('mousedown', handleMouseDown);
      }
    };
  }, []);
  return (
    <div ref={containerRef}>
      <button onClick={handleZoomIn}>放大</button>
      <button onClick={handleZoomOut}>缩小</button>
      <button onClick={handleReset}>重置</button>
      <canvas ref={canvasRef} onMouseDown={handleMouseDown}/>
    </div>
  );
};

export default BirdViewer;
