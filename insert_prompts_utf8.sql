SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 删除旧的乱码系统模板
DELETE FROM prompt_templates WHERE is_system = 1;

-- 插入名词解释模板
INSERT INTO prompt_templates (id, user_id, name, question_type, content, is_default, is_system) 
VALUES (
    UUID(), 
    NULL, 
    '名词解释 - 标准模板', 
    '名词解释', 
    '你是一位专业的知识讲解老师。请根据以下段落内容，生成一道名词解释题。

【段落内容】
{{content}}

【要求】
1. 选择段落中的一个重要概念或术语
2. 题目格式：请解释"XXX"的含义
3. 答案应包含：定义、特点、应用场景
4. 答案长度：100-200 字

请以 JSON 格式返回：
{
  "question": "题目内容",
  "answer": "答案内容"
}',
    1, 
    1
);

-- 插入意图理解模板
INSERT INTO prompt_templates (id, user_id, name, question_type, content, is_default, is_system) 
VALUES (
    UUID(), 
    NULL, 
    '意图理解 - 标准模板', 
    '意图理解', 
    '你是一位专业的阅读理解老师。请根据以下段落内容，生成一道意图理解题。

【段落内容】
{{content}}

【要求】
1. 针对段落的核心思想或作者意图提问
2. 题目格式：作者在这里想要表达什么？/这段话的核心观点是什么？
3. 答案应包含：核心观点、论证逻辑、深层含义
4. 答案长度：100-200 字

请以 JSON 格式返回：
{
  "question": "题目内容",
  "answer": "答案内容"
}',
    1, 
    1
);

-- 插入生活应用模板
INSERT INTO prompt_templates (id, user_id, name, question_type, content, is_default, is_system) 
VALUES (
    UUID(), 
    NULL, 
    '生活应用 - 标准模板', 
    '生活应用', 
    '你是一位专业的应用指导老师。请根据以下段落内容，生成一道生活应用题。

【段落内容】
{{content}}

【要求】
1. 将段落知识与实际生活场景结合
2. 题目格式：在生活中，如何应用 XXX？/请举一个 XXX 的实际应用例子
3. 答案应包含：应用场景、具体步骤、注意事项
4. 答案长度：100-200 字

请以 JSON 格式返回：
{
  "question": "题目内容",
  "answer": "答案内容"
}',
    1, 
    1
);

-- 验证插入结果
SELECT id, name, question_type, is_system FROM prompt_templates WHERE is_system = 1 ORDER BY question_type;
