// @审计已完成
// 笔记抽屉面板 - 划线笔记和复述记录，标签页切换

import React, { useState, useEffect } from 'react';
import type { HuaXianXinXi, HuaXianYanSe } from '../hooks/useHuaXianChuTi';
import { paraphraseService, type ParaphraseRecord } from '@shared/services/paraphraseService';
import { showError } from '@shared/utils/common/ToastTiShi';

interface BiJiChouTiProps {
  highlights: HuaXianXinXi[];
  bookId: string;
  onDelete: (id: string) => void;
  onJump: (huaXian: HuaXianXinXi) => void;
  onGuanBi: () => void;
}

const YAN_SE_COLOR: Record<HuaXianYanSe, string> = {
  yellow: '#000000',
  green: '#000000',
  blue: '#000000',
  pink: '#000000',
};

type BiaoQian = 'huaxian' | 'fushu';

export function BiJiChouTi({ highlights, bookId, onDelete, onJump, onGuanBi }: BiJiChouTiProps) {
  const [biaoQian, setBiaoQian] = useState<BiaoQian>('huaxian');
  const [fuShuJiLu, setFuShuJiLu] = useState<ParaphraseRecord[]>([]);
  const [jiaZaiZhong, setJiaZaiZhong] = useState(false);

  const paiXuHouDeHuaXian = [...highlights].sort((a, b) => b.createdAt - a.createdAt);

  useEffect(() => {
    if (biaoQian === 'fushu') {
      jiaZaiFuShuJiLu();
    }
  }, [biaoQian, bookId]);

  const jiaZaiFuShuJiLu = async () => {
    setJiaZaiZhong(true);
    try {
      const { records, error } = await paraphraseService.getParaphrasesByBook(bookId);
      if (error) {
        showError('加载复述记录失败：' + error);
        return;
      }
      setFuShuJiLu(records);
    } finally {
      setJiaZaiZhong(false);
    }
  };

  const shanChuFuShu = async (id: string) => {
    const queDing = confirm('确定要删除这条复述记录吗？');
    if (!queDing) return;

    try {
      const { error } = await paraphraseService.deleteParaphrase(id);
      if (error) {
        showError('删除失败：' + error);
        return;
      }
      setFuShuJiLu(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error('删除复述记录失败:', e);
    }
  };

  return (
    <div style={{
      width: '360px',
      height: '100%',
      backgroundColor: '#252525',
      borderLeft: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      right: 0,
      top: 0,
      zIndex: 10001,
      animation: 'slideInRight 0.25s ease-out',
    }}>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f3f4f6' }}>
          {biaoQian === 'huaxian' ? `笔记 (${highlights.length})` : `复述 (${fuShuJiLu.length})`}
        </h3>
        <button onClick={onGuanBi} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.25rem' }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
        <button
          onClick={() => setBiaoQian('huaxian')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            backgroundColor: biaoQian === 'huaxian' ? '#2d2d2d' : 'transparent',
            color: biaoQian === 'huaxian' ? '#f3f4f6' : '#6b7280',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            borderBottom: biaoQian === 'huaxian' ? '2px solid #60a5fa' : '2px solid transparent',
          }}
        >
          划线笔记
        </button>
        <button
          onClick={() => setBiaoQian('fushu')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            backgroundColor: biaoQian === 'fushu' ? '#2d2d2d' : 'transparent',
            color: biaoQian === 'fushu' ? '#f3f4f6' : '#6b7280',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            borderBottom: biaoQian === 'fushu' ? '2px solid #60a5fa' : '2px solid transparent',
          }}
        >
          复述记录
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        {biaoQian === 'huaxian' ? (
          paiXuHouDeHuaXian.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.75rem' }}>
              <svg width="48" height="48" fill="none" stroke="#4b5563" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>暂无笔记</p>
              <p style={{ margin: 0, color: '#4b5563', fontSize: '0.78rem' }}>在阅读时划线并添加想法</p>
            </div>
          ) : (
            paiXuHouDeHuaXian.map(h => (
              <div
                key={h.id}
                onClick={() => onJump(h)}
                style={{
                  padding: '0.85rem',
                  marginBottom: '0.6rem',
                  backgroundColor: '#2d2d2d',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  transition: 'border-color 0.12s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: YAN_SE_COLOR[h.yanSe], flexShrink: 0 }} />
                  <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                    {new Date(h.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(h.id); }}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.15rem', opacity: 0.6 }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '0.87rem', color: '#d1d5db', lineHeight: 1.6 }}>{h.text}</p>
                {h.beiZhu && (
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: '#9ca3af', fontStyle: 'italic', borderTop: '1px solid #374151', paddingTop: '0.4rem' }}>
                    💡 {h.beiZhu}
                  </p>
                )}
              </div>
            ))
          )
        ) : (
          jiaZaiZhong ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.75rem' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '3px solid rgba(96, 165, 250, 0.2)',
                borderTopColor: '#60a5fa',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>加载中...</p>
            </div>
          ) : fuShuJiLu.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.75rem' }}>
              <svg width="48" height="48" fill="none" stroke="#4b5563" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>暂无复述记录</p>
              <p style={{ margin: 0, color: '#4b5563', fontSize: '0.78rem' }}>选择文本后使用「用自己的话复述」</p>
            </div>
          ) : (
            fuShuJiLu.map(jiLu => (
              <div
                key={jiLu.id}
                style={{
                  padding: '0.85rem',
                  marginBottom: '0.6rem',
                  backgroundColor: '#2d2d2d',
                  borderRadius: '8px',
                  border: '1px solid transparent',
                  transition: 'border-color 0.12s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                    {new Date(jiLu.created_at).toLocaleDateString('zh-CN')}
                  </span>
                  <button
                    onClick={() => shanChuFuShu(jiLu.id)}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.15rem', opacity: 0.6 }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#9ca3af', lineHeight: 1.5 }}>
                  原文：{jiLu.original_text.length > 100 ? jiLu.original_text.substring(0, 100) + '...' : jiLu.original_text}
                </p>
                <p style={{ margin: 0, fontSize: '0.87rem', color: '#d1d5db', lineHeight: 1.6 }}>
                  {jiLu.paraphrased_text}
                </p>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
