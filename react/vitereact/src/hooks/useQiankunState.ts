import { useEffect, useState } from 'react';
import microActions from './microActions';

export default function useQiankunState(): [number, (value: number) => void] {
  const [qkm, setQkm] = useState<number>(microActions.states.qkm);
  useEffect(() => {
    microActions.registerListener('qkm', () => {
      setQkm(microActions.states.qkm)
    })
    return () => {
      microActions.removeListener('qkm')
    }
  }, [])
  return [qkm, setQkm];
}