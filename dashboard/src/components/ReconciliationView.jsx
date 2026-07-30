import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileSearch, 
  ArrowRight,
  TrendingUp,
  Percent,
  CheckSquare,
  AlertCircle
} from 'lucide-react';

const ReconciliationView = ({ reconData, onOpenVendorFollowup }) => {
  if (!reconData) return null;

  const { stats, itcBreakdown, threeWaySample, mismatchBuckets } = reconData;
  const totalMatches = stats.pass1_exact + stats.pass2_fuzzy + stats.pass3_smart + stats.unmatched;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Exact Match': return <span className="badge badge-green" style={{display: 'inline-flex', alignItems: 'center'}}><CheckSquare size={12} style={{marginRight: '4px'}}/>{status}</span>;
      case 'Missing in 2B': return <span className="badge badge-amber" style={{display: 'inline-flex', alignItems: 'center'}}><AlertTriangle size={12} style={{marginRight: '4px'}}/>{status}</span>;
      case 'Amount Mismatch': return <span className="badge badge-indigo" style={{display: 'inline-flex', alignItems: 'center'}}><AlertCircle size={12} style={{marginRight: '4px'}}/>{status}</span>;
      case 'OCR Mismatch': return <span className="badge badge-red" style={{display: 'inline-flex', alignItems: 'center'}}><XCircle size={12} style={{marginRight: '4px'}}/>{status}</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const getCategoryBadge = (category) => {
    switch(category) {
      case 'eligible': return <span className="badge badge-green">Eligible</span>;
      case 'ineligible': return <span className="badge badge-red">Ineligible</span>;
      case 'missingIn2B': return <span className="badge badge-amber">Missing in 2B</span>;
      case 'rateMismatch': return <span className="badge badge-indigo">Rate Mismatch</span>;
      default: return <span className="badge">{category}</span>;
    }
  };

  return (
    <div style={{ padding: '24px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 8px 0', color: 'var(--accent-green)' }}>
            GSTR-2B × Tally × OCR — 3-Way Reconciliation
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            July 2026 — Rajnish & Associates
          </p>
        </div>
      </div>

      {/* ITC BREAKDOWN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        
        {/* Eligible */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderTop: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Eligible ITC</span>
            <CheckCircle size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {itcBreakdown.eligible.value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Count: {itcBreakdown.eligible.count}</span>
            <span>•</span>
            <span style={{ color: '#10B981', fontWeight: '600' }}>{itcBreakdown.eligible.pct}% of total</span>
          </div>
        </div>

        {/* Ineligible */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderTop: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Ineligible</span>
            <XCircle size={20} color="#EF4444" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {itcBreakdown.ineligible.value}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Count: {itcBreakdown.ineligible.count}</span>
              <span>•</span>
              <span style={{ color: '#EF4444', fontWeight: '600' }}>{itcBreakdown.ineligible.pct}%</span>
            </div>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{itcBreakdown.ineligible.label}</span>
          </div>
        </div>

        {/* Missing in 2B */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderTop: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Missing in 2B</span>
            <AlertTriangle size={20} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {itcBreakdown.missingIn2B.value}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Count: {itcBreakdown.missingIn2B.count}</span>
              <span>•</span>
              <span style={{ color: '#F59E0B', fontWeight: '600' }}>{itcBreakdown.missingIn2B.pct}%</span>
            </div>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{itcBreakdown.missingIn2B.label}</span>
          </div>
        </div>

        {/* Rate Mismatch */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderTop: '4px solid #6366F1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Rate Mismatch</span>
            <Percent size={20} color="#6366F1" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {itcBreakdown.rateMismatch.value}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Count: {itcBreakdown.rateMismatch.count}</span>
              <span>•</span>
              <span style={{ color: '#6366F1', fontWeight: '600' }}>{itcBreakdown.rateMismatch.pct}%</span>
            </div>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{itcBreakdown.rateMismatch.label}</span>
          </div>
        </div>

      </div>

      {/* MATCH PIPELINE */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="var(--accent-green)"/> Match Pipeline
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between' }}>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
              <span>Pass 1: Exact Match</span>
              <span style={{ fontWeight: '600' }}>{stats.pass1_exact}%</span>
            </div>
            <div className="progress-container" style={{ background: '#E5E7EB', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
              <div className="progress-bar-green" style={{ width: `${stats.pass1_exact}%`, background: '#10B981', height: '100%' }}></div>
            </div>
          </div>
          
          <ArrowRight size={16} color="var(--text-muted)" />
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
              <span>Pass 2: Fuzzy Match</span>
              <span style={{ fontWeight: '600' }}>{stats.pass2_fuzzy}%</span>
            </div>
            <div className="progress-container" style={{ background: '#E5E7EB', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
              <div className="progress-bar" style={{ width: `${stats.pass2_fuzzy}%`, background: '#3B82F6', height: '100%' }}></div>
            </div>
          </div>

          <ArrowRight size={16} color="var(--text-muted)" />

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
              <span>Pass 3: Smart AI</span>
              <span style={{ fontWeight: '600' }}>{stats.pass3_smart}%</span>
            </div>
            <div className="progress-container" style={{ background: '#E5E7EB', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
              <div className="progress-bar" style={{ width: `${stats.pass3_smart}%`, background: '#8B5CF6', height: '100%' }}></div>
            </div>
          </div>

          <ArrowRight size={16} color="var(--text-muted)" />

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
              <span>Unmatched</span>
              <span style={{ fontWeight: '600' }}>{stats.unmatched}%</span>
            </div>
            <div className="progress-container" style={{ background: '#E5E7EB', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
              <div className="progress-bar" style={{ width: `${stats.unmatched}%`, background: '#EF4444', height: '100%' }}></div>
            </div>
          </div>

        </div>
      </div>

      {/* 3-WAY COMPARISON TABLE */}
      <div className="glass-panel" style={{ borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSearch size={18} color="var(--accent-green)"/> 3-Way Sample Comparison
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '12px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>Vendor</th>
                <th style={{ padding: '12px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>Invoice #</th>
                <th style={{ padding: '12px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>OCR Amount</th>
                <th style={{ padding: '12px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>Tally Amount</th>
                <th style={{ padding: '12px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>Portal (2B) Amount</th>
                <th style={{ padding: '12px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>ITC Category</th>
              </tr>
            </thead>
            <tbody>
              {threeWaySample.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '500' }}>{row.vendor}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{row.invoiceNo}</td>
                  <td style={{ padding: '16px 20px' }}>₹{row.ocrAmount.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '16px 20px' }}>₹{row.tallyAmount.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '16px 20px' }}>
                    {row.portalAmount === null ? (
                      <span style={{ color: '#EF4444', fontWeight: '600' }}>—</span>
                    ) : (
                      `₹${row.portalAmount.toLocaleString('en-IN')}`
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>{getStatusBadge(row.status)}</td>
                  <td style={{ padding: '16px 20px' }}>{getCategoryBadge(row.itcCategory)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MISMATCH BUCKETS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {Object.entries(mismatchBuckets).map(([key, bucket]) => {
          let title = key.replace('_', ' ').toUpperCase();
          if(key === 'books_only') title = 'BOOKS ONLY (MISSING IN 2B)';
          if(key === 'portal_only') title = 'PORTAL ONLY (MISSING IN BOOKS)';
          
          return (
            <div key={key} className="glass-panel" style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{title}</h4>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{bucket.value}</div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{bucket.count} Invoices</p>
              <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                <button 
                  onClick={() => onOpenVendorFollowup({ title, desc: bucket.description })}
                  style={{ 
                    width: '100%', 
                    padding: '10px 16px', 
                    background: 'var(--accent-green)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Send Follow-up <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ReconciliationView;
