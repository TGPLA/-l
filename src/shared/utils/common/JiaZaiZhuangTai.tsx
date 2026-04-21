// @审计已完成
// 加载状态组件 - 统一的加载动画

interface JiaZaiZhuangTaiProps {
  wenAn?: string;
  chiCun?: 'small' | 'medium' | 'large';
  anSeZhuTi?: boolean;
}

export function JiaZaiZhuangTai({ wenAn = '加载中...', chiCun = 'medium', anSeZhuTi = false }: JiaZaiZhuangTaiProps) {
  const chiCunMap = {
    small: { spinner: '1.5rem', text: '0.75rem' },
    medium: { spinner: '2rem', text: '0.875rem' },
    large: { spinner: '3rem', text: '1rem' },
  };

  const { spinner, text } = chiCunMap[chiCun];
  const textColor = anSeZhuTi ? '#d1d5db' : '#6b7280';
  const borderColor = anSeZhuTi ? 'rgba(255, 255, 255, 0.15)' : '#e5e7eb';
  const spinnerColor = anSeZhuTi ? '#60a5fa' : '#3b82f6';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '2rem',
    }}>
      <div style={{
        width: spinner,
        height: spinner,
        border: '3px solid ' + borderColor,
        borderTopColor: spinnerColor,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <span style={{ color: textColor, fontSize: text }}>{wenAn}</span>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export function QuanPingJiaZai({ wenAn = '加载中...' }: { wenAn?: string }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <JiaZaiZhuangTai wenAn={wenAn} chiCun="large" />
    </div>
  );
}
