import microActions from '../microActions';
import { useState, useEffect } from 'react';

export const useQiankunState = () => {
  const [qkm, setQkm] = useState(microActions.states.qkm);
  useEffect(()=>{
    microActions.registerListener('qkm',()=>{
      setQkm(microActions.states.qkm)
    })
    return ()=>{
      microActions.removeListener('qkm')
    }
  },[])
  return [qkm, setQkm];
}