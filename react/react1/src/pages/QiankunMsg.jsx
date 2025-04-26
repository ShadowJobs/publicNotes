
import { useQiankunState } from '../hooks/qiankunState';
import microActions from '../microActions';
import { Button } from 'antd';
export const QiankunMsg = () => {
  const [qkm, setQkm] = useQiankunState();
  return <Button type="primary" onClick={() => {
    let newQkm = qkm + 1;
    microActions?.setGlobalState?.({ qkm: newQkm })}
  }>
    qiankun child app {qkm}
  </Button>
}