import { useState } from 'react';
import { Slider } from 'antd';
import Color from 'color';


function lerp(v0, v1, t) {
  return (1 - t) * v0 + t * v1;
}

function colorGenerator(value, colorConfig) {
  let ranges=colorConfig.ranges;
  if (ranges.length === 0) {
    return ranges.startColor;
  }
  let prevRangeEnd = colorConfig.startNumber;
  let prevColor = parseColor(colorConfig.startColor);
  for (let range of ranges) {
    if (value < range.rangeEnd) {
      let t = (value - prevRangeEnd) / (range.rangeEnd - prevRangeEnd);
      let nextColor = parseColor(range.color);
      let lerpedColor = [
        Math.round(lerp(prevColor[0], nextColor[0], t)),
        Math.round(lerp(prevColor[1], nextColor[1], t)),
        Math.round(lerp(prevColor[2], nextColor[2], t))
      ];
      return `rgb(${lerpedColor.join(", ")})`;
    }
    prevRangeEnd = range.rangeEnd;
    prevColor = parseColor(range.color);
  }

  // If we've gone past all the ranges, just return the last color
  return `rgb(${prevColor.join(", ")})`;
}
// color格式：#FF00FF，red，rgb(233,21,23),hsl(233,21,23)
function parseColor(color) {
  let {r, g, b} = Color(color).rgb().object();
  return [r, g, b];
}
const ColorTestComponent = () => {
  const [value, setValue] = useState(0);
  const colorConfig = {
    startColor: "red",
    startNumber: 0,
    ranges: [
      { color: "yellow", rangeEnd: 0.2 },
      { color: "rgb(0, 255,0)", rangeEnd: 0.5 },
      { color: "hsl(240, 100%, 50%)", rangeEnd: 0.8 },
      { color: "#000000", rangeEnd: 1 },
    ],
  };
  const handleSliderChange = (value) => {
    setValue(value);
  };
  return (
    <div>
      <div style={{display:"flex"}}>
      <div style={{flex:"auto"}}>色彩渐变</div>
      <div style={{flex:"200px"}}><Slider min={0} max={1} step={0.01} onChange={handleSliderChange} value={value} /></div>
      </div>
      <div style={{
        width: '100px',
        height: '100px',
        backgroundColor: colorGenerator(value, colorConfig)
      }} />
    </div>
  );
};

export default ColorTestComponent;