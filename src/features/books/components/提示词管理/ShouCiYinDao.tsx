// @审计已完成
// 首次引导组件 - 整合介绍和选择页面
import { useState } from 'react';
import type { QuestionTypeEnum, PromptTemplate } from '@infrastructure/types';
import { YinDaoJieShao } from './YinDaoJieShao';
import { YinDaoXuanZe } from './YinDaoXuanZe';

interface ShouCiYinDaoProps {
  questionType: QuestionTypeEnum;
  onComplete: (template: PromptTemplate | null) => void;
}

export function ShouCiYinDao({ questionType, onComplete }: ShouCiYinDaoProps) {
  const [step, setStep] = useState<'intro' | 'choose'>('intro');

  if (step === 'intro') {
    return (
      <YinDaoJieShao
        questionType={questionType}
        onNext={() => setStep('choose')}
        onSkip={() => onComplete(null)}
      />
    );
  }

  return (
    <YinDaoXuanZe
      questionType={questionType}
      onBack={() => setStep('intro')}
      onComplete={onComplete}
    />
  );
}
