// @审计已完成
// 段落渲染工具 - 智能段落分割和美化

import React from 'react';

interface DuanLuoXuanRanProps {
  content: string;
}

export function DuanLuoXuanRan({ content }: DuanLuoXuanRanProps) {
  if (!content) {
    return <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>暂无章节内容</div>;
  }

  const 段落列表 = 分割文本为段落(content);

  return (
    <div>
      {段落列表.map((段落, 索引) => (
        <p
          key={索引}
          style={{
            margin: 0,
            marginBottom: '1rem',
            textIndent: '2em',
            lineHeight: 1.8,
            textAlign: 'justify',
          }}
        >
          {段落}
        </p>
      ))}
    </div>
  );
}

function 分割文本为段落(text: string): string[] {
  if (!text) return [];

  return text
    .split(/\n+/)
    .map(段落 => 段落.trim())
    .filter(段落 => 段落.length > 0);
}

export function 简单段落渲染(content: string): React.ReactNode {
  if (!content) {
    return <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>暂无章节内容</div>;
  }

  const 段落列表 = content
    .split(/\n+/)
    .map(段落 => 段落.trim())
    .filter(段落 => 段落.length > 0);

  return (
    <div>
      {段落列表.map((段落, 索引) => (
        <p
          key={索引}
          style={{
            margin: 0,
            marginBottom: '1rem',
            lineHeight: 1.8,
          }}
        >
          {段落}
        </p>
      ))}
    </div>
  );
}
