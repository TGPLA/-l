// @审计已完成
// 划词创建段落底部栏

interface HuaCiChuangJianDiLanProps {
  selectedText: string;
  onCancel: () => void;
  onCreate: () => void;
  creating: boolean;
}

export function HuaCiChuangJianDiLan({ selectedText, onCancel, onCreate, creating }: HuaCiChuangJianDiLanProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      padding: '1rem',
      boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 40,
    }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
          已选中 {selectedText.length} 字
        </div>
        <div style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          marginBottom: '0.75rem',
          maxHeight: '4rem',
          overflowY: 'auto',
          fontSize: '0.875rem',
          color: '#374151',
          lineHeight: 1.5,
        }}>
          {selectedText.length > 200 ? selectedText.slice(0, 200) + '...' : selectedText}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: 'transparent',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={onCreate}
            disabled={creating}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: creating ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: creating ? 'not-allowed' : 'pointer',
            }}
          >
            {creating ? '创建中...' : '创建段落'}
          </button>
        </div>
      </div>
    </div>
  );
}
