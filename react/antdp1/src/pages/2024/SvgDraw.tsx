import { RollbackOutlined } from "@ant-design/icons";
import { Button, Input, InputNumber } from "antd";
import React, { useEffect, useRef, useState } from "react";

const SvgDraw: React.FC = () => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [color, setColor] = useState("black");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [paths, setPaths] = useState<SVGPathElement[]>([]);
  const [undoStack, setUndoStack] = useState<SVGPathElement[]>([]);
  const [fillColor, setFillColor] = useState("#ADD8E6");

  const constRef = useRef<Record<string, any>>({
    isDrawing: false,
    currentPath: document.createElementNS("http://www.w3.org/2000/svg", "path"),
  });

  function startDrawing(event) {
    constRef.current.isDrawing = true;
    const currentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const { offsetX, offsetY } = event;
    currentPath.setAttribute("d", `M${offsetX},${offsetY}`);
    currentPath.setAttribute("stroke", color);
    currentPath.setAttribute("stroke-width", strokeWidth.toString());
    currentPath.setAttribute("fill", "none");
    constRef.current.currentPath = currentPath;
    svgRef.current.appendChild(currentPath);
  }

  function draw(event) {
    if (!constRef.current.isDrawing) return;
    const { offsetX, offsetY } = event;
    const d = constRef.current.currentPath.getAttribute("d");
    constRef.current.currentPath.setAttribute("d", `${d} L${offsetX},${offsetY}`);
  }

  function stopDrawing() {
    if (constRef.current.currentPath) {
      setPaths((prevPaths) => [...prevPaths, constRef.current.currentPath]);
      constRef.current.currentPath.setAttribute("fill", fillColor);
      constRef.current.isDrawing = false;
      constRef.current.currentPath = null;
    }
  }

  function clearCanvas() {
    const svg = svgRef.current;
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    setPaths([]);
    setUndoStack([]);
  }

  function undo() {
    if (paths.length > 0) {
      const lastPath = paths[paths.length - 1];
      svgRef.current.removeChild(lastPath);
      setUndoStack((prevUndoStack) => [...prevUndoStack, lastPath]);
      setPaths((prevPaths) => prevPaths.slice(0, -1));
    }
  }

  function redo() {
    if (undoStack.length > 0) {
      const lastUndone = undoStack[undoStack.length - 1];
      svgRef.current.appendChild(lastUndone);
      setPaths((prevPaths) => [...prevPaths, lastUndone]);
      setUndoStack((prevUndoStack) => prevUndoStack.slice(0, -1));
    }
  }

  function saveAsImage() {
    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const image = new Image();
    image.src = 'data:image/svg+xml;base64,' + window.btoa(source);
    const link = document.createElement("a");
    link.href = image.src;
    link.download = "drawing.svg";
    link.click();
  }

  function useEraser() {
    setColor("white");
  }

  useEffect(() => {
    const svg = svgRef.current;
    svg.addEventListener("mousedown", startDrawing);
    svg.addEventListener("mousemove", draw);
    svg.addEventListener("mouseup", stopDrawing);
    svg.addEventListener("mouseleave", stopDrawing);

    return () => {
      svg.removeEventListener("mousedown", startDrawing);
      svg.removeEventListener("mousemove", draw);
      svg.removeEventListener("mouseup", stopDrawing);
      svg.removeEventListener("mouseleave", stopDrawing);
    };
  }, [color, strokeWidth]);

  return (
    <>
      <div>
        <Button onClick={clearCanvas}>清除画布</Button>
        <Button onClick={undo} icon={<RollbackOutlined />} title="撤销" />
        <Button onClick={redo} icon={<RollbackOutlined style={{ transform: "scaleX(-1)" }} />} title="恢复" />
        <Button onClick={saveAsImage}>保存图片图片</Button>
        <Button onClick={useEraser}>橡皮擦</Button>
        边框色：<Input type="color" style={{ width: 50 }} value={color} onChange={(e) => setColor(e.target.value)} />
        填充色：<Input type="color" style={{ width: 50 }} value={fillColor} onChange={(e) => setFillColor(e.target.value)} />
        线宽：<InputNumber
          defaultValue={strokeWidth}
          onChange={(e) => setStrokeWidth(e as number)}
          style={{ width: 120, marginLeft: 8 }}
        />
      </div>
      <div style={{ border: "1px solid #000" }}>
        <svg id="drawingCanvas" width="100%" height="600" ref={svgRef}></svg>
      </div>
    </>
  );
};

export default SvgDraw;