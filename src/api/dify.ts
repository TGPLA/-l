import type { Settings, QuestionType, Difficulty, ConceptEvaluation } from '../types';

interface ChoiceQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  answer?: string;
  knowledgePoint?: string;
}

interface ShortAnswerQuestion {
  question: string;
  answer: string;
  knowledgePoint?: string;
}

interface GenerateQuestionsResponse {
  questions: Array<ChoiceQuestion | ShortAnswerQuestion>;
}

export async function generateQuestions(
  settings: Settings,
  bookTitle: string,
  bookAuthor: string,
  questionType: QuestionType,
  difficulty: Difficulty,
  scope: string,
  count: number
): Promise<GenerateQuestionsResponse> {
  if (!settings.difyApiKey || !settings.questionWorkflowUrl) {
    throw new Error('请先配置 Dify API Key 和问题生成 Workflow URL');
  }

  const query = scope ? `关于《${bookTitle}》${scope}部分` : `关于《${bookTitle}》全书内容`;

  console.log('API Request:', {
    url: settings.questionWorkflowUrl,
    inputs: {
      query,
      book_title: bookTitle,
      book_author: bookAuthor,
      question_type: questionType,
      difficulty,
      scope: scope || '全书',
      count,
    },
  });

  let response;
  try {
    response = await fetch(settings.questionWorkflowUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.difyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          query,
          book_title: bookTitle,
          book_author: bookAuthor,
          question_type: questionType,
          difficulty,
          scope: scope || '全书',
          count,
        },
        response_mode: 'blocking',
        user: 'user',
      }),
    });
  } catch (fetchError) {
    console.error('Fetch error:', fetchError);
    if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
      throw new Error('网络连接失败，请检查：\n1. Dify API URL 是否正确\n2. 网络连接是否正常\n3. 是否存在跨域问题（CORS）');
    }
    throw fetchError;
  }

  console.log('API Response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error response:', errorText);
    throw new Error(`API 调用失败: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  console.log('Raw API response:', data);
  
  let outputs = data.outputs || data.data || data;
  
  if (outputs && typeof outputs === 'object' && outputs.outputs) {
    outputs = outputs.outputs;
  }
  
  console.log('Final outputs:', outputs);
  
  if (outputs.questions && Array.isArray(outputs.questions)) {
    return { questions: outputs.questions.map((q: any) => normalizeQuestion(q)) };
  }
  
  const parseJsonFromText = (text: string): Array<any> | null => {
    let jsonStr = text.trim();
    
    jsonStr = jsonStr.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
    jsonStr = jsonStr.replace(/<think[\s\S]*?<\/think>/gi, '');
    
    if (jsonStr.includes('```')) {
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
    }
    
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        return parsed.map(q => normalizeQuestion(q));
      }
    } catch (e) {
      console.error('JSON parse error:', e);
    }
    
    return null;
  };
  
  const normalizeQuestion = (q: { question: string; options?: string[]; correct_answer?: string; explanation?: string | any; knowledge_point?: string; knowledgePoint?: string }): any => {
    const normalized: any = {
      question: q.question,
      options: q.options || [],
      answer: '',
      correctIndex: undefined,
      knowledgePoint: q.knowledge_point || q.knowledgePoint || '',
    };
    
    if (q.correct_answer) {
      const answerLetter = q.correct_answer.toUpperCase().trim();
      normalized.correctIndex = answerLetter.charCodeAt(0) - 65;
    }
    
    if (q.explanation) {
      if (typeof q.explanation === 'string') {
        normalized.answer = q.explanation;
      } else if (typeof q.explanation === 'object') {
        const parts: string[] = [];
        if (q.explanation.translation) parts.push(q.explanation.translation);
        if (q.explanation.example) parts.push(q.explanation.example);
        if (q.explanation.vocabulary) parts.push(q.explanation.vocabulary);
        normalized.answer = parts.join('\n\n');
      }
    }
    
    normalized.options = normalized.options.map((opt: string) => {
      return opt.replace(/^[A-Z]\.\s*/, '');
    });
    
    return normalized;
  };
  
  if (outputs.questions && typeof outputs.questions === 'string') {
    const parsed = parseJsonFromText(outputs.questions);
    if (parsed) {
      return { questions: parsed };
    }
  }
  
  if (outputs.question && typeof outputs.question === 'string') {
    const parsed = parseJsonFromText(outputs.question);
    if (parsed) {
      return { questions: parsed };
    }
  }
  
  if (outputs.text && typeof outputs.text === 'string') {
    const parsed = parseJsonFromText(outputs.text);
    if (parsed) {
      return { questions: parsed };
    }
  }
  
  if (Array.isArray(outputs)) {
    return { questions: outputs.map((q: any) => normalizeQuestion(q)) };
  }
  
  if (outputs.result && Array.isArray(outputs.result)) {
    return { questions: outputs.result.map((q: any) => normalizeQuestion(q)) };
  }
  
  const outputKeys = Object.keys(outputs || {});
  for (const key of outputKeys) {
    const value = outputs[key];
    if (Array.isArray(value) && value.length > 0 && value[0] && value[0].question) {
      return { questions: value.map((q: any) => normalizeQuestion(q)) };
    }
    if (typeof value === 'string') {
      const parsed = parseJsonFromText(value);
      if (parsed) {
        return { questions: parsed };
      }
    }
  }
  
  console.error('Unexpected API response format. Outputs:', outputs);
  throw new Error('API 返回格式不正确，请检查 Dify Workflow 输出变量配置');
}

export async function evaluateConceptAnswer(
  settings: Settings,
  bookTitle: string,
  question: string,
  userAnswer: string
): Promise<ConceptEvaluation> {
  if (!settings.difyApiKey || !settings.correctionWorkflowUrl) {
    throw new Error('请先配置 Dify API Key 和概念纠错 Workflow URL');
  }

  const response = await fetch(settings.correctionWorkflowUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.difyApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {
        book_title: bookTitle,
        question,
        user_answer: userAnswer,
      },
      response_mode: 'blocking',
      user: 'user',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 调用失败: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const outputs = data.outputs || data;
  return {
    evaluation: outputs.evaluation || '',
    supplement: outputs.supplement || '',
    translation: outputs.translation && typeof outputs.translation === 'string' ? outputs.translation : undefined,
    scenario: outputs.scenario && typeof outputs.scenario === 'string' ? outputs.scenario : undefined,
    vocabularyCards: outputs.vocabularyCards || undefined,
  };
}
