// @审计已完成
// EPUB 导入弹窗 - 表单子组件

interface EPUBDaoRuTanChuangShangChuanBiaoDanProps {
  darkMode: boolean;
  loading: boolean;
  jieXiZhuangTai: boolean;
  title: string;
  author: string;
  onTitleChange: (title: string) => void;
  onAuthorChange: (author: string) => void;
  onConfirm: () => void;
}

export function EPUBDaoRuTanChuangShangChuanBiaoDan({ darkMode, loading, jieXiZhuangTai, title, author, onTitleChange, onAuthorChange, onConfirm }: EPUBDaoRuTanChuangShangChuanBiaoDanProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {jieXiZhuangTai && (
        <div style={{ padding: '0.75rem', backgroundColor: darkMode ? '#1f2937' : '#eff6ff', color: darkMode ? '#60a5fa' : '#2563eb', borderRadius: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          正在解析 EPUB 文件...
        </div>
      )}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
          书名
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="请输入书名"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            color: darkMode ? '#f9fafb' : '#111827',
          }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
          作者
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => onAuthorChange(e.target.value)}
          placeholder="请输入作者（可选）"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            color: darkMode ? '#f9fafb' : '#111827',
          }}
        />
      </div>
      <button
        onClick={onConfirm}
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          border: 'none',
          borderRadius: '0.5rem',
          backgroundColor: loading ? '#9ca3af' : '#3b82f6',
          color: '#ffffff',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
        }}
      >
        下一步
      </button>
    </div>
  );
}
