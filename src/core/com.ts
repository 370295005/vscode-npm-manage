import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

type DevType = 'devDep' | 'dep'

export class NodeDependenciesProvider implements vscode.TreeDataProvider<Dependency> {
  constructor(private workspaceRoot: string, private devType: DevType) {
    this.workspaceRoot = workspaceRoot
    this.devType = devType
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace')
      return Promise.resolve([])
    }

    if (element) {
      return Promise.resolve(
        this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json'))
      )
    } else {
      const packageJsonPath = path.join(this.workspaceRoot, 'package.json')
      if (this.pathExists(packageJsonPath)) {
        return Promise.resolve(this.getDepsInPackageJson(packageJsonPath))
      } else {
        vscode.window.showInformationMessage('Workspace has no package.json')
        return Promise.resolve([])
      }
    }
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
    if (this.pathExists(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

      if (this.devType === 'dep') {
        const deps = packageJson.dependencies
          ? Object.keys(packageJson.dependencies).map((dep) => {
              return new Dependency(dep, packageJson.dependencies[dep], vscode.TreeItemCollapsibleState.None)
            })
          : []
        return deps
      }

      if ((this, this.devType === 'devDep')) {
        const devDeps = packageJson.devDependencies
          ? Object.keys(packageJson.devDependencies).map(
              (dep) => new Dependency(dep, packageJson.devDependencies[dep], vscode.TreeItemCollapsibleState.None)
            )
          : []
        return devDeps
      }
      return []
    } else {
      return []
    }
  }

  private pathExists(path: string): boolean {
    try {
      fs.accessSync(path)
    } catch (err) {
      return false
    }
    return true
  }
}

class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState)
  }

  getVersion() {
    return this.version
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'images', 'command-light.png'),
    dark: path.join(__filename, '..', '..', 'images', 'command-dark.png')
  }
}
