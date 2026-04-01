-- 删除旧的乱码系统模板
DELETE FROM prompt_templates WHERE is_system = 1;

-- 插入名词解释模板（使用 HEX 编码）
INSERT INTO prompt_templates (id, user_id, name, question_type, content, is_default, is_system) 
VALUES (
    UUID(), 
    NULL, 
    0xE5908DE8AF8DE8A7A3E9878A202D20E6A087E58786E6A8A1E69DFF, -- '名词解释 - 标准模板'
    0xE5908DE8AF8DE8A7A3E9878A, -- '名词解释'
    0xE4BDA0E698AFE4B880E4BDA0E4B893E4B89AE79A84E79FA5E8AF86E8AEB2E8A7A3E88081E5B88820E8AFB7E6A0B9E68DAEE4BBA5E4B88BE6AEB5E890BDE58685E5AEB9EFBC8CE7949FE68890E4B880E98193E5908DE8AF8DE8A7A3E9878AE9A298, -- '你是一位专业的知识讲解老师。请根据以下段落内容，生成一道名词解释题'
    1, 
    1
);

-- 验证
SELECT id, name, question_type FROM prompt_templates WHERE is_system = 1 LIMIT 1;
