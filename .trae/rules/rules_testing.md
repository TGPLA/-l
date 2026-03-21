# 后端 API 集成测试规范

## 测试层级关系

```
第一层：本地测试（基础层）
    │ 验证代码逻辑正确
    │
    ▼ 通过后
部署到服务器
    │
    ▼
第二层：远程测试（验证层）
    │ 验证生产环境正常
    │
    ▼ 通过后
上线完成
```

| 测试类型 | 后端服务位置 | 数据库位置 | 测试时机 |
|----------|--------------|------------|----------|
| **本地测试** | 本地 localhost:8080 | 远程（SSH 隧道） | 开发时，每次改代码 |
| **远程测试** | 远程 linyubo.top | 远程 | 部署后，验证线上 |

---

## 本地测试（第一层）

### 执行步骤

#### 1. 数据库连接
```bash
ssh -f -N -L 3307:127.0.0.1:3306 root@<服务器IP>
```

#### 2. 启动后端服务
```bash
cd backend && go run main.go
```

#### 3. 运行测试
```bash
npx vitest run src/shared/services/local.integration.test.ts --reporter=verbose
```

### 失败处理
- 问题在代码逻辑 → 修复代码
- 修复后重新运行本地测试

---

## 远程测试（第二层）

### 前置条件
- 本地测试已通过
- 代码已部署到服务器

### 运行测试
```bash
npx vitest run src/shared/services/database.integration.test.ts --reporter=verbose
```

### 失败处理
- 问题在部署/环境配置 → 检查部署流程或回滚

---

## 一次性检查（项目初始化时确认）

> 以下内容除非有架构变更，否则无需重复检查

### 1. 后端认证机制
- 后端 API 需要 JWT 认证（已确认）

### 2. 跨语言类型映射
- Go string 类型无法表示 null，零值是空字符串 ""
- MySQL JSON 类型不接受空字符串，只接受 NULL 或有效 JSON
- 可空字段应使用指针类型（如 `*string`）而非值类型

---

## 测试编写规范

### 1. 测试文件命名
- 本地测试：`local.integration.test.ts`
- 远程测试：`database.integration.test.ts`
- 单元测试：`<模块名>.test.ts`

### 2. 测试数据格式
- 测试前先了解后端 API 的数据模型和依赖关系（如：题目必须属于章节）
- 测试数据使用 snake_case 字段名（与后端 Go 模型保持一致）
- JSON 类型字段必须发送有效值：
  - 正确：`options: null`（后端用 `*string`）
  - 错误：`options: ''` 或 `options: null`（后端用 `string`）

### 3. 测试数据清理（必须）
- 测试代码中必须包含清理逻辑
- 清理顺序：先删除子表数据，再删除父表数据
- 清理后验证数据已删除

### 4. 测试描述规范
- 明确测试对象：后端 API / 前端服务 / 端到端
- 示例：
  - `describe('后端认证 API（直接调用 /api/auth/*）')`
  - `it('后端登录接口：未注册用户应该返回错误')`

---

## Bug 修复优先级

1. **第一优先**：数据库表结构（字段类型、约束）
2. **第二优先**：后端代码（类型定义、空值处理）
3. **第三优先**：前端/测试代码（数据格式）

---

## 测试代码模板

```typescript
/**
 * @vitest-environment node
 * 后端 API 集成测试
 */
import { describe, it, expect } from 'vitest'
import { fetch } from 'undici'

const 服务器地址 = 'http://localhost:8080'  // 本地测试用 localhost，远程测试用 linyubo.top

describe('后端 API 集成测试', () => {
  describe('后端健康检查', () => {
    it('后端服务应该正常运行', async () => {
      const 响应 = await fetch(`${服务器地址}/health`)
      expect(响应.status).toBe(200)
    })
  })

  describe('后端认证 API', () => {
    it('注册：应该成功注册新用户', async () => {
      // 测试代码...
    })

    it('登录：未注册用户应该返回错误', async () => {
      // 测试代码...
    })
  })

  // 清理测试数据（必须放在最后）
  describe('清理测试数据', () => {
    it('删除测试题目', async () => { /* ... */ })
    it('删除测试章节', async () => { /* ... */ })
    it('删除测试书籍', async () => { /* ... */ })
    it('验证数据已清理', async () => { /* ... */ })
  })
})
```
