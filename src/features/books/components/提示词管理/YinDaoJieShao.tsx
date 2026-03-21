// @审计已完成
// 首次引导组件 - 介绍页面
import type { QuestionTypeEnum } from '@infrastructure/types';

interface YinDaoJieShaoProps {
  questionType: QuestionTypeEnum;
  onNext: () => void;
  onSkip: () => void;
}

export function YinDaoJieShao({ onNext, onSkip }: YinDaoJieShaoProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        maxWidth: '32rem',
        width: '100%',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
          选择你的出题方式
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          在开始出题之前，你需要选择一种提示词模板。
          提示词决定了 AI 如何理解段落内容并生成题目。
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0', textAlign: 'left' }}>
            <h3 style={{ fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>✅ 使用预设模板</h3>
            <p style={{ fontSize: '0.875rem', color: '#15803d' }}>
              适合新手，开箱即用。系统已为你准备了针对不同题型的专业模板。
            </p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #fcd34d', textAlign: 'left' }}>
            <h3 style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.5rem' }}>⚙️ 创建自定义模板</h3>
            <p style={{ fontSize: '0.875rem', color: '#b45309' }}>
              适合进阶用户，完全自定义。你可以根据自己的需求编写提示词。
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onSkip} style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: '#ffffff', color: '#6b7280', cursor: 'pointer' }}>
            跳过
          </button>
          <button onClick={onNext} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
            开始选择
          </button>
        </div>
      </div>
    </div>
  );
}
