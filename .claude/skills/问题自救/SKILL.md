---
name: "问题自救"
description: "当用户需要借鉴GitHub项目解决问题时，自动搜索代码和仓库并评估借鉴方案。Invoke when user mentions needing to reference GitHub projects or says they need help solving a problem."
---

# 问题自救

当用户遇到技术难题需要借鉴GitHub项目来解决时，此技能会帮助你自动搜索、评估并提供借鉴方案。

## 触发条件

用户表达以下意图时自动触发：
- "借鉴GitHub"
- "参考GitHub项目"
- "搜索GitHub"
- "帮我找找"
- 遇到问题无法解决时

## 工作流程

### 第一步：理解问题

1. 明确用户遇到的具体技术问题
2. 提取问题的技术关键词和上下文
3. 确定搜索的合适关键词组合

### 第二步：搜索GitHub

使用以下MCP工具进行全面搜索：

1. **代码搜索** (`mcp_GitHub_search_code`)
   - 搜索关键词：技术栈 + 问题类型 + 具体API
   - 示例：`react useEffect cleanup memory leak`

2. **仓库搜索** (`mcp_GitHub_search_repositories`)
   - 搜索关键词：技术栈 + 功能领域
   - 示例：`react hook typescript`

3. **问题搜索** (`mcp_GitHub_search_issues`)
   - 搜索类似问题的解决方案
   - 示例：`react useEffect memory leak solution`

### 第三步：评估结果

对每个搜索结果评估：
- **相关性**：是否解决用户问题
- **质量**：star数量、更新频率、文档完整性
- **可实施性**：代码复杂度、依赖情况

### 第四步：提供方案

整理并呈现：
1. 找到的相关项目/代码片段
2. 关键实现逻辑分析
3. 在本项目中的实施建议
4. 注意事项和潜在风险

## 输出格式

```markdown
## 搜索结果

### 相关仓库
1. [仓库名](链接) - 描述
   - ⭐ Stars: xxx | 最后更新: xxx
   - 适用场景：xxx
   - 关键实现：xxx

### 相关代码
1. [文件名](链接) - 语言
   - 代码片段：xxx
   - 可借鉴点：xxx

## 实施建议

1. 方案一：xxx
2. 方案二：xxx
```

## 注意事项

- 优先搜索高质量、高star的仓库
- 检查代码的最后更新时间，确保不是过时方案
- 结合本项目的技术栈和规范进行适配
- 避免直接复制代码，提取思路后重新实现
- 遵守目录使用规范，需要克隆到`项目参考/`目录时说明

## 示例对话

用户："我的React组件有内存泄漏问题，想借鉴GitHub上的解决方案"

→ 自动搜索 → 找到相关useEffect cleanup实现 → 提供借鉴方案