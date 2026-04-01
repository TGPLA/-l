@echo off
echo ========================================
echo    ReadRecall - Start Dev Environment
echo ========================================
echo.

cd /d "%~dp0.."

echo [1/4] Checking SSH tunnel...
tasklist /FI "IMAGENAME eq ssh.exe" 2>NUL | find /I /N "ssh.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] SSH tunnel is running
) else (
    echo [WARN] SSH tunnel not found, creating...
    start /B ssh -f -N -L 3307:127.0.0.1:3306 root@linyubo.top
    timeout /t 2 /nobreak >nul
    
    tasklist /FI "IMAGENAME eq ssh.exe" 2>NUL | find /I /N "ssh.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo [OK] SSH tunnel created
    ) else (
        echo [FAIL] Failed to create SSH tunnel!
        echo.
        echo Please create it manually:
        echo   ssh -f -N -L 3307:127.0.0.1:3306 root@linyubo.top
        echo.
        echo Or check:
        echo   1. SSH key exists: %%USERPROFILE%%\.ssh\id_rsa
        echo   2. Network connection is normal
        echo   3. Server linyubo.top is reachable
        echo.
        pause
        exit /b 1
    )
)

echo.
echo [2/4] Starting backend service...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if "%ERRORLEVEL%"=="0" (
    echo [OK] Backend is running
) else (
    echo [OK] Starting backend...
    cd backend
    start "ReadRecall-Backend" cmd /k "readrecall-backend.exe"
    cd ..
    echo [OK] Backend started
)

echo.
echo [3/4] Waiting for backend to be ready...
echo [OK] Waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting frontend...
echo.
echo ========================================
echo    [OK] All services started!
echo ========================================
echo.
echo Service Status:
echo   - SSH Tunnel:    Running
echo   - Backend:       Starting (http://localhost:8080)
echo   - Frontend:      Starting
echo.
echo Access URLs:
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:8080
echo   - Health:   http://localhost:8080/health
echo.
echo Test Account:
echo   - Username: 10002
echo   - Password: 123456
echo.
echo ========================================
echo.

npm run dev
