# 部署脚本 - 阅读回响项目
# 使用方法: .\deploy.ps1

param(
    [string]$ServerIP = "114.132.47.245",
    [string]$User = "root",
    [string]$RemotePath = "/opt/1panel/www/sites/readrecall/index",
    [string]$LocalDist = ".\dist"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  阅读回响 - 部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 dist 目录是否存在
if (-not (Test-Path $LocalDist)) {
    Write-Host "[错误] dist 目录不存在，请先运行 npm run build" -ForegroundColor Red
    exit 1
}

Write-Host "[步骤 1/4] 构建检查通过" -ForegroundColor Green

# 显示要上传的文件
Write-Host "[步骤 2/4] 准备上传以下文件:" -ForegroundColor Yellow
Get-ChildItem $LocalDist -Recurse | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[步骤 3/4] 清空服务器旧文件..." -ForegroundColor Yellow
ssh ${User}@${ServerIP} "rm -rf ${RemotePath}/*"

Write-Host "[步骤 4/4] 上传新文件到服务器..." -ForegroundColor Yellow
Write-Host "  服务器: $ServerIP" -ForegroundColor Gray
Write-Host "  目录: $RemotePath" -ForegroundColor Gray
Write-Host ""

# 执行上传
scp -r "$LocalDist\*" "${User}@${ServerIP}:${RemotePath}/"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  部署成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "访问地址: https://linyubo.top" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "[错误] 部署失败，请检查网络连接和服务器配置" -ForegroundColor Red
    exit 1
}
