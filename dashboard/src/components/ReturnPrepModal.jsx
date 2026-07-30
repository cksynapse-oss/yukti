import React from 'react';
import { X, FileText, Download, Check } from 'lucide-react';

const ReturnPrepModal = ({ onClose, gstrSummary }) => {
  if (!gstrSummary) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          maxWidth: '600px',
          width: '90%',
          backgroundColor: 'var(--bg-card, #111114)',
          border: '1px solid var(--border-color, #222228)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color, #222228)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--text-primary, #ffffff)" />
            <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #ffffff)' }}>
              Return Preparation & Tally Export
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #888)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary, #ffffff)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted, #888)'}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div className="glass-panel" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid var(--border-color, #222228)'
          }}>
            <span style={{ color: 'var(--text-secondary, #a0a0a0)', fontSize: '14px' }}>GSTR-1 Outward Tax Liability</span>
            <span className="tabular-nums" style={{ fontSize: '20px', color: 'var(--text-primary, #ffffff)' }}>
              {gstrSummary.gstr1_outwardLiability}
            </span>
          </div>

          <div className="glass-panel" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid var(--border-color, #222228)'
          }}>
            <span style={{ color: 'var(--text-secondary, #a0a0a0)', fontSize: '14px' }}>GSTR-3B Eligible ITC</span>
            <span className="tabular-nums" style={{ fontSize: '20px', color: 'var(--accent-green, #10b981)' }}>
              {gstrSummary.gstr3b_eligibleITC}
            </span>
          </div>

          <div className="glass-panel" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid var(--border-color, #222228)'
          }}>
            <span style={{ color: 'var(--text-secondary, #a0a0a0)', fontSize: '14px' }}>Ineligible ITC (Sec 17(5))</span>
            <span className="tabular-nums" style={{ fontSize: '20px', color: 'var(--accent-red, #ef4444)' }}>
              {gstrSummary.ineligibleITC_sec17_5}
            </span>
          </div>

          <div className="glass-panel" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px'
          }}>
            <span style={{ color: 'var(--text-secondary, #a0a0a0)', fontSize: '14px' }}>Net Tax Payable</span>
            <span className="tabular-nums" style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              color: gstrSummary.netTaxPayable && gstrSummary.netTaxPayable.includes('Refund') ? 'var(--accent-green, #10b981)' : 'var(--accent-red, #ef4444)'
            }}>
              {gstrSummary.netTaxPayable}
            </span>
          </div>
        </div>

        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid var(--border-color, #222228)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color, #222228)',
              color: 'var(--text-secondary, #a0a0a0)',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--text-muted, #888)';
              e.currentTarget.style.color = 'var(--text-primary, #ffffff)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color, #222228)';
              e.currentTarget.style.color = 'var(--text-secondary, #a0a0a0)';
            }}
          >
            <Download size={16} />
            Export Tally XML
          </button>
          
          <button 
            onClick={onClose}
            style={{
              background: 'var(--accent-green, #10b981)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            <Check size={16} />
            Generate JSON for Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnPrepModal;
