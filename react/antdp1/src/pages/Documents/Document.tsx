import { PythonUrl } from "@/global"
import { request, useParams } from "umi"
import { MarkdownComp } from "../LinYing/SmallComps"
import { useQuery } from "react-query"
import { Markdown } from "@/components/markdown/markdown"
import CopyBtn from "@/components/markdown/copy-btn"

const Document: React.FC = () => {
  const { file } = useParams<{ file: string }>()
  // 这里用react-query，所以当python文件内容修改时，会定期重新请求。
  // 特点是，页面激活时（比如鼠标从别的窗口进入浏览器标签时），并且超过6秒（因为下面cacheTime设置为6秒）,会自动请求一次数据。
  const { data } = useQuery(["file", file], async () => { 
    const r = await request(`${PythonUrl}/doc/file/${file}`)
    return r.data
  }, {
    staleTime: 1000 * 3, // 数据在3秒后会陈旧 //这两个时间才是关键，不设置的话，会一直请求
    cacheTime: 1000 * 6, // 缓存在10秒后删除.
  })
  return <>
  <div style={{position:"absolute",right:10}}><CopyBtn className='mr-1' value={data} isPlain/></div>
  <Markdown content={data} />
  {/* <MarkdownComp content={data} />  */}
  </>
}
export default Document