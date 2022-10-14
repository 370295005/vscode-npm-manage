import React, { FC } from 'react'
import './index.less'
export interface PackageListType {
  data: StringObject
  latestVersionData: StringObject
}
const PackageList: FC<PackageListType> = ({ data, latestVersionData }) => {
  return (
    <div className="package-list">
      {Object.keys(data).map((packageName, index) => {
        return (
          <div className="package" key={index}>
            <div className="package-name">{packageName}</div>
            <div className="package-version">
              <div className="current-version">{data[packageName] || ''}</div>
              {latestVersionData[packageName] ? <i className="iconfont icon-shengji upgrade-package-icon"></i> : null}
              <div className="latest-version">{latestVersionData[packageName]}</div>
            </div>
            <div className="operation">
              <i className="iconfont icon-shanchu delete-package-icon" title="删除依赖"></i>
              <i className="iconfont icon-yunxiazai_o install-package-icon" title="升级依赖"></i>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PackageList
