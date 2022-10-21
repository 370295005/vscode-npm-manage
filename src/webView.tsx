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
  const [searchResult, setSearchResult] = useState<{ dep: string; version: string | Array<string> }>({
    dep: '',
    version: []
  })
  // 在线平台组依赖
  // const [csdcList, setCsdcList] = useState([])
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
    setLoading(true)
    vscode.postMessage({ command: MESSAGE.INIT_NPM })
  }, [])

  useEffect(() => {
    // webview和外界的交互需要使用监听message事件来完成
    const listen = (event: any) => {
      const data = event.data
      switch (data.message) {
        // 查询依赖版本完成
        case MESSAGE.FINISH_QUERY_PACKAGE:
          batch(() => {
            setLoading(false)
            setPackageData(data.payload)
          })
          return
        // 查询依赖版本更新完成
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
        // 查询单个依赖最新版本完成
        case MESSAGE.FINISH_SEARCH_PACKAGE_LATEST:
          const { dep, version } = data.payload
          batch(() => {
            setLoading(false)
            setSearchResult({ dep, version })
          })
          return
        // 升级依赖完成
        case MESSAGE.FINISH_UPGRADE_PACKAGE:
          setLoading(false)
          return
        // 删除依赖完成
        case MESSAGE.FINISH_DELETE_PACKAGE:
          setLoading(false)
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
  /**
   *
   * @param {boolean} all 是否搜索全部版本
   * @return {void}
   */
  const onSearch = (all: boolean = false): void => {
    if (searchValue.trim()) {
      setLoading(true)
      vscode.postMessage({ command: MESSAGE.SEARCH_PACKAGE_LATEST, payload: { dep: searchValue.trim(), all } })
    }
  }
  /**
   * 删除依赖
   * @param {string} packageName 依赖名称
   * @param {string} version 要升级的版本
   * @return {void}
   */
  const upgradePackage = (packageName: string, version: string): void => {
    setLoading(true)
    vscode.postMessage({ command: MESSAGE.UPGRAD_PACKAGE, payload: { dep: packageName, version } })
  }
  /**
   * 删除依赖
   * @param {string} packageName 依赖名称
   * @return {void}
   */
  const deletePackage = (packageName: string): void => {
    setLoading(true)
    vscode.postMessage({ command: MESSAGE.DELETE_PACKAGE, payload: { dep: packageName } })
  }
  return (
    <div className="npm-manage">
      <Loading isLoading={loading} />
      <div className="header">
        <Input onChange={onChangeSearchValue} />
        <div className="filter">
          <button
            className="filter-btn"
            onClick={() => {
              onSearch()
            }}
          >
            搜索最新稳定版本
          </button>
          <button
            className="filter-btn"
            onClick={() => {
              onSearch(true)
            }}
          >
            搜索依赖的最新十个版本
          </button>
          <button className="filter-btn" onClick={onCheckUpdate}>
            检查依赖升级
            <i className="iconfont icon-yunxiazai_o"></i>
          </button>
        </div>
      </div>
      {/* TODO 修改搜索结果的样式 */}
      {searchResult.dep && searchResult.version ? (
        <div className="search-result">
          <div className="card" style={{ width: 'calc(50% - 13px)' }}>
            <div className="title">
              <span>搜索结果</span>
            </div>
            <div className="search-list">
              <div className="package-name" title={searchResult.dep}>
                {searchResult.dep}
              </div>
              <div className="package-version">
                {Array.isArray(searchResult.version) ? (
                  searchResult.version.map((item: string) => {
                    return (
                      <div
                        className="version"
                        key={item}
                        onClick={() => {
                          upgradePackage(searchResult.dep, item)
                        }}
                      >
                        <div className="name" title={item}>
                          {item}
                        </div>
                        <div className="iconfont icon-yunxiazai_o" title={`安装${searchResult.dep}@${item}`}></div>
                      </div>
                    )
                  })
                ) : (
                  <div
                    className="version"
                    onClick={() => {
                      upgradePackage(searchResult.dep, searchResult.version as string)
                    }}
                  >
                    <div className="name" title={searchResult.version}>
                      {searchResult.version}
                    </div>
                    <div
                      className="iconfont icon-yunxiazai_o"
                      title={`安装${searchResult.dep}@${searchResult.version}`}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="content">
        <div className="card">
          <div className="title">在线平台组依赖</div>
        </div>
        <div className="list">{/* <PackageList data={csdcList} latestVersionData={[]}></PackageList> */}</div>
      </div>
      <div className="content">
        <div className="card">
          <div className="title">生产依赖</div>
          <div className="list">
            <PackageList
              data={packageData.dependencies}
              latestVersionData={latestVersionData}
              upgradePackage={upgradePackage}
              deletePackage={deletePackage}
            />
          </div>
        </div>
        <div className="card">
          <div className="title">开发依赖</div>
          <div className="list">
            <PackageList
              data={packageData.devDependencies}
              latestVersionData={latestVersionData}
              upgradePackage={upgradePackage}
              deletePackage={deletePackage}
            />
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
