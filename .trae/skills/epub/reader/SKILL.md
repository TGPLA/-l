# EPUB 阅读器核心 — L3 模块 Skill

## 职责
翻页、渲染、位置同步、rendition 管理相关的开发。

---

## 核心概念

### rendition
- epub.js 的渲染实例
- 负责在 DOM 中渲染当前页面
- 通过 `renditionRef` 持有

### book
- epub.js 的书籍实例
- 负责加载 EPUB 文件、访问元数据
- 通过 `bookRef` 持有

### location / CFI
- CFI = Canonical Fragment Identifier，EPUB 内部位置格式
- 用于精确定位、存储进度
- **不要用页码**，用 CFI

---

## 核心文件

- `src/features/books/components/EPUBReader.tsx` — 阅读器主组件
- `src/features/books/components/EPUBYueDuQuYu.tsx` — 阅读区域
- `src/features/books/hooks/useEPUBReaderShiJian.ts` — 阅读器核心 Hook
- `src/features/books/hooks/useEPUBReader.ts` — rendition 初始化

---

## 常见任务参考

### 翻页不响应
- 检查 `renditionRef.current` 是否存在
- 检查 `rendition.on('relocated')` 事件是否绑定

### 进度条不更新
- `location.start.cfi` 变化时同步更新 UI
- 在 `relocated` 事件里处理

### 章节跳过
- 检查 `rendition.next()` / `rendition.prev()` 的边界判断
- `displayed` 事件里获取总页数

### rendition 初始化失败
- 确认 `url` 参数正确
- 确认 `epub` 文件可加载
- 用 try-catch 捕获 `await book.open()`

---

## rendition 常用方法

| 方法 | 用途 |
| --- | --- |
| `rendition.next()` | 下一页 |
| `rendition.prev()` | 上一页 |
| `rendition.display(cfi)` | 跳转到指定位置 |
| `rendition.annotations.add()` | 添加标注 |
| `rendition.getContents()` | 获取 iframe 内容 |
