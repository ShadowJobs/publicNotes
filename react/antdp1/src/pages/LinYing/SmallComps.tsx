import { Button, Card, Checkbox, Col, DatePicker, Image, Input, Modal, Row, Select, Slider, Space, Tag, Tooltip, message } from "antd"
const { Option } = Select;
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Form } from 'antd';
import './Common.css';
import { Box, Column, Pie } from "@ant-design/charts";
import DebounceSelect from "./DebounceSelect";
import MonacoEditor from 'react-monaco-editor';
import DiffViewer from "react-diff-viewer";
import { CheckCircleOutlined, CheckOutlined, CopyOutlined } from "@ant-design/icons";
import copy from 'copy-to-clipboard';
import ColorTestComponent from "./ColorGenerator";
import { deepClone } from "@/utils";
import domtoimage from 'dom-to-image';
import { request } from "umi";
import _ from "lodash";
import "./hightlight11.8.0.min.css" //react-markdown的代码高亮样式,必须配合hightlight.js库
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight'
import { NamePath } from "antd/lib/form/interface";
import { FormInstance } from "antd/es/form";


const ReactEcharts = React.lazy(() => import('echarts-for-react'));
// 可以搜索，又可以自己输入的select
//props={value,onChange,initOps} //value和onChange是配合Form使用用的,value要绑定到Select上，onChange在改变value时使用，initOps是初始可选择项
class MySelect extends React.Component {
  state = {
    options: [...this.props.initOps],
    tempOptions: [...this.props.initOps]//临时值，只有当用户输入时，才会改变。但是用户逐个输入时，会产生很多临时值，所以这里会在用户选择某一条后，将options里的值覆盖tempOptions
  };

  handleChange = (value) => {//这里是用户点击选择后，触发的函数。触发后，将新的值天假到options，并将options覆盖tempOptions，保证没有无效的值
    console.log(`选择了: ${value}`);
    if (!this.state.options.find(v => v.value == value)) {
      this.state.options.push({ value })
      this.setState({ tempOptions: [...this.state.options] })
    }
    this.props.onChange?.(value) //调用外部的onChange
  };

  handleSearch = (value) => {
    const { tempOptions } = this.state;
    if (!tempOptions.some((option) => option.value === value)) {
      tempOptions.push({ value });//输入一个字符就会产生一条，等于会产生很多无效的值
      this.setState({ tempOptions });
    }
  };
  handleBlur = (value) => {//失去交点式，清理tempOptions
    this.setState({ tempOptions: [...this.state.options] })
  };

  render() {
    const { tempOptions } = this.state;
    return (
      <Select
        style={{ width: "100%" }}
        placeholder="请选择一个选项"
        value={this.props.value} // props.value在这里用，保证内外的同步
        onChange={this.handleChange}
        showSearch
        onSearch={this.handleSearch}
        onBlur={this.handleBlur}
      >
        {tempOptions.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.value}
          </Option>
        ))}
      </Select>
    );
  }
}
// CustomRadioGroup.tsx

// 包装Select组件，允许输入值,优先搜索，防抖500ms，如果搜索不到，则直接将输入值填入options
export const OneUserSelect = ({ value, onChange, width }) => {
  const [searchedUsers, setSearchedUsers] = useState([])
  const handleSearchUser = _.debounce(async (e) => {
    console.log(e)
    if (!e) {
      setSearchedUsers([])
      return
    }
    const { name_list } = await request(`/user/fuzzy`, { query_name: e })

    console.log(name_list)
    if (name_list.length == 0) {
      setSearchedUsers([{ value: e, text: e }])
      return
    } else {
      setSearchedUsers(name_list.map(v => ({ value: v, text: v })))
    }
  }, 800)
  return (
    <Select
      style={{ width: width || "100%" }}
      placeholder="请选择一个选项"
      value={value}
      onChange={_.debounce(onChange, 500)}
      showSearch
      onSearch={_.debounce(handleSearchUser, 500)}
      allowClear
    >
      {searchedUsers.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {option.value}
        </Select.Option>
      ))}
    </Select>
  );
}
interface CustomRadioGroupProps {
  value?: string | string[];
  onChange?: (value: string | null) => void;
  mode?: 'single' | 'multi'
}

