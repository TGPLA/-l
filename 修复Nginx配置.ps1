# 修复 Nginx 配置 - 添加 /uploads 路径的反向代理
# @审计已完成
# 使用方式：在本地 PowerShell 执行此脚本，会自动连接到服务器并更新配置

$服务器IP = "114.132.47.245"
$Nginx容器名 = "1Panel-openresty-EPWv"
$Nginx配置文件 = "/opt/1panel/www/conf.d/readrecall.conf"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "修复 Nginx 配置 - 添加 /uploads 反向代理" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 配置修复步骤：" -ForegroundColor Yellow
Write-Host "1. 备份原有 Nginx 配置"
Write-Host "2. 添加 /uploads/ 路径的反向代理配置"
Write-Host "3. 测试配置语法"
Write-Host "4. 重载 Nginx 配置"
Write-Host ""

# 备份配置
Write-Host "💾 第1步：备份 Nginx 配置..." -ForegroundColor Green
$备份时间 = Get-Date -Format "yyyyMMdd_HHmmss"
$备份命令 = "cp $Nginx配置文件 $Nginx配置文件.backup.$备份时间"
ssh root@$服务器IP $备份命令
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 备份完成" -ForegroundColor Green
} else {
    Write-Host "❌ 备份失败" -ForegroundColor Red
    exit 1
}

# 查看当前配置
Write-Host ""
Write-Host "📄 当前 Nginx 配置：" -ForegroundColor Green
$查看配置 = "cat $Nginx配置文件"
ssh root@$服务器IP $查看配置 | Select-Object -First 30

Write-Host ""
Write-Host "⚠️  即将添加的配置片段：" -ForegroundColor Yellow
Write-Host '
    # EPUB 文件反向代理到后端
    location /uploads/ {
        proxy_pass http://127.0.0.1:8080/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 增加超时时间，EPUB 文件可能较大
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
'

$确认 = Read-Host "是否继续修复配置？(y/n)"
if ($确认 -ne "y") {
    Write-Host "❌ 已取消" -ForegroundColor Red
    exit 0
}

# 应用修复
Write-Host ""
Write-Host "🔧 第2步：添加 /uploads/ 反向代理配置..." -ForegroundColor Green

# 创建要插入的配置片段
$uploads配置 = @"

    # EPUB 文件反向代理到后端
    location /uploads/ {
        proxy_pass http://127.0.0.1:8080/uploads/;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;

        # 增加超时时间，EPUB 文件可能较大
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
"@

# 使用 sed 在 location /api/ 之前插入配置
$sed命令 = @"
sed -i '/location \/api\//i\
    # EPUB 文件反向代理到后端\
    location /uploads/ {\
        proxy_pass http://127.0.0.1:8080/uploads/;\
        proxy_set_header Host \$host;\
        proxy_set_header X-Real-IP \$remote_addr;\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto \$scheme;\
\
        # 增加超时时间，EPUB 文件可能较大\
        proxy_connect_timeout 60s;\
        proxy_send_timeout 60s;\
        proxy_read_timeout 60s;\
    }\
' $Nginx配置文件
"@

ssh root@$服务器IP $sed命令
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 配置已添加" -ForegroundColor Green
} else {
    Write-Host "❌ 配置添加失败" -ForegroundColor Red
    exit 1
}

# 测试配置语法
Write-Host ""
Write-Host "✅ 第3步：测试配置语法..." -ForegroundColor Green
$测试命令 = "docker exec $Nginx容器名 nginx -t"
ssh root@$服务器IP $测试命令
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 配置语法检查通过" -ForegroundColor Green
} else {
    Write-Host "❌ 配置语法检查失败，正在恢复备份..." -ForegroundColor Red
    $恢复命令 = "cp $Nginx配置文件.backup.$备份时间 $Nginx配置文件"
    ssh root@$服务器IP $恢复命令
    Write-Host "✅ 已恢复原始配置" -ForegroundColor Green
    exit 1
}

# 重载 Nginx
Write-Host ""
Write-Host "🔄 第4步：重载 Nginx 配置..." -ForegroundColor Green
$重载命令 = "docker exec $Nginx容器名 nginx -s reload"
ssh root@$服务器IP $重载命令
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Nginx 配置已重载" -ForegroundColor Green
} else {
    Write-Host "❌ Nginx 重载失败" -ForegroundColor Red
    exit 1
}

# 验证配置
Write-Host ""
Write-Host "📋 验证 /uploads 配置：" -ForegroundColor Green
$验证命令 = "docker exec $Nginx容器名 grep -A 10 'location /uploads/' $Nginx配置文件"
ssh root@$服务器IP $验证命令

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 修复完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 下一步测试：" -ForegroundColor Yellow
Write-Host "1. 打开浏览器访问 https://linyubo.top"
Write-Host "2. 进入书架，上传或选择一本书籍"
Write-Host "3. 点击阅读 EPUB 文件"
Write-Host "4. 在不同设备（手机、电脑）上测试访问"
Write-Host ""
Write-Host "如果仍有问题，请检查：" -ForegroundColor Yellow
Write-Host "- 后端容器是否正常运行"
Write-Host "- /data/readrecall/uploads/ 目录是否有文件"
Write-Host "- 服务器日志：ssh root@$服务器IP 'docker logs readrecall-backend --tail 50'"