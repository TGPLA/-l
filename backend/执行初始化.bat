@echo off
echo ========================================
echo 阅读回响 - 数据库表结构初始化
echo ========================================
echo.
echo 请输入 MySQL root 用户密码，然后按回车...
echo.

mysql -u root -p reading_reflection < init_tables.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 数据库表结构初始化成功！
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ 初始化失败，请检查错误信息
    echo ========================================
)

echo.
pause
