# 划线点击编辑菜单设计文档

> 日期：2026-04-06
> 状态：已确认，待实现

## 需求概述

为 EPUB 阅读器中已有的划线/马克笔标记添加**点击交互**：用户点击已画线的文本时，在划线上方弹出编辑菜单（复刻微信读书风格），支持删除、换色、复制操作。

## 现有系统分析

### 划线渲染（双轨制）
- **SVG overlay**：`rendition.annotations.add('highlight', cfiRange, ...)` — 位置追踪层
- **DOM span 包裹**：`baoGuaSpan()` 在 iframe 内创建 `<span className="hl-underline-{color}" data-biaoji="true">` — CSS 样式层

### CSS 类名体系
| 类型 | 黄 | 绿 | 蓝 | 粉 |
|------|----|----|----|-----|
| 划线(underline) | `hl-underline-yellow` | `hl-underline-green` | `hl-underline-blue` | `hl-underline-pink` |
| 马克笔(marker) | `mk-marker-yellow` | `mk-marker-green` | `mk-marker-blue` | `mk-marker-pink` |

### 已有组件
- `HuaXianCaiDan.tsx` — 选区弹出菜单（AI问书/复制/划线/马克笔），仅在文本选区时触发
- `useHuaXianChuTi.ts` — 划线核心逻辑 Hook，含数据 CRUD

### 数据模型
```typescript
interface HuaXianXinXi {
  id: string;
  text: string;
  cfiRange: string;
  yanSe: HuaXianYanSe;    // 'yellow' | 'green' | 'blue' | 'pink'
  leiXing: BiaoJiLeiXing;  // 'underline' | 'marker'
  beiZhu: string;
  createdAt: number;
}
```
存储键：`huaxian_{userId}_{bookId}_{chapterId}`（localStorage）

## 技术方案：MutationObserver + 事件代理 + postMessage

### 核心难点
EPUB 内容在 epub.js 创建的 iframe 中，React 无法直接监听内部 DOM 事件。

### 架构
```
父窗口 (React)
├── useHuaXianDianJi Hook        ← 监听 postMessage + 管理状态
├── HuaXianBianJiCaiDan 组件      ← 编辑菜单 UI
│
└─── postMessage ─────────────→
    │
EPUB iframe 内部
├── MutationObserver             ← 自动发现新划线 span
├── 事件代理 (document click)    ← 捕获划线点击 → postMessage 给父窗口
```

### 交互时序
1. 用户点击划线 span
2. iframe 内事件代理捕获 → 检查 `e.target.closest('[data-biaoji]')`
3. 匹配成功 → `preventDefault()` + `stopPropagation()` （阻止选区触发）
4. 读取 `data-cfi` / `data-huaxian-id` / `getBoundingClientRect()`
5. 坐标补偿（iframe offset 累加）→ `window.postMessage({ type:'huaxian-click', ... })`
6. 父窗口 useHuaXianDianJi 收到 message → 在 huaXianList 中匹配
7. 设置 activeId → postMessage 通知 iframe 加 `.hl-active` class
8. 渲染 HuaXianBianJiCaiDan
9. 用户操作（删除/换色/复制）→ 更新 localStorage → 重新渲染
10. 关闭菜单 → 移除 .hl-active → activeId = null

## 文件变更清单

### 新建文件（2 个）

| 文件 | 职责 |
|------|------|
| `src/features/books/hooks/useHuaXianDianJi.ts` | 监听 postMessage、匹配划线数据、管理编辑菜单显示/隐藏/激活态 |
| `src/features/books/components/HuaXianBianJiCaiDan.tsx` | 编辑菜单 UI：删除/复制/颜色选择器 |

### 修改文件（4 个）

| 文件 | 改动点 |
|------|--------|
| `useHuaXianChuTi.ts` | `baoGuaSpan()` 增加 `data-cfi` 和 `data-huaxian-id` 属性 |
| `useEPUBReaderShiJian.ts` | hooks.content.register 中注入 MutationObserver + 事件代理脚本；CSS 增加 `.hl-active` 激活态样式 |
| `EPUBYueDuQuYu.tsx` | 集成 useHuaXianDianJi + 渲染 HuaXianBianJiCaiDan |
| `package.json` | 新增 lucide-react 依赖 |

## UI 设计规范

### 菜单布局
```
        ┌─────────────────────────────┐
        │   🗑 删除    📋 复制         │   ← 操作按钮行
        ├─────────────────────────────┤
        │  🔴  🟡  🔵  🟣  ⚪        │   ← 颜色选择行（圆形色块）
        └─────────────────────────────┘
                 ▲ 三角箭头指向划线
```

### 视觉规范
- 背景：`rgba(51, 51, 51, 0.95)` + `backdrop-filter: blur(12px)`（与 HuaXianCaiDan 一致）
- 文字/图标：白色 #ffffff
- 圆角：0.75rem
- 动画：scale(0.9→1) + fade-in + translateY(10px→0)，0.25s cubic-bezier(0.22,1,0.36,1)
- 定位：划线上方居中，四象限边界自动调整（复用现有定位算法）
- 图标库：lucide-react（Trash2, Copy）

### 颜色选择器
5 种颜色圆点（直径 20px，间距 8px）：
| 色 | hex | 对应 yanSe |
|----|-----|-----------|
| 红 | #EF4444 | (新增选项) |
| 黄 | #F5C842 | yellow |
| 绿 | #4ADE80 | green |
| 蓝 | #5E94FF | blue |
| 紫 | #A78BFA | (新增选项) |

当前选中颜色显示 ring（2px white border）。

### 激活态视觉反馈
```css
/* 划线被点击时的视觉强化 */
span.hl-active.hl-underline-* {
  background-size: 100% 4px !important;   /* 下划线 2px → 4px */
}
span.hl-active.mk-marker-* {
  /* 背景色透明度加深 ~0.15 */
}
```

## postMessage 协议

### 父 → 子（设置激活态）
```typescript
{ type: 'set-hl-active', id: string | null }
```

### 子 → 父（报告点击）
```typescript
{
  type: 'huaxian-click';
  cfi: string;       // data-cfi 属性值
  id: string;        // data-huaxian-id 属性值
  className: string; // hl-underline-blue 等
  rect: { top, left, width, height }; // 屏幕坐标（已补偿 iframe 偏移）
  text: string;      // span.textContent
}
```

## 冲突防护

| 场景 | 处理方式 |
|------|---------|
| 点击划线 vs 选区文本 | 划线 click 内 stopPropagation，选区 mousedown/mouseup 不完整执行 |
| 菜单打开后点击别处 | click-outside 关闭菜单 + 清除激活态 |
| 快速连续点击不同划线 | 先清旧激活态，再设新的 |
| 翻页后 DOM 重建 | MutationObserver 自动重新绑定；activeId 清空 |

## 范围边界

**本次实现：**
- ✅ 点击划线 → 弹出编辑菜单
- ✅ 删除划线（含 SVG + DOM + localStorage 三层清理）
- ✅ 切换颜色（实时更新视觉效果 + 数据层）
- ✅ 复制划线文字
- ✅ 激活态视觉反馈

**不在本次范围：**
- ❌ 写笔记功能（beiZhu 字段已有但无编辑 UI，后续迭代）
- ❌ 后端同步（当前纯 localStorage）
