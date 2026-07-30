import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Copy, ArrowRight } from 'lucide-react';

const ReconciliationView = ({ reconData, onOpenVendorFollowup }) => {
  if (!reconData) return null;

  const { stats, mismatchBuckets } = reconData;

  const getBucketInfo = (key) => {
    switch (key) {
      case 'books_only':
        return {
          title: 'Books Only (Missing in GSTR-2B)',
          icon: <AlertTriangle size={18} style={{ color: 'var(--accent-amber)', marginRight: '8px' }} />,
          color: 'var(--accent-amber)'
        };
      case 'portal_only':
        return {
          title: 'Portal Only (Missing in Books)',
          icon: <XCircle size={18} style={{ color: 'var(--accent-red)', marginRight: '8px' }} />,
          color: 'var(--accent-red)'
        };
      case 'amount_mismatch':
        return {
          title: 'Amount Mismatch',
          icon: <AlertTriangle size={18} style={{ color: 'var(--accent-indigo)', marginRight: '8px' }} />,
          color: 'var(--accent-indigo)'
        };
      case 'duplicate_entry':
        return {
          title: 'Duplicate Entries',
          icon: <Copy size={18} style={{ color: 'var(--accent-amber)', marginRight: '8px' }} />,
          color: 'var(--accent-amber)'
        };
      default:
        return {
          title: key,
          icon: <AlertTriangle size={18} style={{ color: 'var(--text-primary)', marginRight: '8px' }} />,
          color: 'var(--text-primary)'
        };
    }
  };

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '24px', margin: '0 0 4px 0' }}>GSTR-2B Reconciliation</h2>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Books vs. Portal matching — July 2026</div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Pass 1: Exact Match</div>
            <div style={{ color: 'var(--text-primary)', fontSize: '32px', marginBottom: '8px' }} className="tabular-nums">{stats?.pass1_exact || 0}%</div>
            <div className="progress-container">
              <div className="progress-bar progress-bar-green" style={{ width: `${stats?.pass1_exact || 0}%` }}></div>
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Pass 2: Fuzzy Match</div>
            <div style={{ color: 'var(--text-primary)', fontSize: '32px', marginBottom: '8px' }} className="tabular-nums">{stats?.pass2_fuzzy || 0}%</div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${stats?.pass2_fuzzy || 0}%`, background: 'var(--accent-amber)' }}></div>
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Pass 3: Smart Match</div>
            <div style={{ color: 'var(--text-primary)', fontSize: '32px', marginBottom: '8px' }} className="tabular-nums">{stats?.pass3_smart || 0}%</div>
            <div className="progress-container">
              <div className="progress-bar progress-bar-indigo" style={{ width: `${stats?.pass3_smart || 0}%` }}></div>
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Unmatched</div>
            <div style={{ color: 'var(--text-primary)', fontSize: '32px', marginBottom: '8px' }} className="tabular-nums">{stats?.unmatched || 0}%</div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${stats?.unmatched || 0}%`, background: 'var(--accent-red)' }}></div>
            </div>
          </div>
        </div>
      </div>

      <h3 style={{ color: 'var(--text-secondary)', fontSize: '18px', marginTop: '32px', marginBottom: '16px', fontWeight: '600' }}>Mismatch Breakdown</h3>
      
      {mismatchBuckets && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {Object.entries(mismatchBuckets).map(([key, bucket]) => {
            const info = getBucketInfo(key);
            return (
              <div key={key} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  {info.icon}
                  <div style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: '500' }}>{info.title}</div>
                </div>
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <div style={{ fontSize: '28px', color: info.color, fontWeight: '600' }} className="tabular-nums">{bucket.count}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>{bucket.value}</div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5', flexGrow: 1, marginBottom: '20px' }}>
                  {bucket.description}
                </div>
                <button 
                  onClick={() => onOpenVendorFollowup && onOpenVendorFollowup({ title: info.title, desc: bucket.description })}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'transparent', 
                    border: `1px solid ${info.color}`, 
                    color: info.color, 
                    padding: '8px 16px', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    marginTop: 'auto',
                    transition: 'background 0.2s ease, color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = info.color;
                    e.currentTarget.style.color = 'var(--bg-card, #111114)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = info.color;
                  }}
                >
                  Send Follow-up <ArrowRight size={14} style={{ marginLeft: '6px' }} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReconciliationView;
