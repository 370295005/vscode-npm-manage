/*
 * @Description:
 * @Date: 2020-07-02 00:16:18
 */
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

/**
 * 获取某个扩展文件相对于webview需要的一种特殊路径格式
 * 形如：vscode-resource:/Users/toonces/projects/vscode-cat-coding/media/cat.gif
 * @param context 上下文
 * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
 */
const getExtensionFileVscodeResource = (context: vscode.ExtensionContext, relativePath: string) => {
  const diskPath = vscode.Uri.file(path.join(context.extensionPath, relativePath))
  return diskPath.with({ scheme: 'vscode-resource' })
}

/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
const getWebViewContent = (context: vscode.ExtensionContext, templatePath: string) => {
  const resourcePath = path.join(context.extensionPath, templatePath)
  const dirPath = path.dirname(resourcePath)
  let html = fs.readFileSync(resourcePath, 'utf-8')
  // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
  html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (_m, $1, $2) => {
    return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"'
  })
  return html
}

export { getWebViewContent, getExtensionFileVscodeResource }
