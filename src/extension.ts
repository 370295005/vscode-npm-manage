import * as vscode from 'vscode'
import path from 'path'
import { getWebViewContent, getExtensionFileVscodeResource } from './utils/index'
import { MESSAGE } from './enum/message'
import { getPackageVersion, getPackageLastVersion, getSingleDepInfo } from './core/command'
import { NodeDependenciesProvider } from './core/com'

type MessageType = {
  command: MESSAGE
  payload: any
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
    panel.iconPath = getExtensionFileVscodeResource(context, 'dist/images/npm-outline.svg')

    /**
     * 接收并处理webview传递的信息
     */
    panel.webview.onDidReceiveMessage(async (message: MessageType) => {
      switch (message.command) {
        case MESSAGE.INIT_NPM:
          const data = await getPackageVersion(context, url)
          if (data) {
            panel.webview.postMessage({ message: MESSAGE.FINISH_QUERY_PACKAGE, payload: data })
          }
          return
        case MESSAGE.CHECK_PACKAGES_LATEST:
          try {
            const result = await getPackageLastVersion(url)
            panel.webview.postMessage({ message: MESSAGE.FINISH_CHECK_PACKAGES_LATEST, payload: result })
          } catch (error) {
            vscode.window.showErrorMessage(JSON.stringify(error))
            // vscode.window.showErrorMessage('error')
            panel.webview.postMessage({ message: MESSAGE.FINISH_CHECK_PACKAGES_LATEST, payload: null })
          }
          return
        case MESSAGE.SEARCH_PACKAGES_LATEST:
          console.log(123123)
          try {
            console.log(message.payload)
            const dep = message.payload
            const result = await getSingleDepInfo(dep)
            console.log(result)
          } catch (error) {
            vscode.window.showErrorMessage(JSON.stringify(error))
            panel.webview.postMessage({ message: MESSAGE.SEARCH_PACKAGES_LATEST, payload: null })
          }
          return
        default:
          return {}
      }
    })

    panel.onDidDispose(() => {}, undefined, context.subscriptions)
  })

  vscode.commands.registerCommand('vscode-npm-manage.npmUpdateLatest', () => {
    vscode.window.showInformationMessage('更新最新的2npm')
  })
  vscode.commands.registerCommand('vscode-npm-manage.deleteEntry', () => {
    vscode.window.showInformationMessage('删除')
  })

  context.subscriptions.push(disposable)
}

/**
 * 插件关闭时执行
 */
export function deactivate() {}
