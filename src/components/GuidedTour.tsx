import { useState } from 'react';
import { getResponsiveValue } from '../utils/responsive';

interface GuidedTourProps {
  onComplete: () => void;
}

export function GuidedTour({ onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      title: '欢迎使用阅读回响',
      description: '这是一个帮助你通过做题来加深对书籍理解的工具。',
      icon: '📚',
    },
    {
      title: '第一步：添加问题',
      description: '你可以手动添加问题，或者使用AI自动生成问题。',
      icon: '✏️',
    },
    {
      title: '第二步：开始刷题',
      description: '选择一种刷题模式开始练习，巩固你的知识。',
      icon: '🎯',
    },
    {
      title: '第三步：查看统计',
      description: '通过统计分析了解你的学习进度和掌握情况。',
      icon: '📊',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: getResponsiveValue({ mobile: '1rem', tablet: '2rem' }),
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        padding: getResponsiveValue({ mobile: '1.5rem', tablet: '2rem' }),
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }),
        }}>
          <div style={{
            fontSize: getResponsiveValue({ mobile: '3rem', tablet: '4rem' }),
            marginBottom: getResponsiveValue({ mobile: '0.5rem', tablet: '1rem' }),
          }}>
            {steps[currentStep].icon}
          </div>
          
          <h2 style={{
            fontSize: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }),
            fontWeight: 700,
            color: '#111827',
            margin: 0,
          }}>
            {steps[currentStep].title}
          </h2>
          
          <p style={{
            color: '#6b7280',
            lineHeight: 1.6,
            margin: 0,
          }}>
            {steps[currentStep].description}
          </p>
          
          <div style={{
            display: 'flex',
            gap: getResponsiveValue({ mobile: '0.5rem', tablet: '1rem' }),
            marginTop: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }),
            width: '100%',
            justifyContent: 'space-between',
          }}>
            <button
              onClick={handleSkip}
              style={{
                padding: getResponsiveValue({ mobile: '0.5rem 1rem', tablet: '0.75rem 1.5rem' }),
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
                fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }),
                flex: 1,
              }}
            >
              跳过
            </button>
            
            <button
              onClick={handleNext}
              style={{
                padding: getResponsiveValue({ mobile: '0.5rem 1rem', tablet: '0.75rem 1.5rem' }),
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }),
                flex: 2,
              }}
            >
              {currentStep < steps.length - 1 ? '下一步' : '开始使用'}
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }),
          }}>
            {steps.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '50%',
                  backgroundColor: index === currentStep ? '#3b82f6' : '#e5e7eb',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
