# 划线与标注 — L3 模块 Skill

## 职责
选中文本、高亮显示、标注笔记相关的开发。

---

## 核心 Hook

- `useHuaCiJiaoHu` — 划词交互（选中文本、弹出菜单）
- `useHuaXianChuTi` — 划线处理（颜色、创建、更新、删除）

---

## 划线数据结构

```typescript
interface HuaXian {
  id: string;
  cfiRange: string;    // CFI 位置
  text: string;         // 原文
  note?: string;        // 笔记
  color: YanSe;         // 颜色
  createdAt: number;
}
```

---

## 颜色配置

`YAN_SE_PEI_ZHI` 定义了 4 种颜色：
- `huang`（黄）
- `lv`（绿）
- `lan`（蓝）
- `hong`（红）

每种颜色对应 CSS class 和 SVG 样式。

---

## 划线流程

1. 用户选中文本 → `selection` 事件触发
2. 计算 CFI range → `rendition.annotations.add()`
3. 保存到 localStorage → `annotationService`

---

## 目录（TOC）相关

- 目录是 `navigation.toc`，不是 highlights
- 划线笔记存 `localStorage`，key = `readrecall_highlights_{bookId}`
- 加载书时从 localStorage 读取并应用划线

---

## 注意事项

- **CFI 不稳定**：同一位置每次解析可能不同，存储时用 `accurateCfiRange`
- **划线和目录是两个东西**：目录是书的结构，划线是用户笔记
