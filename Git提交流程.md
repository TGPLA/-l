# Git 提交流程

## 标准流程（5步）

```powershell
# 步骤1：查看状态
git -C e:\阅读回响 status

# 步骤2：添加文件到暂存区
git -C e:\阅读回响 add .

# 步骤3：确认变更（可选）
git -C e:\阅读回响 diff --cached --stat

# 步骤4：提交
git -C e:\阅读回响 commit -m "提交描述"

# 步骤5：推送到远程
git -C e:\阅读回响 push
```

## 简写（合并执行）

```powershell
git -C e:\阅读回响 add . && git -C e:\阅读回响 commit -m "描述" && git -C e:\阅读回响 push
```

## 常用命令

| 功能 | 命令 |
|------|------|
| 查看状态 | git -C e:\阅读回响 status |
| 添加所有 | git -C e:\阅读回响 add . |
| 添加单个文件 | git -C e:\阅读回响 add 文件路径 |
| 查看变更 | git -C e:\阅读回响 diff --cached --stat |
| 提交 | git -C e:\阅读回响 commit -m "描述" |
| 推送 | git -C e:\阅读回响 push |
| 查看提交记录 | git -C e:\阅读回响 log -3 |
| 撤销暂存 | git -C e:\阅读回响 restore --staged . |
| 撤销提交 | git -C e:\阅读回响 reset --soft HEAD~1 |

## 参数说明

- `-C 路径`：指定Git工作目录，无需切换文件夹
- `--cached`：查看已暂存的变更
- `--stat`：显示统计信息（行数）