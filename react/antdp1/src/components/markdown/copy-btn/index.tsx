'use client'
import { useState } from 'react'
import copy from 'copy-to-clipboard'
// import s from './style.module.css'
import s from './style.less'

// .copyIcon.copied {
//   background-image: url(~@/components/assets/copied.svg);
// }
type ICopyBtnProps = {
  value: string
  className?: string
  isPlain?: boolean
}

const CopyBtn = ({
  value,
  className,
  isPlain,
}: ICopyBtnProps) => {
  const [isCopied, setIsCopied] = useState(false)

  return (
    <div className={`${className}`}>
      
        <div
          // className={'box-border p-0.5 flex items-center justify-center rounded-md bg-white cursor-pointer'}
          style={{
            boxSizing: 'border-box',
            padding: '0.125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.375rem',
            backgroundColor: 'white',
            cursor: 'pointer',
            boxShadow:!isPlain?'0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)':undefined
          }}
          onClick={() => {
            copy(value)
            setIsCopied(true)
          }}
        >
          <div className={`${s.copyIcon} ${isCopied ? s.copied : ''}`}></div>
        </div>
    </div>
  )
}

export default CopyBtn
