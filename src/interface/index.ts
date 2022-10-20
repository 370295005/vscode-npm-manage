// package.json的类型
export interface PackageType {
  name: string
  version: string
  description: string
  main: string
  scripts: StringObject
  devDependencies: StringObject
  dependencies: StringObject
}
