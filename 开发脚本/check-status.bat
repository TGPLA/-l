@echo off
if "%1"=="already_run" goto begin
start cmd /k "%~f0 already_run"
exit /b

:begin
echo ========================================
echo    ReadRecall - Check Dev Status
echo ========================================
echo.

cd /d "%~dp0.."

echo [1/5] Checking SSH tunnel...
tasklist /FI "IMAGENAME eq ssh.exe" 2>NUL | find /I /N "ssh.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] SSH Tunnel: Running
) else (
    echo [FAIL] SSH Tunnel: Not running
)

echo.
echo [2/5] Checking backend service...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if "%ERRORLEVEL%"=="0" (
    echo [OK] Backend: Running (port 8080)
) else (
    echo [FAIL] Backend: Not running
)

echo.
echo [3/5] Checking frontend service...
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if "%ERRORLEVEL%"=="0" (
    echo [OK] Frontend: Running (port 5173)
) else (
    echo [WARN] Frontend: Not running (optional)
)

echo.
echo [4/5] Checking backend health...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if "%ERRORLEVEL%"=="0" (
    curl -s -o nul -w "%%{http_code}" http://localhost:8080/health >nul 2>&1
    if "%ERRORLEVEL%"=="0" (
        echo [OK] Backend Health: Passed
    ) else (
        echo [FAIL] Backend Health: Failed
    )
) else (
    echo [SKIP] Backend Health: Skipped (backend not running)
)

echo.
echo [5/5] Checking config files...
if exist "backend\.env" (
    echo [OK] Backend Config: Exists (backend\.env)
) else (
    echo [FAIL] Backend Config: Missing (backend\.env)
)

echo.
echo ========================================
echo    Access URLs
echo ========================================
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if "%ERRORLEVEL%"=="0" (
    echo [WEB] Frontend: http://localhost:5173
)
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if "%ERRORLEVEL%"=="0" (
    echo [API] Backend: http://localhost:8080
    echo [HEALTH] Health Check: http://localhost:8080/health
)
echo.

echo ========================================
echo    Quick Actions
echo ========================================
tasklist /FI "IMAGENAME eq ssh.exe" 2>NUL | find /I /N "ssh.exe">NUL
if not "%ERRORLEVEL%"=="0" (
    echo [START] Need to start? Run: 开发脚本\start-dev.bat
)
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if not "%ERRORLEVEL%"=="0" (
    echo [START] Need to start? Run: 开发脚本\start-dev.bat
)
tasklist /FI "IMAGENAME eq ssh.exe" 2>NUL | find /I /N "ssh.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [STOP] Need to stop? Run: 开发脚本\stop-dev.bat
)
echo.

echo ========================================
echo    Test Account
echo ========================================
echo Username: 10002
echo Password: 123456
echo.
echo Press any key to close...
pause >nul
