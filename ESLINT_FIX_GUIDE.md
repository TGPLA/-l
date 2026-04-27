# ESLint 错误清单 - ReadRecall 项目

> 共 36 个 error，21 个 warning
> 修复优先级：按顺序 1-36

---

## 1. EPUBYueDuQuYu.tsx - 修改 prop 问题（error）
**文件**: `src/features/books/components/EPUBYueDuQuYu.tsx`
**行号**: 83
**错误**: Cannot modify component props
**修复方法**: 删除这行代码，或使用本地变量
```tsx
// 第 83 行
localRendition.spread = () => true;
// 删除即可，spread 默认就是 'auto'
```

---

## 2. EPUBYueDuQuYu.tsx - 渲染时访问 ref（error）
**文件**: `src/features/books/components/EPUBYueDuQuYu.tsx`
**行号**: 150
**错误**: Cannot access refs during render
**修复方法**: 改为条件渲染，用 useState 控制
```tsx
// 把
<ShuangLanPaiBan rendition={renditionRef.current} darkMode={darkMode} />
// 改成：加个 state 跟踪 rendition 是否准备好
const [renditionReady, setRenditionReady] = useState(false);
useEffect(() => { if (renditionRef.current) setRenditionReady(true); }, [renditionRef.current]);
// 然后
{renditionReady && <ShuangLanPaiBan rendition={renditionRef.current} darkMode={darkMode} />}
```

---

## 3. HuaXianBianJiCaiDan.tsx - effect 中调用 setState（error）
**文件**: `src/features/books/components/HuaXianBianJiCaiDan.tsx`
**行号**: 35
**错误**: setState in effect
**修复方法**: 改用 useMemo 或直接渲染
```tsx
// 第 35 行，删除这个 useEffect，改为：
const visible = show; // 直接用 show 即可
// 或者用 useMemo: const visible = useMemo(() => show, [show]);
```

---

## 4. HuaXianCaiDan.tsx - effect 中调用 setState（error）
**文件**: `src/features/books/components/HuaXianCaiDan.tsx`
**行号**: 35
**错误**: setState in effect
**修复方法**: 同上
```tsx
// 删除 useEffect，直接用 showMenu
const isVisible = showMenu; // 或 useMemo
```

---

## 5. MuLuChouTi.tsx - effect 中调用 setState（error）
**文件**: `src/features/books/components/MuLuChouTi.tsx`
**行号**: 22
**错误**: setState in effect
**修复方法**: 把逻辑移到事件处理函数或直接渲染
```tsx
// 第 22 行，用 useMemo 代替
const gaoLiangId = useMemo(() => {
  const xunZhao = (items: NavItem[]): string | null => {
    for (const item of items) {
      if (dangQianCfi && item.href && dangQianCfi.includes(item.href.split('#')[0])) 
        return item.id || item.href;
      if (item.subitems?.length) { const f = xunZhao(item.subitems); if (f) return f; }
    }
    return null;
  };
  return xunZhao(zhangJieLieBiao);
}, [zhangJieLieBiao, dangQianCfi]);
```

---

## 6. SettingsPage.tsx - effect 中调用 setState（error）
**文件**: `src/features/user/components/SettingsPage.tsx`
**行号**: 24
**错误**: setState in effect
**修复方法**: 用 useMemo 初始化
```tsx
// 第 24 行，删除 useEffect，改为：
const [formData, setFormData] = useState(() => settings);
// 或者：const formData = settings; // 直接用 props
```

---

## 7. BiJiChouTi.tsx - useEffect 依赖缺失（warning）
**文件**: `src/features/books/components/BiJiChouTi.tsx`
**行号**: 57
**警告**: Missing dependency 'jiaZaiFuShuJiLu'
**修复方法**: 加到依赖数组
```tsx
useEffect(() => { ... }, [show, jiaZaiFuShuJiLu]);
```

---

