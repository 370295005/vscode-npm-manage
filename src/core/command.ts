import type { PackageType } from '../interface'

import * as vscode from 'vscode'
import { readFilePromise } from '../utils/file'
import ncu from 'npm-check-updates'
// import axios from 'axios';

// 获取当前依赖的版本
export const getPackageVersion = (_context: vscode.ExtensionContext, url: any): Object => {
  return readFilePromise(url, 'utf-8').then(async (file) => {
    try {
      const data: PackageType = JSON.parse(file)
      const devDependencies = data.devDependencies || {}
      const dependencies = data.dependencies || {}
      return { devDependencies, dependencies }
    } catch (error) {
      vscode.window.showErrorMessage(error as string)
      return
    }
  })
}

// /**
//  * TODO 优化整个检测流程/移动提示信息
//  * @description: 检测package.json依赖的最新版本
//  * @param packageUrl {string} package.json文件地址
//  * @return: 与最新版本不相同的所有依赖
//  */
export const getPackageLastVersion = (packageUrl: string): Promise<StringObject> => {
  return new Promise((resolve, reject) => {
    // ncu查询能升级的依赖
    ncu
      .run({
        packageFile: packageUrl,
        jsonUpgraded: true,
        packageManager: 'npm',
        silent: true
      })
      .then((result) => {
        resolve(result)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

/**
 * 查询单个依赖
 * @param {string} dep 依赖的名字
 */
export const getSingleDepInfo = (dep: string): Promise<StringObject> => {
  return new Promise((resolve, reject) => {
    ncu
      .run({
        dep,
        packageManager: 'npm',
        jsonUpgraded: true
      })
      .then((result) => {
        resolve(result)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
