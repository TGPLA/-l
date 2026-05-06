---
name: "控制台检查"
description: "自动获取浏览器控制台日志信息。Invoke when 需要检查网页错误、调试运行时问题、或用户反馈功能异常时。"
---

# 控制台检查

## 核心原则

**当需要获取控制台信息解决问题时，AI 必须主动获取，不要让用户手动获取。**

## 触发场景

1. **调试运行时错误** - 构建成功但功能异常时
2. **用户反馈 Bug** - 功能不工作、点击无反应等
3. **白屏问题** - 页面空白但无编译错误
4. **API 请求失败** - 网络请求错误或数据加载失败
5. **组件渲染问题** - 组件未显示或行为异常

## 自动检查流程

### 第一步：检查控制台错误（必须）

```
调用 mcp_playwright_browser_console_messages
- level: "error"  // 优先检查错误级别
```

### 第二步：如有需要，检查警告和信息

```
调用 mcp_playwright_browser_console_messages
- level: "warning"  // 检查警告
```

### 第三步：检查网络请求（如需要）

```
调用 mcp_playwright_browser_network_requests
- includeStatic: false  // 只检查业务请求
```

### 第四步：截图辅助定位（如需要）

```
调用 mcp_playwright_browser_take_screenshot
- type: "png"
- fullPage: true
```

## 常见错误类型及处理

| 错误类型 | 可能原因 | 检查方向 |
|----------|----------|----------|
| `Cannot access 'xxx' before initialization` | 变量定义顺序问题 | 检查 `useCallback` 依赖数组、变量声明顺序 |
| 白屏但无报错 | 组件渲染逻辑问题 | 检查异步加载状态、条件渲染逻辑 |
| 网络请求失败 | API 代理配置或后端服务问题 | 检查后端服务状态、API 地址配置 |
| `Uncaught TypeError` | 类型错误或空值访问 | 检查数据流、props 传递 |

## 禁止行为

- ❌ 禁止让用户手动打开浏览器控制台截图
- ❌ 禁止说"请检查一下控制台有什么错误"
- ❌ 禁止在没有查看控制台日志的情况下就猜测问题
- ❌ 禁止忽略控制台错误继续其他操作

## 使用示例

**场景 1：用户反馈功能异常**

用户："这个按钮点击没反应"

AI："让我检查一下控制台日志"
→ 调用 `mcp_playwright_browser_console_messages` 获取错误
→ 根据错误定位问题

**场景 2：调试白屏问题**

用户："页面是白的"

AI："让我检查控制台和页面状态"
→ 调用 `mcp_playwright_browser_console_messages` 获取日志
→ 调用 `mcp_playwright_browser_snapshot` 查看页面结构
→ 调用 `mcp_playwright_browser_network_requests` 检查请求

**场景 3：API 请求失败**

用户："数据加载不出来"

AI："让我检查网络请求和控制台"
→ 调用 `mcp_playwright_browser_network_requests` 查看失败请求
→ 调用 `mcp_playwright_browser_console_messages` 获取错误详情

## 输出格式

获取控制台信息后，按以下格式报告：

```markdown
### 控制台检查结果

**错误 (Errors)**: [数量]
- [错误 1 内容]
- [错误 2 内容]

**警告 (Warnings)**: [数量]
- [警告 1 内容]

**分析**: [根据日志分析可能的问题原因]
```

## 注意事项

1. **优先检查错误级别** - 先解决 error，再关注 warning
2. **结合上下文** - 控制台日志需要结合当前页面状态分析
3. **及时清理** - 某些日志可能是历史遗留，关注与当前问题相关的日志
4. **多次检查** - 修复问题后重新检查控制台，确认错误已消失
