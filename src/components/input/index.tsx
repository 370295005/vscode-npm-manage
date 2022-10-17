import React, { FC, ReactElement } from 'react'
import './index.less'
export interface InputProps {
  placeholder?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const Input: FC<InputProps> = ({ onChange, placeholder }): ReactElement<any, any> => {
  return (
    <>
      <div className="search-input">
        <input type="text" placeholder={placeholder || '请输入依赖名称'} onChange={onChange} />
      </div>
    </>
  )
}

export default Input
