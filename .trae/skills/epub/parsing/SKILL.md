# EPUB 解析 — L3 模块 Skill

## 职责
EPUB 元数据提取、封面获取、目录解析。

---

## 核心文件

- `src/shared/utils/epubFengMian.ts` — 封面提取
- `src/shared/utils/epubParser.ts` — 元数据和章节解析

---

## EPUB 文件结构

EPUB 本质是一个 ZIP 包，包含：
- `META-INF/container.xml` — 入口文件，指向 OPF 路径
- `*.opf` — 元数据文件（书名、作者、目录）
- `EPUB/*.xhtml` — 章节内容

---

## 元数据提取流程

1. 用 `jszip` 解压 EPUB
2. 读取 `META-INF/container.xml` 获取 OPF 路径
3. 读取 OPF 文件获取 metadata（title、author）
4. 从 spine 顺序读取章节内容

---

## 目录解析

- OPF 里的 `<spine>` 和 `<manifest>` 定义了阅读顺序
- `book.loaded.navigation` 返回目录树
- 目录是嵌套结构，每个节点有 `href` 和 `subitems`

---

## 常见问题

### 目录为空
- 确认 `book.loaded.navigation` 有值
- 检查 EPUB 文件是否损坏
- `navigation.toc` 是目录数组

### 封面不显示
- 检查 OPF metadata 里的 cover 属性
- 封面图片在 manifest 里定义
- 参考 `epubFengMian.ts` 的提取逻辑

### 乱码
- 确认文件编码是 UTF-8
- 检查 OPF 文件解析是否用了 XML parser
