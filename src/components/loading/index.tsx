import React, { FC, memo } from 'react'
import { Spin } from 'antd'
import './index.less'
import 'antd/lib/spin/style/index.css'
export interface LoadingProps {
  isLoading: boolean
}
const Loading: FC<LoadingProps> = ({ isLoading }) => {
  return (
    <div className="loading" style={{ display: isLoading ? 'flex' : 'none' }}>
      <Spin size="large" />
    </div>
  )
}

export default memo(Loading)
