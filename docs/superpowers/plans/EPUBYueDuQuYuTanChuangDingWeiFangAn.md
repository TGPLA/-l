# EPUB 阅读器选词弹窗定位方案

## 核心思路：四象限边界检测算法

参考 Android WebView 自定义选中文本弹窗的实现，采用「优先上方 → 备选下方 → 全屏处理」的定位策略。

---

## 算法步骤

### 1. 计算初始位置

```
选区中心 = rect.top + rect.height / 2
弹窗顶部初始位置 = 选区中心 - 弹窗高度 / 2 - 间距(15px)
```

### 2. 四象限检测逻辑

```
┌─────────────────────────────────────┐
│          上方空间检测                │
│  if (弹窗顶部 >= 安全边距 AND        │
│      弹窗底部 <= 视口底部)           │
│      → 优先放上方，箭头向下          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          下方空间检测                │
│  else if (弹窗可放在选区下方)       │
│      → 放下方，箭头上指             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          边界处理                    │
│  - 上方溢出：贴顶 + 判断箭头方向     │
│  - 下方溢出：贴底 + 判断箭头方向     │
│  - 左右溢出：左右边界约束            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          极端情况                    │
│  选区高度 > 弹窗高度/2 → 放选区下方  │
└─────────────────────────────────────┘
```

### 3. 关键判断条件

| 条件 | 结果 |
|------|------|
| 上方空间充足 | 放上方，箭头向下 |
| 上方不足，下方充足 | 放下方，箭头上指 |
| 上下都不足 | 贴边 + 箭头指向选区中心 |
| 选区太大 | 放在选区下方 |

---

## 核心代码逻辑

```typescript
function calculatePopupPosition(rect, menuWidth, menuHeight, safeMargin) {
  const selectionCenterY = rect.top + rect.height / 2;
  
  // 初始：尝试放上方
  let menuTop = selectionCenterY - menuHeight / 2 - 15;
  let showCaretUp = true; // 箭头向下，指向选区
  
  // 检测：如果选区太大，放到下方
  if (rect.height > menuHeight / 2) {
    menuTop = rect.bottom + 20;
    showCaretUp = true;
  }
  
  // 上方检测
  if (menuTop >= safeMargin) {
    const menuBottom = menuTop + menuHeight;
    if (menuBottom <= window.innerHeight - safeMargin) {
      return { menuTop, showCaretUp }; // 可放上方
    }
  }
  
  // 切换到下方
  menuTop = selectionCenterY + 15;
  showCaretUp = false;
  
  const menuBottom = menuTop + menuHeight;
  if (menuBottom <= window.innerHeight - safeMargin) {
    return { menuTop, showCaretUp };
  }
  
  // 边界约束
  menuTop = Math.max(safeMargin, window.innerHeight - safeMargin - menuHeight);
  showCaretUp = selectionCenterY > menuTop + menuHeight / 2;
  
  return { menuTop, showCaretUp };
}
```

---

## 边界处理完整流程

```
1. 初始定位 → 尝试放选区上方 15px 处
2. 选区高度检测 → 太大则放选区下方
3. 上方空间检测 → 空间充足直接返回
4. 下方切换 → 空间不足则尝试放下方
5. 边界约束 → 上下都溢出则贴边
6. 箭头方向 → 根据选区与弹窗的相对位置决定
```

---

## 坐标获取要点

1. **嵌套 iframe 处理**：递归遍历所有父级 frame，累加偏移量
2. **视口坐标**：`getBoundingClientRect()` 返回相对于视口的坐标
3. **滚动修正**：fixed 定位不需要考虑滚动，只需考虑视口边界