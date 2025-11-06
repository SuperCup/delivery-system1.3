import { Component, ReactNode } from 'react'
import { Result, Button } from 'antd'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: unknown) {
    // 可以在此处接入日志上报
    // console.error('ErrorBoundary caught:', error, info)
  }

  handleReload = () => {
    // 强制刷新以恢复页面
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="页面加载失败"
          subTitle={this.state.error?.message || '发生未知错误，请重试'}
          extra={<Button type="primary" onClick={this.handleReload}>刷新页面</Button>}
        />
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary