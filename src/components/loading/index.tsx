import React, { FC } from 'react'
import './index.less'

export interface LoadingProps {
  visible: boolean
}
const Loading: FC<LoadingProps> = ({ visible }) => {
  if (!visible) {
    return null
  }
  return (
    <div className="vscode-npm-manage-loader-box">
      <div className="vscode-npm-manage-loader">
        <div className="outer"></div>
        <div className="inner"></div>
      </div>
      <div className="vscode-npm-manage-loader-text">Loading...</div>
    </div>
  )
}

export default React.memo(Loading)
