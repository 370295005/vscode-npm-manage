// 传递消息的类型
export enum MESSAGE {
  /**
   * 初始化
   */
  INIT_NPM,
  /**
   * 获取版本信息完成
   */
  FINISH_QUERY_PACKAGE,
  /**
   * 检测最新版本
   */
  CHECK_PACKAGES_LATEST,
  /**
   * 检测最新版本完成
   */
  FINISH_CHECK_PACKAGES_LATEST,
  /**
   * 搜索检测依赖更新
   */
  SEARCH_PACKAGE_LATEST,
  FINISH_SEARCH_PACKAGE_LATEST,
  /**
   * 升级单个依赖
   */
  UPGRAD_PACKAGE,
  /**
   * 升级依赖完成
   */
  UPGRAD_PACKAGE_FINISH
}
