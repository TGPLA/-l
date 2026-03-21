@echo off
echo ========================================
echo 阅读回响 - 本地数据库初始化
echo ========================================
echo.

REM 请修改下面的密码为你设置的 root 密码
set MYSQL_ROOT_PASSWORD=your_root_password_here

echo 正在执行数据库初始化脚本...
mysql -u root -p%MYSQL_ROOT_PASSWORD% < "数据库初始化.sql"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 数据库初始化成功！
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ 数据库初始化失败，请检查错误信息
    echo ========================================
)

echo.
pause
