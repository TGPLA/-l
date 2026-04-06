# 划线点击编辑菜单 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 EPUB 阅读器中已有的划线/马克笔标记添加点击交互，弹出编辑菜单支持删除、换色、复制操作。

**Architecture:** 在 EPUB iframe 内通过 MutationObserver 自动发现划线 span 并绑定事件代理，点击时通过 postMessage 通知父窗口 React 组件；父窗口用新 Hook 管理状态并驱动独立的新编辑菜单组件。

**Tech Stack:** React, epub.js, MutationObserver, postMessage, lucide-react, localStorage

**设计文档:** [2026-04-06-huaxian-dianji-bianji-caidan-design.md](../specs/2026-04-06-huaxian-dianji-bianji-caidan-design.md)

---

### Task 1: 安装 lucide-react 依赖

**Files:**
- Modify: `package.json`（通过 npm install）

- [ ] **Step 1: 安装 lucide-react**

Run: `npm install lucide-react`
Expected: 成功添加到 node_modules 和 package.json

---

### Task 2: 扩展 baoGuaSpan() — 增加 data-cfi 和 data-huaxian-id 属性

**Files:**
- Modify: `src/features/books/hooks/useHuaXianChuTi.ts:63-82`

> **背景：** 当前 `baoGuaSpan()` 只给 span 设置 `className` 和 `data-biaoji="true"`。为了让 iframe 内的事件代理能识别每条划线的身份和位置，需要额外写入 CFI 路径和划线 ID。
>
> **注意：** `baoGuaSpan` 被两处调用——`yingYongBiaoJi()`（新建标记）和 `setupRenditionListener` 中的 `applyBiaoJi()`（翻页重建）。两处都传入 cfiRange，但只有 `yingYongBiaoJi` 有 id 信息。因此需要给函数增加可选的 `id` 参数。

- [ ] **Step 1: 修改 baoGuaSpan 函数签名和实现**

