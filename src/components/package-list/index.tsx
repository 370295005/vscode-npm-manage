import React, { FC } from 'react'
import './index.less'
export interface PackageListType {
  data: StringObject
  latestVersionData: StringObject
  deletePackage: (packageName: string) => void
  upgradePackage: (packageName: string, version: string) => void
}
const PackageList: FC<PackageListType> = ({ data, latestVersionData, deletePackage, upgradePackage }) => {
  return (
    <div className="package-list">
      {Object.keys(data).map((packageName, index) => {
        return (
          <div className="package" key={index}>
            <div className="package-name">{packageName}</div>
            <div className="package-version">
              <div className="current-version">{data[packageName] || ''}</div>
              {latestVersionData[packageName] && data[packageName] ? (
                <i className="iconfont icon-shengji upgrade-package-icon"></i>
              ) : null}
              <div className="latest-version">{latestVersionData[packageName]}</div>
            </div>
            <div className="operation">
              <i
                className="iconfont icon-shanchu delete-package-icon"
                title="删除依赖"
                onClick={() => {
                  deletePackage(packageName)
                }}
              ></i>
              {latestVersionData[packageName] ? (
                <i
                  className="iconfont icon-yunxiazai_o install-package-icon"
                  title="升级依赖"
                  onClick={() => {
                    upgradePackage(packageName, latestVersionData[packageName])
                  }}
                ></i>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PackageList
