import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

console.log('=== 应用启动 ===')
console.log('应用名称：阅读回响')
console.log('API 基础路径：/api')
console.log('React 版本:', StrictMode.name ? '可用' : '未知')
console.log('DOM 准备中...')

const rootElement = document.getElementById('root')
console.log('Root 元素:', rootElement)

if (rootElement) {
  console.log('开始渲染应用...')
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    console.log('应用渲染完成')
  } catch (error) {
    console.error('渲染失败:', error)
  }
} else {
  console.error('Root element not found')
}
