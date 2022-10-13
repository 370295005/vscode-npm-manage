import React, { FC, ReactElement, useCallback, KeyboardEventHandler } from 'react'
import './index.less'
export interface InputProps {
  placeholder?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onEnter?: () => void
}

const Input: FC<InputProps> = ({ onChange, onEnter, placeholder }): ReactElement<any, any> => {
  const inputHander: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (target) => {
      // 敲击回车
      if (target.keyCode === 13) {
        onEnter && onEnter()
      }
    },
    [onEnter]
  )
  return (
    <>
      <div className="search-input">
        <input type="text" placeholder={placeholder || '请输入依赖名称'} onChange={onChange} onKeyPress={inputHander} />
      </div>
    </>
  )
}

export default Input
