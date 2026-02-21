# 阅读回响项目 - 国产平台迁移实施计划

## 📋 目录
1. [项目概述](#项目概述)
2. [当前架构分析](#当前架构分析)
3. [目标架构设计](#目标架构设计)
4. [迁移方案选择](#迁移方案选择)
5. [详细实施步骤](#详细实施步骤)
6. [时间规划](#时间规划)
7. [风险评估](#风险评估)
8. [回滚方案](#回滚方案)
9. [验证测试](#验证测试)
10. [上线切换](#上线切换)

---

## 项目概述

### 项目名称
**阅读回响 (ReadRecall)** - 通过主动回忆机制加深书籍理解的个人刷题工具

### 核心功能
- 📚 书籍管理（添加、编辑、删除）
- 📝 问题管理（创建、编辑、批量管理）
- 🎯 练习模式（标准练习、概念练习、错题练习）
- 🤖 AI 辅助（智谱AI生成问题和批改）
- ⚙️ 设置管理（深色模式、API配置）
- 👤 用户认证（注册、登录、登出）
- 🔄 数据同步（多设备数据同步）

### 技术栈
| 层级 | 当前技术 | 国产替代 |
|------|---------|---------|
| 前端框架 | React 19 | React 19 |
| 构建工具 | Vite 6 | Vite 6 |
| 认证服务 | Supabase Auth | 阿里云认证服务 |
| 数据库 | Supabase PostgreSQL | 阿里云 RDS PostgreSQL |
| 存储服务 | Supabase Storage | 阿里云 OSS |
| AI 服务 | 智谱AI | 智谱AI（已国产） |
| 部署平台 | Vercel → 腾讯云 EdgeOne Pages | 腾讯云 EdgeOne Pages |

---

## 当前架构分析

### 系统架构图
```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器                             │
│                   (React + Vite)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              腾讯云 EdgeOne Pages                          │
│              (静态网站托管 + CDN)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ API 调用
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase 服务                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Auth       │  │  PostgreSQL  │  │   Storage    │   │
│  │  (认证服务)   │  │   (数据库)    │  │  (文件存储)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ API 调用
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    智谱 AI                                 │
│              (AI 问题生成 + 批改)                          │
└─────────────────────────────────────────────────────────────┘
```

### 当前服务依赖
```typescript
// 认证服务
src/services/supabaseAuth.ts
  ├── supabase.auth.signUp()
  ├── supabase.auth.signInWithPassword()
  ├── supabase.auth.signOut()
  ├── supabase.auth.resetPassword()
  └── supabase.auth.updatePassword()

// 数据库服务
src/services/database.ts
  ├── supabase.from('books').select()
  ├── supabase.from('questions').select()
  ├── supabase.from('user_settings').select()
  └── supabase.from('books').insert()

// AI 服务
src/api/zhipu.ts
  └── fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions')

src/api/dify.ts
  └── fetch('https://api.dify.ai/v1/chat-messages')
```

### 数据库结构
```sql
-- 书籍表
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  description TEXT,
  question_count INTEGER DEFAULT 0,
  mastered_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 问题表
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  question TEXT NOT NULL,
  answer TEXT,
  type TEXT DEFAULT 'standard',
  difficulty INTEGER DEFAULT 1,
  mastered BOOLEAN DEFAULT FALSE,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户设置表
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dark_mode BOOLEAN DEFAULT FALSE,
  zhipu_api_key TEXT,
  zhipu_model TEXT DEFAULT 'glm-4',
  dify_api_key TEXT,
  question_workflow_url TEXT,
  correction_workflow_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 目标架构设计

### 推荐方案：阿里云全家桶 + 腾讯云 EdgeOne Pages

### 系统架构图
```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器                             │
│                   (React + Vite)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              腾讯云 EdgeOne Pages                          │
│              (静态网站托管 + CDN)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ API 调用
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   阿里云服务                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  认证服务    │  │  RDS PostgreSQL│  │     OSS      │   │
│  │ (阿里云认证)  │  │   (数据库)    │  │  (文件存储)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ API 调用
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    智谱 AI                                 │
│              (AI 问题生成 + 批改)                          │
└─────────────────────────────────────────────────────────────┘
```

### 服务映射表
| 当前服务 | 迁移目标 | 产品名称 | 功能 |
|---------|---------|---------|------|
| Supabase Auth | 阿里云认证服务 | 阿里云 IDaaS | 用户认证、会话管理 |
| Supabase PostgreSQL | 阿里云 RDS | 阿里云 RDS PostgreSQL | 关系型数据库 |
| Supabase Storage | 阿里云 OSS | 阿里云对象存储 OSS | 文件存储 |
| Supabase Edge Functions | 阿里云函数计算 | 阿里云函数计算 FC | 服务端逻辑 |
| Vercel | 腾讯云 EdgeOne Pages | 腾讯云 EdgeOne Pages | 静态网站托管 |
| 智谱 AI | 智谱 AI | 智谱 AI | AI 服务（保持不变） |

---

## 迁移方案选择

### 方案对比

#### 方案 1：阿里云全家桶（推荐 ⭐⭐⭐⭐⭐）
**优势：**
- ✅ 一站式解决方案，集成度高
- ✅ 国内访问速度快
- ✅ 文档丰富，社区活跃
- ✅ 价格合理，成本可控
- ✅ 技术支持强，响应及时

**劣势：**
- ⚠️ 需要学习阿里云服务
- ⚠️ 初期配置较复杂

**适用场景：** 追求稳定性和集成度的项目

#### 方案 2：腾讯云全家桶（推荐 ⭐⭐⭐⭐）
**优势：**
- ✅ 与 EdgeOne Pages 集成度高
- ✅ 国内访问速度快
- ✅ 价格优惠，性价比高
- ✅ 技术支持及时

**劣势：**
- ⚠️ 部分服务功能不如阿里云完善
- ⚠️ 文档相对较少

**适用场景：** 已使用 EdgeOne Pages，追求性价比的项目

#### 方案 3：混合方案（推荐 ⭐⭐⭐）
**优势：**
- ✅ 灵活性高，选择最佳服务
- ✅ 避免厂商锁定
- ✅ 成本优化空间大

**劣势：**
- ⚠️ 管理复杂度增加
- ⚠️ 需要配置跨平台访问
- ⚠️ 故障排查困难

**适用场景：** 有多个云平台使用经验的团队

### 最终推荐：**方案 1 - 阿里云全家桶**

**理由：**
1. 阿里云认证服务功能完善，替代 Supabase Auth
2. RDS PostgreSQL 性能稳定，功能丰富
3. OSS 成本低，功能强大
4. 函数计算 FC 支持多种运行时
5. 与 EdgeOne Pages 配合，实现前后端分离

---

## 详细实施步骤

### 阶段 1：准备阶段（第 1 周）

#### 1.1 账户和权限准备
**任务清单：**
- [ ] 注册阿里云账户
- [ ] 完成实名认证
- [ ] 开通必要服务：
  - [ ] 阿里云 IDaaS（认证服务）
  - [ ] 阿里云 RDS PostgreSQL
  - [ ] 阿里云 OSS
  - [ ] 阿里云函数计算 FC
  - [ ] 阿里云 ARMS（监控服务）
- [ ] 创建 AccessKey（API 访问密钥）
- [ ] 配置 RAM 权限（访问控制）

**详细步骤：**

1. **注册阿里云账户**
   - 访问：https://www.aliyun.com
   - 点击"免费注册"
   - 填写注册信息
   - 完成手机验证和邮箱验证

2. **实名认证**
   - 登录阿里云控制台
   - 进入"账号中心" → "实名认证"
   - 选择"个人认证"或"企业认证"
   - 上传身份证件或企业证件
   - 等待审核（通常 1-2 个工作日）

3. **开通服务**
   - 访问：https://console.aliyun.com
   - 搜索并开通以下服务：
     - "IDaaS"（身份认证服务）
     - "RDS"（云数据库）
     - "OSS"（对象存储）
     - "函数计算"（Serverless 计算）
     - "ARMS"（应用实时监控）

4. **创建 AccessKey**
   - 访问：https://ram.console.aliyun.com/manage/ak
   - 点击"创建 AccessKey"
   - 选择"继续使用 AccessKey"
   - 保存 AccessKey ID 和 AccessKey Secret（只显示一次）

5. **配置 RAM 权限**
   - 访问：https://ram.console.aliyun.com/users
   - 创建子用户
   - 授予必要的权限：
     - AliyunRDSFullAccess（RDS 完全访问）
     - AliyunOSSFullAccess（OSS 完全访问）
     - AliyunFCFullAccess（函数计算完全访问）
     - AliyunIDaaSFullAccess（IDaaS 完全访问）

#### 1.2 数据备份
**任务清单：**
- [ ] 导出 Supabase 数据库结构和数据
- [ ] 备份用户数据和设置
- [ ] 备份 AI 配置信息
- [ ] 备份环境变量配置

**详细步骤：**

1. **导出 Supabase 数据库**
   ```sql
   -- 使用 pg_dump 导出数据库
   pg_dump -h db.ohqkqnhmgzqeqdsueiih.supabase.co \
           -U postgres \
           -d postgres \
           -F c \
           -f supabase_backup.dump
   ```

2. **备份用户数据**
   - 在 Supabase Dashboard 中：
     - 进入 "Authentication" → "Users"
     - 导出用户列表（CSV 格式）

3. **备份环境变量**
   ```bash
   # 备份 Vercel 环境变量
   vercel env pull .env.local
   ```

4. **保存配置信息**
   - 创建配置文档 `migration-config.md`：
     ```markdown
     # 迁移配置信息

     ## Supabase 配置
     - Project URL: https://ohqkqnhmgzqeqdsueiih.supabase.co
     - Anon Key: sb_publishable_AG0a_37OtsrePOc4aEp9Rw_z2Q_ZkWD

     ## 智谱 AI 配置
     - API Key: [你的智谱 API Key]
     - Model: glm-4

     ## Dify 配置
     - API Key: [你的 Dify API Key]
     - Question Workflow URL: [问题生成工作流 URL]
     - Correction Workflow URL: [批改工作流 URL]
     ```

#### 1.3 环境搭建
**任务清单：**
- [ ] 创建阿里云 RDS PostgreSQL 实例
- [ ] 创建阿里云 OSS 存储桶
- [ ] 配置阿里云 IDaaS 应用
- [ ] 创建阿里云函数计算服务
- [ ] 配置网络和安全组

**详细步骤：**

1. **创建 RDS PostgreSQL 实例**
   - 访问：https://rds.console.aliyun.com
   - 点击"创建实例"
   - 配置参数：
     - 数据库引擎：PostgreSQL
     - 版本：14 或 15
     - 实例规格：按需选择（建议 2核4GB 起步）
     - 存储空间：20GB 起步
     - VPC 网络：默认 VPC
     - 白名单设置：添加开发服务器 IP
   - 等待实例创建（约 5-10 分钟）

2. **创建 OSS 存储桶**
   - 访问：https://oss.console.aliyun.com
   - 点击"创建 Bucket"
   - 配置参数：
     - Bucket 名称：readrecall-files（全局唯一）
     - 区域：华东1（杭州）
     - 存储类型：标准存储
     - 读写权限：私有
   - 点击"确定"

3. **配置 IDaaS 应用**
   - 访问：https://idaas.console.aliyun.com
   - 点击"创建应用"
   - 应用类型：Web 应用
   - 应用名称：阅读回响
   - 回调地址：https://linyubo.top/auth/callback
   - 保存应用 ID 和密钥

4. **创建函数计算服务**
   - 访问：https://fc.console.aliyun.com
   - 点击"创建服务"
   - 服务名称：readrecall-api
   - 运行时：Node.js 20
   - VPC 网络：选择与 RDS 相同的 VPC

#### 1.4 代码准备
**任务清单：**
- [ ] 创建新的 Git 分支用于迁移
- [ ] 创建迁移配置文件
- [ ] 准备数据库迁移脚本
- [ ] 准备 API 适配代码

**详细步骤：**

1. **创建迁移分支**
   ```bash
   git checkout -b feature/migrate-to-aliyun
   ```

2. **创建迁移配置文件**
   ```typescript
   // src/config/aliyun.ts
   export const aliyunConfig = {
     rds: {
       host: process.env.VITE_ALIYUN_RDS_HOST,
       port: 5432,
       user: process.env.VITE_ALIYUN_RDS_USER,
       password: process.env.VITE_ALIYUN_RDS_PASSWORD,
       database: process.env.VITE_ALIYUN_RDS_DATABASE,
     },
     oss: {
       region: process.env.VITE_ALIYUN_OSS_REGION,
       accessKeyId: process.env.VITE_ALIYUN_OSS_ACCESS_KEY_ID,
       accessKeySecret: process.env.VITE_ALIYUN_OSS_ACCESS_KEY_SECRET,
       bucket: process.env.VITE_ALIYUN_OSS_BUCKET,
     },
     idaas: {
       clientId: process.env.VITE_ALIYUN_IDAAS_CLIENT_ID,
       clientSecret: process.env.VITE_ALIYUN_IDAAS_CLIENT_SECRET,
       redirectUri: process.env.VITE_ALIYUN_IDAAS_REDIRECT_URI,
     },
   };
   ```

3. **准备数据库迁移脚本**
   ```sql
   -- supabase/migrations/001_initial_schema_aliyun.sql
   -- 与 Supabase 相同的数据库结构
   ```

---

### 阶段 2：核心服务迁移（第 2-3 周）

#### 2.1 数据库迁移
**任务清单：**
- [ ] 创建数据库表结构
- [ ] 导入数据
- [ ] 配置数据库连接
- [ ] 测试数据库操作

**详细步骤：**

1. **创建数据库表结构**
   ```sql
   -- 在阿里云 RDS 中执行以下 SQL

   -- 创建扩展
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- 创建用户表（如果不存在）
   CREATE TABLE IF NOT EXISTS users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 创建书籍表
   CREATE TABLE IF NOT EXISTS books (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     author TEXT,
     cover_url TEXT,
     description TEXT,
     question_count INTEGER DEFAULT 0,
     mastered_count INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 创建问题表
   CREATE TABLE IF NOT EXISTS questions (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
     user_id UUID NOT NULL REFERENCES users(id),
     question TEXT NOT NULL,
     answer TEXT,
     type TEXT DEFAULT 'standard',
     difficulty INTEGER DEFAULT 1,
     mastered BOOLEAN DEFAULT FALSE,
     last_reviewed_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 创建用户设置表
   CREATE TABLE IF NOT EXISTS user_settings (
     user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
     dark_mode BOOLEAN DEFAULT FALSE,
     zhipu_api_key TEXT,
     zhipu_model TEXT DEFAULT 'glm-4',
     dify_api_key TEXT,
     question_workflow_url TEXT,
     correction_workflow_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 创建索引
   CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
   CREATE INDEX IF NOT EXISTS idx_questions_book_id ON questions(book_id);
   CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
   ```

2. **导入数据**
   ```bash
   # 使用 pg_restore 导入数据
   pg_restore -h <RDS_HOST> \
              -U <RDS_USER> \
              -d <RDS_DATABASE> \
              -f supabase_backup.dump
   ```

3. **配置数据库连接**
   ```typescript
   // src/lib/aliyun-db.ts
   import { Pool } from 'pg';

   const pool = new Pool({
     host: process.env.VITE_ALIYUN_RDS_HOST,
     port: 5432,
     user: process.env.VITE_ALIYUN_RDS_USER,
     password: process.env.VITE_ALIYUN_RDS_PASSWORD,
     database: process.env.VITE_ALIYUN_RDS_DATABASE,
   });

   export const query = async (text: string, params?: any[]) => {
     const start = Date.now();
     try {
       const res = await pool.query(text, params);
       const duration = Date.now() - start;
       console.log('Executed query', { text, duration, rows: res.rowCount });
       return res;
     } catch (error) {
       console.error('Database query error', error);
       throw error;
     }
   };

   export default pool;
   ```

4. **测试数据库操作**
   ```typescript
   // src/services/aliyunDatabase.ts
   import { query } from '../lib/aliyun-db';

   export class AliyunDatabaseService {
     async testConnection() {
       try {
         const result = await query('SELECT NOW()');
         console.log('Database connection successful:', result.rows[0]);
         return true;
       } catch (error) {
         console.error('Database connection failed:', error);
         return false;
       }
     }

     async getAllBooks(userId: string) {
       const result = await query(
         'SELECT * FROM books WHERE user_id = $1 ORDER BY created_at DESC',
         [userId]
       );
       return result.rows;
     }

     // ... 其他数据库操作方法
   }
   ```

#### 2.2 认证服务迁移
**任务清单：**
- [ ] 配置阿里云 IDaaS
- [ ] 实现认证服务类
- [ ] 迁移用户数据
- [ ] 测试认证流程

**详细步骤：**

1. **配置阿里云 IDaaS**
   - 在 IDaaS 控制台：
     - 创建应用：阅读回响
     - 配置回调地址：https://linyubo.top/auth/callback
     - 启用邮箱密码登录
     - 启用注册功能
     - 配置 JWT 签名密钥

2. **实现认证服务类**
   ```typescript
   // src/services/aliyunAuth.ts
   export class AliyunAuthService {
     private currentUser: AuthUser | null = null;
     private listeners: ((user: AuthUser | null) => void)[] = [];

     constructor() {
       this.initializeAuth();
     }

     private async initializeAuth() {
       // 从 localStorage 获取 token
       const token = localStorage.getItem('aliyun_token');
       if (token) {
         try {
           const user = await this.verifyToken(token);
           this.currentUser = user;
           this.notifyListeners(user);
         } catch (error) {
           localStorage.removeItem('aliyun_token');
         }
       }
     }

     async signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
       try {
         const response = await fetch('https://idaas.aliyuncs.com/api/v1/signup', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, password }),
         });

         const data = await response.json();

         if (data.error) {
           return { user: null, error: { message: data.error.message } };
         }

         this.currentUser = data.user;
         localStorage.setItem('aliyun_token', data.token);
         this.notifyListeners(data.user);

         return { user: data.user, error: null };
       } catch (error) {
         return {
           user: null,
           error: { message: error instanceof Error ? error.message : '注册失败' },
         };
       }
     }

     async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
       try {
         const response = await fetch('https://idaas.aliyuncs.com/api/v1/signin', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, password }),
         });

         const data = await response.json();

         if (data.error) {
           return { user: null, error: { message: data.error.message } };
         }

         this.currentUser = data.user;
         localStorage.setItem('aliyun_token', data.token);
         this.notifyListeners(data.user);

         return { user: data.user, error: null };
       } catch (error) {
         return {
           user: null,
           error: { message: error instanceof Error ? error.message : '登录失败' },
         };
       }
     }

     async signOut(): Promise<{ error: AuthError | null }> {
       try {
         localStorage.removeItem('aliyun_token');
         this.currentUser = null;
         this.notifyListeners(null);
         return { error: null };
       } catch (error) {
         return {
           error: { message: error instanceof Error ? error.message : '登出失败' },
         };
       }
     }

     onAuthChange(callback: (user: AuthUser | null) => void) {
       this.listeners.push(callback);
       return () => {
         this.listeners = this.listeners.filter(l => l !== callback);
       };
     }

     private notifyListeners(user: AuthUser | null) {
       this.listeners.forEach(listener => listener(user));
     }

     private async verifyToken(token: string): Promise<AuthUser> {
       const response = await fetch('https://idaas.aliyuncs.com/api/v1/verify', {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${token}` },
       });

       const data = await response.json();
       return data.user;
     }

     isAuthenticated(): boolean {
       return this.currentUser !== null;
     }

    getCurrentUser(): AuthUser | null {
      return this.currentUser;
    }
   }

   export const aliyunAuthService = new AliyunAuthService();
   ```

3. **迁移用户数据**
   ```sql
   -- 从 Supabase 导出用户数据
   -- 在阿里云 RDS 中导入
   INSERT INTO users (id, email, password_hash, created_at, updated_at)
   SELECT id, email, encrypted_password, created_at, updated_at
   FROM supabase_users;
   ```

4. **测试认证流程**
   - 测试注册功能
   - 测试登录功能
   - 测试登出功能
   - 测试会话保持

#### 2.3 存储服务迁移
**任务清单：**
- [ ] 配置阿里云 OSS
- [ ] 实现文件上传下载功能
- [ ] 迁移现有文件
- [ ] 测试文件操作

**详细步骤：**

1. **配置阿里云 OSS**
   ```typescript
   // src/lib/aliyun-oss.ts
   import OSS from 'ali-oss';

   const client = new OSS({
     region: process.env.VITE_ALIYUN_OSS_REGION,
     accessKeyId: process.env.VITE_ALIYUN_OSS_ACCESS_KEY_ID,
     accessKeySecret: process.env.VITE_ALIYUN_OSS_ACCESS_KEY_SECRET,
     bucket: process.env.VITE_ALIYUN_OSS_BUCKET,
   });

   export default client;
   ```

2. **实现文件上传下载功能**
   ```typescript
   // src/services/aliyunStorage.ts
   import client from '../lib/aliyun-oss';

   export class AliyunStorageService {
     async uploadFile(fileName: string, file: File): Promise<{ url: string; error: string | null }> {
       try {
         const result = await client.put(fileName, file);
         return { url: result.url, error: null };
       } catch (error) {
         return {
           url: '',
           error: error instanceof Error ? error.message : '上传失败',
         };
       }
     }

     async downloadFile(fileName: string): Promise<{ data: any; error: string | null }> {
       try {
         const result = await client.get(fileName);
         return { data: result.content, error: null };
       } catch (error) {
         return {
           data: null,
           error: error instanceof Error ? error.message : '下载失败',
         };
       }
     }

     async deleteFile(fileName: string): Promise<{ error: string | null }> {
       try {
         await client.delete(fileName);
         return { error: null };
       } catch (error) {
         return {
           error: error instanceof Error ? error.message : '删除失败',
         };
       }
     }
   }

   export const aliyunStorageService = new AliyunStorageService();
   ```

3. **迁移现有文件**
   ```bash
   # 从 Supabase Storage 下载所有文件
   # 上传到阿里云 OSS
   ```

4. **测试文件操作**
   - 测试文件上传
   - 测试文件下载
   - 测试文件删除
   - 测试文件访问权限

---

### 阶段 3：前端适配（第 4 周）

#### 3.1 API 适配
**任务清单：**
- [ ] 更新认证服务调用
- [ ] 更新数据库服务调用
- [ ] 更新存储服务调用
- [ ] 统一错误处理

**详细步骤：**

1. **更新认证服务调用**
   ```typescript
   // src/App.tsx
   // 修改前
   import { authService } from './services/supabaseAuth';

   // 修改后
   import { aliyunAuthService } from './services/aliyunAuth';

   function AppContent() {
     const [isAuthenticated, setIsAuthenticated] = useState(false);

     useEffect(() => {
       const unsubscribe = aliyunAuthService.onAuthChange((user) => {
         setIsAuthenticated(!!user);
       });

       return () => unsubscribe();
     }, []);

     // ...
   }
   ```

2. **更新数据库服务调用**
   ```typescript
   // src/hooks/AppProvider.tsx
   // 修改前
   import { databaseService } from '../services/database';

   // 修改后
   import { aliyunDatabaseService } from '../services/aliyunDatabase';

   export function AppProvider({ children }: { children: React.ReactNode }) {
     const [userId, setUserId] = useState<string | null>(null);

     useEffect(() => {
       const user = aliyunAuthService.getCurrentUser();
       if (user) {
         setUserId(user.id);
         aliyunDatabaseService.setUserId(user.id);
       }
     }, []);

     // ...
   }
   ```

3. **更新存储服务调用**
   ```typescript
   // src/components/BookDetail.tsx
   // 修改前
   import { supabase } from '../lib/supabase';

   const handleUploadCover = async (file: File) => {
     const { data, error } = await supabase.storage
       .from('book-covers')
       .upload(`${userId}/${bookId}/${file.name}`, file);
   };

   // 修改后
   import { aliyunStorageService } from '../services/aliyunStorage';

   const handleUploadCover = async (file: File) => {
     const { url, error } = await aliyunStorageService.uploadFile(
       `${userId}/${bookId}/${file.name}`,
       file
     );
   };
   ```

4. **统一错误处理**
   ```typescript
   // src/utils/errorHandler.ts
   export const handleError = (error: any): string => {
     if (error.response) {
       // 阿里云 API 错误
       return error.response.data.message || '请求失败';
     } else if (error.request) {
       // 网络错误
       return '网络连接失败，请检查网络设置';
     } else {
       // 其他错误
       return error.message || '未知错误';
     }
   };
   ```

#### 3.2 环境变量更新
**任务清单：**
- [ ] 更新本地环境变量
- [ ] 更新 EdgeOne Pages 环境变量
- [ ] 验证环境变量加载

**详细步骤：**

1. **更新本地环境变量**
   ```bash
   # .env.local
   VITE_ALIYUN_RDS_HOST=your-rds-host.rds.aliyuncs.com
   VITE_ALIYUN_RDS_PORT=5432
   VITE_ALIYUN_RDS_USER=your-rds-user
   VITE_ALIYUN_RDS_PASSWORD=your-rds-password
   VITE_ALIYUN_RDS_DATABASE=readrecall

   VITE_ALIYUN_OSS_REGION=oss-cn-hangzhou
   VITE_ALIYUN_OSS_ACCESS_KEY_ID=your-oss-access-key-id
   VITE_ALIYUN_OSS_ACCESS_KEY_SECRET=your-oss-access-key-secret
   VITE_ALIYUN_OSS_BUCKET=readrecall-files

   VITE_ALIYUN_IDAAS_CLIENT_ID=your-idaas-client-id
   VITE_ALIYUN_IDAAS_CLIENT_SECRET=your-idaas-client-secret
   VITE_ALIYUN_IDAAS_REDIRECT_URI=https://linyubo.top/auth/callback
   ```

2. **更新 EdgeOne Pages 环境变量**
   - 访问 EdgeOne Pages 控制台
   - 进入项目设置
   - 添加上述环境变量

3. **验证环境变量加载**
   ```typescript
   // src/utils/env.ts
   export const validateEnv = () => {
     const requiredVars = [
       'VITE_ALIYUN_RDS_HOST',
       'VITE_ALIYUN_RDS_USER',
       'VITE_ALIYUN_RDS_PASSWORD',
       'VITE_ALIYUN_RDS_DATABASE',
       'VITE_ALIYUN_OSS_REGION',
       'VITE_ALIYUN_OSS_ACCESS_KEY_ID',
       'VITE_ALIYUN_OSS_ACCESS_KEY_SECRET',
       'VITE_ALIYUN_OSS_BUCKET',
       'VITE_ALIYUN_IDAAS_CLIENT_ID',
       'VITE_ALIYUN_IDAAS_CLIENT_SECRET',
     ];

     const missing = requiredVars.filter(v => !import.meta.env[v]);
     if (missing.length > 0) {
       throw new Error(`Missing environment variables: ${missing.join(', ')}`);
     }
   };

   // 在应用启动时调用
   import { validateEnv } from './utils/env';
   validateEnv();
   ```

#### 3.3 功能测试
**任务清单：**
- [ ] 测试用户认证流程
- [ ] 测试书籍管理功能
- [ ] 测试问题管理功能
- [ ] 测试练习模式功能
- [ ] 测试 AI 辅助功能
- [ ] 测试设置管理功能

**详细测试用例：**

1. **用户认证流程测试**
   - [ ] 注册新用户
   - [ ] 使用错误密码登录
   - [ ] 使用正确密码登录
   - [ ] 登出后重新登录
   - [ ] 刷新页面后保持登录状态

2. **书籍管理功能测试**
   - [ ] 添加新书籍
   - [ ] 编辑书籍信息
   - [ ] 删除书籍
   - [ ] 上传书籍封面
   - [ ] 查看书籍列表

3. **问题管理功能测试**
   - [ ] 添加新问题
   - [ ] 编辑问题
   - [ ] 删除问题
   - [ ] 批量删除问题
   - [ ] AI 生成问题

4. **练习模式功能测试**
   - [ ] 标准练习模式
   - [ ] 概念练习模式
   - [ ] 错题练习模式
   - [ ] 标记已掌握
   - [ ] 查看练习统计

5. **AI 辅助功能测试**
   - [ ] AI 生成问题
   - [ ] AI 批改答案
   - [ ] AI 生成建议

6. **设置管理功能测试**
   - [ ] 切换深色/浅色模式
   - [ ] 配置智谱 API Key
   - [ ] 配置 Dify API Key
   - [ ] 测试 API 连接

---

### 阶段 4：部署和监控（第 5 周）

#### 4.1 重新部署
**任务清单：**
- [ ] 构建前端应用
- [ ] 部署到 EdgeOne Pages
- [ ] 配置自定义域名
- [ ] 验证部署成功

**详细步骤：**

1. **构建前端应用**
   ```bash
   # 安装依赖
   npm install

   # 构建生产版本
   npm run build

   # 本地预览
   npm run preview
   ```

2. **部署到 EdgeOne Pages**
   - 方法 1：通过 GitHub 自动部署
     - 推送代码到 GitHub
     - EdgeOne Pages 自动触发构建
     - 等待构建完成

   - 方法 2：通过 CLI 手动部署
     ```bash
     npm install -g @tencentcloud/edgeone-cli
     edgeone login
     edgeone deploy --prod
     ```

3. **配置自定义域名**
   - 在 EdgeOne Pages 控制台：
     - 添加域名：linyubo.top
     - 配置 DNS 记录：
       ```
       类型: CNAME
       主机记录: @
       记录值: [EdgeOne 提供的域名]
       ```
   - 等待 DNS 生效（5-10 分钟）

4. **验证部署成功**
   ```bash
   # 检查 DNS 解析
   nslookup linyubo.top

   # 访问网站
   curl https://linyubo.top

   # 检查 HTTPS 证书
   openssl s_client -connect linyubo.top:443
   ```

#### 4.2 监控配置
**任务清单：**
- [ ] 配置阿里云 ARMS 监控
- [ ] 配置告警规则
- [ ] 配置日志服务
- [ ] 配置性能监控

**详细步骤：**

1. **配置阿里云 ARMS 监控**
   - 访问：https://arms.console.aliyun.com
   - 创建应用监控
   - 配置监控指标：
     - 页面加载时间
     - API 响应时间
     - 错误率
     - 用户活跃度

2. **配置告警规则**
   ```javascript
   // 告警规则示例
   const alertRules = [
     {
       name: 'API 响应时间过长',
       condition: 'api_response_time > 3000ms',
       duration: '5m',
       severity: 'warning',
     },
     {
       name: '错误率过高',
       condition: 'error_rate > 5%',
       duration: '10m',
       severity: 'critical',
     },
     {
       name: '数据库连接失败',
       condition: 'db_connection_failed',
       duration: '1m',
       severity: 'critical',
     },
   ];
   ```

3. **配置日志服务**
   - 访问：https://sls.console.aliyun.com
   - 创建日志项目
   - 配置日志采集：
     - 前端日志
     - API 日志
     - 数据库日志
     - 错误日志

4. **配置性能监控**
   - 使用阿里云 ARMS APM
   - 监控关键性能指标：
     - 首次内容绘制（FCP）
     - 最大内容绘制（LCP）
     - 首次输入延迟（FID）
     - 累积布局偏移（CLS）

---

### 阶段 5：上线切换（第 6 周）

#### 5.1 灰度发布
**任务清单：**
- [ ] 配置灰度发布策略
- [ ] 选择灰度用户
- [ ] 监控灰度效果
- [ ] 逐步扩大灰度范围

**详细步骤：**

1. **配置灰度发布策略**
   ```typescript
   // src/utils/featureFlag.ts
   export const isAliyunEnabled = (userId: string): boolean => {
     // 基于用户 ID 的哈希值决定是否使用阿里云
     const hash = userId.split('').reduce((acc, char) => {
       return ((acc << 5) - acc) + char.charCodeAt(0);
     }, 0);

     // 10% 的用户使用阿里云
     return Math.abs(hash) % 10 === 0;
   };
   ```

2. **选择灰度用户**
   - 选择内部测试用户
   - 选择活跃用户
   - 选择新注册用户

3. **监控灰度效果**
   - 监控错误率
   - 监控性能指标
   - 收集用户反馈

4. **逐步扩大灰度范围**
   - 第一周：10% 用户
   - 第二周：30% 用户
   - 第三周：50% 用户
   - 第四周：100% 用户

#### 5.2 全量切换
**任务清单：**
- [ ] 确认灰度发布成功
- [ ] 更新 DNS 记录
- [ ] 验证全量访问
- [ ] 监控系统状态

**详细步骤：**

1. **确认灰度发布成功**
   - 错误率低于 0.1%
   - 性能指标正常
   - 用户反馈良好

2. **更新 DNS 记录**
   - 在域名注册商处：
     ```
     类型: CNAME
     主机记录: @
     记录值: [EdgeOne 提供的域名]
     TTL: 600
     ```

3. **验证全量访问**
   ```bash
   # 检查 DNS 解析
   dig linyubo.top

   # 访问网站
   curl -I https://linyubo.top

   # 检查 SSL 证书
   openssl s_client -connect linyubo.top:443 -servername linyubo.top
   ```

4. **监控系统状态**
   - 监控错误率
   - 监控性能指标
   - 监控用户活跃度
   - 监控资源使用情况

#### 5.3 旧环境下线
**任务清单：**
- [ ] 备份 Supabase 数据
- [ ] 停止 Supabase 服务
- [ ] 取消 Vercel 订阅
- [ ] 清理旧资源

**详细步骤：**

1. **备份 Supabase 数据**
   ```bash
   # 最终备份
   pg_dump -h db.ohqkqnhmgzqeqdsueiih.supabase.co \
           -U postgres \
           -d postgres \
           -F c \
           -f supabase_final_backup.dump
   ```

2. **停止 Supabase 服务**
   - 在 Supabase Dashboard 中：
     - 暂停项目
     - 保留数据 30 天

3. **取消 Vercel 订阅**
   - 在 Vercel Dashboard 中：
     - 删除项目
     - 取消订阅

4. **清理旧资源**
   - 删除 Vercel 项目
   - 删除 Supabase 项目
   - 清理相关配置

---

## 时间规划

### 总体时间表（6 周）

| 阶段 | 时间 | 主要任务 | 里程碑 |
|------|------|---------|--------|
| **阶段 1：准备阶段** | 第 1 周 | 账户准备、数据备份、环境搭建 | ✅ 完成所有准备工作 |
| **阶段 2：核心服务迁移** | 第 2-3 周 | 数据库迁移、认证服务迁移、存储服务迁移 | ✅ 核心服务迁移完成 |
| **阶段 3：前端适配** | 第 4 周 | API 适配、环境变量更新、功能测试 | ✅ 前端适配完成并通过测试 |
| **阶段 4：部署和监控** | 第 5 周 | 重新部署、监控配置 | ✅ 部署成功，监控正常运行 |
| **阶段 5：上线切换** | 第 6 周 | 灰度发布、全量切换、旧环境下线 | ✅ 完全切换到阿里云 |

### 详细甘特图

```
周次  1  2  3  4  5  6
      │  │  │  │  │  │
账户  ████████
      │
备份  ████████
      │
环境  ████████
      │
数据库    ████████████
          │
认证      ████████████
          │
存储      ████████████
          │
API适配          ████████████
                  │
环境变量          ████████████
                  │
功能测试          ████████████
                  │
重新部署              ████████████
                      │
监控配置              ████████████
                      │
灰度发布                  ████████████
                          │
全量切换                  ████████████
                          │
旧环境下线                  ████████████
```

---

## 风险评估

### 风险识别

| 风险类型 | 风险描述 | 影响程度 | 发生概率 | 风险等级 |
|---------|---------|---------|---------|---------|
| **数据丢失** | 迁移过程中数据丢失或损坏 | 高 | 低 | 中 |
| **服务中断** | 迁移过程中服务不可用 | 高 | 中 | 高 |
| **性能下降** | 新环境性能不如预期 | 中 | 中 | 中 |
| **兼容性问题** | 代码与新服务不兼容 | 高 | 中 | 高 |
| **成本超支** | 新服务成本超出预算 | 中 | 低 | 低 |
| **安全问题** | 数据泄露或安全漏洞 | 高 | 低 | 中 |
| **时间延误** | 迁移时间超出预期 | 中 | 中 | 中 |
| **用户流失** | 迁移过程中用户体验下降 | 高 | 低 | 中 |

### 风险应对策略

#### 高风险应对

1. **服务中断**
   - **预防措施**：
     - 选择低峰期进行切换
     - 提前进行多次演练
     - 准备回滚方案
   - **应急预案**：
     - 立即回滚到 Supabase
     - 通知用户服务维护
     - 提供 FAQ 和帮助文档

2. **兼容性问题**
   - **预防措施**：
     - 在测试环境充分测试
     - 进行代码审查
     - 准备兼容性补丁
   - **应急预案**：
     - 快速修复兼容性问题
     - 发布热修复版本
     - 提供临时解决方案

#### 中风险应对

1. **性能下降**
   - **预防措施**：
     - 进行性能测试
     - 优化数据库查询
     - 使用 CDN 加速
   - **应急预案**：
     - 升级服务器配置
     - 优化代码和数据库
     - 使用缓存策略

2. **时间延误**
   - **预防措施**：
     - 制定详细计划
     - 设置里程碑
     - 预留缓冲时间
   - **应急预案**：
     - 调整优先级
     - 增加人力资源
     - 延长迁移周期

#### 低风险应对

1. **成本超支**
   - **预防措施**：
     - 制定预算
     - 监控资源使用
     - 选择合适的套餐
   - **应急预案**：
     - 优化资源配置
     - 切换到更便宜的套餐
     - 申请折扣或优惠

2. **安全问题**
   - **预防措施**：
     - 进行安全审计
     - 使用加密传输
     - 配置防火墙
   - **应急预案**：
     - 立即修复安全漏洞
     - 通知受影响用户
     - 加强安全措施

---

## 回滚方案

### 回滚触发条件

在以下情况下，立即触发回滚：
- ❌ 错误率超过 5%
- ❌ API 响应时间超过 5 秒
- ❌ 数据丢失或损坏
- ❌ 严重安全漏洞
- ❌ 用户投诉激增
- ❌ 关键功能不可用

### 回滚步骤

#### 快速回滚（DNS 切换）
**预计时间：5-10 分钟**

1. **更新 DNS 记录**
   ```bash
   # 在域名注册商处更新 DNS
   类型: CNAME
   主机记录: @
   记录值: [Vercel 提供的域名]
   TTL: 60
   ```

2. **验证 DNS 生效**
   ```bash
   # 检查 DNS 解析
   dig linyubo.top

   # 访问网站
   curl https://linyubo.top
   ```

3. **通知用户**
   - 在应用内显示通知
   - 发送邮件通知
   - 更新状态页面

#### 完整回滚（代码 + 数据）
**预计时间：30-60 分钟**

1. **回滚代码**
   ```bash
   # 切换回 Supabase 分支
   git checkout main

   # 更新环境变量
   # 恢复 Supabase 配置

   # 重新部署
   npm run build
   edgeone deploy --prod
   ```

2. **回滚数据**
   ```bash
   # 从备份恢复数据
   pg_restore -h db.ohqkqnhmgzqeqdsueiih.supabase.co \
              -U postgres \
              -d postgres \
              -f supabase_final_backup.dump
   ```

3. **验证功能**
   - 测试登录功能
   - 测试数据访问
   - 测试关键功能

4. **通知用户**
   - 发送邮件通知
   - 更新状态页面
   - 提供补偿措施

### 回滚验证清单

- [ ] DNS 解析正确
- [ ] 网站可正常访问
- [ ] 用户可以登录
- [ ] 数据完整性检查通过
- [ ] 关键功能正常
- [ ] 性能指标正常
- [ ] 错误率低于阈值
- [ ] 用户反馈正常

---

## 验证测试

### 测试策略

#### 1. 单元测试
```typescript
// src/services/__tests__/aliyunAuth.test.ts
import { aliyunAuthService } from '../aliyunAuth';

describe('AliyunAuthService', () => {
  test('should sign up a new user', async () => {
    const { user, error } = await aliyunAuthService.signUp(
      'test@example.com',
      'password123'
    );
    expect(error).toBeNull();
    expect(user).not.toBeNull();
    expect(user?.email).toBe('test@example.com');
  });

  test('should sign in an existing user', async () => {
    const { user, error } = await aliyunAuthService.signIn(
      'test@example.com',
      'password123'
    );
    expect(error).toBeNull();
    expect(user).not.toBeNull();
  });

  test('should sign out a user', async () => {
    const { error } = await aliyunAuthService.signOut();
    expect(error).toBeNull();
    expect(aliyunAuthService.isAuthenticated()).toBe(false);
  });
});
```

#### 2. 集成测试
```typescript
// src/integration/__tests__/fullFlow.test.ts
import { aliyunAuthService } from '../../services/aliyunAuth';
import { aliyunDatabaseService } from '../../services/aliyunDatabase';

describe('Full User Flow', () => {
  test('should complete full user journey', async () => {
    // 1. 注册用户
    const { user } = await aliyunAuthService.signUp(
      'integration@example.com',
      'password123'
    );
    expect(user).not.toBeNull();

    // 2. 添加书籍
    const book = await aliyunDatabaseService.createBook(user!.id, {
      title: '测试书籍',
      author: '测试作者',
    });
    expect(book).not.toBeNull();

    // 3. 添加问题
    const question = await aliyunDatabaseService.createQuestion(user!.id, book!.id, {
      question: '测试问题',
      answer: '测试答案',
    });
    expect(question).not.toBeNull();

    // 4. 登出
    await aliyunAuthService.signOut();
    expect(aliyunAuthService.isAuthenticated()).toBe(false);
  });
});
```

#### 3. 性能测试
```typescript
// src/performance/__tests__/apiPerformance.test.ts
describe('API Performance', () => {
  test('should respond within 1 second', async () => {
    const start = Date.now();
    await aliyunDatabaseService.getAllBooks('test-user-id');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });

  test('should handle concurrent requests', async () => {
    const requests = Array(100).fill(null).map(() =>
      aliyunDatabaseService.getAllBooks('test-user-id')
    );
    const results = await Promise.all(requests);
    expect(results).toHaveLength(100);
  });
});
```

#### 4. 安全测试
```typescript
// src/security/__tests__/authSecurity.test.ts
describe('Authentication Security', () => {
  test('should reject weak passwords', async () => {
    const { error } = await aliyunAuthService.signUp(
      'test@example.com',
      '123'
    );
    expect(error).not.toBeNull();
    expect(error?.message).toContain('密码');
  });

  test('should reject duplicate email', async () => {
    await aliyunAuthService.signUp('test@example.com', 'password123');
    const { error } = await aliyunAuthService.signUp(
      'test@example.com',
      'password456'
    );
    expect(error).not.toBeNull();
    expect(error?.message).toContain('已被注册');
  });
});
```

### 测试执行计划

| 测试类型 | 执行时间 | 负责人 | 通过标准 |
|---------|---------|--------|---------|
| **单元测试** | 第 4 周 | 开发人员 | 100% 通过 |
| **集成测试** | 第 4 周 | 开发人员 | 100% 通过 |
| **性能测试** | 第 4 周 | 开发人员 | 满足性能要求 |
| **安全测试** | 第 4 周 | 安全工程师 | 无高危漏洞 |
| **用户验收测试** | 第 5 周 | 产品经理 | 满足用户需求 |

---

## 上线切换

### 切换前检查清单

#### 技术检查
- [ ] 所有测试通过
- [ ] 性能指标达标
- [ ] 安全扫描通过
- [ ] 监控配置完成
- [ ] 日志配置完成
- [ ] 备份完成
- [ ] 回滚方案准备就绪

#### 业务检查
- [ ] 功能验证完成
- [ ] 用户文档更新
- [ ] 帮助文档更新
- [ ] FAQ 更新
- [ ] 客服培训完成
- [ ] 用户通知准备

#### 运营检查
- [ ] 监控告警配置
- [ ] 运维文档更新
- [ ] 应急预案准备
- [ ] 团队值班安排
- [ ] 沟通渠道畅通

### 切换流程

#### 切换前（T-1 天）
1. **最终检查**
   - 确认所有检查项完成
   - 召开切换前会议
   - 确认切换时间窗口

2. **数据同步**
   - 最后一次数据同步
   - 验证数据一致性
   - 备份最终数据

3. **通知准备**
   - 准备用户通知
   - 准备状态页面
   - 准备 FAQ

#### 切换中（T 日）
1. **灰度发布（10:00-12:00）**
   - 开启 10% 流量
   - 监控关键指标
   - 收集用户反馈

2. **扩大灰度（14:00-16:00）**
   - 扩大到 50% 流量
   - 持续监控
   - 准备应急预案

3. **全量切换（18:00-20:00）**
   - 切换 100% 流量
   - 全面监控
   - 验证所有功能

#### 切换后（T+1 天）
1. **持续监控**
   - 监控错误率
   - 监控性能指标
   - 监控用户反馈

2. **问题处理**
   - 快速响应问题
   - 及时修复 bug
   - 更新文档

3. **总结复盘**
   - 总结切换过程
   - 分析问题原因
   - 制定改进措施

### 切换后验证

#### 功能验证
- [ ] 用户可以注册
- [ ] 用户可以登录
- [ ] 数据正常显示
- [ ] 功能正常使用
- [ ] 性能满足要求

#### 性能验证
- [ ] 页面加载时间 < 2 秒
- [ ] API 响应时间 < 500ms
- [ ] 错误率 < 0.1%
- [ ] 并发支持 > 1000

#### 安全验证
- [ ] 数据传输加密
- [ ] 用户数据隔离
- [ ] 权限控制正确
- [ ] 无安全漏洞

---

## 附录

### A. 环境变量清单

```bash
# 阿里云 RDS 配置
VITE_ALIYUN_RDS_HOST=your-rds-host.rds.aliyuncs.com
VITE_ALIYUN_RDS_PORT=5432
VITE_ALIYUN_RDS_USER=your-rds-user
VITE_ALIYUN_RDS_PASSWORD=your-rds-password
VITE_ALIYUN_RDS_DATABASE=readrecall

# 阿里云 OSS 配置
VITE_ALIYUN_OSS_REGION=oss-cn-hangzhou
VITE_ALIYUN_OSS_ACCESS_KEY_ID=your-oss-access-key-id
VITE_ALIYUN_OSS_ACCESS_KEY_SECRET=your-oss-access-key-secret
VITE_ALIYUN_OSS_BUCKET=readrecall-files

# 阿里云 IDaaS 配置
VITE_ALIYUN_IDAAS_CLIENT_ID=your-idaas-client-id
VITE_ALIYUN_IDAAS_CLIENT_SECRET=your-idaas-client-secret
VITE_ALIYUN_IDAAS_REDIRECT_URI=https://linyubo.top/auth/callback

# 智谱 AI 配置（保持不变）
VITE_ZHIPU_API_KEY=your-zhipu-api-key
VITE_ZHIPU_MODEL=glm-4

# Dify 配置（保持不变）
VITE_DIFY_API_KEY=your-dify-api-key
VITE_DIFY_QUESTION_WORKFLOW_URL=your-dify-question-workflow-url
VITE_DIFY_CORRECTION_WORKFLOW_URL=your-dify-correction-workflow-url
```

### B. 数据库迁移脚本

```sql
-- supabase/migrations/001_initial_schema_aliyun.sql

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建书籍表
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  description TEXT,
  question_count INTEGER DEFAULT 0,
  mastered_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建问题表
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  question TEXT NOT NULL,
  answer TEXT,
  type TEXT DEFAULT 'standard',
  difficulty INTEGER DEFAULT 1,
  mastered BOOLEAN DEFAULT FALSE,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dark_mode BOOLEAN DEFAULT FALSE,
  zhipu_api_key TEXT,
  zhipu_model TEXT DEFAULT 'glm-4',
  dify_api_key TEXT,
  question_workflow_url TEXT,
  correction_workflow_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_book_id ON questions(book_id);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_mastered ON questions(mastered);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);

-- 创建触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### C. API 接口文档

#### 认证接口

**注册用户**
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt-token"
}
```

**登录用户**
```
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt-token"
}
```

**登出用户**
```
POST /api/auth/signout
Authorization: Bearer jwt-token

Response:
{
  "success": true
}
```

#### 数据库接口

**获取所有书籍**
```
GET /api/books
Authorization: Bearer jwt-token

Response:
{
  "books": [
    {
      "id": "uuid",
      "title": "书籍标题",
      "author": "作者",
      "coverUrl": "封面URL",
      "description": "描述",
      "questionCount": 10,
      "masteredCount": 5,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**创建书籍**
```
POST /api/books
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "title": "书籍标题",
  "author": "作者",
  "coverUrl": "封面URL",
  "description": "描述"
}

Response:
{
  "book": {
    "id": "uuid",
    "title": "书籍标题",
    "author": "作者",
    "coverUrl": "封面URL",
    "description": "描述",
    "questionCount": 0,
    "masteredCount": 0,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

### D. 监控指标

#### 关键性能指标（KPI）

| 指标 | 目标值 | 告警阈值 | 说明 |
|------|--------|---------|------|
| **页面加载时间** | < 2s | > 3s | 首页加载时间 |
| **API 响应时间** | < 500ms | > 1s | API 平均响应时间 |
| **错误率** | < 0.1% | > 1% | 请求错误率 |
| **可用性** | > 99.9% | < 99.5% | 服务可用性 |
| **并发用户数** | > 1000 | < 500 | 同时在线用户数 |

#### 业务指标

| 指标 | 目标值 | 监控频率 | 说明 |
|------|--------|---------|------|
| **日活跃用户（DAU）** | > 100 | 每日 | 每日活跃用户数 |
| **月活跃用户（MAU）** | > 500 | 每月 | 每月活跃用户数 |
| **用户留存率** | > 30% | 每月 | 7日留存率 |
| **平均会话时长** | > 10min | 每日 | 用户平均使用时长 |
| **问题完成率** | > 80% | 每日 | 问题完成比例 |

### E. 联系方式

#### 技术支持
- **阿里云技术支持**：95187
- **腾讯云技术支持**：95081
- **智谱 AI 技术支持**：https://open.bigmodel.cn/support

#### 项目团队
- **项目负责人**：[姓名]
- **技术负责人**：[姓名]
- **运维负责人**：[姓名]

---

## 总结

本迁移实施计划详细描述了将"阅读回响"项目从 Supabase 迁移到阿里云服务的完整流程。通过分阶段、有计划的迁移，可以最大程度地降低风险，确保迁移成功。

### 关键成功因素
1. **充分的准备工作**：数据备份、环境搭建、代码准备
2. **详细的测试验证**：单元测试、集成测试、性能测试、安全测试
3. **完善的监控告警**：实时监控、及时告警、快速响应
4. **灵活的回滚方案**：快速回滚、数据恢复、服务恢复
5. **有效的沟通协作**：团队协作、用户沟通、问题反馈

### 预期收益
- ✅ **完全国产化**：所有服务使用国产云平台
- ✅ **访问速度提升**：国内访问速度更快
- ✅ **合规性增强**：符合国内数据存储要求
- ✅ **成本优化**：降低运营成本
- ✅ **技术自主可控**：减少对海外服务的依赖

---

**文档版本**：v1.0
**最后更新**：2025-02-20
**维护人员**：项目团队