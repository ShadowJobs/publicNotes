import React, { useEffect, useRef, useState } from 'react';
import { Slider, InputNumber, Row, Col } from 'antd';
const precision =4
export const steps = 100;
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(
    () => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay],
  );
  return debouncedValue;
}

const roundUp = (num: number, precision: number) => {
  precision = Math.pow(10, precision);
  return Math.ceil(num * precision) / precision;
};

const RangeSlider: React.FC<{
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  onAfterChange?: any;
  min: number;
  max: number;
  inputWidth?:number|string;
  inputDisabled?: boolean;
}> = ({ value, onChange, onAfterChange, min, max, inputDisabled, inputWidth }) => {
  const stepValue = roundUp((max - min) / steps, precision) || 0.0001; //坑：如果是0，不报错，但是会导致页面超出宽度，因为最后计算得到的width是个超大的数
  const extendedMax = parseFloat((min + (steps + 1) * stepValue).toFixed(precision));

  const [leftValue, setLeftValue] = useState(value ? value[0] : min);
  const [rightValue, setRightValue] = useState(value ? value[1] : extendedMax);

  const debouncedLeftValue = useDebounce(leftValue, 1000);
  const debouncedRightValue = useDebounce(rightValue, 1000);

  const first = useRef(true);

  useEffect(() => {
    const triggerChange = (values: number[]) => {
      onChange?.(values);
      if (first.current) {
        first.current = false;
      } else {
        if (onAfterChange) {
          onAfterChange();
        }
      }
    };
    triggerChange([debouncedLeftValue, debouncedRightValue]);
  }, [debouncedLeftValue, debouncedRightValue]);

  const onLeftChange = (value: number) => {
    if (isNaN(value)) {
      return;
    }
    setLeftValue(value);
  };

  const onRightChange = (value: number) => {
    if (isNaN(value)) {
      return;
    }
    setRightValue(value);
  };

  const onSliderChange = (value: number[]) => {
    setLeftValue(value[0]);
    setRightValue(value[1]);
  };

  return (
    <Row align="middle">
      <Col span={6}>
        {inputDisabled ? (
          <span style={{ width: 32 }}>{leftValue}</span>
        ) : (
          <InputNumber
            min={min}
            max={extendedMax}
            {...stepValue>1e20?{}:{step:stepValue}} //含e的数字会报错
            value={leftValue}
            onChange={(value) => {
              onLeftChange(value);
            }}
            style={{
              width: inputWidth||72,
            }}
          />
        )}
      </Col>

      <Col span={12}>
        <Slider
          range
          min={min}
          max={extendedMax}
          onChange={onSliderChange}
          step={stepValue}
          value={[leftValue, rightValue]}
          style={{ margin: '0px 8px 0px 14px' }}
        />
      </Col>

      <Col span={6}>
        {inputDisabled ? (
          <span style={{ width: 32 }}>{rightValue}</span>
        ) : (
          <InputNumber
            min={min}
            max={extendedMax}
            {...stepValue>1e20?{}:{step:stepValue}}
            value={rightValue}
            onChange={(value) => {
              onRightChange(value);
            }}
            style={{
              width: inputWidth || 72,
            }}
          />
        )}
      </Col>
    </Row>
  );
};

export default RangeSlider;
