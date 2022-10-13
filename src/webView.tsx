import type { PackageType } from './interface/index'
import React, { useState, useCallback, useEffect } from 'react'
import ReactDom, { unstable_batchedUpdates as batch } from 'react-dom'
import Input from './components/input/index'
import List from './components/list'
import Loading from './components/loading'

import { MESSAGE } from './enum/message'

import './styles/reset.less'
import './styles/webview.less'

const vscode = acquireVsCodeApi()

const WebView = () => {
  const [searchValue, setSearchValue] = useState('')
  const [searchResult, setSearchResult] = useState({ dep: '', version: '' })
  const [loading, setLoading] = useState(false)
  const [packageData, setPackageData] = useState<PackageType>({
    name: '',
    version: '',
    description: '',
    main: '',
    scripts: {},
    devDependencies: {},
    dependencies: {}
  })
  const [latestVersionData, setLatestVersion] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    vscode.postMessage({ command: MESSAGE.INIT_NPM })
  }, [])

  useEffect(() => {
    // webview和外界的交互需要使用监听message事件来完成
    const listen = (event: any) => {
      const data = event.data
      switch (data.message) {
        case MESSAGE.FINISH_QUERY_PACKAGE:
          setPackageData(data.payload)
          return
        case MESSAGE.FINISH_CHECK_PACKAGES_LATEST:
          if (!data.payload) {
            setLoading(false)
            return
          }
          batch(() => {
            setLatestVersion(data.payload)
            setLoading(false)
          })
          return
        case MESSAGE.FINISH_SEARCH_PACKAGE_LATEST:
          const { dep, version } = data.payload
          console.log('webview 获取到的搜索结果', `${dep}-${version}`)
          setSearchResult({ dep, version })
          return
        default:
          return
      }
    }
    window.addEventListener('message', listen)
    return () => {
      window.removeEventListener('message', listen)
    }
  }, [])

  const onChangeSearchValue: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setSearchValue(e.target.value)
  }, [])

  /**
   * 检测依赖最新版本
   */
  const onCheckUpdate = useCallback(() => {
    setLoading(true)
    vscode.postMessage({ command: MESSAGE.CHECK_PACKAGES_LATEST })
  }, [])
  // 搜索依赖
  const onSearch = () => {
    vscode.postMessage({ command: MESSAGE.SEARCH_PACKAGE_LATEST, payload: { dep: searchValue } })
  }
  const onEnter = () => {
    console.log('按下了enter')
  }
  return (
    <div className="npm-manage">
      <Loading visible={loading} />
      <div className="header">
        <Input onChange={onChangeSearchValue} onEnter={onEnter} />
        <div className="filter">
          <button className="filter-btn" onClick={onSearch}>
            搜索
          </button>
          <button className="filter-btn" onClick={onCheckUpdate}>
            检查依赖升级
            <svg className="icon download-icon" aria-hidden="true">
              <use xlinkHref="#icon-download"></use>
            </svg>
          </button>
        </div>
      </div>
      {/* TODO 修改搜索结果的样式 */}
      {searchResult.dep && searchResult.version ? (
        <div className="search-result">
          <div className="title">
            <span>搜索结果</span>
          </div>
          <div className="list">
            <List
              data={{ [searchResult.dep]: '' }}
              latestVersionData={{ [searchResult.dep]: searchResult.version }}
            ></List>
          </div>
        </div>
      ) : null}
      <div className="content">
        <div className="card">
          <div className="title">
            <span>生产依赖</span>
          </div>
          <div className="list">
            <List data={packageData.dependencies} latestVersionData={latestVersionData} />
          </div>
        </div>
        <div className="card">
          <div className="title">
            <span>开发依赖</span>
          </div>
          <div className="list">
            <List data={packageData.devDependencies} latestVersionData={latestVersionData} />
          </div>
        </div>
      </div>
    </div>
  )
}

ReactDom.render(
  <div className="app">
    <WebView />
  </div>,
  document.getElementById('vscode-npm-manage')
)

if (module.hot) {
  module.hot.accept()
}
