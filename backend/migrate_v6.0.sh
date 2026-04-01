#!/bin/bash
# 数据库迁移脚本 - 在服务器上执行

mysql -u root -pmysql_h8TCKC << 'EOF'
USE reading_reflection;
ALTER TABLE books MODIFY COLUMN cover_url TEXT COMMENT '封面图片 URL 或 base64 数据';
DESCRIBE books;
EOF

echo "迁移完成！"
