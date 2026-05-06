# 前端组件 — L3 模块 Skill

## 职责
所有 UI 组件的创建、修改、样式相关任务。

---

## 组件目录

`src/features/books/components/` — 书籍相关组件
`src/features/user/components/` — 用户相关组件
`src/shared/utils/common/` — 通用 UI 组件（Toast、Loading 等）

---

## 组件类型参考

### 容器型组件
- 持有状态，管理子组件
- 如 `EPUBReader.tsx` — 阅读器主容器

### 展示型组件
- 纯接收 props，渲染 UI
- 如 `BookCard.tsx` — 书籍卡片

### 弹窗/抽屉型
- `XxxTanChuang.tsx` — 弹窗
- `XxxChouTi.tsx` — 抽屉面板
- 如 `MuLuChouTi.tsx`（目录抽屉）、`BiJiChouTi.tsx`（笔记抽屉）

### 表单型
- 用户输入、提交
- 如 `EPUBDaoRuTanChuang.tsx`（导入书籍表单）

---

## 新建组件流程

1. 确定组件类型（容器/展示/弹窗/表单）
2. 确定放哪个目录
3. 按命名规范命名（PascalCase.tsx）
4. 优先使用 Tailwind 样式
5. 导出类型定义清晰

---

## 样式规范

- 使用 Tailwind CSS
- 深色模式：通过 `darkMode` prop 或 `dark:` 前缀
- 响应式：`md:`、`lg:` 断点

---

## L4 功能点

| 功能 | L4 路径 |
| --- | --- |
| 弹窗/对话框 | `frontend/components/modal/` |
| 抽屉面板 | `frontend/components/drawer/` |
| 表单 | `frontend/components/form/` |
| 卡片/列表 | `frontend/components/card/` |
