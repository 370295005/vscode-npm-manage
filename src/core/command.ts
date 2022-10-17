import type { PackageType } from '../interface'
import { exec } from 'child_process'
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
 * 升级某个依赖
 * @param {string} dep 依赖的名字
 * @param {string} version
 */

export const upgradeDep = (dep: string, version: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cmd = `npm install ${dep}@${version}`
    exec(cmd, (error, stdout, stderr) => {
      if (error || stderr) {
        reject(error || stderr)
      } else {
        resolve(stdout || `${dep}安装成功`)
      }
    })
  })
}

/**
 * 获取某个依赖的最新版本和所有版本
 * @param {string} dep 依赖名称
 * @param {boolean} all 是否检查所有版本
 * @return 检查最新版本返回字符串，检查所有版本返回一个数组，数组最后一项为最新版本版本号
 * */

export const getDepLatestVersion = (dep: string, all: boolean = false): Promise<string | Array<string>> => {
  return new Promise((resolve, reject) => {
    // 依赖名称不需要用单引号引起来
    const cmd = `npm view ${dep} version${all ? 's' : ''}`
    exec(cmd, (error, stdout, stderr) => {
      if (error || stderr) {
        reject(error || stderr || '获取版本失败')
      } else {
        // 查询全部版本返回一个字符串格式化为数组，并且截取后\最新十个版本
        const res = all
          ? stdout.replace(/\[|]/g, '').replace(/(\s*)/g, '').replace(/'/g, '').split(',').slice(-10).reverse()
          : stdout.replace('\n', '')
        resolve(res)
      }
    })
  })
}
