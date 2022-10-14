import type { PackageType } from './interface/index'
import React, { useState, useCallback, useEffect } from 'react'
import ReactDom, { unstable_batchedUpdates as batch } from 'react-dom'
import Input from './components/input/index'
import PackageList from './components/package-list'
import Loading from './components/loading'
import { MESSAGE } from './enum/message'
import './styles/reset.less'
import './styles/webview.less'

const vscode = acquireVsCodeApi()
const WebView = () => {
  // 搜索框输入的值
  const [searchValue, setSearchValue] = useState('')
  // 搜索结果 dep依赖名 version版本号 string | Array<string>
  const [searchResult, setSearchResult] = useState({ dep: '', version: '' })
  // 是否为加载状态
  const [loading, setLoading] = useState(false)
  // package.json的内容
  const [packageData, setPackageData] = useState<PackageType>({
    name: '',
    version: '',
    description: '',
    main: '',
    scripts: {},
    devDependencies: {},
    dependencies: {}
  })
  // package.json中所有依赖的最新版本
  const [latestVersionData, setLatestVersion] = useState<{ [key: string]: string }>({})
  // 初始化
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
          setLoading(false)
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
    setLoading(true)
    vscode.postMessage({ command: MESSAGE.SEARCH_PACKAGE_LATEST, payload: { dep: searchValue } })
  }
  const onEnter = () => {
    onSearch()
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
          <div className="card">
            <div className="title">
              <span>搜索结果</span>
            </div>
            <div className="list">
              <PackageList
                data={{ [searchResult.dep]: '' }}
                latestVersionData={{ [searchResult.dep]: searchResult.version }}
              ></PackageList>
            </div>
          </div>
        </div>
      ) : null}
      <div className="content">
        <div className="card">
          <div className="title">
            <span>生产依赖</span>
          </div>
          <div className="list">
            <PackageList data={packageData.dependencies} latestVersionData={latestVersionData} />
          </div>
        </div>
        <div className="card">
          <div className="title">
            <span>开发依赖</span>
          </div>
          <div className="list">
            <PackageList data={packageData.devDependencies} latestVersionData={latestVersionData} />
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
