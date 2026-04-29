# 状态管理 — L3 模块 Skill

## 职责
组件状态、全局状态、持久化的管理。

---

## 状态方案选择

| 场景 | 方案 |
| --- | --- |
| 组件内部状态 | `useState` |
| 组件间共享、不需持久化 | `useContext` |
| 需要持久化到本地 | `useLocalStorageState` |
| 复杂状态机 | `useReducer` |

---

## 现有状态管理

- `use-local-storage-state` — 用于持久化（阅读进度、设置）
- `useState` — 组件内临时状态
- `useRef` — 不触发重渲染的可变值

---

## localStorage 规范

| Key | 用途 |
| --- | --- |
| `readrecall_progress_{bookId}` | 单本书阅读进度 |
| `readrecall_settings` | 用户设置 |
| `readrecall_highlights_{bookId}` | 划线笔记数据 |

---

## 注意事项

- **不要滥用全局状态**：只在确实需要跨组件共享时用 Context
- **localStorage 只存必要数据**：用户设置、进度、笔记
- **阅读进度用 CFI 格式**：不是页码，保证精度
