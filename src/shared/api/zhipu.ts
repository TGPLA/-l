import type { Settings, Difficulty } from '@infrastructure/types';

interface RawQuestionResponse {
  question?: string;
  answer?: string;
  knowledgePoint?: string;
  knowledge_point?: string;
}

export async function validateApiKey(apiKey: string, model: string = 'glm-4-flash'): Promise<{ valid: boolean; message: string }> {
  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: '你好',
          },
        ],
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Key 验证失败:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        return {
          valid: false,
          message: `验证失败: ${errorJson.error?.message || errorText}`,
        };
      } catch {
        return {
          valid: false,
          message: `验证失败: ${response.status} - ${errorText}`,
        };
      }
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return {
        valid: true,
        message: 'API Key 验证成功！',
      };
    }

    return {
      valid: false,
      message: 'API 返回了无效的响应',
    };
  } catch (error) {
    console.error('API Key 验证出错:', error);
    return {
      valid: false,
      message: `验证出错: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}

interface ShortAnswerQuestion {
  question: string;
  answer: string;
  knowledgePoint?: string;
}

interface GenerateQuestionsResponse {
  questions: ShortAnswerQuestion[];
}

export async function generateQuestions(
  settings: Settings,
  bookTitle: string,
  bookAuthor: string,
  difficulty: Difficulty,
  scope: string,
  count: number,
  summary?: string,
  contents?: string,
  keyPoints?: string[]
): Promise<GenerateQuestionsResponse> {
  if (!settings.zhipuApiKey) {
    throw new Error('请先配置智谱 AI API Key');
  }

  const query = scope 
    ? `请根据《${bookTitle}》中${scope}部分的内容` 
    : `请根据《${bookTitle}》全书的内容`;

  const systemPrompt = `你是一个专业的出题助手，擅长根据书籍内容生成高质量的题目。

请根据提供的书籍信息生成${count}道简答题，难度为${difficulty}。

要求：
1. 题目要紧扣书籍内容，考查对核心概念和重要观点的理解
2. 简答题要有详细的答案解析
3. 每道题都要标注相关的知识点
4. 答案要详细，包含解释和说明

输出格式必须是纯 JSON 数组，不要有任何其他文字、解释或标记。

简答题 JSON 格式：
[
  {
    "question": "题目内容",
    "answer": "答案解析，包含详细解释",
    "knowledgePoint": "相关知识点"
  }
]

注意：
- 必须输出纯 JSON，不要包含任何其他内容`;

  const userPrompt = `${query}

书籍信息：
- 书名：《${bookTitle}》
- 作者：${bookAuthor}
- 出题范围：${scope || '全书'}
- 题目数量：${count}道
- 难度等级：${difficulty}

${summary ? `书籍简介：\n${summary}\n` : ''}

${contents ? `书籍内容：\n${contents}\n` : ''}

${keyPoints && keyPoints.length > 0 ? `重点内容：\n${keyPoints.join('\n')}\n` : ''}

请严格按照要求的 JSON 格式输出${count}道题目。`;

  let response;
  try {
    response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.zhipuApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.zhipuModel || 'glm-4-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
  } catch (fetchError) {
    console.error('Fetch error:', fetchError);
    if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
      throw new Error('网络连接失败，请检查：\n1. 网络连接是否正常\n2. 智谱 AI API Key 是否正确\n3. 是否存在跨域问题（CORS）');
    }
    throw fetchError;
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('智谱 AI Error response:', errorText);
    
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(`智谱 AI 调用失败: ${errorJson.error?.message || errorText}`);
    } catch {
      throw new Error(`智谱 AI 调用失败: ${response.status} - ${errorText}`);
    }
  }

  const data = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('智谱 AI 返回了空响应');
  }

  const content = data.choices[0].message?.content;
  
  if (!content) {
    throw new Error('智谱 AI 返回的内容为空');
  }

  const parseJsonFromText = (text: string): ShortAnswerQuestion[] | null => {
    let jsonStr = text.trim();
    
    jsonStr = jsonStr.replace(/```json\s*/gi, '');
    jsonStr = jsonStr.replace(/```\s*/gi, '');
    
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        return parsed.map((q: RawQuestionResponse) => ({
          question: q.question || '',
          answer: q.answer || '',
          knowledgePoint: q.knowledgePoint || q.knowledge_point || '',
        }));
      }
    } catch (e) {
      console.error('JSON parse error:', e);
      console.error('Failed to parse:', jsonStr);
    }
    
    return null;
  };

  const parsed = parseJsonFromText(content);
  if (parsed) {
    return { questions: parsed };
  }

  console.error('Failed to parse questions from content:', content);
  throw new Error('无法解析智谱 AI 返回的题目，请检查返回格式');
}

export async function evaluateAnswer(
  settings: Settings,
  bookTitle: string,
  question: string,
  userAnswer: string
): Promise<{ 
  evaluation: string; 
  supplement: string; 
  translation?: string; 
  scenario?: string; 
  vocabularyCards?: Array<{ term: string; definition: string; context: string }> 
}> {
  if (!settings.zhipuApiKey) {
    throw new Error('请先配置智谱 AI API Key');
  }

  const systemPrompt = `你是一位擅长"知识翻译"的超级私教。你不仅能把深奥的黑话讲透，还能让用户在听懂的同时，顺便掌握这些高级思维模型。你认为：懂道理是目的，掌握专业词汇是武装大脑的武器。

## 核心任务
* 白话解构：用极度生活化的语言解释逻辑
* 术语锚定：在白话描述中，精准地"顺便"带出专业名词
* 知识桥接：让用户在读完后，能用专业词汇向别人分享

## 翻译算法 (Bridge Logic)
* 公式：[生活场景] + [动作/现象] = [专业词汇]
* 逻辑：先讲故事，在故事的高潮处抛出专业名词，并解释为什么要用这个词
* 双语对照：关键术语保留中文+英文，增强专业感

## 输出模块 (必须按此格式输出)
输出格式必须是纯 JSON 对象，不要有任何其他文字、解释或标记。

JSON 格式：
{
  "evaluation": "对答案的评价，指出正确和错误的地方",
  "supplement": "补充说明，提供更详细的解释或相关知识",
  "translation": "📢 翻译成人话\\n> 要求：用"其实这就是……"开头\\n> 特色：在描述中，将专业词汇加粗显示\\n> 示例：这事儿其实就是你想吃肉但怕长胖，这种两难境地在博弈论里叫**激励相容 (Incentive Compatibility)**，说白了就是得让你的嘴和你的胃达成共识",
  "scenario": "🏠 场景模拟 (内含黑话)\\n> 要求：选一个生活场景（如：买菜、谈恋爱、玩游戏），在讲故事的过程中嵌入 2-3 个核心思维模型\\n> 示例：你在菜市场只跟相熟的摊主买菜，是因为你怕生人坑你，这在经济学里叫**降低交易成本 (Transaction Cost)**；而那个摊主为了留住你这个回头客，不敢卖次品，这叫维护他的**护城河 (Moat)**",
  "vocabularyCards": [
    {
      "term": "专业名词",
      "definition": "一句话极简定义",
      "context": "教用户在什么场景下说出这个词会显得很专业"
    }
  ]
}

## 语言风格
* 拒绝无脑精简：可以多写两句，要把逻辑链条讲清楚
* 专业与通俗并存：语气可以幽默，但引用模型时要准确
* 不再删除黑话：而是把黑话当成"知识点"来教学
* 增加装逼指南：满足用户"学到了"的成就感
* 强化关联：让用户明白，生活中的琐事其实都能对应上牛 逼的理论

请根据书籍内容评估学生的答案，给出评价和补充说明，并按照知识翻译私教的角色提供专业的翻译和场景模拟。`;

  const userPrompt = `请评估以下答案：

书籍：《${bookTitle}》
题目：${question}
学生答案：${userAnswer}

请按照要求的 JSON 格式输出评价和补充说明。`;

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.zhipuApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: settings.zhipuModel || 'glm-4-flash',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`智谱 AI 调用失败: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message?.content;

  const parseJsonFromText = (text: string): Record<string, unknown> | null => {
    let jsonStr = text.trim();
    
    jsonStr = jsonStr.replace(/```json\s*/gi, '');
    jsonStr = jsonStr.replace(/```\s*/gi, '');
    
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('JSON parse error:', e);
    }
    
    return null;
  };

  const parsed = parseJsonFromText(content);
  if (parsed) {
    return {
      evaluation: parsed.evaluation || '',
      supplement: parsed.supplement || '',
      translation: parsed.translation && typeof parsed.translation === 'string' ? parsed.translation : undefined,
      scenario: parsed.scenario && typeof parsed.scenario === 'string' ? parsed.scenario : undefined,
      vocabularyCards: parsed.vocabularyCards || undefined,
    };
  }

  throw new Error('无法解析智谱 AI 返回的评价');
}
