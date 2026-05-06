# 前端 Hooks — L3 模块 Skill

## 职责
所有自定义 Hook 的创建和管理。

---

## Hook 目录

`src/features/books/hooks/` — 书籍功能 Hook
`src/infrastructure/hooks/` — 基础设施 Hook

---

## 现有 Hook 清单

| Hook | 路径 | 用途 |
| --- | --- | --- |
| `useEPUBReaderShiJian` | `books/hooks/` | 阅读器核心：翻页、渲染、标注 |
| `useHuaCiJiaoHu` | `books/hooks/` | 划词交互：选中文本、显示菜单 |
| `useHuaXianChuTi` | `books/hooks/` | 划线处理：高亮、标注 |
| `useChaZhaoChouTi` | `books/hooks/` | 搜索抽屉：搜索状态 |
| `useYueDuQiBuJu` | `books/hooks/` | 阅读器布局：面板开关 |
| `useEPUBReader` | `books/hooks/` | 阅读器初始化、rendition ref |

---

## 自定义 Hook 规范

### 命名
- `useXxx.ts`（camelCase）
- 中文命名变量，英文命名函数

### 结构
```typescript
export function useXxx(param: ParamType) {
  const [state, setState] = useState(initial);
  // 业务逻辑
  return { state, setState, handler };
}
```

### 原则
- **一个 Hook 一个职责**
- **Hooks 放在 `hooks/` 目录**，不放 `components/`
- 如果 Hook 需要引用 `rendition`，通过 `ref` 传递，不放在 Hook 里

---

## 与 components 的区别

| components | hooks |
| --- | --- |
| 返回 JSX | 返回数据和函数 |
| 管 UI 渲染 | 管逻辑和状态 |
| 可调用 hooks | 可调用其他 hooks |
