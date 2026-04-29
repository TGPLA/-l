# E2E 测试 — L3 模块 Skill

## 职责
Playwright 端到端测试的编写和修复。

---

## 测试目录

`tests/` — Playwright E2E 测试

---

## 运行命令

```bash
npm run test:e2e       # 运行所有 E2E 测试
npm run test:e2e:ui     # 打开 Playwright UI 界面
```

---

## Playwright 测试规范

```typescript
import { test, expect } from '@playwright/test';

test('登录失败后显示错误提示', async ({ page }) => {
  await page.goto('/auth');
  await page.fill('[data-testid="username"]', 'wrong');
  await page.fill('[data-testid="password"]', 'wrong');
  await page.click('[data-testid="login-btn"]');
  await expect(page.locator('.toast-error')).toBeVisible();
});
```

---

## 选择器优先级

1. `data-testid` — 最优先（需要开发时添加）
2. `role` — 如 `getByRole('button', { name: '登录' })`
3. `text` — 如 `getByText('提交')`
4. `CSS selector` — 最后考虑

---

## 常用操作

| 操作 | 代码 |
| --- | --- |
| 点击 | `page.click(selector)` |
| 填表单 | `page.fill(selector, text)` |
| 等待元素 | `expect(locator).toBeVisible()` |
| 截图 | `page.screenshot()` |
