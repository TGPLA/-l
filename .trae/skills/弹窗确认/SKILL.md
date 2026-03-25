---
name: "弹窗确认"
description: "当AI需要向用户确认需求或让用户做选择时，使用弹窗形式提问。Invoke when AI needs to ask user for clarification or choices."
---

# 弹窗确认技能

## 触发条件

当 AI 需要向用户了解需求、确认选择、或做任何形式的提问时，**必须使用弹窗形式**，禁止使用纯文本提问。

## 使用方式

### 调用弹窗工具

使用 `AskUserQuestion` 工具发起弹窗提问：

```typescript
AskUserQuestion({
  questions: [
    {
      header: "选择类型",
      multiSelect: false,  // 单选为 false，多选为 true
      options: [
        { label: "选项一", description: "描述一" },
        { label: "选项二", description: "描述二" }
      ],
      question: "你要选择哪个选项？"
    }
  ]
})
```

## 弹窗规则

1. **必须弹窗**：任何需要用户响应的问题都必须用弹窗
2. **描述清晰**：每个选项需要有清晰的描述
3. **多选控制**：`multiSelect` 根据业务场景正确设置
4. **禁止文本提问**：禁止用文字描述问题让用户回复

## 示例场景

| 场景 | 错误做法 | 正确做法 |
|------|----------|----------|
| 确认功能 | "是否启用该功能？(是/否)" | 弹窗提问 |
| 选择格式 | "请输入 1 或 2" | 弹窗选项 |
| 确认操作 | "要继续吗？" | 弹窗确认 |
