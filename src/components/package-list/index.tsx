import React, { FC } from 'react'
import './index.less'
import { MESSAGE } from '@/enum/message'
/**
 * 删除依赖
 * @param {string} packageName 依赖名称
 * @return {void}
 */
const deletePackage = (packageName: string): void => {
  vscode.postMessage({ command: MESSAGE.DELETE_PACKAGE, payload: { dep: packageName } })
}
/**
 * 删除依赖
 * @param {string} packageName 依赖名称
 * @param {string} version 要升级的版本
 * @return {void}
 */
const upgradePackage = (packageName: string, version: string): void => {
  vscode.postMessage({ command: MESSAGE.UPGRAD_PACKAGE, payload: { dep: packageName, version } })
}
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
