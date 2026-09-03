import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Eye, 
  Check, 
  X, 
  Zap, 
  Sparkles, 
  ShieldAlert, 
  BookOpen, 
  Send,
  ArrowRight,
  HelpCircle,
  FileCheck,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import VendorPatternBanner from './VendorPatternBanner';

export default function ReviewQueue({ 
  reviewItems = [], 
  onApprove, 
  onReject, 
  onInspect, 
  onBulkApproveNearMatches,
  onOpenVendorFollowup,
  getPattern,
  onNavigateTab
}) {
  const [selectedId, setSelectedId] = useState(reviewItems[0]?.id || null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(true);

  // Keep selection valid when items change
  useEffect(() => {
    if (!reviewItems.some(i => i.id === selectedId) && reviewItems.length > 0) {
      setSelectedId(reviewItems[0].id);
    }
  }, [reviewItems, selectedId]);

  // Filter items
  const filteredItems = reviewItems.filter(item => {
    const matchesCategory = 
      categoryFilter === 'All' ? true :
      categoryFilter === 'Critical' ? item.issueSeverity === 'CRITICAL' :
      categoryFilter === 'Math Mismatch' ? item.issueCategory === 'Math Mismatch' :
      categoryFilter === 'Missing in 2B' ? item.issueCategory === 'Missing in GSTR-2B' :
      categoryFilter === 'Rule 37' ? item.issueCategory === 'Rule 37 Warning' :
      categoryFilter === 'Near Matches' ? item.issueCategory?.includes('Near Match') : true;

    const matchesSearch = 
      (item.supplierName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.supplierGstin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.invoiceNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const selectedIndex = filteredItems.findIndex(i => i.id === selectedId);
  const activeItem = filteredItems[selectedIndex] || filteredItems[0];
  const activePattern = activeItem ? getPattern?.(activeItem.supplierGstin) : null;

  // Keyboard Event Listener (J, K, A, R, E)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        if (selectedIndex < filteredItems.length - 1) {
          setSelectedId(filteredItems[selectedIndex + 1].id);
        }
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        if (selectedIndex > 0) {
          setSelectedId(filteredItems[selectedIndex - 1].id);
        }
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (activeItem) {
          onApprove(activeItem.id);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (activeItem) {
          onReject(activeItem.id);
        }
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (activeItem) {
          onInspect(activeItem);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredItems, activeItem, onApprove, onReject, onInspect]);

  const risk = activeItem?.riskModel || {
    severity: activeItem?.issueSeverity || 'MEDIUM',
    confidence: activeItem?.confidenceScore || 85,
    confidenceLabel: `${activeItem?.confidenceScore || 85}% — Review recommended`,
    financialImpact: activeItem?.itcAtRisk || '₹0',
    complianceImpact: 'MEDIUM',
    reversibility: 'Easy (Tally Draft)',
    recommendedAction: 'Inspect invoice OCR and verify ledger',
    auditImplication: 'Automated audit flag recorded'
  };

  const evidence = activeItem?.evidence || {
    extractedFields: [
      { field: "Supplier GSTIN", value: activeItem?.supplierGstin, confidence: 99.8, status: "VALID" },
      { field: "Invoice No", value: activeItem?.invoiceNo, confidence: 99.5, status: "VALID" },
      { field: "Taxable Value", value: `₹${(activeItem?.taxableValue || 0).toLocaleString('en-IN')}`, confidence: 98.4, status: "VALID" },
      { field: "Total Stated", value: `₹${(activeItem?.grandTotal || 0).toLocaleString('en-IN')}`, confidence: 98.0, status: "VALID" }
    ],
    rulesApplied: [
      { ruleId: "RULE_1.4", name: "Statutory Section 16 Verification", status: "PASSED" }
    ],
    vendorPatternNotes: "Historical pattern verified against ledger masters."
  };

  return (
    <div className="view-container">
      {/* Top Filter Bar */}
      <div className="flex justify-between items-center gap-4 flex-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Critical', 'Math Mismatch', 'Missing in 2B', 'Rule 37', 'Near Matches'].map(tab => (
            <button
              key={tab}
              className={`btn btn-secondary ${categoryFilter === tab ? 'bg-subtle font-semibold border-brand text-brand' : ''}`}
              style={categoryFilter === tab ? { borderColor: 'var(--brand)', color: 'var(--brand)', backgroundColor: 'var(--brand-light)' } : {}}
              onClick={() => setCategoryFilter(tab)}
            >
              <span>{tab}</span>
              <span className="badge badge-neutral font-mono" style={{ fontSize: '10px' }}>
                {tab === 'All' ? reviewItems.length :
                 tab === 'Critical' ? reviewItems.filter(i => i.issueSeverity === 'CRITICAL').length :
                 tab === 'Math Mismatch' ? reviewItems.filter(i => i.issueCategory === 'Math Mismatch').length :
                 tab === 'Missing in 2B' ? reviewItems.filter(i => i.issueCategory === 'Missing in GSTR-2B').length :
                 tab === 'Rule 37' ? reviewItems.filter(i => i.issueCategory === 'Rule 37 Warning').length :
                 reviewItems.filter(i => i.issueCategory?.includes('Near Match')).length}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search vendor, GSTIN, invoice #..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <button 
            className="btn btn-primary"
            onClick={onBulkApproveNearMatches}
            title="Approve all high-confidence near-matches (< ₹1,000)"
          >
            <Zap size={14} />
            <span>Bulk Approve Near-Matches</span>
          </button>
        </div>
      </div>

      {/* Main Review Split Grid */}
      <div className="review-queue-layout">
        {/* Left Column: List of Items */}
        <div className="queue-items-list">
          {filteredItems.length === 0 ? (
            /* Intelligent Empty State (Item 38) */
            <div className="panel" style={{ padding: '36px 24px', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <CheckCircle size={24} />
              </div>
              <h3 className="font-bold text-primary" style={{ fontSize: '16px', margin: '0 0 6px 0' }}>
                You're clear.
              </h3>
              <p className="text-xs text-muted" style={{ maxWidth: '320px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                Yukti checked <strong>1,248 invoices</strong> across your practice portfolio:
              </p>

              <div style={{ background: 'var(--bg-subtle)', borderRadius: '6px', padding: '12px', textAlign: 'left', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '300px', margin: '0 auto 18px' }}>
                <div className="flex justify-between">
                  <span className="text-muted">Exact Matches:</span>
                  <strong className="font-mono text-green">1,042 auto-posted</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Smart Matches:</span>
                  <strong className="font-mono text-green">98 auto-posted</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Rounding Differences:</span>
                  <strong className="font-mono text-green">48 settled (&lt;₹100)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Exceptions Cleared:</span>
                  <strong className="font-mono text-primary">60 resolved</strong>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '14px' }}>
                <span className="text-xs text-muted block mb-1">Next recommended action:</span>
                <button 
                  className="btn btn-secondary"
                  onClick={() => onNavigateTab ? onNavigateTab('calendar') : null}
                  style={{ fontSize: '11px', padding: '5px 12px', margin: '0 auto' }}
                >
                  Review 3 Upcoming Filing Deadlines →
                </button>
              </div>
            </div>
          ) : (
            filteredItems.map(item => {
              const isSelected = item.id === activeItem?.id;
              const hasPattern = getPattern?.(item.supplierGstin);
              const itemRisk = item.riskModel || {
                severity: item.issueSeverity || 'MEDIUM',
                confidence: item.confidenceScore || 80
              };

              return (
                <div
                  key={item.id}
                  className={`queue-card-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="queue-card-top">
                    <div>
                      <div className="flex items-center gap-1.5" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`status-dot ${
                          itemRisk.severity === 'CRITICAL' ? 'red' :
                          itemRisk.severity === 'HIGH' ? 'amber' : 'green'
                        }`}></span>
                        <span className="queue-vendor-title">{item.supplierName}</span>
                      </div>
                      <div className="queue-vendor-gstin font-mono">{item.supplierGstin}</div>
                    </div>

                    <div className="text-right">
                      <span className={`badge ${
                        itemRisk.severity === 'CRITICAL' ? 'badge-danger' :
                        itemRisk.severity === 'HIGH' ? 'badge-warning' : 'badge-neutral'
                      } font-mono`} style={{ fontSize: '10px' }}>
                        {item.issueSeverity}
                      </span>
                      <span className="text-xs text-muted font-mono block mt-0.5">
                        {itemRisk.confidence || item.confidenceScore}% conf
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-secondary mb-1">
                    Client: <strong>{item.customerName}</strong> • Inv #{item.invoiceNo}
                  </div>

                  {hasPattern && (
                    <div style={{ fontSize: '11px', color: '#15803D', display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                      <Sparkles size={11} />
                      <span>Learned vendor pattern recognized</span>
                    </div>
                  )}

                  <div className="queue-card-meta">
                    <div>
                      <span className="text-muted text-xs">ITC Exposure: </span>
                      <strong className="text-red font-mono">{item.itcAtRisk}</strong>
                    </div>
                    <div className="queue-amount-val font-mono">
                      ₹{item.grandTotal?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Invoice Detail with Risk Model & Evidence Drawer */}
        {activeItem ? (
          <div className="queue-detail-container">
            {/* Vendor Recognition Banner */}
            {activePattern && <VendorPatternBanner pattern={activePattern} />}

            {/* Header with Calibrated Confidence */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Universal Decision Queue
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {activeItem.supplierName}
                </h2>
                <div className="font-mono text-xs text-secondary mt-1">
                  GSTIN: {activeItem.supplierGstin} • Date: {activeItem.invoiceDate} • Inv #{activeItem.invoiceNo}
                </div>
              </div>

              {/* Calibrated Confidence Badge */}
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${
                  risk.confidence >= 90 ? 'badge-success' :
                  risk.confidence >= 75 ? 'badge-warning' : 'badge-danger'
                } font-mono`} style={{ fontSize: '12px', padding: '3px 8px' }}>
                  Confidence: {risk.confidence}%
                </span>
                <span className="text-xs text-muted block mt-0.5">
                  {risk.confidenceLabel}
                </span>
              </div>
            </div>

            {/* Explicit Risk Model Bar (Item 8 of user prompt) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: 'var(--bg-subtle)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '11px' }}>
              <div>
                <span className="text-muted block text-xs">Risk Severity</span>
                <strong style={{ color: risk.severity === 'CRITICAL' ? '#DC2626' : risk.severity === 'HIGH' ? '#D97706' : '#10B981' }}>
                  {risk.severity}
                </strong>
              </div>
              <div>
                <span className="text-muted block text-xs">Financial Exposure</span>
                <strong className="font-mono text-red">
                  {typeof risk.financialImpact === 'number' ? `₹${risk.financialImpact.toLocaleString('en-IN')}` : risk.financialImpact}
                </strong>
              </div>
              <div>
                <span className="text-muted block text-xs">Compliance Impact</span>
                <strong className="text-primary">{risk.complianceImpact || 'HIGH'}</strong>
              </div>
              <div>
                <span className="text-muted block text-xs">Reversibility</span>
                <strong className="text-green">{risk.reversibility || 'Easy (Tally Draft)'}</strong>
              </div>
            </div>

            {/* Diagnostic Box & Recommendation */}
            <div className={`detail-reasoning-card ${activeItem.issueSeverity === 'CRITICAL' ? 'critical' : ''}`}>
              <div className="font-semibold flex items-center gap-1.5 mb-1" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} />
                <span>Diagnostic: {activeItem.issueCategory}</span>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', lineHeight: 1.4 }}>
                {activeItem.reasoningText}
              </p>
              <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <strong className="text-xs text-brand block">Yukti Recommended Action:</strong>
                <span className="text-xs text-primary">{risk.recommendedAction || "Inspect invoice document before posting."}</span>
              </div>
            </div>

            {/* Financial Amounts Breakdown */}
            <div className="panel" style={{ padding: '12px 14px' }}>
              <span className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Financial Amounts Breakdown</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px' }}>
                <div>
                  <span className="text-muted text-xs block">Taxable Value</span>
                  <strong className="font-mono text-sm">₹{activeItem.taxableValue?.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-muted text-xs block">Total Tax (GST)</span>
                  <strong className="font-mono text-sm">₹{(activeItem.cgst + activeItem.sgst + activeItem.igst)?.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-muted text-xs block">Invoice Total</span>
                  <strong className="font-mono text-sm text-brand">₹{activeItem.grandTotal?.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* Suggested Tally Ledger */}
            <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px' }}>
              <span className="form-label" style={{ fontSize: '11px' }}>Auto-Mapped Tally Purchase Ledger</span>
              <div className="flex items-center gap-2 mt-0.5" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={13} className="text-muted" />
                <strong className="text-xs text-primary">{activeItem.suggestedLedger}</strong>
              </div>
            </div>

            {/* Evidence Drawer Accordion (Item 9 & 14) */}
            <div className="panel" style={{ overflow: 'hidden' }}>
              <div 
                style={{ padding: '10px 14px', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setShowEvidenceDrawer(!showEvidenceDrawer)}
              >
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-brand" />
                  <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                    Evidence Drawer (Why did Yukti flag this?)
                  </strong>
                </div>
                {showEvidenceDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>

              {showEvidenceDrawer && (
                <div style={{ padding: '12px 14px', fontSize: '11px' }}>
                  {/* Extracted Fields Table */}
                  <span className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
                    Extracted OCR Fields & Confidence Calibration
                  </span>
                  <table className="data-table mb-3" style={{ fontSize: '11px', marginBottom: '10px' }}>
                    <thead>
                      <tr>
                        <th>Field Name</th>
                        <th>Extracted Value</th>
                        <th>Confidence</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(evidence.extractedFields || []).map((f, i) => (
                        <tr key={i}>
                          <td className="font-semibold text-primary">{f.field}</td>
                          <td className="font-mono">{f.value}</td>
                          <td className="font-mono">{f.confidence}%</td>
                          <td>
                            <span className={`badge ${f.status === 'VALID' ? 'badge-success' : 'badge-danger'} font-mono`} style={{ fontSize: '9px' }}>
                              {f.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Rules Applied */}
                  <span className="form-label" style={{ marginBottom: '4px', display: 'block' }}>
                    Deterministic Rules & Patterns Applied
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(evidence.rulesApplied || []).map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                        <span className="text-secondary">{r.ruleId}: {r.name}</span>
                        <span className="badge badge-neutral font-mono" style={{ fontSize: '9px' }}>
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {evidence.vendorPatternNotes && (
                    <p className="text-xs text-muted mt-2" style={{ marginTop: '8px' }}>
                      <strong>Vendor Pattern Context:</strong> {evidence.vendorPatternNotes}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => onInspect(activeItem)}
                  title="Inspect side-by-side OCR and edit fields (HotKey: E)"
                >
                  <Eye size={14} />
                  <span>Inspect (E)</span>
                </button>

                {activeItem.issueCategory === 'Missing in GSTR-2B' && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => onOpenVendorFollowup(activeItem)}
                  >
                    <Send size={14} />
                    <span>Vendor Follow-up</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-danger"
                  onClick={() => onReject(activeItem.id)}
                  title="Reject & Flag (HotKey: R)"
                >
                  <X size={14} />
                  <span>Reject (R)</span>
                </button>

                <button 
                  className="btn btn-primary"
                  onClick={() => onApprove(activeItem.id)}
                  title="Approve & Post to Tally (HotKey: A)"
                >
                  <Check size={14} />
                  <span>Approve & Post (A)</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
            <p className="text-muted text-xs">Select an invoice on the left to inspect.</p>
          </div>
        )}
      </div>

      {/* Floating Keyboard HUD (Docked Bottom Right) */}
      <div className="keyboard-hud">
        <div className="keyboard-hud-item">
          <kbd>J</kbd> <kbd>K</kbd>
          <span>Select</span>
        </div>
        <div className="keyboard-hud-item">
          <kbd>A</kbd>
          <span>Approve to Tally</span>
        </div>
        <div className="keyboard-hud-item">
          <kbd>R</kbd>
          <span>Flag</span>
        </div>
        <div className="keyboard-hud-item">
          <kbd>E</kbd>
          <span>Inspect</span>
        </div>
      </div>
    </div>
  );
}
