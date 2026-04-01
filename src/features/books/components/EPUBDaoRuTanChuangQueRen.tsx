// @审计已完成
// EPUB 导入弹窗 - 确认信息子组件

interface EPUBDaoRuTanChuangQueRenProps {
  title: string;
  author: string;
  darkMode: boolean;
  onConfirm: () => void;
  onReset: () => void;
  onClose: () => void;
  loading: boolean;
}

export function EPUBDaoRuTanChuangQueRen({ title, author, darkMode, onConfirm, onReset, onClose, loading }: EPUBDaoRuTanChuangQueRenProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: darkMode ? '#f9fafb' : '#111827' }}>确认导入信息</h2>
        <button onClick={onClose} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div style={{ backgroundColor: darkMode ? '#374151' : '#f9fafb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '0.5rem' }}>书籍信息</h3>
        <p style={{ fontSize: '1.125rem', fontWeight: 600, color: darkMode ? '#f9fafb' : '#111827' }}>{title}</p>
        <p style={{ fontSize: '0.875rem', color: darkMode ? '#d1d5db' : '#6b7280', marginTop: '0.25rem' }}>作者：{author}</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button onClick={onReset} style={{ padding: '0.5rem 1rem', border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, borderRadius: '0.5rem', backgroundColor: 'transparent', color: darkMode ? '#e5e7eb' : '#374151', cursor: 'pointer' }}>重新选择</button>
        <button onClick={onConfirm} disabled={loading} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', backgroundColor: loading ? '#9ca3af' : '#3b82f6', color: '#ffffff', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '导入中...' : '确认导入'}
        </button>
      </div>
    </div>
  );
}
