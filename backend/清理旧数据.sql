-- 清理旧数据脚本
-- 删除所有书籍、章节、段落、题目数据

-- 注意：此操作不可逆，请谨慎执行！

-- 先删除子表数据（按外键依赖顺序）
DELETE FROM concept_practice_records;
DELETE FROM concepts;
DELETE FROM practice_records;
DELETE FROM questions;
DELETE FROM paragraphs;
DELETE FROM chapters;

-- 最后删除书籍数据
DELETE FROM books;

-- 验证清理结果
SELECT '清理完成！' AS message;
SELECT COUNT(*) AS remaining_books FROM books;
SELECT COUNT(*) AS remaining_chapters FROM chapters;
SELECT COUNT(*) AS remaining_paragraphs FROM paragraphs;
