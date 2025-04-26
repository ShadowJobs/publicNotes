import { FrontendPre } from '@/global';
import React, { useEffect, useRef, useState } from 'react';
const linedata = {
    "data": {
        "category": "LC",
        "line_points_2d": [
            [
                874.3475860940401,
                408.6904004293151
            ],
            [
                860.9063997956282,
                407.8884926899299
            ],
            [
                849.9063997956282,
                407.8884926899299
            ],
            [
                849.9063997956282,
                406.8884926899299
            ],
            [
                849.9063997956282,
                406.8884926899299
            ],
            [
                775.215785534433,
                401.42032307822035
            ],
            [
                675.215785534433,
                401.42032307822035
            ],
            [
                665.215785534433,
                411.42032307822035
            ],
            [
                675.215785534433,
                311.42032307822035
            ],
        ],
    },
    "feature": "ddld_event",
    "height": 768,
    "ignore": false,
    "source": "gt",
    "source_id": 0,
    "tags": {},
    "vis_info": {
        "line_width": 1
    },
    "width": 1024
}
export const useRefWidth = (ref: React.MutableRefObject<HTMLDivElement | null>) => {
    const [width, setWidth] = useState<number>(1);
    useEffect(() => {
        const handleResize = () => setWidth(ref.current!.offsetWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return { width: width, setWidth: setWidth };
}
const VV: React.FC<{}> = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widthRef = useRefWidth(containerRef);
    const [scale, setScale] = useState(1);  // state to manage scale
    const [offset, setOffset] = useState({ x: 0, y: 0 }); // state to manage dragging offset

    const [imageInfo, setimginfo] = useState({
        imgWidth: 1,
        imgHeight: 1,
        ratio: 1,
        isLoading: false,
        img: null,
    })
    const canvasWidth = widthRef.width;
    const canvasHeight = canvasWidth * imageInfo.ratio;
    const widthRatio = canvasWidth / imageInfo.imgWidth;
    const heightRatio = canvasHeight / imageInfo.imgHeight;
    const ctx = canvasRef.current?.getContext('2d')!;
    const transferX = (originX: number, zipWidth: number) =>
        ((originX * widthRatio * imageInfo.imgWidth) / zipWidth) * scale + offset.x;
    const transferY = (originY: number, zipHeight: number) =>
        ((originY * heightRatio * imageInfo.imgHeight) / zipHeight) * scale + offset.y;

    const drawByFeature = (feature: string, zoom: boolean) => {
        const featureRenderers = {
            ddld_event: (instance: object, index: number, groupIndex?: number) => drawLane(instance, index, groupIndex),
        };
        if (!featureRenderers[feature]) {
            return null;
        }
        return featureRenderers[feature];
    };

    const drawLane = (laneInstance: object, index: number, groupIndex?: number) => {
        const points = laneInstance['data']['line_points_2d'];
        if (!points) return
        const zipWidth = laneInstance['width'];
        const zipHeight = laneInstance['height'];
        var color = "yellow"
        if (laneInstance['ignore']) {
            color = 'purple';
        }
        ctx.beginPath();
        points.forEach((p: Int32Array, i: number) => {
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = laneInstance.vis_info?.line_width || 1;
            ctx.font = 'bold 15px serif';
            const x = transferX(p[0], zipWidth);
            const y = transferY(p[1], zipHeight);
            if (i == 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            if (i == 0 && laneInstance['source'] == 'dt') {
                ctx.fillText(index.toString(), x, y - 5, 40);
            }
            if (i == points.length - 1 && laneInstance['source'] == 'gt') {
                ctx.fillText(index.toString(), x, y - 5, 40);
            }
        });
        ctx.stroke();
        ctx.closePath();

        // draw corner points
        const radius = 5; // affects the size of corner point annotation
        if (laneInstance['data']['lane_corner_points_2d']) {
            laneInstance['data']['lane_corner_points_2d'].map(
                (cornerPoint: {
                    point_type: 'dash_endpoint' | 'occlusion_point' | 'invalid' | 'others';
                    x: number;
                    y: number;
                }) => {
                    const cpX = transferX(cornerPoint.x, zipWidth);
                    const cpY = transferY(cornerPoint.y, zipHeight);
                    ctx.beginPath();
                    ctx.fillRect(cpX - 0.5, cpY - 0.5, 1, 1); // mark the central point out
                    if (cornerPoint.point_type == 'dash_endpoint') {
                        ctx.arc(cpX, cpY, radius, 0, 2 * Math.PI, false);
                    } else if (cornerPoint.point_type == 'occlusion_point') {
                        ctx.rect(cpX - radius, cpY - radius, radius * 2, radius * 2);
                    } else if (cornerPoint.point_type == 'invalid') {
                        ctx.save();
                        ctx.translate(cpX, cpY);
                        ctx.rotate(Math.PI / 4);
                        ctx.rect(-radius, -radius, radius * 2, radius * 2);
                        ctx.translate(-cpX, -cpY);
                        ctx.restore();
                    } else if (cornerPoint.point_type == 'others') {
                        [(1 / 6) * Math.PI, (5 / 6) * Math.PI, (3 / 2) * Math.PI, (1 / 6) * Math.PI].map(
                            (angle, index) => {
                                const triangleX = 1.5 * radius * Math.cos(angle) + cpX;
                                const triangleY = 1.5 * radius * Math.sin(angle) + cpY;
                                index == 0 ? ctx.moveTo(triangleX, triangleY) : ctx.lineTo(triangleX, triangleY);
                            },
                        );
                    }
                    ctx.stroke();
                    ctx.closePath();
                },
            );
        }
    };
    useEffect(() => {
        if (containerRef.current) {
            widthRef.setWidth(containerRef.current.getBoundingClientRect().width);
        }
    }, [containerRef.current?.getBoundingClientRect().x]);

    useEffect(() => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          // Add event listener directly to the canvas element
          const wheelHandler = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (e.deltaY < 0) {
              handleZoomIn({ x: x, y: y });
            } else {
              handleZoomOut({ x: x, y: y });
            }
          };
        //   因为React元素上的onWheel事件处理器没有能力阻止原生事件在DOM树中的传播。
        //   直接向DOM节点添加一个事件监听器，并在那里调用stopPropagation
          canvas.addEventListener("wheel", wheelHandler);
          drawWorld();
          return () => canvas.removeEventListener("wheel", wheelHandler);
        }
      }, [canvasWidth, imageInfo.img, scale, offset]);
    useEffect(() => {
        const oriImg = new Image();
        oriImg.src = `${FrontendPre}/tang.jpg`;
        oriImg.onload = () => {
            setimginfo({
                img: oriImg,
                imgWidth: oriImg.width,
                imgHeight: oriImg.height,
                ratio: oriImg.height / oriImg.width,
            })
        }
    }, [])
    const drawWorld = () => {
        if (canvasRef.current) {
            canvasRef.current.width = canvasWidth * scale;
            canvasRef.current.height = canvasHeight * scale;
            if (imageInfo.img && ctx) {
                ctx.clearRect(0, 0, canvasWidth * scale, canvasHeight * scale);
                ctx.drawImage(imageInfo.img, offset.x, offset.y, canvasWidth * scale, canvasHeight * scale);
                drawByFeature("ddld_event", false)(linedata, 0, 0)
            }
        }
    };
    const handleZoomIn = (center: { x: number; y: number }) => {
        setOffset((prevOffset) => ({
            x: prevOffset.x - (center.x - prevOffset.x) * 0.1,
            y: prevOffset.y - (center.y - prevOffset.y) * 0.1,
        }));
        setScale(scale * 1.1);
    };

    const handleZoomOut = (center: { x: number; y: number }) => {
        if (scale >= 1.1) {
            setOffset((prevOffset) => ({
                x: prevOffset.x + (center.x - prevOffset.x) * 0.1,
                y: prevOffset.y + (center.y - prevOffset.y) * 0.1,
            }));
            setScale(scale / 1.1);
        }
    };
    const handleReset = () => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        let lastX = e.clientX;
        let lastY = e.clientY;
        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newX = moveEvent.clientX;
            const newY = moveEvent.clientY;
            const diffX = newX - lastX;
            const diffY = newY - lastY;
            setOffset((prevOffset) => ({
                x: prevOffset.x + diffX,
                y: prevOffset.y + diffY,
            }));
            lastX = newX;
            lastY = newY;
        };
        document.addEventListener('mousemove', handleMouseMove);
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div>
            <div style={{border:"1px solid black", width: 600, height: 600, overflow: "hidden" }}>
                <button onClick={() => handleZoomIn({ x: canvasWidth / 2, y: canvasHeight / 2 })}>Zoom In</button>
                <button onClick={() => handleZoomOut({ x: canvasWidth / 2, y: canvasHeight / 2 })}>Zoom Out</button>
                <button onClick={handleReset}>Reset</button>
                <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
                    {/* 注意这里不能onWheel的监听直接放大canvas上，原因见上一个 wheelHandler*/}
                    <canvas ref={canvasRef} onMouseDown={handleMouseDown} />
                </div>
            </div>
            <div>这里是个超长的页面↓↓ </div>
            <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
            <div>
                asdfasdf
            </div>
            
        </div>
    );
};

export default VV;
