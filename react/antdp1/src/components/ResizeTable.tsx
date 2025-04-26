// components/ResizableTable/index.jsx
// 可拖拽表格组件
import { useState } from 'react';
import { Table } from 'antd';
import ProTable from '@ant-design/pro-table';
import { Resizable } from 'react-resizable';
import _ from 'lodash'
import './resize.css';

const ResizableTitle = ({ onResize, width, ...restProps }) => {
  if (!width) { return (<th {...restProps} />) };
  return (
    <Resizable width={width} height={0}
      handle={<span className="react-resizable-handle" onClick={e => { e.stopPropagation() }} />}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} style={{ ...restProps?.style, userSelect: 'none' }} />
    </Resizable>
  );
};

export const ResizableTable = ({ columns = [], ...props }) => {
  // * 列数据
  const [cols, setCols] = useState(columns);
  const colsArray = cols.map((col, index) => {
    return {
      ...col,
      onHeaderCell: column => ({ width: column.width, onResize: handleResize(index) })
    };
  });

  // todo 调整列宽
  const handleResize = index => {
    return (_, { size }) => {
      const temp = [...cols];
      temp[index] = { ...temp[index], width: size.width };
      setCols(temp);
    };
  };
  return <Table components={{ header: { cell: ResizableTitle } }} columns={colsArray} {...props} />
};

export const ResizableProTable = ({ columns = [], ...props }) => {
  // todo 调整列宽
  const handleResize = index => {
    return (_, { size }) => {
      const temp = [...cols];
      temp[index] = { ...temp[index], width: size.width };
      setCols(temp);
    };
  };

  // * 列数据
  const [cols, setCols] = useState(columns);
  const colsArray = cols.map((col, index) => {
    let f = _.throttle(handleResize, 500)
    return {
      ...col,
      onHeaderCell: column => ({ width: column.width, onResize: f(index) })
    };
  });

  return <ProTable components={{ header: { cell: ResizableTitle } }} columns={colsArray} {...props} />
};

// 默认暴露 普通表格
export default ResizableProTable;