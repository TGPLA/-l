# 从 Vercel 迁移到腾讯云 EdgeOne Pages 指南

## 📋 迁移概述

本文档介绍如何将"阅读回响"项目从 Vercel 迁移到腾讯云 EdgeOne Pages。

## 🎯 迁移原因

- ✅ 国内访问速度更快
- ✅ 腾讯云生态集成
- ✅ 成本更低
- ✅ 域名管理更方便

## 📦 准备工作

### 1. 腾讯云账户准备

1. **注册腾讯云账户**
   - 访问：https://cloud.tencent.com
   - 完成实名认证

2. **开通 EdgeOne 服务**
   - 访问：https://console.cloud.tencent.com/edgeone
   - 开通 EdgeOne 服务（有免费额度）

### 2. GitHub 仓库准备

确保你的 GitHub 仓库包含：
- ✅ 完整的源代码
- ✅ package.json
- ✅ vite.config.ts
- ✅ 最新提交

## 🚀 迁移步骤

### 步骤 1：创建 EdgeOne Pages 项目

1. **访问 EdgeOne Pages**
   - 打开：https://console.cloud.tencent.com/edgeone
   - 点击"站点列表" → "新建站点"

2. **选择导入方式**
   - 选择"从 GitHub 导入"
   - 授权 GitHub 访问权限

3. **选择仓库**
   - 选择仓库：`TGPLA/-l`
   - 选择分支：`main`

### 步骤 2：配置构建设置

在"构建设置"中配置：

| 配置项 | 值 |
|--------|-----|
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| Node.js 版本 | `20` |
| 安装命令 | `npm ci` |

### 步骤 3：配置环境变量

在"环境变量"中添加：

| 变量名 | 值 |
|--------|-----|
| VITE_SUPABASE_URL | `https://ohqkqnhmgzqeqdsueiih.supabase.co` |
| VITE_SUPABASE_ANON_KEY | `sb_publishable_AG0a_37OtsrePOc4aEp9Rw_z2Q_ZkWD` |

### 步骤 4：配置域名

1. **添加自定义域名**
   - 在站点设置中点击"域名管理"
   - 添加域名：`linyubo.top`

2. **配置 DNS 记录**
   - 按照腾讯云提供的提示配置 DNS
   - 添加 CNAME 记录指向 EdgeOne 提供的域名

3. **等待 DNS 生效**
   - 通常需要 5-10 分钟
   - 可以使用 `nslookup linyubo.top` 检查

### 步骤 5：首次部署

1. **触发部署**
   - 点击"立即部署"按钮
   - 等待构建和部署完成

2. **验证部署**
   - 访问 EdgeOne 提供的默认域名
   - 确认应用正常运行

3. **验证自定义域名**
   - 访问：https://linyubo.top
   - 确认域名解析正确

## 🔧 配置 GitHub Actions 自动部署

### 1. 获取腾讯云密钥

1. **访问 API 密钥管理**
   - 打开：https://console.cloud.tencent.com/cam/capi
   - 创建新密钥或使用现有密钥

2. **获取 EdgeOne 站点信息**
   - 在 EdgeOne 控制台获取：
     - Zone ID（站点 ID）
     - Site ID（站点 ID）

### 2. 配置 GitHub Secrets

在你的 GitHub 仓库中添加以下 Secrets：

| Secret 名称 | 说明 |
|-------------|------|
| TENCENT_SECRET_ID | 腾讯云 Secret ID |
| TENCENT_SECRET_KEY | 腾讯云 Secret Key |
| EDGEONE_ZONE_ID | EdgeOne Zone ID |
| EDGEONE_SITE_ID | EdgeOne Site ID |
| VITE_SUPABASE_URL | Supabase URL |
| VITE_SUPABASE_ANON_KEY | Supabase Anon Key |

### 3. 启用 GitHub Actions

- 代码已包含 `.github/workflows/deploy-edgeone.yml`
- 每次推送到 `main` 分支会自动触发部署

## 📊 Vercel vs EdgeOne Pages 对比

| 特性 | Vercel | EdgeOne Pages |
|------|---------|---------------|
| 国内访问速度 | 一般 | 快 |
| 免费额度 | 100GB/月 | 有免费额度 |
| 构建速度 | 快 | 快 |
| CDN | 全球 | 全球+国内 |
| 域名管理 | 需要手动配置 | 集成管理 |
| 成本 | 较高 | 较低 |
| GitHub 集成 | ✅ | ✅ |

## ⚠️ 注意事项

### 1. 环境变量
- 确保所有环境变量都已正确配置
- 特别注意 Supabase 的 URL 和密钥

### 2. DNS 配置
- 域名 DNS 配置可能需要时间生效
- 建议在低峰期切换域名

### 3. 缓存清理
- 部署后清除浏览器缓存
- 建议使用无痕模式测试

### 4. 数据库迁移
- Supabase 数据库不需要迁移
- 数据仍然存储在 Supabase 中

## 🔄 回滚方案

如果迁移后出现问题，可以快速回滚到 Vercel：

1. **更新 DNS 记录**
   - 将 `linyubo.top` 的 CNAME 记录改回 Vercel 提供的域名

2. **等待 DNS 生效**
   - 通常需要 5-10 分钟

3. **验证回滚**
   - 访问 `https://linyubo.top`
   - 确认返回到 Vercel 版本

## 📞 技术支持

- 腾讯云文档：https://cloud.tencent.com/document/product/1552
- EdgeOne 文档：https://cloud.tencent.com/document/product/1552/80821
- GitHub Actions 文档：https://docs.github.com/en/actions

## ✅ 迁移检查清单

- [ ] 注册腾讯云账户
- [ ] 开通 EdgeOne 服务
- [ ] 创建 EdgeOne Pages 项目
- [ ] 配置构建设置
- [ ] 配置环境变量
- [ ] 添加自定义域名
- [ ] 配置 DNS 记录
- [ ] 首次部署成功
- [ ] 验证自定义域名
- [ ] 配置 GitHub Actions
- [ ] 测试所有功能
- [ ] 清理 Vercel 资源（可选）

## 🎉 迁移完成

完成以上步骤后，你的应用就已经成功迁移到腾讯云 EdgeOne Pages 了！

享受更快的国内访问速度和更低的成本！