将 [useHuaXianChuTi.ts:63-74](src/features/books/hooks/useHuaXianChuTi.ts#L63-L74) 的 `baoGuaSpan` 函数：

```typescript
// 原代码
function baoGuaSpan(rendition: Rendition, cfiRange: string, className: string) {
  try {
    const range = rendition.getRange(cfiRange);
    if (!range || range.collapsed) return;
    const doc = range.commonAncestorContainer.ownerDocument as Document;
    const span = doc.createElement('span');
    span.className = className;
    span.setAttribute('data-biaoji', 'true');
    range.surroundContents(span);
  } catch (e) {
    console.warn('DOM 包裹失败（跨元素边界时正常）:', e);
  }
}
```

替换为：

```typescript
function baoGuaSpan(rendition: Rendition, cfiRange: string, className: string, id?: string) {
  try {
    const range = rendition.getRange(cfiRange);
    if (!range || range.collapsed) return;
    const doc = range.commonAncestorContainer.ownerDocument as Document;
    const span = doc.createElement('span');
    span.className = className;
    span.setAttribute('data-biaoji', 'true');
    span.setAttribute('data-cfi', cfiRange);
    if (id) span.setAttribute('data-huaxian-id', id);
    range.surroundContents(span);
  } catch (e) {
    console.warn('DOM 包裹失败（跨元素边界时正常）:', e);
  }
}
```

- [ ] **Step 2: 更新 yingYongBiaoJi 调用 — 传入 id**

将 [useHuaXianChuTi.ts:100-108](src/features/books/hooks/useHuaXianChuTi.ts#L100-L108) 中 `yingYongBiaoJi` 函数里调用 `baoGuaSpan` 的那行：

找到：
```typescript
baoGuaSpan(rendition, cfiRange, cls);
```
替换为（注意：需要把 id 参数从外层传入 yingYongBiaoJi）：

首先修改 `yingYongBiaoJi` 签名增加 `id` 参数：

```typescript
const yingYongBiaoJi = useCallback(async (cfiRange: string, qingChuJiu: boolean = false, yanSe: HuaXianYanSe = 'blue', leiXing: BiaoJiLeiXing = 'underline', id?: string) => {
```

然后在 `baoGuaSpan` 调用处：
```typescript
baoGuaSpan(rendition, cfiRange, cls, id);
```

- [ ] **Step 3: 更新 handleHuaXian 调用 yingYongBiaoJi 时传入 id**

在 [useHuaXianChuTi.ts](src/features/books/hooks/useHuaXianChuTi.ts) 的 `handleHuaXian` 回调中，找到：
```typescript
if (cfiRange) yingYongBiaoJi(cfiRange, false, yanSe, 'underline');
```
替换为：
```typescript
if (cfiRange) yingYongBiaoJi(cfiRange, false, yanSe, 'underline', xinXi.id);
```

- [ ] **Step 4: 更新 handleMaKeBi 调用 yingYongBiaoJi 时传入 id**

在 `handleMaKeBi` 回调中，找到：
```typescript
if (cfiRange) yingYongBiaoJi(cfiRange, false, yanSe, 'marker');
```
替换为：
```typescript
if (cfiRange) yingYongBiaoJi(cfiRange, false, yanSe, 'marker', xinXi.id);
```

- [ ] **Step 5: 更新 applyBiaoJi 中重建标记时也传入 id**

在 `setupRenditionListener` → `applyBiaoJi` 的 forEach 循环中，找到：
```typescript
baoGuaSpan(currentRendition, h.cfiRange, cls);
```
替换为：
```typescript
baoGuaSpan(currentRendition, h.cfiRange, cls, h.id);
```

- [ ] **Step 6: 构建验证**

Run: `npm run build`
Expected: 构建成功，无类型错误

- [ ] **Step 7: 提交**

```bash
git add src/features/books/hooks/useHuaXianChuTi.ts
git commit -m "feat: 划线span增加 data-cfi 和 data-huaxian-id 属性"
```

---

### Task 3: 注入 MutationObserver + 事件代理脚本到 EPUB iframe

**Files:**
- Modify: `src/features/books/hooks/useEPUBReaderShiJian.ts:278-310`

> **背景：** `hooks.content.register` 回调中已有注入 CSS 和 `handleIframeClick` 的逻辑。在此处追加 MutationObserver + click 事件代理脚本。该脚本运行在 iframe 内部 document 上下文中。
>
> **核心逻辑：**
> 1. MutationObserver 监听 `[data-biaoji]` 元素插入（处理翻页后 DOM 重建）
> 2. document 级别 click 事件代理，检查 target 是否为划线 span
> 3. 匹配时读取 data 属性 + getBoundingClientRect()，做 iframe offset 补偿
> 4. postMessage 发送给父窗口，preventDefault + stopPropagation 阻止选区触发
> 5. 监听来自父窗口的 `set-hl-active` 消息，切换 .hl-active class

- [ ] **Step 1: 给 UseEPUBReaderShiJianProps 接口增加回调 prop**

在 [useEPUBReaderShiJian.ts:17-29](src/features/books/hooks/useEPUBReaderShiJian.ts#L17-L29) 的接口定义中，在 `externalBookRef` 之后添加：

```typescript
onHuaXianDianJi?: (xinXi: { cfi: string; id: string; className: string; rect: { top: number; left: number; width: number; height: number }; text: string }) => void;
```

同时在解构参数中加上它：

```typescript
externalRenditionRef, externalBookRef, onHuaXianDianJi,
```

- [ ] **Step 2: 在 hooks.content.register 回调中注入划线点击代理脚本**

在 [useEPUBReaderShiJian.ts](src/features/books/hooks/useEPUBReaderShiJian.ts#L278) 的 `hooks.content.register` 回调内部，在 `baseStyle` 注入之后、`handleIframeClick` 定义之前，添加以下完整脚本注入逻辑：

在 `contents.window.document.head.insertBefore(baseStyle, ...)` 这行之后插入：

```typescript
const huaXianProxyScript = contents.window.document.createElement('script');
huaXianProxyScript.textContent = `
(function() {
  var activeId = null;

  function setActive(id) {
    if (activeId) {
      var prev = document.querySelector('[data-huaxian-id="' + activeId + '"]');
      if (prev) prev.classList.remove('hl-active');
    }
    activeId = id;
    if (id) {
      var el = document.querySelector('[data-huaxian-id="' + id + '"]');
      if (el) el.classList.add('hl-active');
    }
  }

  function handleClick(e) {
    var target = e.target.closest('[data-biaoji]');
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    var cfi = target.getAttribute('data-cfi') || '';
    var id = target.getAttribute('data-huaxian-id') || '';
    var className = target.className || '';
    var text = target.textContent || '';
    var rect = target.getBoundingClientRect();
    window.parent.postMessage({
      type: 'huaxian-click',
      cfi: cfi,
      id: id,
      className: className,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      text: text
    }, '*');
  }

  document.addEventListener('click', handleClick, true);

  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'set-hl-active') {
      setActive(e.data.id);
    }
  });

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) {
          var spans = node.querySelectorAll ? node.querySelectorAll('[data-biaoji]') : [];
          if (node.hasAttribute && node.hasAttribute('data-biaoji')) spans.unshift(node);
          spans.forEach(function() {});
        }
      });
    });
  });
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
})();
`;
contents.window.document.head.appendChild(huaXianProxyScript);
```

