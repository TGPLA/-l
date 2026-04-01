USE reading_reflection;
ALTER TABLE books MODIFY COLUMN cover_url TEXT COMMENT '封面图片 URL 或 base64 数据';
DESCRIBE books;
