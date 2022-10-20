import React, { FC, memo } from 'react'
import { Spin } from 'antd'
import './index.less'
import 'antd/lib/spin/style/index.css'
export interface LoadingProps {
  isLoading: boolean
  loadingText?: string
}
const Loading: FC<LoadingProps> = ({ isLoading, loadingText }) => {
  return (
    <div className="loading" style={{ display: isLoading ? 'flex' : 'none' }}>
      <Spin size="large" tip={<div className="loading-text">{loadingText || '加载中...'}</div>} />
    </div>
  )
}

export default memo(Loading)
