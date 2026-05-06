---
name: "自动部署"
description: "自动执行项目部署流程。Invoke when user mentions '部署' or 'deploy' or asks to deploy the project."
---

# 自动部署技能

当用户提到"部署"时，自动执行以下流程：

## 执行步骤

### 1. 自动总结更新内容

分析本次会话中的代码变更，自动生成更新日志：
- 根据变更内容判断更新类型
- 自动生成简洁的更新描述
- 更新类型：[Feature] / [BugFix] / [Architecture] / [UX] / [Security]

### 2. 更新版本号

**必须同时更新以下两个文件，保持版本号一致：**

1. `package.json` - 更新 `"version"` 字段
2. `public/changelog.json` - 更新 `"version"` 字段并添加更新记录

版本号递增规则：末位 +1（如 1.7.5 → 1.7.6）

### 3. 更新日志

自动更新 `public/changelog.json`：
- 自动递增版本号（末位 +1）
- 使用当前日期
- 添加新的更新记录
- 格式示例：
```json
{
  "version": "1.7.1",
  "date": "2026-03-10",
  "category": "[BugFix]",
  "content": "修复练习系统编译错误：函数参数缺失、类型导入错误、路径错误等"
}
```

### 4. 阅读部署指南

读取 `05_部署指南.md` 获取服务器配置信息：
- 服务器 IP: 114.132.47.245
- 用户名: root
- 网站目录: /www/sites/readrecall/index
- 域名: linyubo.top

### 5. 构建项目

执行构建命令：
```bash
npm run build
```

如果构建失败，先修复错误再继续。

### 6. 上传文件

使用 scp 上传 dist 目录到服务器：
```powershell
scp -r dist\* root@114.132.47.245:/www/sites/readrecall/index/
```

### 7. 验证部署

访问 https://linyubo.top 确认部署成功。

## 更新类型判断规则

| 类型 | 触发条件 |
|------|----------|
| [Feature] | 新增功能、新增文件、新增组件 |
| [BugFix] | 修复错误、修复编译问题 |
| [Architecture] | 重构、架构调整、目录结构调整 |
| [UX] | 样式调整、交互优化、响应式适配 |
| [Security] | 安全相关修改 |

## 注意事项

- 部署前确保所有代码更改已保存
- 构建失败时需要先修复错误
- 上传时需要输入服务器密码
- 部署完成后向用户报告结果

## 输出格式

部署完成后，向用户展示：
1. **更新日志内容**（自动生成）
2. 部署步骤执行情况
3. 访问地址
4. 如有错误，提供解决方案