- [ ] **Step 3: 修改 handleIframeClick — 排除划线点击**

在 [useEPUBReaderShiJian.ts:291-300](src/features/books/hooks/useEPUBReaderShiJian.ts#L291-L300) 的 `handleIframeClick` 函数开头增加判断：

原代码：
```typescript
function handleIframeClick() {
  if (!showMenuRef.current) return;
```

替换为：
```typescript
function handleIframeClick(e: Event) {
  var target = (e as any).target;
  if (target && target.closest && target.closest('[data-biaoji]')) return;
  if (!showMenuRef.current) return;
```

这样当用户点击划线 span 时，handleIframeClick 会提前 return，不会关闭选区菜单（因为此时根本不是选区场景）。

- [ ] **Step 4: 在 handleIframeClick 之后添加 message 监听器**

在 `contents.window.addEventListener('click', handleIframeClick)` 这行之后，添加：

```typescript
const handleMessage = (e: MessageEvent) => {
  if (!e.data || e.data.type !== 'huaxian-click') return;
  const frameElement = contents.window.frameElement;
  let totalTop = 0, totalLeft = 0;
  let currentWindow = contents.window;
  while (currentWindow) {
    const fe = currentWindow.frameElement;
    if (fe) {
      const fr = fe.getBoundingClientRect();
      totalTop += fr.top;
      totalLeft += fr.left;
      try {
        const pw = fe.ownerDocument?.defaultView?.parent;
        if (pw && pw !== currentWindow) { currentWindow = pw as Window; } else { break; }
      } catch { break; }
    } else { break; }
  }
  const correctedRect = {
    top: e.data.rect.top + totalTop,
    left: e.data.rect.left + totalLeft,
    width: e.data.rect.width,
    height: e.data.rect.height,
  };
  onHuaXianDianJi?.({
    cfi: e.data.cfi,
    id: e.data.id,
    className: e.data.className,
    rect: correctedRect,
    text: e.data.text,
  });
};
contents.window.addEventListener('message', handleMessage);
```

并在 cleanup 函数中对应添加移除监听：
```typescript
return () => {
  contents.window.removeEventListener('click', handleIframeClick);
  contents.window.removeEventListener('message', handleMessage);
  // ... 已有的 cleanup 代码
};
```

- [ ] **Step 5: 构建验证**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 6: 提交**

```bash
git add src/features/books/hooks/useEPUBReaderShiJian.ts
git commit -m "feat: 注入 MutationObserver+事件代理捕获划线点击"
```

---

### Task 4: 添加 .hl-active 激活态 CSS 样式

**Files:**
- Modify: `src/features/books/hooks/useEPUBReaderShiJian.ts:280-287`

- [ ] **Step 1: 在 baseStyle.textContent 中追加激活态样式**

在 [useEPUBReaderShiJian.ts:287](src/features/books/hooks/useEPUBReaderShiJian.ts#L287) 的 `.mk-marker-pink` 样式规则之后，追加：

```css
span.hl-active.hl-underline-blue, .hl-active.hl-underline-blue { background-size: 100% 4px !important; opacity: 1 !important; }
span.hl-active.hl-underline-yellow, .hl-active.hl-underline-yellow { background-size: 100% 4px !important; opacity: 1 !important; }
span.hl-active.hl-underline-green, .hl-active.hl-underline-green { background-size: 100% 4px !important; opacity: 1 !important; }
span.hl-active.hl-underline-pink, .hl-active.hl-underline-pink { background-size: 100% 4px !important; opacity: 1 !important; }
span.hl-active.mk-marker-yellow { background-color: rgba(245,200,66,0.5) !important; }
span.hl-active.mk-marker-green { background-color: rgba(74,222,128,0.5) !important; }
span.hl-active.mk-marker-blue { background-color: rgba(94,148,255,0.45) !important; }
span.hl-active.mk-marker-pink { background-color: rgba(244,114,182,0.5) !important; }
```

- [ ] **Step 2: 构建验证**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 3: 提交**

```bash
git add src/features/books/hooks/useEPUBReaderShiJian.ts
git commit -m "style: 添加划线激活态 .hl-active CSS 样式"
```

---

### Task 5: 创建 useHuaXianDianJi Hook

**Files:**
- Create: `src/features/books/hooks/useHuaXianDianJi.ts`

> **职责：** 接收来自 iframe 的 postMessage（已由 useEPUBReaderShiJian 转为 onHuaXianDianJi 回调），管理编辑菜单的显示/隐藏/位置/当前选中划线数据，并提供激活态控制方法。

- [ ] **Step 1: 创建 Hook 文件**

创建 `src/features/books/hooks/useHuaXianDianJi.ts`：

```typescript
// @审计已完成
// 划线点击交互 Hook - 管理"点击已有划线→弹出编辑菜单"的全流程

import { useState, useCallback, useEffect } from 'react';
import type { HuaXianXinXi, HuaXianYanSe } from './useHuaXianChuTi';

interface HuaXianDianJiXinXi {
  cfi: string;
  id: string;
  className: string;
  rect: { top: number; left: number; width: number; height: number };
  text: string;
}

export interface HuaXianBianJiZhuangTai {
  showEditMenu: boolean;
  editPosition: { top: number; left: number } | null;
  activeHuaXian: HuaXianXinXi | null;
  activeId: string | null;
}

interface UseHuaXianDianJiProps {
  huaXianList: HuaXianXinXi[];
  onDelete: (id: string) => void;
  onChangeYanSe: (id: string, yanSe: HuaXianYanSe) => void;
  onCopy?: (text: string) => void;
  onCloseEdit?: () => void;
}

export function useHuaXianDianJi({
  huaXianList,
  onDelete,
  onChangeYanSe,
  onCopy,
  onCloseEdit,
}: UseHuaXianDianJiProps) {
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [editPosition, setEditPosition] = useState<{ top: number; left: number } | null>(null);
  const [activeHuaXian, setActiveHuaXian] = useState<HuaXianXinXi | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleHuaXianDianJi = useCallback((xinXi: HuaXianDianJiXinXi) => {
    const matched = huaXianList.find(h =>
      h.id === xinXi.id || h.cfiRange === xinXi.cfi
    );
    if (!matched) return;

    const rect = xinXi.rect;
    const menuWidth = 220;
    const menuHeight = 120;
    const safeMargin = 20;

    let menuTop = rect.top - menuHeight - 12;
    let showCaretUp = true;
    if (menuTop < safeMargin) {
      menuTop = rect.bottom + 12;
      showCaretUp = false;
    }

    let menuLeft = rect.left + rect.width / 2;
    if (menuLeft - menuWidth / 2 < safeMargin) menuLeft = safeMargin + menuWidth / 2;
    else if (menuLeft + menuWidth / 2 > window.innerWidth - safeMargin) menuLeft = window.innerWidth - safeMargin - menuWidth / 2;

    setActiveHuaXian(matched);
    setActiveId(matched.id);
    setEditPosition({ top: menuTop, left: menuLeft });
    setShowEditMenu(true);
  }, [huaXianList]);

  const handleCloseEdit = useCallback(() => {
    setShowEditMenu(false);
    setEditPosition(null);
    setActiveHuaXian(null);
    setActiveId(null);
    onCloseEdit?.();
  }, [onCloseEdit]);

  const handleDelete = useCallback(() => {
    if (!activeHuaXian) return;
    onDelete(activeHuaXian.id);
    handleCloseEdit();
  }, [activeHuaXian, onDelete, handleCloseEdit]);

  const handleChangeYanSe = useCallback((yanSe: HuaXianYanSe) => {
    if (!activeHuaXian) return;
    onChangeYanSe(activeHuaXian.id, yanSe);
    setActiveHuaXian(prev => prev ? { ...prev, yanSe } : null);
  }, [activeHuaXian, onChangeYanSe]);

  const handleCopyText = useCallback(async () => {
    if (!activeHuaXian) return;
    if (onCopy) {
      onCopy(activeHuaXian.text);
    } else {
      try { await navigator.clipboard.writeText(activeHuaXian.text); } catch {}
    }
    handleCloseEdit();
  }, [activeHuaXian, onCopy, handleCloseEdit]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === 'set-hl-active') {
        setActiveId(e.data.id || null);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return {
    showEditMenu,
    editPosition,
    activeHuaXian,
    activeId,
    handleHuaXianDianJi,
    handleCloseEdit,
    handleDelete,
    handleChangeYanSe,
    handleCopyText,
  };
}
```

- [ ] **Step 2: 构建验证**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 3: 提交**

```bash
git add src/features/books/hooks/useHuaXianDianJi.ts
git commit -m "feat: 创建划线点击交互 Hook useHuaXianDianJi"
```

---

### Task 6: 创建 HuaXianBianJiCaiDan 编辑菜单组件

**Files:**
- Create: `src/features/books/components/HuaXianBianJiCaiDan.tsx`

> **职责：** 独立的划线编辑菜单 UI 组件，包含删除、复制按钮和颜色选择器。使用 lucide-react 图标，视觉风格与现有 HuaXianCaiDan 一致（深灰半透明背景 + blur）。

- [ ] **Step 1: 创建组件文件**

创建 `src/features/books/components/HuaXianBianJiCaiDan.tsx`：

```tsx
// @审计已完成
// 划线编辑菜单组件 - 点击已有划线时弹出（删除/复制/换色）

import { useState, useRef, useEffect } from 'react';
import { Trash2, Copy } from 'lucide-react';
import type { HuaXianYanSe } from '../hooks/useHuaXianChuTi';

const YAN_SE_XUAN_XIANG: { value: HuaXianYanSe | 'red' | 'purple'; color: string; label: string }[] = [
  { value: 'red', color: '#EF4444', label: '红' },
  { value: 'yellow', color: '#F5C842', label: '黄' },
  { value: 'green', color: '#4ADE80', label: '绿' },
  { value: 'blue', color: '#5E94FF', label: '蓝' },
  { value: 'purple', color: '#A78BFA', label: '紫' },
];

interface HuaXianBianJiCaiDanProps {
  show: boolean;
  position: { top: number; left: number } | null;
  currentYanSe: HuaXianYanSe;
  onDelete: () => void;
  onCopy: () => void;
  onChangeYanSe: (yanSe: HuaXianYanSe) => void;
  onClose: () => void;
}

export function HuaXianBianJiCaiDan({
  show, position, currentYanSe, onDelete, onCopy, onChangeYanSe, onClose,
}: HuaXianBianJiCaiDanProps) {
  const [visible, setVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (show) requestAnimationFrame(() => setVisible(true)); else setVisible(false); }, [show]);

  useEffect(() => {
    if (!show) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 150);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [show, onClose]);

  if (!show || !position) return null;

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${position.top}px`,
    left: `${position.left}px`,
    transform: `translate(-50%, 0) scale(${visible ? 1 : 0.9}) translateY(${visible ? 0 : 8px})`,
    zIndex: 9999,
    opacity: visible ? 1 : 0,
    transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
    pointerEvents: show ? 'auto' : 'none',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '0.35rem',
    backgroundColor: 'rgba(51, 51, 51, 0.95)', backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', borderRadius: '0.75rem',
    boxShadow: '0 8px 30px rgba(0,0,0,0.4), 0 2px 16px rgba(0,0,0,0.3)',
    padding: '0.4rem 0.5rem', minWidth: '11rem',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
  };

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.45rem 0.65rem', border: 'none', borderRadius: '0.45rem',
    backgroundColor: 'transparent', color: '#ffffff', cursor: 'pointer',
    fontSize: '0.78rem', whiteSpace: 'nowrap', transition: 'background-color 0.15s',
  };

  const dotStyle = (isActive: boolean): React.CSSProperties => ({
    width: '22px', height: '22px', borderRadius: '50%',
    border: isActive ? '2.5px solid #ffffff' : '2px solid transparent',
    boxSizing: 'border-box', cursor: 'pointer', transition: 'all 0.15s',
    flexShrink: 0,
  });

  return (
    <div ref={menuRef} style={menuStyle}>
      <div style={containerStyle}>
        <div style={rowStyle}>
          <button onClick={onDelete} style={btnStyle} onMouseEnter={e => e.currentTarget.style.backgroundColor='#ef4444'} onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
            <Trash2 size={14} /><span>删除</span>
          </button>
          <div style={{ width: '1px', height: '1.2rem', backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <button onClick={onCopy} style={btnStyle} onMouseEnter={e => e.currentTarget.style.backgroundColor='rgba(96,165,250,0.25)'} onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
            <Copy size={14} /><span>复制</span>
          </button>
        </div>
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div style={{ ...rowStyle, justifyContent: 'center', paddingTop: '0.2rem' }}>
          {YAN_SE_XUAN_XIANG.map(opt => (
            <button key={opt.value}
              title={opt.label}
              onClick={() => { if (opt.value !== 'red' && opt.value !== 'purple') onChangeYanSe(opt.value as HuaXianYanSe); }}
              style={{ ...dotStyle(currentYanSe === opt.value), backgroundColor: opt.color }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            />
          ))}
        </div>
        <div style={{
          position: 'absolute', left: '50%', bottom: '-10px', transform: 'translateX(-50%)',
          width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
          borderTop: '10px solid rgba(51, 51, 51, 0.95)', zIndex: 10000,
        }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 构建验证**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 3: 提交**

```bash
git add src/features/books/components/HuaXianBianJiCaiDan.tsx
git commit -m "feat: 创建划线编辑菜单组件 HuaXianBianJiCaiDan"
```

---

### Task 7: 集成到 EPUBYueDuQuYu 和 Hook 链路

**Files:**
- Modify: `src/features/books/hooks/useEPUBReaderHuoChuLi.ts`
- Modify: `src/features/books/components/EPUBYueDuQuYu.tsx`

> **目标：** 将 useHuaXianDianJi 和 HuaXianBianJiCaiDan 串联进现有的 Hook 调用链，让数据流从最顶层一路透传到阅读区域组件。

- [ ] **Step 1: 在 useEPUBReaderHuoChuLi 中集成 useHuaXianDianJi**

在 [useEPUBReaderHuoChuLi.ts](src/features/books/hooks/useEPUBReaderHuoChuLi.ts) 中：

1. 文件顶部增加 import：
```typescript
import { useHuaXianDianJi } from './useHuaXianDianJi';
```

2. 在 `useEPUBReaderShiJian` 调用之后（约 L85），添加：

```typescript
const huaXianDianJi = useHuaXianDianJi({
  huaXianList: jiChu.huaXianList,
  onDelete: jiChu.handleDeleteHuaXian,
  onChangeYanSe: (id, yanSe) => {
    jiChu.setHuaXianList(prev => prev.map(h => h.id === id ? { ...h, yanSe } : h));
  },
  onCopy: jiChu.handleCopy,
});
```

> 注意：`setHuaXianList` 需要从 `useHuaXianChuTi` 或 `useEPUBReaderJiChuHuo` 中导出 setter。如果当前没有导出，需要在 `useHuaXianChuTi.ts` 的 return 中增加 `setHuaXianList`，并在 `useEPUBReaderJiChuHuo.ts` 中透传。

3. 将 `onHuaXianDianJi` 传递给 `useEPUBReaderShiJian`：

在 `useEPUBReaderShiJian({...})` 的参数对象中增加：
```typescript
onHuaXianDianJi: huaXianDianJi.handleHuaXianDianJi,
```

4. 在 return 对象中增加编辑菜单相关状态：

```typescript
editMenuState: huaXianDianJi,
```

- [ ] **Step 2: 确保 setHuaXianList 可从 useHuaXianChuTi 导出**

检查 [useHuaXianChuTi.ts](src/features/books/hooks/useHuaXianChuTi.ts) 的 return 语句，确认包含 `setHuaXianList`。如果没有，在 return 中添加：

找到 return 语句，确保包含：
```typescript
setHuaXianList,
```

如果 `setHuaXianList` 是 `useLocalStorageState` 返回的 setter，它应该已经可用。

- [ ] **Step 3: 在 EPUBYueDuQuYu 中渲染 HuaXianBianJiCaiDan**

在 [EPUBYueDuQuYu.tsx](src/features/books/components/EPUBYueDuQuYu.tsx) 中：

1. 增加 import：
```typescript
import { HuaXianBianJiCaiDan } from './HuaXianBianJiCaiDan';
```

2. Props 接口中增加编辑菜单相关 props：

```typescript
editMenuState?: {
  showEditMenu: boolean;
  editPosition: { top: number; left: number } | null;
  activeHuaXian: { yanSe: import('../hooks/useHuaXianChuTi').HuaXianYanSe } | null;
  handleCloseEdit: () => void;
  handleDelete: () => void;
  handleChangeYanSe: (yanSe: import('../hooks/useHuaXianChuTi').HuaXianYanSe) => void;
  handleCopyText: () => void;
};
```

3. 在 JSX 中 HuaXianCaiDan 渲染块之后，添加：

```tsx
{editMenuState?.showEditMenu && editMenuState.editPosition && editMenuState.activeHuaXian && (
  <HuaXianBianJiCaiDan
    show={editMenuState.showEditMenu}
    position={editMenuState.editPosition}
    currentYanSe={editMenuState.activeHuaXian.yanSe}
    onDelete={editMenuState.handleDelete}
    onCopy={editMenuState.handleCopyText}
    onChangeYanSe={editMenuState.handleChangeYanSe}
    onClose={editMenuState.handleCloseEdit}
  />
)}
```

- [ ] **Step 4: 在 EPUBReader 或 BookDetail 层透传 editMenuState props**

追踪从 `useEPUBReaderHuoChuLi` 到 `EPUBYueDuQuYu` 的 props 传递链路，确保 `editMenuState` 在每一层都被正确传递。

具体来说，检查以下文件是否需要修改：
- `EPUBReader.tsx` — 如果它是中间层
- `BookDetail.tsx` — 如果它是中间层

在每个中间层组件中，将 `editMenuState` 从 props 解构出来并传递给子组件。

- [ ] **Step 5: 构建验证**

Run: `npm run build`
Expected: 构建成功，无类型错误

- [ ] **Step 6: 行数检查**

Run: `npm run check:lines`
Expected: 所有文件行数 ≤ 100

- [ ] **Step 7: 提交**

```bash
git add src/features/books/hooks/useEPUBReaderHuoChuLi.ts src/features/books/components/EPUBYueDuQuYu.tsx
git commit -m "feat: 集成划线编辑菜单到阅读区域"
```

---

### Task 8: 端到端验证与修复

**Files:**
- 无新建文件，可能微调上述文件

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: 开发服务器启动成功

- [ ] **Step 2: 浏览器手动测试**

按以下步骤逐一验证：

1. **基本功能 — 点击划线弹出菜单**
   - 打开一本有划线的书籍
   - 点击已有的蓝色划线文字
   - ✅ 预期：划线变粗（激活态），上方弹出深灰色编辑菜单
   - ✅ 预期：菜单显示「删除」「复制」按钮和 5 个颜色圆点

2. **换色功能**
   - 在编辑菜单中点击黄色圆点
   - ✅ 预期：划线立即变为黄色，菜单中黄色圆点出现白色边框
   - 刷新页面
   - ✅ 预期：划线仍然是黄色（localStorage 已更新）

3. **删除功能**
   - 在编辑菜单中点击「删除」
   - ✅ 预期：划线消失，菜单关闭
   - 刷新页面
   - ✅ 预期：划线仍然消失（localStorage 已删除）

4. **复制功能**
   - 在编辑菜单中点击「复制」
   - ✅ 预期：菜单关闭，文本已复制到剪贴板

5. **冲突防护 — 选区不受影响**
   - 点击普通（无划线）文字并拖动选区
   - ✅ 预期：正常弹出选区菜单（HuaXianCaiDan）
   - 在选区菜单打开状态下，点击一条划线
   - ✅ 预期：选区菜单关闭，编辑菜单弹出

6. **点击空白处关闭**
   - 打开编辑菜单后，点击阅读区域空白处
   - ✅ 预期：编辑菜单关闭，激活态取消

7. **翻页后状态清理**
   - 打开编辑菜单（不关闭），然后翻页
   - ✅ 预期：编辑菜单应关闭或自动隐藏

- [ ] **Step 3: 修复发现的问题**

根据 Step 2 的测试结果修复任何 bug。常见问题：
- postMessage 未正确接收 → 检查 event.origin 或 message 格式
- 坐标偏移不对 → 检查 iframe offset 累加逻辑
- 激活态样式未生效 → 检查 CSS 选择器和 class 是否正确添加
- 颜色切换后未实时更新视图 → 检查 handleChangeYanSe 是否触发了重新渲染

- [ ] **Step 4: 最终构建验证**

Run: `npm run build`
Expected: 构建成功

Run: `npm run check:lines`
Expected: 所有文件 ≤ 100 行

- [ ] **Step 5: 最终提交**

```bash
git add -A
git commit -m "feat: 划线点击编辑菜单功能完成（删除/换色/复制+激活态）"
```

---

## 自检清单

| 设计文档要求 | 对应 Task |
|-----------|----------|
| 点击划线 → 弹出编辑菜单 | Task 3（事件代理）+ Task 6（UI）+ Task 7（集成） |
| 删除划线（SVG+DOM+localStorage三层清理） | Task 6 UI + 复用已有 handleDeleteHuaXian |
| 切换颜色（实时视觉效果+数据层更新） | Task 6 UI + Task 7 onChangeYanSe |
| 复制划线文字 | Task 6 UI |
| 激活态视觉反馈 | Task 4 CSS + Task 5 activeId 管理 |
| 防止与选区冲突 | Task 3 stopPropagation + handleIframeClick 排除判断 |
| Lucide 图标 | Task 1 安装 + Task 6 使用 |
| 独立新组件 | Task 6 新建 HuaXianBianJiCaiDan |
| postMessage 通信 | Task 3 iframe 脚本 + Task 5 监听 |
| data-cfi/data-huaxian-id 属性 | Task 2 扩展 baoGuaSpan |
