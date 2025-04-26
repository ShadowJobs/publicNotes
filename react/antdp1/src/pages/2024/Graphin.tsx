import Graphin, { Behaviors, GraphinContext } from '@antv/graphin';
import React, { useContext } from 'react';

const FitView = () => {
  const { graph } = useContext(GraphinContext);
  setTimeout(() => { graph.fitView() }, 0);
  return <></>;
};

const BigGraphConfigModal = ({ }) => {
  const AllowEdit = ({ disabled = false }) => {
    if (disabled) return <></>;
    const { graph } = useContext(GraphinContext);
    graph.on('node:dblclick', ({ item }) => {
      const type = item.getType(); // type是node或者edge
      if (type === 'node') {
        const { id } = item.getModel(); // 返回item的ID
        console.log('node:dblclick', id);
      }
    });
    graph.on('node:click', ({ item }) => { });
    graph.on('edge:dblclick', ({ item }) => {
      const { source } = item.getModel();
      console.log('edge:dblclick', source);
    });
    return <></>;
  };
  const { DragCanvas, ZoomCanvas, DragNode, BrushSelect, ClickSelect, Hoverable } = Behaviors;
  const nodeStyle = {
    keyshape: {
      size: 140,
      fill: 'white',
      stroke: '#5B8FF9',
      lineWidth: 2,
    },
    label: {
      "position": "center",
      "offset": [0, 13],
      "fontSize": 12
    },
  };
  const edgeStyle = {
    keyshape: {
      lineWidth: 2,
      stroke: '#A2B1C3',
      opacity: 0.6,
    },
    label: {
      stroke: 'black',
      fill: 'black',
    },
  };
  return (
    <Graphin
      data={{
        "nodes": [
          {
            "id": "task-head",
            "style": {
              "keyshape": { ...nodeStyle.keyshape },
              "label": { ...nodeStyle.label, "value": "testly1", }
            }
          }, {
            "id": "testly1checkfilter",
            "style": {
              "keyshape": { ...nodeStyle.keyshape },
              "label": { "value": "质检", ...nodeStyle.label, }
            }
          }, {
            "id": "testly1filter",
            "style": {
              "keyshape": { ...nodeStyle.keyshape },
              "label": { "value": "验收", ...nodeStyle.label, }
            }
          }, {
            "id": "finish",
            "style": {
              "keyshape": { ...nodeStyle.keyshape },
              "label": { "value": "EL", ...nodeStyle.label, }
            }
          }
        ],
        "edges": [
          {
            "source": "task-head",
            "target": "testly1checkfilter",
            "style": {
              "keyshape": { ...edgeStyle.keyshape },
              "label": { ...edgeStyle.label, "value": "100%", }
            },
            "id": "task-head-testly1checkfilter-0"
          }, {
            "source": "testly1checkfilter",
            "target": "testly1filter",
            "style": {
              "keyshape": { ...edgeStyle.keyshape },
              "label": { ...edgeStyle.label, "value": "80%", }
            },
            "id": "testly1checkfilter-testly1filter-1"
          }, {
            "source": "testly1filter",
            "target": "finish",
            "style": {
              "keyshape": { ...edgeStyle.keyshape },
            },
            "id": "testly1filter-finish-2"
          }
        ]
      }}
      layout={{ type: 'dagre', rankdir: 'LR', ranksep: 80 }}
      fitCenter={true}
      width={"100%"}
      style={{ margin: 'auto', minHeight: 300, }}
      animate={false}
    >
      <ZoomCanvas />
      <DragCanvas />
      <BrushSelect />
      <ClickSelect />
      <DragNode />
      <Hoverable bindType="node" />
      <Hoverable bindType="edge" />
      <AllowEdit />
      <FitView />
    </Graphin>
  );
};

export default BigGraphConfigModal;