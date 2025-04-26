import ErrorBoundary from "@/components/ErrorBoundary"
import { PythonUrl } from "@/global"
import ProTable from "@ant-design/pro-table"
import { Button, Tooltip } from "antd"
import { request } from "umi"
const ErrorStatistic: React.FC<{}> = ({ }) => {
  const columns = [
    { dataIndex: 'id', title: 'ID' },
    { dataIndex: 'type', title: '错误类型' },
    { dataIndex: 'message', title: '错误信息' },
    {
      dataIndex: 'source', title: '错误来源', width: 150, render: (text, row) => <div><Tooltip title={text}>
        {text?.slice?.(0, 20) + (text?.length > 20 ? "..." : "")}
      </Tooltip></div>
    },
    {
      dataIndex: "stack", title: "错误栈", width: 200, render: (text, row) => <div><Tooltip title={text} overlayInnerStyle={{ width: 500 }}>
        {text?.slice?.(0, 20) + (text?.length > 20 ? "..." : "")}
      </Tooltip></div>
    },
    { dataIndex: 'lineno', title: '行号' },
    { dataIndex: 'colno', title: '列号' },
    { dataIndex: 'component_stack', title: '组件栈' },
    { dataIndex: 'created_at', title: '创建时间' },
    { dataIndex: 'user', title: '用户' },

  ]
  return <div>
    <ErrorBoundary>
      <Button onClick={() => {
        throw new Error('普通错误')
      }}>触发普通错误</Button>
      <Button onClick={() => {
        Promise.reject(new Error('Promise错误')) //Promise.reject()只返回拒绝原因，不提供错误栈（stack）.可以使用 new Error() 并传递它给reject()
      }}>触发Promise错误</Button>
    </ErrorBoundary>
    <ProTable columns={columns}
      request={
        async (params) => {
          const { current, pageSize } = params
          const res = await request(`${PythonUrl}/front-err/list`, {
            params: { page_num: current, page_size: pageSize }
          })
          return {
            data: res.data,
            success: res.status === 'success',
            total: res.total
          }
        }
      }
      rowKey={'id'}
      scroll={{ x: "max-content" }}
      search={false}
    />
  </div>
}
export default ErrorStatistic