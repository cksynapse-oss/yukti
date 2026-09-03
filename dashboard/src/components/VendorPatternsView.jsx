import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Trash2, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  BookOpen, 
  TrendingUp, 
  Cpu, 
  FileCheck,
  AlertTriangle,
  Calendar,
  Clock,
  ShieldAlert
} from 'lucide-react';

export default function VendorPatternsView({ 
  patterns = [], 
  onDeletePattern, 
  onResetPatterns,
  onShowToast 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPattern, setSelectedPattern] = useState(patterns[0] || null);

  const filtered = patterns.filter(p => 
    (p.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.supplierGstin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.defaultLedger || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCorrections = patterns.reduce((sum, p) => sum + (p.correctionsCount || 0), 0);
  const anomaliesCount = patterns.filter(p => p.anomaly?.hasAnomaly).length;

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="view-pretitle">
            <Sparkles size={14} className="text-brand" />
            <span>Practice Institutional Memory</span>
          </div>
          <h1 className="view-title">Vendor Intelligence & Behavioral Models</h1>
          <p className="view-subtitle">
            Yukti continuously models typical bill amounts, tax classifications, arrival dates, and formats per supplier—creating an irreplaceable firm operating moat.
          </p>
        </div>
        <div className="header-actions-group">
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              onResetPatterns();
              if (onShowToast) onShowToast("Restored default vendor intelligence patterns.");
            }}
          >
            <RotateCcw size={14} />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper">
            <Cpu size={18} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Vendor Profiles</span>
            <h3 className="kpi-value">{patterns.length}</h3>
            <span className="kpi-subtext">Behavioral baseline models</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper text-amber">
            <AlertTriangle size={18} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Active Anomalies</span>
            <h3 className="kpi-value text-amber">{anomaliesCount} Flagged</h3>
            <span className="kpi-subtext">Amount / rate spikes detected</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper text-green">
            <CheckCircle2 size={18} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Firm Memory Depth</span>
            <h3 className="kpi-value">{totalCorrections} Rules</h3>
            <span className="kpi-subtext">Learned from CA approvals</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper text-brand">
            <TrendingUp size={18} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Zero-Touch Accuracy</span>
            <h3 className="kpi-value text-green">91.4%</h3>
            <span className="kpi-subtext">1,051 vouchers to Tally</span>
          </div>
        </div>
      </div>

      {/* Active Anomaly Spotlight Banner (Item 10) */}
      <div className="panel" style={{ padding: '16px 20px', background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '13px', color: '#92400E' }}>
                Active Behavioral Anomaly: Reliance Industries Limited (GSTIN: 27AAACR5055K1Z2)
              </strong>
              <span className="badge badge-warning font-mono" style={{ fontSize: '10px' }}>
                4.3× Normal Amount
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#B45309', margin: '4px 0 8px 0', lineHeight: 1.4 }}>
              <strong>Yukti has learned:</strong> Typical invoice amount is ₹18k–₹42k at 18% GST arriving 15th–20th. Current invoice is <strong>₹1.42 Lakhs</strong>. Flagged because current bill exceeds 14 historical invoices by 430%.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-neutral font-mono" style={{ fontSize: '10px', background: '#FFFFFF' }}>
                Typical: ₹18k–₹42k
              </span>
              <span className="badge badge-neutral font-mono" style={{ fontSize: '10px', background: '#FFFFFF' }}>
                Rate: 18% (SAC 998313)
              </span>
              <span className="badge badge-neutral font-mono" style={{ fontSize: '10px', background: '#FFFFFF' }}>
                Arrival: 15th–20th
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Vendor Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {filtered.map(p => (
          <div 
            key={p.supplierGstin} 
            className="panel" 
            style={{ 
              padding: '18px', 
              borderLeft: p.anomaly?.hasAnomaly ? '3px solid #F59E0B' : '3px solid #10B981' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {p.supplierName}
                </h3>
                <span className="font-mono text-xs text-muted" style={{ display: 'block', marginTop: '2px' }}>
                  GSTIN: {p.supplierGstin}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`badge ${p.anomaly?.hasAnomaly ? 'badge-warning' : 'badge-success'} font-mono`} style={{ fontSize: '10px' }}>
                  {p.anomaly?.hasAnomaly ? 'Anomaly Alert' : 'Model Verified'}
                </span>
                <button
                  className="btn-icon-action"
                  onClick={() => onDeletePattern(p.supplierGstin)}
                  title="Remove pattern memory"
                >
                  <Trash2 size={13} className="text-muted" />
                </button>
              </div>
            </div>

            {/* Behavioral Benchmarks */}
            <div style={{ background: 'var(--bg-subtle)', borderRadius: '6px', padding: '10px 12px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Typical Amount Range:</span>
                <strong className="font-mono text-primary">{p.typicalAmountRange || "₹50,000 – ₹1,50,000"}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Typical GST Rate:</span>
                <strong className="font-mono text-primary">{p.typicalGstRate || `${p.defaultGstRate}%`}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Expected Invoice Arrival:</span>
                <strong className="text-primary">{p.typicalTiming || "15th – 20th of month"}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Document Format:</span>
                <strong className="text-primary">{p.typicalFormat || "PDF"}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Reconciliation Tolerance:</span>
                <strong className="font-mono text-green">{p.reconciliationTolerance || "₹5 (Rounding)"}</strong>
              </div>
            </div>

            {/* Suggested Tally Ledger */}
            <div style={{ fontSize: '11px', marginBottom: '10px' }}>
              <span className="text-muted block text-xs">Auto-Mapped Tally Purchase Ledger:</span>
              <strong className="text-brand text-xs block mt-0.5">{p.defaultLedger}</strong>
            </div>

            {/* Notes & Learning Origin */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
              <span>Learned from <strong>{p.correctionsCount || 4} CA decisions</strong></span>
              <span>Updated: {p.lastCorrected || "2026-07-22"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
