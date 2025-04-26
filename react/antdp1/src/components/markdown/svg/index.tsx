import React from 'react'
import s from './style.less'

type ISVGBtnProps = {
  isSVG: boolean
  setIsSVG: React.Dispatch<React.SetStateAction<boolean>>
}

const SVGBtn = ({
  isSVG,
  setIsSVG,
}: ISVGBtnProps) => {
  return (
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
      }}
      onClick={() => { setIsSVG(prevIsSVG => !prevIsSVG) }}
    >
      <div 
      // className={`w-6 h-6 rounded-md hover:bg-gray-50 ${s.svgIcon} ${isSVG ? s.svgIconed : ''}`}
      className={`${s.svgIcon} ${isSVG ? s.svgIconed : ''}`}

      ></div>
    </div>
  )
}

export default SVGBtn
