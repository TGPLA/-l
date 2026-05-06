# EPUB 阅读器 — L2 领域 Skill

## 职责
所有 EPUB 解析、阅读器核心、划线标注相关的开发任务，加载此文件。

---

## 本领域 L3 模块清单

| 模块 | L3 路径 | 何时使用 |
| --- | --- | --- |
| 阅读器核心 | `epub/reader/SKILL.md` | 翻页、渲染、rendition、位置同步 |
| EPUB 解析 | `epub/parsing/SKILL.md` | 解析元数据、封面、章节目录 |
| 划线与标注 | `epub/highlight/SKILL.md` | 高亮、笔记、划线菜单 |

---

## 核心依赖

- `epub` — EPUB 解析库
- `react-reader` — 阅读器封装组件
- `jszip` — ZIP 格式解压（EPUB 本质是 ZIP）

---

## 阅读器核心概念

- `rendition` — epub.js 的渲染实例，负责翻页/定位
- `book` — epub.js 的书籍实例，负责加载和访问目录
- `location` — 当前位置（CFI 格式）
- `navigation` — 书籍目录结构

---

## 常见任务 → L3 映射

| 任务 | 加载 L3 |
| --- | --- |
| 翻页不动、跳过章节 | `epub/reader/SKILL.md` |
| 目录为空/不显示 | `epub/parsing/SKILL.md` |
| 划线颜色、选中文本 | `epub/highlight/SKILL.md` |
| 打开书报错 | `epub/parsing/SKILL.md` |
| 进度条不更新 | `epub/reader/SKILL.md` |
