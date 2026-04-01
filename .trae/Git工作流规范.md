# Git 工作流规范

> 文档创建时间：2026-03-26
> 最后更新：2026-03-26

---

## 📋 前言

本文档规范项目的 Git 分支策略、提交信息格式和 PR 流程，避免误操作导致代码丢失或功能破坏。

---

## 🌿 分支策略

### 主要分支

| 分支名 | 用途 | 保护级别 |
|--------|------|---------|
| `main` | 生产环境代码 | 🔒 严格保护 |
| `develop` | 开发环境代码（可选） | 🔐 中等保护 |
| `feature/*` | 新功能开发 | 🔓 正常开发 |
| `fix/*` | Bug 修复 | 🔓 正常开发 |
| `hotfix/*` | 紧急线上修复 | 🔓 紧急修复 |
| `refactor/*` | 代码重构 | 🔓 正常开发 |
| `docs/*` | 文档更新 | 🔓 正常开发 |

---

## ✅ 分支创建规范

### 1. 新功能开发

```bash
# 从 main 创建 feature 分支
git checkout main
git pull origin main
git checkout -b feature/epub-chapter-hierarchy
```

**分支命名格式：** `feature/<功能描述>`

**示例：**
- `feature/epub-chapter-hierarchy` - EPUB 章节层级结构
- `feature/user-password-reset` - 用户密码重置
- `feature/dark-mode-enhancement` - 深色模式增强

### 2. Bug 修复

```bash
# 从 main 创建 fix 分支
git checkout main
git pull origin main
git checkout -b fix/auth-401-page-reload
```

**分支命名格式：** `fix/<问题描述>`

**示例：**
- `fix/auth-401-page-reload` - 修复 401 后页面不刷新
- `fix/bookshelf-empty` - 修复书架为空
- `fix/epub-import-failure` - 修复 EPUB 导入失败

### 3. 紧急线上修复

```bash
# 从 main 创建 hotfix 分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-data-loss
```

**分支命名格式：** `hotfix/<紧急问题>`

### 4. 代码重构

```bash
git checkout main
git pull origin main
git checkout -b refactor/epub-parser-split
```

**分支命名格式：** `refactor/<重构内容>`

---

## 📝 提交信息规范

### 约定式提交（Conventional Commits）

强制使用约定式提交格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加 EPUB 章节层级结构` |
| `fix` | Bug 修复 | `fix: 修复 401 认证失败后页面不刷新` |
| `docs` | 文档更新 | `docs: 更新关键代码清单` |
| `style` | 代码格式（不影响功能） | `style: 调整缩进` |
| `refactor` | 重构（既不新增也不修复） | `refactor: 拆分 EPUB 解析逻辑` |
| `perf` | 性能优化 | `perf: 优化章节列表渲染` |
| `test` | 测试相关 | `test: 添加认证服务单元测试` |
| `chore` | 构建/工具相关 | `chore: 更新依赖包` |

### Scope 范围（可选）

影响的模块或组件：
- `auth` - 认证模块
- `books` - 书籍模块
- `epub` - EPUB 导入
- `database` - 数据库服务
- `ui` - UI 组件

### Subject 主题

- 使用中文
- 简洁明了（不超过 50 字）
- 以动词开头

### Body 正文（可选）

详细说明变更的内容和原因：
- 为什么要做这个变更？
- 解决了什么问题？
- 有什么影响？

### Footer 页脚（可选）

- 关闭的 Issue：`Closes #123`
- 破坏性变更：`BREAKING CHANGE: 说明`

---

## ✅ 提交示例

### 好的提交

```bash
git commit -m "fix(auth): 修复 401 认证失败后页面不刷新

- 重新添加 window.location.reload()
- 添加 @关键代码 标记保护
- 防止类似问题再次发生

Closes #42"
```

```bash
git commit -m "feat(epub): 添加章节层级结构支持

- 扩展 EPUBChapter 类型，添加 parentId/level/children
- 递归解析 NCX/NAV 导航嵌套结构
- 实现树形 UI 展示，支持折叠/展开

Closes #45"
```

### 坏的提交（不要这样）

```bash
git commit -m "update"  # 太模糊
git commit -m "fix"     # 没说清楚
git commit -m "随便改改"  # 不专业
```

---

## 🔄 PR（Pull Request）流程

### 1. 开发完成后

```bash
# 推送到远程分支
git push origin feature/epub-chapter-hierarchy
```

### 2. 创建 PR

在 GitHub/GitLab 中创建 PR：

**PR 标题格式：** `<type>(<scope>): <subject>`（同提交信息）

**PR 描述模板：**

```markdown
## 变更类型
- [ ] 新功能 (feat)
- [ ] Bug 修复 (fix)
- [ ] 文档 (docs)
- [ ] 重构 (refactor)
- [ ] 性能优化 (perf)
- [ ] 测试 (test)
- [ ] 其他 (chore)

## 变更描述
[简要描述做了什么]

## 变更原因
[为什么要做这个变更]

## 测试验证
- [ ] `npm run build` 构建成功
- [ ] 手动测试通过
- [ ] 单元测试通过
- [ ] E2E 测试通过

## 影响范围
[列出受影响的功能模块]

## 相关 Issue
Closes #xxx
```

### 3. PR 审查检查清单

审查者必须检查：

- [ ] 变更范围清晰，符合分支用途
- [ ] 提交信息符合规范
- [ ] 没有意外删除关键代码
- [ ] 搜索 `@关键代码` 标记确认保护
- [ ] 查看 `.trae/关键代码清单.md`
- [ ] 构建成功
- [ ] 测试通过

---

## 🚨 禁止事项

### ❌ 禁止直接 push 到 main

```bash
# 错误！
git checkout main
git add .
git commit -m "直接修改"
git push origin main  # ❌ 禁止！
```

### ✅ 正确做法

```bash
# 正确
git checkout main
git pull origin main
git checkout -b feature/your-feature
# 开发...
git add .
git commit -m "feat: 你的功能"
git push origin feature/your-feature
# 创建 PR...
```

### ❌ 禁止在 main 分支上直接开发

始终在 feature/fix 分支上开发。

---

## 📚 相关文档

- [关键代码清单](./关键代码清单.md)
- [代码修改检查清单](./代码修改检查清单.md)
- [项目规则 - 文件操作规范](./rules/rules_file.md)

---

## 💡 记住

**"分支保护，代码安全！"**

- main 分支 = 生产环境，必须稳定
- feature 分支 = 开发环境，用于探索
- PR 审查 = 质量保障，防止误操作
