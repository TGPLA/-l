# 阅读回响 — L1 任务识别与路由入口

## 职责
收到任何开发需求后，**第一步**判断任务属于哪个领域，立即加载对应 L2 skill。

---

## 任务领域识别表

### 关键词匹配规则

| 任务关键词 | 路由到 |
| --- | --- |
| `组件`, `tsx`, `jsx`, `UI`, `按钮`, `弹窗`, `抽屉`, `卡片`, `导航` | `frontend/components` |
| `Hook`, `useState`, `useEffect`, `useRef`, `自定义Hook` | `frontend/hooks` |
| `状态`, `state`, `Context`, `localStorage`, `全局状态` | `frontend/state` |
| `EPUB`, `阅读器`, `翻页`, `目录`, `章节`, `rendition` | `epub/reader` |
| `解析`, `元数据`, `封面`, `OPF`, `chapter` | `epub/parsing` |
| `划线`, `标注`, `高亮`, `笔记`, `huaXian`, `highlight` | `epub/highlight` |
| `测试`, `test`, `vitest`, `spec`, `describe`, `it ` | `testing/unit` |
| `e2e`, `playwright`, `端到端`, `UI测试` | `testing/e2e` |
| `样式`, `Tailwind`, `CSS`, `响应式`, `darkMode` | `frontend/components` |
| `构建`, `build`, `部署`, `Docker`, `CI/CD` | `deploy` |

---

## 执行流程

1. **接收需求** — 理解用户想做什么
2. **匹配关键词** — 看需求中包含哪些技术词
3. **加载对应 L2** — 立即加载对应领域的 SKILL.md
4. **L2 引导 L3** — L2 会告诉你需要哪个 L3
5. **L3 引导 L4** — L3 告诉你具体用哪个实现文件

---

## L2 领域清单

| 领域 | L2 路径 |
| --- | --- |
| 前端开发 | `skills/frontend/SKILL.md` |
| EPUB 阅读器 | `skills/epub/SKILL.md` |
| 测试 | `skills/testing/SKILL.md` |
| 部署运维 | `skills/deploy/SKILL.md` |

---

## 注意

- **多领域任务**：如果一个需求涉及多个领域，按顺序加载所有相关 L2
- **不确定时**：优先加载 `frontend` + `epub` 两个 L2
- **L4 文件是最终执行依据**，L1/L2/L3 都是导航作用
