import React, { FC } from 'react'
import { Alert } from 'antd'
import { AlertProps } from 'antd/lib/alert'
import 'antd/lib/alert/style/index.css'

interface AlertType {
  message: string
  type: AlertProps['type']
  onClose?: React.MouseEventHandler<HTMLButtonElement> | undefined
}
// 默认警告类型
/**
 * @prop {string} message 提示内容
 * @prop {string} type 提示类型 success、info、warning、error
 * @prop {string} onClose 关闭提示后的回调
 *
 */
const AlertComponent: FC<AlertType> = ({ message, type = 'warning', onClose }) => {
  return <Alert closable showIcon message={message} type={type} onClose={onClose} />
}

export default AlertComponent
