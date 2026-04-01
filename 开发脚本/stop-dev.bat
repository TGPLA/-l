@echo off
if "%1"=="already_run" goto begin
start cmd /k "%~f0 already_run"
exit /b

:begin
echo ========================================
echo    ReadRecall - Stop Dev Environment
echo ========================================
echo.

cd /d "%~dp0.."

echo [1/3] Stopping SSH tunnel...
tasklist /FI "IMAGENAME eq ssh.exe" 2>NUL | find /I /N "ssh.exe">NUL
if "%ERRORLEVEL%"=="0" (
    taskkill /F /IM ssh.exe >nul 2>&1
    echo [OK] SSH tunnel stopped
) else (
    echo [SKIP] SSH tunnel: Not running
)

echo.
echo [2/3] Stopping backend service...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [OK] Backend stopped (PID: %%a)
)
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if not "%ERRORLEVEL%"=="0" (
    echo [SKIP] Backend: Not running
)

echo.
echo [3/3] Stopping frontend service...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [OK] Frontend stopped (PID: %%a)
)
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if not "%ERRORLEVEL%"=="0" (
    echo [SKIP] Frontend: Not running
)

echo.
echo ========================================
echo    [OK] All services stopped!
echo ========================================
echo.
echo [RESTART] Need to restart? Run: 开发脚本\start-dev.bat
echo.
echo Press any key to close...
pause >nul
