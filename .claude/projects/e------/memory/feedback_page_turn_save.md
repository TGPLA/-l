---
name: 翻页后 saveImmediately 导致视觉回弹
description: EPUB翻页成功后立即调用 saveImmediately 会触发 ReactReader 重新 navigation，导致视觉闪烁
type: feedback
---

翻页处理流程中不要调用 `saveImmediately()`。因为 `saveImmediately` 更新 `location` 状态 → React 重渲染 → `ReactReader` 收到新 `location` prop → 调用 `rendition.display()` 重载当前章节 → epubjs 清除视图再重建 → 用户看到"拽回"闪烁。

**Why:** `useEPUBReaderShiJian.ts` 中的 `relocated` 事件处理器已调用 `handleLocationChanged(CFI)` → `saveDebounced(CFI)`，翻页后的进度保存已由该路径覆盖。翻页 handler 中再调用 `saveImmediately` 是多余的，且会触发 `rendition.display()` 造成视觉回弹。

**How to apply:** 翻页成功后只清理加载状态（`setFanYeJiaZaiZhong(false)`），不调用 `saveImmediately`。
