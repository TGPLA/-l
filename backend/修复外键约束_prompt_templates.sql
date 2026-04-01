-- 修复 prompt_templates 表的外键约束问题
-- 问题：外键约束的 DELETE_RULE 为 NO ACTION，导致删除用户时报错
-- 解决：删除旧约束，重新添加带 ON DELETE CASCADE 的约束
-- 状态：已执行完成 ✓

USE reading_reflection;

-- 第一步：查看当前的外键约束（执行前检查）
-- DELETE_RULE: NO ACTION (问题所在)
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'reading_reflection'
  AND TABLE_NAME = 'prompt_templates'
  AND CONSTRAINT_NAME = 'fk_prompt_templates_user';

-- 第二步：删除旧的外键约束
ALTER TABLE prompt_templates DROP FOREIGN KEY fk_prompt_templates_user;

-- 第三步：重新添加带 ON DELETE CASCADE 的外键约束
ALTER TABLE prompt_templates
ADD CONSTRAINT fk_prompt_templates_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 第四步：验证约束已正确添加（执行后验证）
-- DELETE_RULE: CASCADE (已修复)
SELECT 
    rc.CONSTRAINT_NAME,
    rc.TABLE_NAME,
    rc.DELETE_RULE,
    rc.UPDATE_RULE
FROM information_schema.REFERENTIAL_CONSTRAINTS rc
WHERE rc.CONSTRAINT_SCHEMA = 'reading_reflection'
  AND rc.TABLE_NAME = 'prompt_templates';

-- 完成！现在删除用户时，prompt_templates 表中关联的记录会自动删除
