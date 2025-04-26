import React, { useEffect, useRef, useState } from 'react';
import G6 from '@antv/g6';
import { Dropdown, Menu } from 'antd';

const AirflowColor = {
  success: "#4caf50",
  running: "#42a5f5",
  failed: "#f44336",
  queued: "#78909c",
  scheduled: "#e91e63",
  restarting: "#67CAFE"
}
const failedSt = ["Canceled", "Failed", "Terminated"]
const AirflowUrl = "http://apm.mm.cn/api/v1";
const G6Graph = ({}) => {
  
  const containerRef = useRef(null);
  const graphRef = useRef(null);  // 添加图实例的引用
  const [tasksData, setTasksData] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const getGraph = async () => {
    const username = "admin";
    const password = "admin";
    const credentials = btoa(`${username}:${password}`); // Base64编码

    // 步骤1：并行执行第一批请求（获取任务列表和DAG运行ID）
    const [tasksResult, dagIdResult] = await Promise.all([
      // 请求1：获取任务列表
      // https://admin:admin@apm.mm.cn/api/v1/dags/pop_t_sim/dagRuns/yinglinjob-33112/taskInstances
      // 浏览器可以直接打开上述链接，js请求必须按下面的写法写

      // fetch(`${AirflowUrl}/dags/pop_t_sim_pipeline/tasks`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Basic ${credentials}`
      //   }
      // }).then(res => res.json()),

      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            "tasks": [
              {
                "downstream_task_ids": [
                  "lymodel_res_task"
                ],
                "task_id": "pipeline_build_pkg",
              },
              {
                "downstream_task_ids": [
                  "lymod_train_job",
                  "pipeline_build_pkg"
                ],
                "task_id": "lymod_process_job",
                
              },
              {
                "downstream_task_ids": [
                  "lymod_simu_job"
                ],
                "task_id": "lymodel_res_task",
              },
              {
                "downstream_task_ids": [],
                "task_id": "lymod_simu_job",
              },
              {
                "downstream_task_ids": [
                  "lymodel_res_task"
                ],
                "task_id": "lymod_train_job",
              }
            ],
            "total_entries": 5
          }
          )
        }, 1000);
      }),

      // 请求2：获取DAG运行ID
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({ data: { dag_run_id: "yinglinjob-33112" } })
        }, 1000);
      })
    ]);

    const dagRunId = dagIdResult.data.dag_run_id;

    // 步骤2：并行执行第二批请求（获取节点状态和job详情）
    const [_nodeLinks] = await Promise.all([
      // 请求3：获取任务实例状态
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            "data": {
              "pipeline_build_pkg": {
                "status": "Completed",
                "url": "http://qq.cn"
              },
              "lymodel_res_task": [
                {
                  "job_name": "job1",
                  "status": "Completed",
                  "url": "http://qq.cn"
                },
                {
                  "job_name": "job2",
                  "status": "Completed",
                  "url": "http://qq.cn"
                }
              ],
              "lymod_simu_job": [
                {
                  "job_name": "job3",
                  "status": "Completed",
                  "url": "http://qq.cn"
                },
                {
                  "job_name": "job4",
                  "status": "Completed",
                  "url": "http://qq.cn"
                }
              ],
              "lymod_train_job": {
                "status": "Completed",
                "url": "http://qq.cn"
              }
            },
            "message": "Get airflow pipeline status success",
            "status": 0
          }
          )
        }, 1000);
      })
    ]);

    const nodeLinks = _nodeLinks?.data

    tasksResult.tasks.forEach(task => {
      task.borderColor = AirflowColor.queued;

      if (nodeLinks?.[task.task_id] && !['lymod_process_job'].includes(task.task_id)) {
        // 如果节点信息是数组
        if (Array.isArray(nodeLinks[task.task_id])) {
          task.urlList = nodeLinks[task.task_id];
          if (task.urlList.length > 0) {
            if (task.urlList.some(v => { return !failedSt.includes(v.status) && v.url })) {
              task.borderColor = AirflowColor.success;
            } else {
              task.borderColor = AirflowColor.failed;
            }
          }
        } else {
          task.url = nodeLinks[task.task_id].url;
          if (task.url) {
            if (failedSt.includes(nodeLinks[task.task_id].status)) {
              task.borderColor = AirflowColor.failed;
            } else
              task.borderColor = AirflowColor.success;
          }

        }
      }
    });
    setTasksData(tasksResult);
  };

  useEffect(() => {
    getGraph();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !tasksData) return;

    const nodes = tasksData.tasks.map(task => ({
      id: task.task_id,
      label: task.task_id,
      type: 'rect',
      url: task.url,
      urlList: task.urlList,
      style: {
        fill: '#FFF8F8',
        stroke: task.borderColor,
        radius: 4,
        cursor: (task.url || task.urlList) ? 'pointer' : 'default'
      }
    }));

    const edges = [];
    tasksData.tasks.forEach(task => {
      if (task.downstream_task_ids) {
        task.downstream_task_ids.forEach(targetId => {
          edges.push({
            source: task.task_id,
            target: targetId,
            style: {
              stroke: '#9E9E9E'
            }
          });
        });
      }
    });

    // 创建 G6 图实例
    const graph = new G6.Graph({
      container: containerRef.current,
      width: containerRef.current.offsetWidth,
      height: 320,
      fitView: true,
      modes: {
        default: ['drag-canvas', 'drag-node']
      },
      layout: {
        type: 'dagre',
        rankdir: 'LR',
        nodesep: 50,
        ranksep: 70
      },
      defaultNode: {
        size: [200, 50],
        type: 'rect',
        style: {
          radius: 4,
          stroke: '#52C41A',
          fill: '#FFF8F8',
          lineWidth: 2
        },
        labelCfg: {
          style: {
            fill: '#333',
            fontSize: 14
          }
        }
      },
      defaultEdge: {
        type: 'cubic-horizontal',
        style: {
          stroke: '#9E9E9E',
          endArrow: {
            path: 'M 0,0 L 8,4 L 8,-4 Z',
            fill: '#9E9E9E'
          }
        }
      }
    });

    // 保存图实例的引用
    graphRef.current = graph;

    // 处理节点点击事件 - 显示下拉菜单
    graph.on('node:click', (evt) => {
      // 阻止事件冒泡，以防它立即触发画布点击事件
      evt.originalEvent.stopPropagation();

      const node = evt.item;
      const model = node.getModel();
      const clientX = evt.clientX;
      const clientY = evt.clientY;

      // 如果节点有多个URL（数组形式），显示下拉菜单
      if (model.urlList && model.urlList.length > 0) {
        setDropdownItems(model.urlList);
        setDropdownPosition({ x: clientX, y: clientY });
        setDropdownVisible(true);
      }
      else if (model.url) {
        window.open(model.url, '_blank');
      }
    });

    // 添加画布点击事件 - 隐藏下拉菜单
    graph.on('canvas:click', () => {
      if (dropdownVisible) {
        setDropdownVisible(false);
      }
    });

    // 当鼠标悬停在有URL的节点上时，改变鼠标样式为指针
    graph.on('node:mouseenter', (evt) => {
      const node = evt.item;
      const model = node.getModel();

      if (model.url || (model.urlList && model.urlList.length > 0)) {
        containerRef.current.style.cursor = 'pointer';
      }
    });

    // 当鼠标离开节点时，恢复默认鼠标样式
    graph.on('node:mouseleave', () => {
      containerRef.current.style.cursor = 'default';
    });

    graph.data({ nodes, edges });
    graph.render();

    // 响应窗口大小变化
    const handleResize = () => {
      if (graph && !graph.destroyed) {
        graph.changeSize(containerRef.current.offsetWidth, 400);
        graph.fitView();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      graph && graph.destroy();
    };
  }, [tasksData, dropdownVisible]); // 添加dropdownVisible作为依赖项，确保图表能监听到下拉菜单状态变化

  // 点击文档的其他区域隐藏下拉菜单
  const handleDocumentClick = (e) => {
    // 检查点击是否在容器外部
    if (containerRef.current && !containerRef.current.contains(e.target) && dropdownVisible) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    // 添加文档点击监听，用于点击图表外部区域时关闭菜单
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [dropdownVisible]);

  // 构建下拉菜单
  const menu = (
    <Menu>
      {dropdownItems.map((item, index) => (
        <Menu.Item key={index}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: failedSt.includes(item.status) ? AirflowColor.failed : AirflowColor.success }}
          >
            {item.job_name || `任务 ${index + 1}`} - {item.status}
          </a>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div style={{ position: 'relative', width: "100%", height: 400 }}>
      <ul>
        <li>1,Promise.all节省通信时间</li>
        <li>2,带登录信息的请求如何用js实现https://admin:admin@apm.mm.cn/api/v1/dags</li>
        <li>3,antv/g6画图，</li>
        <li>4,如何在点击位置画一个下拉选项</li>
      </ul>
      <div
        ref={containerRef}
        style={{ width: "100%", height: 400 }}
      />

      {dropdownVisible && (
        <div
          className="custom-dropdown-container"
          style={{
            position: 'fixed',
            top: dropdownPosition.y,
            left: dropdownPosition.x,
            zIndex: 9999
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Dropdown
            visible={true}
            overlay={menu}
            trigger={[]}
          >
            <span></span>
          </Dropdown>
        </div>
      )}
    </div>
  );
};

export default G6Graph;