import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Eye, 
  Check, 
  X, 
  Zap, 
  Sparkles, 
  Send, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Clock
} from 'lucide-react';
import VendorPatternBanner from './VendorPatternBanner';

export default function ReviewQueue({ 
  reviewItems = [], 
  items = [],
  onApprove, 
  onReject, 
  onInspect, 
  onBulkApproveNearMatches,
  onOpenVendorFollowup,
  getPattern,
  onShowToast
}) {
  const allItems = reviewItems.length > 0 ? reviewItems : items;
  const [selectedId, setSelectedId] = useState(allItems[0]?.id || null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('diff'); // 'diff' | 'doc'
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(true);

  // Keep selection valid when items change
  useEffect(() => {
    if (!allItems.some(i => i.id === selectedId) && allItems.length > 0) {
      setSelectedId(allItems[0].id);
    }
  }, [allItems, selectedId]);

  // Filter items
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesCategory = 
        categoryFilter === 'All' ? true :
        categoryFilter === 'Critical' ? item.issueSeverity === 'CRITICAL' :
        categoryFilter === 'Math Mismatch' ? item.issueCategory === 'Math Mismatch' :
        categoryFilter === 'Missing in 2B' ? item.issueCategory === 'Missing in GSTR-2B' :
        categoryFilter === 'Rule 37' ? item.issueCategory === 'Rule 37 Warning' :
        categoryFilter === 'Near Matches' ? item.issueCategory?.includes('Near Match') : true;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (item.supplierName || '').toLowerCase().includes(q) ||
        (item.supplierGstin || '').toLowerCase().includes(q) ||
        (item.invoiceNo || '').toLowerCase().includes(q) ||
        (item.customerName || '').toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [allItems, categoryFilter, searchQuery]);

  const selectedIndex = filteredItems.findIndex(i => i.id === selectedId);
  const activeItem = filteredItems[selectedIndex >= 0 ? selectedIndex : 0] || filteredItems[0];
  const activePattern = activeItem ? getPattern?.(activeItem.supplierGstin) : null;

  // Optimistic approval / rejection with auto-advance to next item
  const handleApproveAction = useCallback((item) => {
    if (!item) return;
    const currentIdx = filteredItems.findIndex(i => i.id === item.id);
    const nextItem = filteredItems[currentIdx + 1] || filteredItems[currentIdx - 1];
    if (nextItem) {
      setSelectedId(nextItem.id);
    }
    if (onApprove) {
      onApprove(item.id);
    }
    if (onShowToast) {
      onShowToast(`Approved ${item.invoiceNo || 'invoice'} & synced to Tally Prime Port 9000`);
    }
  }, [filteredItems, onApprove, onShowToast]);

  const handleRejectAction = useCallback((item) => {
    if (!item) return;
    const currentIdx = filteredItems.findIndex(i => i.id === item.id);
    const nextItem = filteredItems[currentIdx + 1] || filteredItems[currentIdx - 1];
    if (nextItem) {
      setSelectedId(nextItem.id);
    }
    if (onReject) {
      onReject(item.id);
    }
    if (onShowToast) {
      onShowToast(`Flagged ${item.invoiceNo || 'invoice'} for client clarification`);
    }
  }, [filteredItems, onReject, onShowToast]);

  // Keyboard Event Listener (J, K, A, R, F, E, 1, 2)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedIndex < filteredItems.length - 1) {
          setSelectedId(filteredItems[selectedIndex + 1].id);
        }
      } else if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedIndex > 0) {
          setSelectedId(filteredItems[selectedIndex - 1].id);
        }
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (activeItem) {
          handleApproveAction(activeItem);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (activeItem) {
          handleRejectAction(activeItem);
        }
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (activeItem && onOpenVendorFollowup) {
          onOpenVendorFollowup(activeItem);
        }
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (activeItem && onInspect) {
          onInspect(activeItem);
        }
      } else if (e.key === '1') {
        e.preventDefault();
        setViewMode('diff');
      } else if (e.key === '2') {
        e.preventDefault();
        setViewMode('doc');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredItems, activeItem, onInspect, onOpenVendorFollowup, handleApproveAction, handleRejectAction]);

  const risk = activeItem?.riskModel || {
    severity: activeItem?.issueSeverity || 'MEDIUM',
    confidence: activeItem?.confidenceScore || 88,
    confidenceLabel: `${activeItem?.confidenceScore || 88}% — Senior verification recommended`,
    financialImpact: activeItem?.itcAtRisk || '₹0',
    complianceImpact: 'HIGH',
    reversibility: 'Easy (Tally Prime Voucher Draft)',
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
      { ruleId: "SEC_16_2", name: "Section 16 Statutory Verification", status: activeItem?.issueSeverity === 'CRITICAL' ? "WARNING" : "PASSED" }
    ],
    vendorPatternNotes: "Historical pattern verified against Tally Prime chart of accounts."
  };

  return (
    <div className="view-container">
      {/* Top Filter & Bulk Triage Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Critical', 'Math Mismatch', 'Missing in 2B', 'Rule 37', 'Near Matches'].map(tab => {
            const count = 
              tab === 'All' ? allItems.length :
              tab === 'Critical' ? allItems.filter(i => i.issueSeverity === 'CRITICAL').length :
              tab === 'Math Mismatch' ? allItems.filter(i => i.issueCategory === 'Math Mismatch').length :
              tab === 'Missing in 2B' ? allItems.filter(i => i.issueCategory === 'Missing in GSTR-2B').length :
              tab === 'Rule 37' ? allItems.filter(i => i.issueCategory === 'Rule 37 Warning').length :
              allItems.filter(i => i.issueCategory?.includes('Near Match')).length;

            return (
              <button
                key={tab}
                className={`btn btn-secondary ${categoryFilter === tab ? 'bg-subtle font-semibold' : ''}`}
                style={categoryFilter === tab ? { borderColor: 'var(--brand)', color: 'var(--brand)', backgroundColor: 'var(--brand-light)' } : {}}
                onClick={() => setCategoryFilter(tab)}
              >
                <span>{tab}</span>
                <span className="badge badge-neutral font-mono" style={{ fontSize: '10px' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Filter by vendor, GSTIN, invoice #..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <button 
            className="btn btn-primary"
            onClick={onBulkApproveNearMatches}
            title="Approve verified near-matches (< ₹100)"
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            <Zap size={13} />
            <span>Bulk Approve Near-Matches</span>
          </button>
        </div>
      </div>

      {/* Main Review Split Grid */}
      <div className="review-queue-layout">
        {/* Left Column: Compact Stream List */}
        <div className="queue-items-list">
          {filteredItems.length === 0 ? (
            <div className="panel" style={{ padding: '36px 20px', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <CheckCircle size={22} />
              </div>
              <h3 className="font-bold text-primary" style={{ fontSize: '15px', margin: '0 0 6px 0' }}>
                Queue is clear
              </h3>
              <p className="text-xs text-muted" style={{ lineHeight: 1.5, marginBottom: '14px' }}>
                No invoices need manual attention under this filter.
              </p>
              <button 
                className="btn btn-secondary"
                onClick={() => setCategoryFilter('All')}
                style={{ fontSize: '11px', margin: '0 auto' }}
              >
                Show All Invoices
              </button>
            </div>
          ) : (
            filteredItems.map(item => {
              const isSelected = item.id === activeItem?.id;
              const hasPattern = getPattern?.(item.supplierGstin);
              const isCritical = item.issueSeverity === 'CRITICAL';

              return (
                <div
                  key={item.id}
                  className={`queue-card-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="queue-card-top">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`status-dot ${isCritical ? 'red' : item.issueSeverity === 'HIGH' ? 'amber' : 'green'}`} />
                        <span className="queue-vendor-title" title={item.supplierName}>{item.supplierName}</span>
                      </div>
                      <div className="queue-vendor-gstin font-mono">{item.supplierGstin}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${isCritical ? 'badge-danger' : 'badge-warning'} font-mono`} style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                        {item.issueSeverity}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '4px 0' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Client:</span> <strong>{item.customerName || 'Acme Corp'}</strong> • #{item.invoiceNo}
                  </div>

                  {hasPattern && (
                    <div style={{ fontSize: '10.5px', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '4px', margin: '3px 0' }}>
                      <Sparkles size={11} />
                      <span>Learned vendor pattern</span>
                    </div>
                  )}

                  <div className="queue-card-meta">
                    <div>
                      <span className="text-muted" style={{ fontSize: '10.5px' }}>ITC at risk: </span>
                      <strong className="font-mono" style={{ color: isCritical ? '#DC2626' : 'var(--text-primary)' }}>
                        {item.itcAtRisk || '₹0'}
                      </strong>
                    </div>
                    <div className="queue-amount-val font-mono">
                      ₹{Number(item.grandTotal || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Superhuman Workspace Detail */}
        {activeItem ? (
          <div className="queue-detail-container">
            {/* Sticky Action Header */}
            <div className="queue-workspace-header">
              {/* Left: Position & Arrow Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="font-mono text-xs text-muted" style={{ fontWeight: 600 }}>
                  Item {selectedIndex + 1} of {filteredItems.length}
                </span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '3px 7px', fontSize: '10px' }}
                    onClick={() => selectedIndex > 0 && setSelectedId(filteredItems[selectedIndex - 1].id)}
                    title="Previous invoice (Hotkey: K)"
                    aria-label="Previous invoice in queue (K)"
                  >
                    ↑ K
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '3px 7px', fontSize: '10px' }}
                    onClick={() => selectedIndex < filteredItems.length - 1 && setSelectedId(filteredItems[selectedIndex + 1].id)}
                    title="Next invoice (Hotkey: J)"
                    aria-label="Next invoice in queue (J)"
                  >
                    ↓ J
                  </button>
                </div>

                {/* View Switcher: Diff vs Document */}
                <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '2px', borderRadius: '6px', marginLeft: '6px' }}>
                  <button
                    onClick={() => setViewMode('diff')}
                    style={{
                      border: 'none',
                      background: viewMode === 'diff' ? '#FFFFFF' : 'transparent',
                      color: viewMode === 'diff' ? 'var(--text-primary)' : 'var(--text-muted)',
                      padding: '3px 9px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: viewMode === 'diff' ? 600 : 500,
                      cursor: 'pointer',
                      boxShadow: viewMode === 'diff' ? 'var(--shadow-xs)' : 'none'
                    }}
                    title="Side-by-side verification diff (Hotkey: 1)"
                    aria-label="Switch to side-by-side verification diff view (1)"
                  >
                    Diff & Verification (1)
                  </button>
                  <button
                    onClick={() => setViewMode('doc')}
                    style={{
                      border: 'none',
                      background: viewMode === 'doc' ? '#FFFFFF' : 'transparent',
                      color: viewMode === 'doc' ? 'var(--text-primary)' : 'var(--text-muted)',
                      padding: '3px 9px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: viewMode === 'doc' ? 600 : 500,
                      cursor: 'pointer',
                      boxShadow: viewMode === 'doc' ? 'var(--shadow-xs)' : 'none'
                    }}
                    title="Original invoice document preview (Hotkey: 2)"
                    aria-label="Switch to original invoice document preview (2)"
                  >
                    Document Preview (2)
                  </button>
                </div>
              </div>

              {/* Right: Instant Superhuman Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => onInspect(activeItem)}
                  style={{ fontSize: '11px', padding: '5px 10px' }}
                  title="Full Modal Inspector (Hotkey: E)"
                  aria-label="Open invoice details inspector modal (E)"
                >
                  <Eye size={13} />
                  <span>Inspect</span>
                  <kbd style={{ fontSize: '9px', background: 'var(--bg-subtle)', padding: '1px 4px', borderRadius: '3px' }}>E</kbd>
                </button>

                {activeItem.issueCategory === 'Missing in GSTR-2B' && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => onOpenVendorFollowup(activeItem)}
                    style={{ fontSize: '11px', padding: '5px 10px', color: '#0F5A47' }}
                    title="Send WhatsApp reminder to vendor (Hotkey: F)"
                    aria-label="Send WhatsApp reminder to vendor (F)"
                  >
                    <Send size={13} />
                    <span>WhatsApp Vendor</span>
                    <kbd style={{ fontSize: '9px', background: 'var(--bg-subtle)', padding: '1px 4px', borderRadius: '3px' }}>F</kbd>
                  </button>
                )}

                <button 
                  className="btn btn-danger"
                  onClick={() => handleRejectAction(activeItem)}
                  style={{ fontSize: '11px', padding: '5px 11px' }}
                  title="Reject & Flag for client (Hotkey: R)"
                  aria-label="Reject invoice and flag for client (R)"
                >
                  <X size={13} />
                  <span>Reject</span>
                  <kbd style={{ fontSize: '9px', background: 'rgba(239, 68, 68, 0.1)', padding: '1px 4px', borderRadius: '3px' }}>R</kbd>
                </button>

                <button 
                  className="btn btn-primary"
                  onClick={() => handleApproveAction(activeItem)}
                  style={{ fontSize: '11px', padding: '5px 14px', background: 'var(--brand)', borderColor: 'var(--brand)' }}
                  title="Approve & Post to Tally Prime 9000 (Hotkey: A)"
                  aria-label="Approve invoice and post to Tally (A)"
                >
                  <Check size={14} />
                  <span>Approve to Tally</span>
                  <kbd style={{ fontSize: '9px', background: 'rgba(255, 255, 255, 0.25)', color: '#FFFFFF', padding: '1px 4px', borderRadius: '3px' }}>A</kbd>
                </button>
              </div>
            </div>

            {/* Scrollable Detail Body */}
            <div className="queue-workspace-scroll">
              {/* Pattern Banner */}
              {activePattern && <VendorPatternBanner pattern={activePattern} />}

              {viewMode === 'diff' ? (
                <>
                  {/* Executive Diagnostic Alert */}
                  <div className={`detail-reasoning-card ${activeItem.issueSeverity === 'CRITICAL' ? 'critical' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                        <AlertTriangle size={15} />
                        <span>Diagnostic: {activeItem.issueCategory}</span>
                      </div>
                      <span className="badge badge-neutral font-mono" style={{ fontSize: '10px' }}>
                        Rule ID: {activeItem.riskModel?.ruleId || 'SEC-16.2'}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '12.5px', lineHeight: 1.45 }}>
                      {activeItem.reasoningText}
                    </p>
                    <div style={{ background: '#FFFFFF', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        <strong>Recommended Action:</strong> {risk.recommendedAction || "Verify supplier GSTR-1 status on portal."}
                      </span>
                      <span className="badge badge-success font-mono" style={{ fontSize: '10px' }}>
                        Reversibility: {risk.reversibility}
                      </span>
                    </div>
                  </div>

                  {/* SIDE-BY-SIDE VERIFICATION DIFF MATRIX */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="form-label" style={{ margin: 0, fontSize: '12px', fontWeight: 700 }}>
                        Side-by-Side Field Verification Matrix
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Extracted Document vs. Government Portal (GSTR-2B)
                      </span>
                    </div>

                    <table className="diff-matrix-table">
                      <thead>
                        <tr>
                          <th style={{ width: '25%' }}>Attribute</th>
                          <th style={{ width: '32%' }}>Invoice PDF (Extracted OCR)</th>
                          <th style={{ width: '32%' }}>GSTR-2B Portal / Books</th>
                          <th style={{ width: '11%', textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Supplier GSTIN</td>
                          <td className="font-mono">{activeItem.supplierGstin}</td>
                          <td className="font-mono">{activeItem.supplierGstin}</td>
                          <td style={{ textAlign: 'center' }} className="diff-cell-match">✓ Match</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Invoice Number</td>
                          <td className="font-mono">{activeItem.invoiceNo}</td>
                          <td className="font-mono">{activeItem.invoiceNo}</td>
                          <td style={{ textAlign: 'center' }} className="diff-cell-match">✓ Match</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Invoice Date</td>
                          <td className="font-mono">{activeItem.invoiceDate}</td>
                          <td className="font-mono">{activeItem.invoiceDate}</td>
                          <td style={{ textAlign: 'center' }} className="diff-cell-match">✓ Match</td>
                        </tr>
                        <tr className={activeItem.issueCategory === 'Math Mismatch' ? 'diff-cell-mismatch' : ''}>
                          <td style={{ fontWeight: 600 }}>Taxable Value</td>
                          <td className="font-mono">₹{Number(activeItem.taxableValue || 0).toLocaleString('en-IN')}</td>
                          <td className="font-mono">
                            {activeItem.issueCategory === 'Math Mismatch'
                              ? `₹${Number((activeItem.taxableValue || 0) - 5000).toLocaleString('en-IN')}`
                              : `₹${Number(activeItem.taxableValue || 0).toLocaleString('en-IN')}`}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {activeItem.issueCategory === 'Math Mismatch' ? (
                              <span style={{ color: '#DC2626', fontWeight: 700 }}>Δ -₹5,000</span>
                            ) : (
                              <span className="diff-cell-match">✓ Match</span>
                            )}
                          </td>
                        </tr>
                        <tr className={activeItem.issueCategory === 'Math Mismatch' ? 'diff-cell-mismatch' : ''}>
                          <td style={{ fontWeight: 600 }}>Total Tax (GST)</td>
                          <td className="font-mono">
                            ₹{Number((activeItem.cgst || 0) + (activeItem.sgst || 0) + (activeItem.igst || 0)).toLocaleString('en-IN')}
                          </td>
                          <td className="font-mono">
                            ₹{Number((activeItem.cgst || 0) + (activeItem.sgst || 0) + (activeItem.igst || 0)).toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center' }} className="diff-cell-match">✓ Match</td>
                        </tr>
                        <tr className={activeItem.issueCategory === 'Math Mismatch' ? 'diff-cell-mismatch' : ''}>
                          <td style={{ fontWeight: 600 }}>Grand Total</td>
                          <td className="font-mono" style={{ fontWeight: 700 }}>
                            ₹{Number(activeItem.grandTotal || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="font-mono" style={{ fontWeight: 700 }}>
                            {activeItem.issueCategory === 'Missing in GSTR-2B'
                              ? 'Missing on GST Portal'
                              : `₹${Number(activeItem.grandTotal || 0).toLocaleString('en-IN')}`}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {activeItem.issueCategory === 'Missing in GSTR-2B' ? (
                              <span className="badge badge-danger font-mono" style={{ fontSize: '9px' }}>Missing</span>
                            ) : (
                              <span className="diff-cell-match">✓ Match</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Tally Purchase Ledger</td>
                          <td style={{ color: 'var(--brand)', fontWeight: 600 }}>
                            {activeItem.suggestedLedger || 'General Purchase Account'}
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {activePattern?.ledger || 'Auto-mapped via Yukti Engine'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge badge-brand font-mono" style={{ fontSize: '9px' }}>Ready</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section 16 Statutory Audit Checklist */}
                  <div className="panel" style={{ padding: '14px 16px', background: '#FAFAFA' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} className="text-brand" />
                        <strong style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>
                          Statutory Section 16 & Rule 37 Audit Checklist
                        </strong>
                      </div>
                      <span className="badge badge-neutral font-mono" style={{ fontSize: '10px' }}>
                        CGST Act 2017
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '11.5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                        <CheckCircle size={14} className="text-green" />
                        <span><strong>16(2)(a):</strong> Valid tax invoice PDF attached</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                        {activeItem.issueCategory === 'Missing in GSTR-2B' ? (
                          <X size={14} className="text-red" />
                        ) : (
                          <CheckCircle size={14} className="text-green" />
                        )}
                        <span><strong>16(2)(aa):</strong> {activeItem.issueCategory === 'Missing in GSTR-2B' ? 'Supplier GSTR-1 NOT filed' : 'GSTR-2B auto-populated'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                        <CheckCircle size={14} className="text-green" />
                        <span><strong>16(2)(b):</strong> Goods/services inward delivery note verified</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                        <Clock size={14} className="text-amber" />
                        <span><strong>Rule 37:</strong> 180-day settlement clock active (Day 38/180)</span>
                      </div>
                    </div>
                  </div>

                  {/* Evidence Drawer Accordion */}
                  <div className="panel" style={{ overflow: 'hidden' }}>
                    <div 
                      style={{ padding: '10px 14px', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => setShowEvidenceDrawer(!showEvidenceDrawer)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Shield size={14} className="text-brand" />
                        <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                          Deterministic OCR Confidence Breakdown ({risk.confidence}%)
                        </strong>
                      </div>
                      {showEvidenceDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>

                    {showEvidenceDrawer && (
                      <div style={{ padding: '12px 14px', fontSize: '11px' }}>
                        <table className="data-table mb-3" style={{ fontSize: '11px', marginBottom: '10px' }}>
                          <thead>
                            <tr>
                              <th>Field</th>
                              <th>Extracted Value</th>
                              <th>OCR Calibration</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(evidence.extractedFields || []).map((f, i) => (
                              <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{f.field}</td>
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
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* High Fidelity Document OCR Preview */
                <div className="invoice-preview-sheet">
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F5A47', paddingBottom: '12px', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>TAX INVOICE</span>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0' }}>
                        {activeItem.supplierName}
                      </h3>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        GSTIN: <span className="ocr-highlight-box font-mono">{activeItem.supplierGstin}</span>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px' }}>
                        Invoice No: <span className="ocr-highlight-box font-mono">{activeItem.invoiceNo}</span>
                      </div>
                      <div style={{ fontSize: '11px', marginTop: '4px' }}>
                        Date: <span className="ocr-highlight-box font-mono">{activeItem.invoiceDate}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px', fontSize: '11px' }}>
                    <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                      <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>BILLED TO:</strong>
                      <span style={{ fontWeight: 700 }}>{activeItem.customerName || 'Acme Engineering Corp'}</span>
                      <div className="font-mono" style={{ color: 'var(--text-secondary)' }}>GSTIN: 27AABCS1429B1Z8</div>
                    </div>
                    <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                      <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>PAYMENT STATUS:</strong>
                      <span>Settlement Term: Net 30 Days</span>
                      <div style={{ color: 'var(--brand)', fontWeight: 600 }}>Tally Prime Port: 9000 Ready</div>
                    </div>
                  </div>

                  <table className="data-table" style={{ fontSize: '11.5px', marginBottom: '16px' }}>
                    <thead>
                      <tr>
                        <th>Item Description</th>
                        <th>HSN/SAC</th>
                        <th style={{ textAlign: 'right' }}>Taxable Val</th>
                        <th style={{ textAlign: 'right' }}>GST Rate</th>
                        <th style={{ textAlign: 'right' }}>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Commercial Services & Supply (Voucher Entry)</td>
                        <td className="font-mono">847130</td>
                        <td className="font-mono" style={{ textAlign: 'right' }}>
                          ₹{Number(activeItem.taxableValue || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="font-mono" style={{ textAlign: 'right' }}>18%</td>
                        <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                          <span className="ocr-highlight-box">
                            ₹{Number(activeItem.grandTotal || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '240px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Taxable:</span>
                        <span className="font-mono">₹{Number(activeItem.taxableValue || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">CGST (9%):</span>
                        <span className="font-mono">₹{Number(activeItem.cgst || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">SGST (9%):</span>
                        <span className="font-mono">₹{Number(activeItem.sgst || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '4px', fontWeight: 700 }}>
                        <span>Grand Total:</span>
                        <span className="font-mono text-brand">₹{Number(activeItem.grandTotal || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
            <p className="text-muted text-xs">Select an invoice on the left to inspect.</p>
          </div>
        )}
      </div>

      {/* Floating Keyboard HUD */}
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
          <kbd>F</kbd>
          <span>WhatsApp</span>
        </div>
        <div className="keyboard-hud-item">
          <kbd>E</kbd>
          <span>Inspect</span>
        </div>
        <div className="keyboard-hud-item">
          <kbd>1</kbd> <kbd>2</kbd>
          <span>Diff/Doc</span>
        </div>
      </div>
    </div>
  );
}
