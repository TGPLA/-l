#!/bin/bash
# 修复 Nginx 配置 - 添加 /uploads 路径的反向代理
# @审计已完成

# Nginx 配置文件路径
NGINX_CONF="/opt/1panel/www/conf.d/readrecall.conf"

echo "📝 开始修复 Nginx 配置..."
echo "📄 配置文件: $NGINX_CONF"

# 备份原有配置
BACKUP_CONF="/opt/1panel/www/conf.d/readrecall.conf.backup.$(date +%Y%m%d_%H%M%S)"
cp "$NGINX_CONF" "$BACKUP_CONF"
echo "💾 已备份配置到: $BACKUP_CONF"

# 创建临时文件，包含 /uploads 代理配置
cat > /tmp/nginx_uploads_config.txt << 'EOF'

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
EOF

# 使用 sed 在 location /api/ 之前插入新配置
# 查找 location /api/ 的位置，在它之前插入 uploads 配置
sed -i '/location \/api\//i \
    # EPUB 文件反向代理到后端\
    location /uploads/ {\
        proxy_pass http://127.0.0.1:8080/uploads/;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
\
        # 增加超时时间，EPUB 文件可能较大\
        proxy_connect_timeout 60s;\
        proxy_send_timeout 60s;\
        proxy_read_timeout 60s;\
    }\
' "$NGINX_CONF"

echo "✅ Nginx 配置已更新"

# 测试配置语法
docker exec 1Panel-openresty-EPWv nginx -t
if [ $? -eq 0 ]; then
    echo "✅ 配置语法检查通过"
else
    echo "❌ 配置语法检查失败，正在恢复备份..."
    cp "$BACKUP_CONF" "$NGINX_CONF"
    echo "✅ 已恢复原始配置"
    exit 1
fi

# 重载 Nginx 配置
docker exec 1Panel-openresty-EPWv nginx -s reload
echo "🔄 Nginx 配置已重载"

# 验证配置
echo ""
echo "📋 验证 /uploads 路径配置："
docker exec 1Panel-openresty-EPWv grep -A 10 "location /uploads/" "$NGINX_CONF"

echo ""
echo "🎉 修复完成！"
echo "📝 请测试跨设备访问 EPUB 文件是否正常。"