// @审计已完成
// 删除确认模态框

interface ShanChuQueRenTanChuangProps {
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ShanChuQueRenTanChuang({ title, content, onConfirm, onCancel }: ShanChuQueRenTanChuangProps) {
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
    }} onClick={onCancel}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        maxWidth: '24rem',
        width: '100%',
        padding: '1.5rem',
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.9375rem', color: '#4b5563', marginBottom: '1.5rem' }}>
          {content}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: 'transparent',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '0.9375rem',
            }}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9375rem',
            }}
          >
            确定删除
          </button>
        </div>
      </div>
    </div>
  );
}