## 8. EPUBReader.tsx - useCallback 依赖缺失（warning x3）
**文件**: `src/features/books/components/EPUBReader.tsx`
**行号**: 102, 107, 177
**警告**: Missing dependencies
**修复方法**: 把依赖加到数组，或用 useMemo/useCallback 包装
```tsx
// 第 102 行
useCallback(() => { ... }, [buju, p.renditionRef]); // 加上缺失的依赖
```

---

## 9. XueXiCaiDan.tsx - React Compiler 优化跳过（error）
**文件**: `src/features/books/components/XueXiCaiDan.tsx`
**行号**: 78
**错误**: 手动 memo 与推断依赖不匹配
**修复方法**: 移除手动的 useMemo，用 useCallback
```tsx
// 删除 useMemo，改为：
const handlePositionChange = useCallback((pos: Position) => {
  setPosition(pos);
  // ...其他逻辑
}, []); // 或加上实际依赖
```

---

## 10. ShangWuChangJing.tsx - setState in effect（error）
**文件**: `src/features/business/components/ShangWuChangJing.tsx`
**行号**: 24-27
**错误**: setState in effect
**修复方法**: 改为：
```tsx
// 删除 useEffect，直接：
const [healthStatus, setHealthStatus] = useState(initialStatus);
// 在需要的地方调用 setHealthStatus
```

---

## 11. auth.ts - 未使用变量 'saved'（error）
**文件**: `src/shared/services/auth.ts`
**行号**: 32
**错误**: 'saved' is assigned but never used
**修复方法**: 删掉这行或加 _ 前缀
```tsx
const _saved = ... // 加下划线前缀
```

---

## 12. auth.ts - 未使用变量 'username'（error）
**文件**: `src/shared/services/auth.ts`
**行号**: 215
**错误**: 'username' is defined but never used
**修复方法**: 删掉或加 _ 前缀
```tsx
// 删掉 username 参数，或改成 _username
```

---

## 13. epubParser.ts - 未使用参数 'file'（error）
**文件**: `src/shared/utils/epubParser.ts`
**行号**: 79
**错误**: 'file' is defined but never used
**修复方法**: 改成 _file
```tsx
parseEPUB(_file: ArrayBuffer, ...)
```

---

## 14. ToastGongJu.ts - 未使用变量 'ToastType'（error）
**文件**: `src/shared/utils/common/ToastGongJu.ts`
**行号**: 4
**错误**: 'ToastType' is defined but never used
**修复方法**: 删掉或确认是否导出

---

## 15. DuanLuoXuanRan.tsx - react-refresh 问题（error）
**文件**: `src/shared/utils/common/DuanLuoXuanRan.tsx`
**行号**: 46
**错误**: 文件导出了非组件内容
**修复方法**: 把常量/函数移到单独文件

---

## 16. ToastRongQi.tsx - react-refresh 问题（error）
**文件**: `src/shared/utils/common/ToastRongQi.tsx`
**行号**: 17
**错误**: 同上
**修复方法**: 把非组件导出移到单独文件

---

## 17. ToastTiShi.tsx - react-refresh 问题（error x4）
**文件**: `src/shared/utils/common/ToastTiShi.tsx`
**行号**: 4, 6
**错误**: 同上（多个常量导出）
**修复方法**: 把所有非组件导出移到单独文件

---

## 18. database.integration.test.ts - 无效的 eslint-disable（warning）
**文件**: `src/shared/services/database.integration.test.ts`
**行号**: 8
**警告**: 无效的 disable 指令
**修复方法**: 删掉这行

---

## 修复优先级

**快速修复（1-5分钟）**:
- 11, 12, 13, 14: 未使用变量（加 _ 前缀或删除）
- 18: 删除无效的 eslint-disable

**中等难度（5-15分钟）**:
- 7, 8: 补充依赖数组
- 15, 16, 17: 重构导出（移文件）

**需要重构（15-30分钟）**:
- 1, 2, 3, 4, 5, 6, 9, 10: setState in effect、修改 prop、渲染时访问 ref

---

## 修复完成后

运行 `npm run lint` 确认无 error（warning 可以接受）

提交推送：
```bash
git add .
git commit -m "fix: ESLint 错误全部修复"
git push
```