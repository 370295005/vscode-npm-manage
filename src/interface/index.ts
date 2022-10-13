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

export interface RequestVersionType {
  id: string
  name: string
  'dist-tags': {
    latest: string
  }
  versions: {
    [key: string]: any
  }
  description: string
  readme: string
  homepage: string
}

export interface ResultVersionType {
  name: string
  latest: string
  version: string[]
  description: string
}
