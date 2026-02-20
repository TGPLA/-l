# 腾讯云 EdgeOne Pages 部署配置

## 部署步骤

### 方法 1：通过 GitHub 自动部署（推荐）

1. **访问腾讯云 EdgeOne Pages**
   - 打开：https://console.cloud.tencent.com/edgeone
   - 登录腾讯云账户

2. **创建新项目**
   - 点击"创建项目"
   - 选择"从 GitHub 导入"
   - 授权访问你的 GitHub 账户

3. **选择仓库**
   - 选择仓库：`TGPLA/-l`
   - 选择分支：`main`

4. **配置构建设置**
   - 构建命令：`npm run build`
   - 输出目录：`dist`
   - Node.js 版本：`20`

5. **配置环境变量**
   - `VITE_SUPABASE_URL`: `https://ohqkqnhmgzqeqdsueiih.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_AG0a_37OtsrePOc4aEp9Rw_z2Q_ZkWD`

6. **部署**
   - 点击"部署"按钮
   - 等待部署完成

### 方法 2：通过 CLI 手动部署

1. **安装腾讯云 CLI**
   ```bash
   npm install -g @tencentcloud/edgeone-cli
   ```

2. **登录**
   ```bash
   edgeone login
   ```

3. **部署**
   ```bash
   edgeone deploy --prod
   ```

## 环境变量配置

在腾讯云 EdgeOne Pages 中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| VITE_SUPABASE_URL | https://ohqkqnhmgzqeqdsueiih.supabase.co | Supabase 项目 URL |
| VITE_SUPABASE_ANON_KEY | sb_publishable_AG0a_37OtsrePOc4aEp9Rw_z2Q_ZkWD | Supabase 匿名密钥 |

## 域名配置

1. **添加域名**
   - 在项目设置中点击"域名管理"
   - 添加域名：`linyubo.top`

2. **配置 DNS**
   - 按照提示配置 DNS 记录
   - 等待 DNS 生效

## 注意事项

- 确保在腾讯云中正确配置了环境变量
- 部署完成后，清除浏览器缓存
- 如果遇到问题，查看部署日志获取详细信息