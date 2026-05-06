#!/bin/bash
# 阅读回响后端部署脚本
# 在服务器上执行: bash deploy_backend.sh

echo "========================================"
echo "  阅读回响 - 后端部署"
echo "========================================"
echo ""

cd /root/backend || { echo "错误: 找不到/root/backend目录"; exit 1; }

echo "[1/4] 停止并删除旧容器..."
docker-compose down 2>/dev/null
docker stop readrecall-backend 2>/dev/null
docker rm readrecall-backend 2>/dev/null

echo ""
echo "[2/4] 构建新镜像并启动..."
docker-compose up -d --build

echo ""
echo "[3/4] 等待10秒让服务启动..."
sleep 10

echo ""
echo "[4/4] 检查状态..."
if docker ps --format '{{.Names}}' | grep -q readrecall-backend; then
    echo "✓ 后端部署成功！"
    echo ""
    echo "现在可以访问 https://linyubo.top 测试功能了！"
    echo ""
    echo "检查容器日志:"
    docker-compose logs --tail 20
else
    echo "✗ 容器启动失败"
    echo ""
    echo "查看日志:"
    docker-compose logs
fi
