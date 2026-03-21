// @审计已完成
// 错误边界组件 - 捕获 React 组件渲染错误

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { shiBieCuoWu, type CuoWuXinXi } from './CuoWuDingYi';

interface Props {
  children: ReactNode;
  onHuiTui?: () => void;
}

interface State {
  hasError: boolean;
  cuoWu: CuoWuXinXi | null;
}

export class CuoWuBianJie extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, cuoWu: null };
  }

  static getDerivedStateFromError(error: Error): State {
    const cuoWu = shiBieCuoWu(error);
    return { hasError: true, cuoWu };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('组件错误:', error);
    console.error('错误堆栈:', errorInfo.componentStack);
  }

  handleChongShi = () => {
    this.setState({ hasError: false, cuoWu: null });
    this.props.onHuiTui?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            maxWidth: '28rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
              页面出错了
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {this.state.cuoWu?.xiaoXi || '发生未知错误'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleChongShi}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                重试
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