const options = ['all', 'success', 'MPD', 'MPI'];
export const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({ value, onChange, mode = 'single' }) => {
  const [selected, setSelected] = useState<string | string[]>(value || (mode === 'multi' ? [] : ''));

  const handleClick = (option: string) => {
    if (mode === 'single') {
      // 单选模式
      if (selected === option) {
        setSelected('');
        onChange && onChange(null);
      } else {
        setSelected(option);
        onChange && onChange(option);
      }
    } else {
      // 多选模式
      if ((selected as string[]).includes(option)) {
        const newSelected = (selected as string[]).filter((item) => item !== option);
        setSelected(newSelected);
        onChange && onChange(newSelected);
      } else {
        const newSelected = [...(selected as string[]), option];
        setSelected(newSelected);
        onChange && onChange(newSelected);
      }
    }
  };

  return (
    <div>
      {options.map((option) => (
        <Tag.CheckableTag
          key={option}
          // className={`custom-button${mode === 'single' ? (selected === option ? ' selected' : '') : ((selected as string[]).includes(option) ? ' selected' : '')}`}
          checked={mode == 'single' ? (selected === option) : (selected as string[]).includes(option)}
          onClick={() => handleClick(option)}
        >
          {option}
        </Tag.CheckableTag>
      ))}
    </div>
  );
};

export const FormCheckbox = (props) => {
  const { value, onChange, ...rest } = props;
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };
  return <Checkbox checked={value} onChange={handleChange} {...rest} />
};
const selfWriteCopyFunc = (() => {
  if (navigator.clipboard) {//惰性函数,这个判断只会执行一次，省略后面的判断
    return async (text) => {
      await navigator.clipboard.writeText(text)
    }
    // writeText()需要用户的交互才能正常工作。除此之外，它还需要页面处于活动状态（即当前标签页）。如果以上两点不存在，浏览器会出于安全原因拒绝执行命令。
    // 对于 navigator.clipboard.writeText(text) API，当页面在后台运行或未获取焦点时，浏览器将会阻止复制操作。这是为了保护用户的剪贴板不被无意中修改。
    // 必须使用异步函数，否则会报错
  } else {
    return (text) => {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
  }
})()
export const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopyText = () => {
    copy(text);
    setCopied(true);
    message.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 3000);
  };

  return <div>
    <span>{text}</span>
    <Button type="link" icon={copied ? <CheckOutlined /> : <CopyOutlined />} onClick={handleCopyText} />
    <span>{text}</span>，自己写的copy函数
    <Button type="link" icon={copied ? <CheckOutlined /> : <CopyOutlined />} onClick={() => selfWriteCopyFunc(text)} />
    <Button onClick={() => {
      document.addEventListener('copy', (event) => {
        event.preventDefault();
        event.clipboardData.setData('text/plain', "复制已经被禁用");
        message.error("复制已经被禁用")
        document.execCommand('copy');

      }, false);
    }}>禁用浏览器复制</Button>解禁在element-eventlisteners-copy里可以删除所有的
  </div>
};
export const LevelPie: React.FC<{ chart: Mynote.ApiAggLevelPieChart }> = ({ chart }) => {
  const [data, setData] = useState(chart.data);
  const [crumbs, setCrumbs] = useState(['root']);
  const handleClick = (params) => {
    if (params.children) {
      setData(params.children);
      setCrumbs(pre => [...pre, params.label]);
    }
  }
  const getDataByCrumbs = (pathes: string[]) => {
    let d = [...chart.data]
    for (let i = 1; i < pathes.length; ++i) {
      d = [...d.find(v => v.label == pathes[i]).children]
    }
    return d
  }
  const handleCrumbClick = (index) => {
    if (index == crumbs.length - 1) return
    setData(getDataByCrumbs(crumbs.slice(0, index + 1)));
    setCrumbs(pre => pre.slice(0, index + 1));
  }

  const config = {
    appendPadding: 10,
    data: data.map(item => ({ ...item, type: item.label })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    // innerRadius: 0.64,
    label: { type: 'inner', offset: '-50%', content: '{value}', style: { textAlign: 'center' } },
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
    statistic: { title: false, content: false },
    onReady(plot) {
      plot.on('element:click', (event) => {
        handleClick(event.data.data);
      })
    }
  };
  return (
    <div>
      {crumbs.map((crumb, index) => (
        <span style={{ marginRight: 5 }} key={index} onClick={() => handleCrumbClick(index)}>
          <a>{crumb}</a> {index == crumbs.length - 1 ? "" : "|"}
        </span>
      ))}
      <Pie {...config} />
    </div>
  );
}

export const JerkNegMinHistogram = ({ data, mkey }) => {
  const [chartData, setChartData] = useState([]);
  const [xLabels, setXLabels] = useState('-10,-5,-1,0,2,4');

  const handleInputChange = (e) => {
    setXLabels(e.target.value);
  };

  useEffect(() => {
    countValues(data, xLabels);
  }, [data, xLabels]);

  const validateXLabels = (labelsStr) => {
    const pattern = /^(-?\d+(\.\d+)?)(,\s*-?\d+(\.\d+)?)*$/;
    if (!pattern.test(labelsStr)) {
      return false;
    }
    const labelArray = labelsStr.split(',').map((num) => parseFloat(num));
    for (let i = 0; i < labelArray.length - 1; i++) {
      if (labelArray[i] >= labelArray[i + 1]) {
        return false;
      }
    }
    return true;
  };

  const countValues = (data, xLabels) => {
    if (!validateXLabels(xLabels)) {
      setChartData([]);
      return;
    }
    const labels = processXLabels(xLabels);
    let counts = labels.map((label) => [
      { category: label, metricType: 'BaseMetric', count: 0 },
      { category: label, metricType: 'YourMetric', count: 0 }
    ]).flat();
    data.forEach(item => {
      const baseValue = item.baseMetric[mkey];
      const yourValue = item.yourMetric[mkey];
      counts = countHelper(baseValue, 'BaseMetric', counts, xLabels);
      counts = countHelper(yourValue, 'YourMetric', counts, xLabels);
    });
    setChartData(counts);
  };

  const processXLabels = (labelsStr) => {
    const labelArray = labelsStr.split(',');
    const labels = [];

    labels.push(`(-∞, ${parseFloat(labelArray[0])})`); //用parseFloat转换一遍：原因是，如果不转化，02在这儿会被组装成(-∞, 02),而在countHelper()里会被组装成(-∞, 2)，不等了
    for (let i = 0; i < labelArray.length - 1; i++) {
      labels.push(`[${parseFloat(labelArray[i])}, ${parseFloat(labelArray[i + 1])})`);
    }
    labels.push(`[${parseFloat(labelArray[labelArray.length - 1])}, ∞)`);

    return labels;
  };
  const countHelper = (value, metricType, arr, xLabels) => {
    const labelArray = xLabels.split(',').map((num) => parseFloat(num));

    if (value < labelArray[0]) {
      const index = arr.findIndex(item => item.category === `(-∞, ${labelArray[0]})` && item.metricType === metricType);
      arr[index].count++;
    }
    for (let i = 0; i < labelArray.length - 1; i++) {
      if (value >= labelArray[i] && value < labelArray[i + 1]) {
        const index = arr.findIndex(item => item.category === `[${labelArray[i]}, ${labelArray[i + 1]})` && item.metricType === metricType);
        arr[index].count++;
      }
    }
    if (value >= labelArray[labelArray.length - 1]) {
      const index = arr.findIndex(item => item.category === `[${labelArray[labelArray.length - 1]}, ∞)` && item.metricType === metricType);
      arr[index].count++;
    }

    return arr;
  };
  const config = {
    data: chartData,
    xField: 'category',
    yField: 'count',
    isGroup: true,
    seriesField: 'metricType',
    height: 400,
    xAxis: {
      type: 'category',
      label: {
        autoRotate: false,
      },
    },
  };

  return (
    <Card>
      <Input placeholder="Enter comma-separated numbers" value={xLabels} onChange={handleInputChange} />
      <Column {...config} />
    </Card>
  );
};


export const JerkNegMinBoxPlot = ({ data, mkey }) => {
  const average = (arr) => arr.reduce((sum, value) => sum + value, 0) / arr.length;
  const quantile = (arr, q) => {
    const sorted = arr.slice().sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  };
  const prepareData = (data) => {
    const baseMetricValues = data.map((item) => item.baseMetric[mkey]);
    const yourMetricValues = data.map((item) => item.yourMetric[mkey]);
    return [{
      x: "BaseMetric", low: Math.min(...baseMetricValues), q1: quantile(baseMetricValues, 0.25), mid: average(baseMetricValues),
      q3: quantile(baseMetricValues, 0.75), high: Math.max(...baseMetricValues)
    }, {
      x: "YourMetric", low: Math.min(...yourMetricValues), q1: quantile(yourMetricValues, 0.25), mid: average(yourMetricValues),
      q3: quantile(yourMetricValues, 0.75), high: Math.max(...yourMetricValues)
    }];
  };
  const boxData = prepareData(data);
  const config = {
    data: boxData,
    xField: 'x',
    yField: ['low', 'q1', 'mid', 'q3', 'high'],
    outliersStyle: { fill: '#f6f', },
    height: 430
  };

  return <Card><Box {...config} /></Card>
};

const FreeEchart: React.FC<{ result: Mynote.ApiAggFreeEchart }> = ({ result }) => {
  const customizeFuncs = {
    "customize_adas_1": function (params) {
      const tip = params[0].data.tip;
      return `x: ${params[0].name}<br>${params[0].marker}y: ${params[0].value}<br>提示: ${tip}`;
    }
  }
  return <div>
    echart自定义tooltip函数
    {result.data &&
      <ReactEcharts option={{
        ...result.data,
        toolbox: { feature: { dataZoom: { show: true } } },
        tooltip: result.data.tooltip ?
          {
            ...result.data.tooltip,
            formatter: result.data.tooltip.func ? customizeFuncs[result.data.tooltip.func] : undefined
          } :
          { show: true, trigger: 'axis' }
      }}
        style={{
          height: result.external?.echartHeight ? (result.external.echartHeight) : 500,
          width: result.external?.echartWidth ? (result.external.echartWidth) : 500,
        }}
      />
    }</div>
}
// 方法1：
const MonacoTest = () => {
  const [visible, setVisible] = useState(false);
  const editorCount = 2;
  const editorRefs = useRef([]); //useRef默认值可以是单个，null，也可以是个数组[],或hash{}

  useEffect(() => {
    if (visible) {
      //这里的current就是[]
      editorRefs.current.forEach((editorRef) => {
        if (editorRef) {
          editorRef.layout(); //FIX: 重新渲染
        }
      });
    }
  }, [visible]);

  const onEditorDidMount = (editor, index) => {
    editorRefs.current[index] = editor;
  };

  return (
    <div>
      <Button onClick={() => setVisible(true)}>Open Modal</Button>
      <Modal visible={visible} onCancel={() => setVisible(false)} footer={null} width="80%">
        <div>
          {Array.from({ length: editorCount }).map((_, index) => (
            <div key={index} style={{ width: '100%', height: '200px', marginTop: index === 0 ? 0 : 16 }}>
              <MonacoEditor
                language="json"
                theme="vs"
                options={{ selectOnLineNumbers: true }}
                editorDidMount={(editor) => onEditorDidMount(editor, index)}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
// 方法2：
const MonacoTest2 = ({ }) => {
  const editorRef = useRef(null);
  const [isView, setIsView] = useState(false);
  const data = {A:1,B:2}
  const [editorMounted, setEditorMounted] = useState(false);
  
  // 在Modal显示后，确保编辑器正确计算尺寸
  useEffect(() => {
    if (isView && editorMounted && editorRef.current) {
      // 给Monaco一点时间来正确渲染
      const timer = setTimeout(() => {
        // 手动触发布局更新
        if (editorRef.current.editor) {
          editorRef.current.editor.layout();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isView, editorMounted]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = { editor };
    setEditorMounted(true);
    // 监听窗口大小变化，重新计算编辑器尺寸
    window.addEventListener('resize', () => {
      if (editor) {
        editor.layout();
      }
    });
  };

  return (
    <Modal 
      destroyOnClose 
      width={750} 
      open={isView} 
      title="View" 
      style={{ top: 20 }}
      onCancel={() => setIsView(false)} 
      onOk={() => setIsView(false)}
      afterOpenChange={(visible) => {
        // Modal打开后重新计算编辑器尺寸
        if (visible && editorRef.current && editorRef.current.editor) {
          setTimeout(() => {
            editorRef.current.editor.layout();
          }, 100);
        }
      }}
    >
      {data && (
        <div style={{ width: '100%', height: '75vh' }}>
          <MonacoEditor
            value={JSON.stringify(data, null, 2)}
            height="100%"
            width="100%"
            language="json"
            theme="vs"
            options={{ 
              selectOnLineNumbers: true, 
              readOnly: true,
              automaticLayout: true // 启用自动布局
            }}
            editorDidMount={handleEditorDidMount}
          />
        </div>
      )}
    </Modal>
  );
};

const barBoxData = [
  {
    "Bag name": "PLEBW377_event_manual_recording_20230407-102446_0.bag",
    "Base Result": "success",
    "Download Command": "None",
    "Your Result": "success",
    "base_checker_result": [],
    "base_message": "",
    "comments": [],
    "consistent": true,
    "tag": [],
    "your_checker_result": [],
    "your_message": "",
    "baseMetric": {
      "jerk_neg_min": -0.2786413020359496
    },
    "yourMetric": {
      "jerk_neg_min": -0.2786413020359496
    },
    "idx": 39
  },
  {
    "Bag name": "PLEBE733_event_manual_recording_20230406-182601_0.bag",
    "Base Result": "success",
    "Download Command": "None",
    "Your Result": "success",
    "base_checker_result": [],
    "base_message": "",
    "comments": [],
    "consistent": true,
    "tag": [],
    "your_checker_result": [],
    "your_message": "",
    "baseMetric": {
      "jerk_neg_min": -0.7382167611943058
    },
    "yourMetric": {
      "jerk_neg_min": -0.7382167611943058
    },
    "idx": 40
  },
  {
    "Bag name": "PLUA5802_event_manual_recording_20230404-134336_0.bag",
    "Base Result": "success",
    "Download Command": "None",
    "Your Result": "success",
    "base_checker_result": [],
    "base_message": "",
    "comments": [],
    "consistent": true,
    "tag": [],
    "your_checker_result": [],
    "your_message": "",
    "baseMetric": {
      "jerk_neg_min": -1.7216385666347562
    },
    "yourMetric": {
      "jerk_neg_min": -1.4319760105262216
    },
    "idx": 41
  },
  {
    "Bag name": "PLE9X4R7_event_manual_recording_20230203-164545_0.bag",
    "Base Result": "success",
    "Download Command": "None",
    "Your Result": "success",
    "base_checker_result": [],
    "base_message": "",
    "comments": [],
    "consistent": true,
    "tag": [],
    "your_checker_result": [],
    "your_message": "",
    "baseMetric": {
      "jerk_neg_min": -0.4227291562008433
    },
    "yourMetric": {
      "jerk_neg_min": -0.4156026668599247
    },
    "idx": 42
  },
  {
    "Bag name": "PLE9X4R7_event_manual_recording_20230111-102213_0.bag",
    "Base Result": "success",
    "Download Command": "None",
    "Your Result": "success",
    "base_checker_result": [],
    "base_message": "",
    "comments": [],
    "consistent": true,
    "tag": [],
    "your_checker_result": [],
    "your_message": "",
    "baseMetric": {
      "jerk_neg_min": -2.3335658771052192
    },
    "yourMetric": {
      "jerk_neg_min": -2.3335658771052192
    },
    "idx": 43
  }
]

const handleCopy = (value, e) => {
  // 阻止选择事件触发
  e.stopPropagation();
  navigator.clipboard.writeText(value).then(() => {
    message.success(`Copied: ${value}`);
  }).catch(err => {
    message.error('Failed to copy!');
  });
}

const SmallComps: React.FC = () => {
  const [form] = Form.useForm();
  const [sid, setSid] = useState(1)
  const handleChange = (value: string | null) => {
    console.log(`Selected value: ${value}`);
  };
  return <>
    <InterceptTooltip>
      <Tooltip title="tooltip">
        <div>拦截Tooltip</div>
      </Tooltip>
    </InterceptTooltip>
    改造后的Select组件，可以在单选的前提下，同时支持1，由可选的options，2能自己输入新值
    <MySelect initOps={[{ value: 'A' }, { value: 'B' }]} />
    <br />
    <CopyButton text={"复制功能"} />
    Select如何折行显示,搜索不搜索value，而是搜索label
    <div id="pp">
      <Select style={{ width: 300 }} optionFilterProp="label" showSearch onChange={e => {
        // document.querySelector('.ant-select-selection-item').style.color = "yellow"
        document.getElementById("pp").querySelectorAll('.ant-select-selection-item').forEach(item => {
          item.style.color = e == 1 ? 'yellow' : "blue"
        })

      }}>
        {
          [{ label: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa111111111111111111111111", value: 1 },
          { label: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb2222222222222222222222222", value: 2 }]
            .map(v => <Select.Option {...v}>
              <div style={{ wordBreak: "break-all", whiteSpace: "normal" }}>{v.label}</div>
              <Button style={{ float: "right", marginTop: -4 }}
                type="link"
                icon={<CopyOutlined />}
                onClick={(e) => handleCopy(v.label, e)}
              />
            </Select.Option>)
        }
      </Select></div>
    <div>Select可以使用options,也可以使用Children里的Select.Option,Select.Option已经不推荐使用了，但这种写法的好处是可以自定义Item的style
      select自定义已选文字的颜色，可以用querySelector('.ant-select-selection-item').style.color = "blue"
    </div>
    <Tooltip title={"超长字符串省略+tip写法 啊；发送端发；氨基酸的； 发；三大纠纷；就阿斯；东方今典杀戮空间发牢骚大军阀；了解阿斯蒂芬撒大家；发 "}>
      <h3 style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 200 }}
      >
        超长字符串省略+tip写法 啊；发送端发；氨基酸的； 发；三大纠纷；就阿斯；东方今典杀戮空间发牢骚大军阀；了解阿斯蒂芬撒大家；发
      </h3>
    </Tooltip>

    <div><Button onClick={() => {
      const obj = { a: 1, b: 2 }; obj.c = obj
      console.log(deepClone(obj))
    }}>深度克隆</Button>json.parse,messagechannel,自写,lodash
    </div>
    <Form form={form} layout="vertical">
      <Form.Item label="Status (Single)" name="statusSingle">
        <CustomRadioGroup mode="single" onChange={handleChange} />
      </Form.Item>
      <Form.Item label="Status (Multi)" name="statusMulti">
        <CustomRadioGroup mode="multi" onChange={handleChange} />
      </Form.Item>
      <Form.Item label="改造后的checkbox，支持配合Form.item使用" name="checkbox" initialValue={true}>
        <FormCheckbox />
      </Form.Item>
    </Form>
    <Row>
      <Col span={12}>
        注意箱体图的5个点：依次为最下到最上
        <JerkNegMinBoxPlot mkey={"jerk_neg_min"} data={barBoxData} />
      </Col>
      <Col span={12}>
        注意输入：用户输入的1,2,3会被转化为x轴的区间坐标
        <JerkNegMinHistogram data={barBoxData} mkey={"jerk_neg_min"} />
      </Col>
      <Suspense fallback={<div>loading...</div>}>
        <FreeEchart result={{
          "category": null,
          "data": {
            "xAxis": {
              "type": "category",
              "data": ["Mon", "Tue", "Wed", "Thu", 'Fri']
            },
            tooltip: { show: true, trigger: 'axis', func: 'customize_adas_1' },
            "yAxis": { "type": "value" },
            "series": [
              {
                "data": [{ value: 820, tip: "1" }, { value: 932, tip: "2" }, { value: 901, tip: "a" }, { value: 934, tip: "b" }, { value: 1290, tip: "c" }],
                "type": "line",
              }
            ]
          },
          "external": { "span": 12 },
          "title": "Test",
          "type": "echart"
        }} />
      </Suspense>
      防抖搜索Select，可翻页
      <DebounceSelect value={sid} showSearch
        placeholder="Select onnx"
        fetchOptions={async (params) => {
          //请求翻页，params={offset:0,pageSize:10},模拟接口
          if (params.offset == 0)
            return [{ label: 1, value: 1 }, { label: 2, value: 2 }, { label: 3, value: 3 }, { label: 4, value: 4 }, { label: 5, value: 5 }, { label: 6, value: 6 }, { label: 7, value: 7 }, { label: 8, value: 8 },
            { label: 9, value: 9 }, { label: 10, value: 10 }]
          else if (params.offset == 10)
            return [{ label: 11, value: 11 }, { label: 12, value: 12 }, { label: 13, value: 13 }, { label: 14, value: 14 }, { label: 15, value: 15 }, { label: 16, value: 16 }, { label: 17, value: 17 }]
          else return []
        }}
        onChange={async (newValue) => {
          // const selected = onnxList.find(v => v.id == newValue.value)
          console.log(newValue);


        }}
        style={{ width: '100%' }}
      />
      在Modal弹框里嵌入MonacoEditor（model lab这儿掉坑里，monaco显示不出来）
      解决方法见MonacoTest
      <MonacoTest />
      <br /><br />
      <Col span={24}>
        可层级展开的饼图
        <LevelPie chart={{
          "external": { "span": 12 },
          "category": null,
          "data": [
            {
              "color": "#FBF8CC", "label": "Shanghai", "value": 131, children: [
                { "color": "#E9EDC9", "label": "huangpu", "value": 30 },
                { "color": "#CFBAF0", "label": "jingan", "value": 40 },
                {
                  "color": "#98F5E1", "label": "hongkou", "value": 61, children: [
                    { "color": "#E9EDC9", "label": "a", "value": 20 },
                    { "color": "#CFBAF0", "label": "b", "value": 41 },
                  ]
                }
              ]
            },
            { "color": "#E9EDC9", "label": "Baoding", "value": 64 },
            { "color": "#CFBAF0", "label": "Shenzhen", "value": 7 },
            { "color": "#98F5E1", "label": "unknown", "value": 66 },
          ],
          "title": "Distribution: level city",
          "type": "levelPie"
        }} />
      </Col>
      <Row>
        <Col span={18} >
          代码里这个styles的作用，是让修改默认的换行方式，否则，diffviewer的宽度会超过Col设置的18，是个bug
          <br />本代码实现的是react-diff-viewer库，还有其他的库比如
          <Space>
            <a href="https://diff2html.xyz/">diff2html</a> <a href="https://github.com/securingsincity/react-ace">react-ace</a>支持语言多
            <a href="https://uiwjs.github.io/react-codemirror/">react-codemirror</a>
          </Space>
          <DiffViewer
            styles={{ //
              diffContainer: { wordBreak: "break-all" },
              diffRemoved: { wordBreak: "break-all" },
              diffAdded: { wordBreak: "break-all" },
            }}
            oldValue={JSON.stringify({ "A": 1, "B": 2, "x": "X" }, null, 2)}
            newValue={JSON.stringify({ "B": 2, "C": 4 }, null, 2)}
            splitView={true}
            leftTitle="Current config"
            rightTitle="Compare config"
            useDarkTheme={false}
            oldTitleTemplate={() => 'Old Config'}
            newTitleTemplate={() => 'New Config'}
          />
        </Col>
        <Col span={6}></Col>
      </Row>
    </Row>
    <ColorTestComponent />
  </>
}

const MultiColorProgressSegment = ({ value, color }) => {
  const segmentStyle = {
    width: `${value}%`,
    backgroundColor: color,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // 对于绝对定位的提示框是必需的
    overflow: 'hidden', // 隐藏溢出的文本
  };

  return <div style={segmentStyle} />
};


export const MultiColorProgress = ({ percents, endp, success, fail, allSucc }) => {
  return (
    <div style={{ width: '100%', height: 12, position: 'relative', display: "flex" }}>
      <div style={{ flex: 1, borderRadius: '6px', backgroundColor: '#bfbfbf', overflow: 'hidden', display: "flex", }}>
        {percents.map(({ k, v, color }, index) => (
          <MultiColorProgressSegment key={index} label={k} value={v} color={color} />
        ))}
      </div>
      <div style={{ flexBasis: 50, marginLeft: 5 }}>
        <div style={{ position: 'absolute', right: '1px', top: -4, color: endp >= success ? 'green' : endp <= fail ? 'red' : '#000', fontSize: 13 }}>
          {allSucc ? <CheckCircleOutlined /> : `${endp}%`}
        </div>
      </div>
    </div>
  );
};
// 用法如下
{/* <Tooltip title={<div style={{width:200}}>
  阿斯顿发生大法师</div>
}>
  <div style={{width:"100%",paddingTop:2}}> //必须用div包裹，否则Tooltip不显示
    <MultiColorProgress percents={[
      {k:"Success",v:taskInfo.success_counts/taskInfo.total_items*100,color:"#19C106"},
      {k:"Fail",v:taskInfo.failure_counts/taskInfo.total_items*100,color:"red"},
      {k:"Waiting",v:(1/taskInfo.total_items*100,color:"#bfbfbf"}
    ]} success={60} fail={40} 
    endp={80} 
    allSucc={taskInfo.success_counts==taskInfo.total_items && taskInfo.total_items!=0} />
  </div>
</Tooltip> */}


export const InterceptTooltip = ({ children }) => {
  // 控制 Tooltip 显示的状态
  const [tooltipVisible, setTooltipVisible] = useState(false);
  // Tooltip 自己的鼠标移入事件处理函数
  const handleMouseEnter = (e) => {
    // setTooltipVisible(true);
    e.stopPropagation(); //
    e.nativeEvent.stopPropagation();
  };

  // Tooltip 自己的鼠标移出事件处理函数
  const handleMouseLeave = (e) => {
    // setTooltipVisible(false);
    e.stopPropagation();
    e.nativeEvent.stopPropagation();
  };

  const extendedChildren = React.Children.map(children, (child) => {
    if (child.type === Tooltip) {
      return React.cloneElement(child, { //覆盖tooltip的visible和onVisibleChange方法属性
        visible: tooltipVisible,
        onVisibleChange: () => { console.log("visiblechage"); }, // 忽略任何由 Tooltip 内部触发的 visible 改变
        afterVisibleChange: () => { console.log("afterVisibleChange"); } // 忽略任何由 Tooltip 内部触发的 visible 改变
      });
    }
    return child;
  });

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {extendedChildren}
    </div>
  );
};

export const SavePngButton: React.FC<{ node: HTMLElement }> = ({ node }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imgData, setImgData] = useState<string>();
  return <>
    <Modal title={"Preview"} open={isModalVisible} onCancel={e => setIsModalVisible(false)} footer={null}>
      <Image src={imgData} />
      <Button type="primary" onClick={() => {
        const link = document.createElement('a');
        link.download = 'page.png';
        link.href = imgData
        link.click();
      }}>
        Download PNG
      </Button>
    </Modal>
    <Button type="primary" onClick={() => {
      domtoimage.toPng(node)
        .then((dataUrl) => {
          domtoimage.toPng(node).then((dataUrl) => {
            setImgData(dataUrl);
            setIsModalVisible(true);
          });
        })
        .catch((error) => {
          message.error(`save png error`);
        });
    }}>
      ScreenShot
    </Button>
  </>
}

// 第一种markdown组件 react-markdown+rehype-highlight，问题：在ant design pro项目里（aep，epl），报错 react-markdown 依赖的vfile里的
// 找不到 #minpath in ./node_modules/react-markdown/node_modules/vfile/lib/index.js 
export const MarkdownComp: React.FC<{ content: string }> = ({ content }) => {
  return <div style={
    { border: "1px solid #EFF0F2", backgroundColor: "#F5F6F5", borderRadius: 8, padding: 5, width: "100%", }
  } >
    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{content}</ReactMarkdown>
  </div>
}
// 第二种markdown组件 import Markdown from 'markdown-to-jsx';  【推荐】
// 第三种方法的python高亮有问题
// const CustomCode = ({ children, ...props }) => (
//   <pre {...props}>
//     <code>{children}</code>
//   </pre>
// );
// export const MarkdownContent = ({ content }) => {
  // <Markdown options={{ overrides: { code: { component: CustomCode } } }}>{diagnosisData.data}</Markdown>
  // };
// 第二种方法的高亮做法：
// import hljs from 'highlight.js';
// import 'highlight.js/styles/github.css'; // 选择你喜欢的样式
// const applyHighlight = () => {
//   document.querySelectorAll('pre code').forEach((block) => {
//     hljs.highlightBlock(block);
//   });
// };
// 在数据更新时，调用 applyHighlight() 即可。 useEffect(() => { applyHighlight(); }, [content]);
// 第二种方法坑： highlight.js占用较大空间，优化一：类似与react.lazy的懒加载，
// import Markdown from 'react-markdown'; // 假设您使用的是react-markdown
// export const MarkdownComp: React.FC<{ mdStr: string }> = ({ mdStr }) => {
//   useEffect(() => {
//     const applyHighlight = async () => {
//       const hljs = await import('highlight.js');
//       document.querySelectorAll('pre code').forEach((block) => {
//         hljs.default.highlightBlock(block);
//       });
//     };
//     applyHighlight();
//   }, [mdStr]);
//   return (
//     <div style={{ padding: 5, width: "100%", marginBottom: -20, textAlign: "left" }} className="markdown-suggest">
//       <Markdown>{mdStr}</Markdown>
//     </div>
//   );
// };
// 优化2： 优化一有个缺点：如果页面上多次使用MarkdownComp，那么就会多次下载highlight.js，优化方法：
//做成provider，只下载一次highlight.js，然后在MarkdownComp里使用
// import React, { useEffect, useRef, useState } from 'react';
// import Markdown from 'react-markdown';

// // 创建一个 context 来共享 highlight.js 实例
// const HighlightContext = React.createContext<any>(null);

// // 这个组件将包裹整个表格
// export const HighlightProvider: React.FC = ({ children }) => {
//   const [hljs, setHljs] = useState<any>(null);

//   useEffect(() => {
//     // 预加载 highlight.js
//     import('highlight.js').then(module => {
//       setHljs(module.default);
//     });
//   }, []);

//   return (
//     <HighlightContext.Provider value={hljs}>
//       {children}
//     </HighlightContext.Provider>
//   );
// };

// export const MarkdownComp: React.FC<{ mdStr: string }> = ({ mdStr }) => {
//   const hljs = React.useContext(HighlightContext);
//   const codeRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (hljs && codeRef.current) {
//       // 使用 requestIdleCallback 在浏览器空闲时执行高亮
//       requestIdleCallback(() => {
//         codeRef.current!.querySelectorAll('pre code').forEach((block) => {
//           hljs.highlightBlock(block);
//         });
//       });
//     }
//   }, [mdStr, hljs]);

//   return (
//     <div ref={codeRef} style={{ padding: 5, width: "100%", marginBottom: -20, textAlign: "left" }} className="markdown-suggest">
//       <Markdown>{mdStr}</Markdown>
//     </div>
//   );
// };




// 第三种markdown组件 remarkable ; 有高亮问题？？？待尝试
// import { Remarkable } from 'remarkable';
// const MarkdownContent = ({ content }) => {
//   const md = new Remarkable(
    // { //加高亮时使用如下的配置：
    // 先 import Prism from 'prismjs';import 'prismjs/themes/prism.css'
    // highlight: function(str, lang) {
    //   if (lang && Prism.languages[lang]) {
    //     try {
    //       return Prism.highlight(str, Prism.languages[lang], lang);
    //     } catch (_) {}
    //   }
      
    //   return ''; // 使用默认的转义
    // }
// );
//   const htmlContent = md.render(content);
//   return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
// };


// export const RecentButtons: React.FC<{ form: FormInstance, name: string }> = ({ form, name }) => {
//   return <Space>
//     <Button type="primary" size="small" onClick={() => {
//       // 当前时间往前1年
//       const start = dayjs().subtract(1, 'years')
//       const end = dayjs()
//       form.setFieldsValue({ [name]: [start, end] })
//     }}>
//       Last Year
//     </Button>
//     <Button type="primary" size="small" onClick={() => {
//       // 当前时间往前推1个月
//       const start = dayjs().subtract(1, 'months')
//       const end = dayjs()
//       form.setFieldsValue({ [name]: [start, end] })
//     }}>Last Month</Button>
//     <Button type="primary" size="small" onClick={() => {
//       const start = dayjs().subtract(1, 'weeks')
//       const end = dayjs()
//       form.setFieldsValue({ [name]: [start, end] })
//     }}>
//       Last Week
//     </Button>
//     <Button type="primary" size="small" onClick={() => {
//       // 今天0点到24点
//       const start = dayjs().startOf('day')
//       const end = dayjs().endOf('day')
//       form.setFieldsValue({ [name]: [start, end] })
//     }}>
//       Today
//     </Button>
//   </Space>
// }

// 第四种 dify官方MarkDown写法：
// 参考 web/app/components/base/markdown.tsx 

export const TimeRangePickerWithExtra: React.FC<{
  name: NamePath, label: React.ReactNode,
  form: FormInstance<any>,
  value?: any, onChange?: Function
}> = ({ name, label, form }) => {
  return <DatePicker.RangePicker style={{ width: "100%" }} 
  // renderExtraFooter={() => <RecentButtons form={form} name="start_at" />} 
  />
}


export default SmallComps
