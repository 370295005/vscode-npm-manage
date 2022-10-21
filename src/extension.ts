import * as vscode from 'vscode'
import path from 'path'
import { getWebViewContent, getExtensionFileVscodeResource } from './utils/index'
import { MESSAGE } from './enum/message'
import {
  getPackageVersion,
  getPackageLastVersion,
  upgradeDep,
  getDepLatestVersion,
  deletePackage
} from './core/command'
import { NodeDependenciesProvider } from './core/com'

type MessageType = {
  command: MESSAGE
  payload: { version: string; dep: string; all: boolean; error: string; result: string }
}
/**
 * 插件触发时执行
 */
export function activate(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider(
    'npmManageDependencies',
    new NodeDependenciesProvider(vscode.workspace.rootPath || '', 'dep')
  )
  vscode.window.registerTreeDataProvider(
    'npmManageDevDependencies',
    new NodeDependenciesProvider(vscode.workspace.rootPath || '', 'devDep')
  )

  const disposable = vscode.commands.registerCommand('vscode-npm-manage.openNpmManageView', () => {
    const url = path.join(vscode.workspace.rootPath as string, 'package.json')
    const html = getWebViewContent(context, 'dist/view/webView.html')
    let panel = vscode.window.createWebviewPanel('webView', 'NPM Manage', vscode.ViewColumn.One, {
      enableScripts: true, // 启用JS
      retainContextWhenHidden: true // webview被隐藏时保持状态,避免被重置.
    })
    panel.webview.html = html
    panel.iconPath = getExtensionFileVscodeResource(context, 'dist/images/extension.png')

    /**
     * 接收并处理webview传递的信息
     */
    panel.webview.onDidReceiveMessage(async (message: MessageType) => {
      switch (message.command) {
        // 初始化查询所有依赖的版本
        case MESSAGE.INIT_NPM:
          try {
            const result = await getPackageVersion(context, url)
            panel.webview.postMessage({ message: MESSAGE.FINISH_QUERY_PACKAGE, payload: result })
          } catch (error) {
            panel.webview.postMessage({ message: MESSAGE.FINISH_QUERY_PACKAGE, payload: error })
          }
          return
        // 获取所有依赖的最新版本
        case MESSAGE.CHECK_PACKAGES_LATEST:
          try {
            const result = await getPackageLastVersion(url)
            panel.webview.postMessage({ message: MESSAGE.FINISH_CHECK_PACKAGES_LATEST, payload: result })
          } catch (error) {
            panel.webview.postMessage({ message: MESSAGE.FINISH_CHECK_PACKAGES_LATEST, payload: error })
          }
          return
        // 搜索依赖
        case MESSAGE.SEARCH_PACKAGE_LATEST:
          try {
            const { dep, all } = message.payload
            if (dep) {
              const result = await getDepLatestVersion(dep, all)
              panel.webview.postMessage({
                message: MESSAGE.FINISH_SEARCH_PACKAGE_LATEST,
                payload: { dep, version: result }
              })
            }
          } catch (error) {
            panel.webview.postMessage({ message: MESSAGE.FINISH_SEARCH_PACKAGE_LATEST, payload: error })
          }
          return
        // 升级单个依赖
        case MESSAGE.UPGRAD_PACKAGE:
          try {
            const { dep, version } = message.payload
            const result = await upgradeDep(dep, version, vscode.workspace.rootPath as string)
            panel.webview.postMessage({ message: MESSAGE.FINISH_UPGRADE_PACKAGE, payload: result })
          } catch (error) {
            panel.webview.postMessage({ message: MESSAGE.FINISH_UPGRADE_PACKAGE, payload: error })
          }
          return
        // 删除单个依赖
        case MESSAGE.DELETE_PACKAGE:
          try {
            const { dep } = message.payload
            const result = await deletePackage(dep, vscode.workspace.rootPath as string)
            console.log(result)
            panel.webview.postMessage({ message: MESSAGE.FINISH_DELETE_PACKAGE })
          } catch (error) {
            panel.webview.postMessage({ message: MESSAGE.FINISH_DELETE_PACKAGE })
          }
          return
        default:
          return {}
      }
    })

    panel.onDidDispose(() => {}, undefined, context.subscriptions)
  })
  context.subscriptions.push(disposable)
}

/**
 * 插件关闭时执行
 */
export function deactivate() {}
