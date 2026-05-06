# 单元测试 — L3 模块 Skill

## 职责
Vitest 单元测试的编写和修复。

---

## 测试目录

- `src/shared/services/*.test.ts` — Service 测试
- `src/shared/services/*.integration.test.ts` — 集成测试
- `tests/` — E2E 测试（Playwright）

---

## 运行命令

```bash
npm run test          # watch 模式
npm run test:run      # 单次运行
```

---

## 测试规范

### Service 测试
```typescript
import { describe, it, expect } from 'vitest';

describe('authService', () => {
  it('should return error for invalid credentials', async () => {
    const result = await authService.login('wrong', 'wrong');
    expect(result.error).toBeTruthy();
  });
});
```

### Mock
- 用 `vi.fn()` mock 函数
- 用 `vi.mock()` mock 模块

---

## 注意事项

- 测试文件名：`xxx.test.ts`
- 一个 test 文件对应一个 source 文件
- 集成测试后缀：`xxx.integration.test.ts`
