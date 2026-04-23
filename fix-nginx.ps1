$serverIP = "114.132.47.245"
$nginxContainer = "1Panel-openresty-EPWv"
$nginxConf = "/opt/1panel/www/conf.d/readrecall.conf"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Nginx Config - Add /uploads Proxy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Steps:" -ForegroundColor Yellow
Write-Host "1. Backup current Nginx config"
Write-Host "2. Add /uploads/ reverse proxy"
Write-Host "3. Test config syntax"
Write-Host "4. Reload Nginx"
Write-Host ""

# Step 1: Backup
Write-Host "[Step 1] Backing up Nginx config..." -ForegroundColor Green
$backupTime = Get-Date -Format "yyyyMMdd_HHmmss"
$backupCmd = "cp $nginxConf $nginxConf.backup.$backupTime"
ssh root@$serverIP $backupCmd
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup completed" -ForegroundColor Green
} else {
    Write-Host "Backup failed" -ForegroundColor Red
    exit 1
}

# View current config
Write-Host ""
Write-Host "[Current Nginx Config]" -ForegroundColor Green
$viewCmd = "cat $nginxConf"
ssh root@$serverIP $viewCmd | Select-Object -First 30

Write-Host ""
Write-Host "Continue with fix? (y/n)" -ForegroundColor Yellow
$confirm = Read-Host
if ($confirm -ne "y") {
    Write-Host "Cancelled" -ForegroundColor Red
    exit 0
}

# Step 2: Apply fix using sed
Write-Host ""
Write-Host "[Step 2] Adding /uploads/ proxy config..." -ForegroundColor Green

$sedCmd = @"
sed -i '/location \/api\//i\
    # EPUB file reverse proxy to backend\
    location /uploads/ {\
        proxy_pass http://127.0.0.1:8080/uploads/;\
        proxy_set_header Host `$host;\
        proxy_set_header X-Real-IP `$remote_addr;\
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto `$scheme;\
\
        # Increased timeout for large EPUB files\
        proxy_connect_timeout 60s;\
        proxy_send_timeout 60s;\
        proxy_read_timeout 60s;\
    }\
' $nginxConf
"@

ssh root@$serverIP $sedCmd
if ($LASTEXITCODE -eq 0) {
    Write-Host "Config added" -ForegroundColor Green
} else {
    Write-Host "Config addition failed" -ForegroundColor Red
    exit 1
}

# Step 3: Test config
Write-Host ""
Write-Host "[Step 3] Testing config syntax..." -ForegroundColor Green
$testCmd = "docker exec $nginxContainer nginx -t"
ssh root@$serverIP $testCmd
if ($LASTEXITCODE -eq 0) {
    Write-Host "Syntax check passed" -ForegroundColor Green
} else {
    Write-Host "Syntax check failed, restoring backup..." -ForegroundColor Red
    $restoreCmd = "cp $nginxConf.backup.$backupTime $nginxConf"
    ssh root@$serverIP $restoreCmd
    Write-Host "Backup restored" -ForegroundColor Green
    exit 1
}

# Step 4: Reload Nginx
Write-Host ""
Write-Host "[Step 4] Reloading Nginx..." -ForegroundColor Green
$reloadCmd = "docker exec $nginxContainer nginx -s reload"
ssh root@$serverIP $reloadCmd
if ($LASTEXITCODE -eq 0) {
    Write-Host "Nginx reloaded" -ForegroundColor Green
} else {
    Write-Host "Nginx reload failed" -ForegroundColor Red
    exit 1
}

# Verify config
Write-Host ""
Write-Host "[Verify /uploads config]" -ForegroundColor Green
$verifyCmd = "docker exec $nginxContainer grep -A 10 'location /uploads/' $nginxConf"
ssh root@$serverIP $verifyCmd

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan