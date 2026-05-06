# 前端开发 — L2 领域 Skill

## 职责
所有 React 组件、样式、交互相关的开发任务，加载此文件。

---

## 本领域 L3 模块清单

| 模块 | L3 路径 | 何时使用 |
| --- | --- | --- |
| 组件开发 | `frontend/components/SKILL.md` | 需要新建/修改 UI 组件时 |
| Hook 开发 | `frontend/hooks/SKILL.md` | 需要自定义 Hook 时 |
| 状态管理 | `frontend/state/SKILL.md` | 需要管理组件/全局状态时 |

---

## 技术栈

- **框架**：React 19 + TypeScript
- **样式**：Tailwind CSS
- **构建**：Vite
- **状态**：useState / useLocalStorageState / useContext
- **图标**：lucide-react

---

## 组件命名规范

- 组件文件：`PascalCase.tsx`（如 `BookShelf.tsx`）
- Hook 文件：`usePascalCase.ts`（如 `useEPUBReaderShiJian.ts`）
- 工具函数：`camelCase.ts`（如 `showToast.ts`）

---

## 常见任务 → L3 映射

| 任务 | 加载 L3 |
| --- | --- |
| 改书架页面样式 | `frontend/components/SKILL.md` |
| 加一个弹窗/抽屉 | `frontend/components/SKILL.md` |
| 处理用户输入 | `frontend/hooks/SKILL.md` |
| 存数据到 localStorage | `frontend/state/SKILL.md` |
| 新页面/路由 | `frontend/components/SKILL.md` |
