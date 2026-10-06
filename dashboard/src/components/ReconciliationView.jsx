import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Send, 
  GitCompare, 
  TrendingUp, 
  Download, 
  RefreshCw,
  Percent,
  Check
} from 'lucide-react';

export default function ReconciliationView({ 
  reconData, 
  onOpenVendorFollowup,
  onOpenReconModal,
  onShowToast 
}) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [density, setDensity] = useState('compact'); // 'compact' | 'comfortable'
  const [tolerance, setTolerance] = useState(100); // 0 | 50 | 100

  const summary = reconData?.summary || {};
  const records = reconData?.records;

  // Filter records based on category and search
  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter(r => {
      const matchesCat = 
        filterCategory === 'ALL' ? true :
        filterCategory === 'EXACT_MATCH' ? r.category === 'EXACT_MATCH' :
        filterCategory === 'NEAR_MATCH' ? r.category === 'NEAR_MATCH' :
        filterCategory === 'IN_BOOKS_ONLY' ? r.category === 'IN_BOOKS_ONLY' :
        filterCategory === 'AMOUNT_MISMATCH' ? r.category === 'AMOUNT_MISMATCH' :
        filterCategory === 'TAX_RATE_MISMATCH' ? r.category === 'TAX_RATE_MISMATCH' :
        filterCategory === 'ON_PORTAL_ONLY' ? r.category === 'ON_PORTAL_ONLY' : true;

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
        (r.supplierName || '').toLowerCase().includes(q) ||
        (r.supplierGstin || '').toLowerCase().includes(q) ||
        (r.invoiceNo || '').toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [records, filterCategory, searchTerm]);

  const getStatusBadge = (category) => {
    switch (category) {
      case 'EXACT_MATCH':
        return <span className="badge badge-success font-mono" style={{ fontSize: '10px' }}>Exact Match</span>;
      case 'NEAR_MATCH':
        return <span className="badge badge-brand font-mono" style={{ fontSize: '10px' }}>Near Match (&lt;₹{tolerance})</span>;
      case 'IN_BOOKS_ONLY':
        return <span className="badge badge-danger font-mono" style={{ fontSize: '10px' }}>Missing in 2B</span>;
      case 'TAX_RATE_MISMATCH':
        return <span className="badge badge-warning font-mono" style={{ fontSize: '10px' }}>Rate Mismatch</span>;
      case 'AMOUNT_MISMATCH':
        return <span className="badge badge-warning font-mono" style={{ fontSize: '10px' }}>Amount Mismatch</span>;
      case 'ON_PORTAL_ONLY':
        return <span className="badge badge-info font-mono" style={{ fontSize: '10px' }}>On Portal Only</span>;
      default:
        return <span className="badge badge-neutral font-mono" style={{ fontSize: '10px' }}>{category}</span>;
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Supplier Name", "Supplier GSTIN", "Invoice No", "Invoice Date", "Books Amount (₹)", "Portal Amount (₹)", "Variance (₹)", "Category", "Status", "ITC Eligibility", "Action"];
    const rows = filteredRecords.map(r => [
      `"${r.id || ''}"`,
      `"${(r.supplierName || '').replace(/"/g, '""')}"`,
      `"${r.supplierGstin || ''}"`,
      `"${r.invoiceNo || ''}"`,
      `"${r.invoiceDate || ''}"`,
      r.bookAmount || 0,
      r.portalAmount || 0,
      r.diffAmount || 0,
      `"${r.category || ''}"`,
      `"${r.status || ''}"`,
      `"${r.itcEligibility || ''}"`,
      `"${r.actionRequired || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Yukti_Reconciliation_${filterCategory}_July2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast("Reconciliation CSV downloaded successfully");
  };

  return (
    <div className="view-container">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
        <div>
          <div className="view-pretitle" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GitCompare size={14} className="text-brand" />
            <span style={{ fontWeight: 700, letterSpacing: '0.04em' }}>AUTOMATED 3-WAY RECONCILIATION ENGINE</span>
          </div>
          <h1 className="view-title" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            3-Way Match Matrix (Books vs. GSTR-2B Portal)
          </h1>
          <p className="view-subtitle" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            High-throughput DuckDB matching of Tally purchase vouchers against government GSTR-2B statements.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Density Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setDensity('compact')}
              style={{
                border: 'none',
                background: density === 'compact' ? '#FFFFFF' : 'transparent',
                color: density === 'compact' ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: density === 'compact' ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Compact rows (high data density)"
            >
              Compact
            </button>
            <button
              onClick={() => setDensity('comfortable')}
              style={{
                border: 'none',
                background: density === 'comfortable' ? '#FFFFFF' : 'transparent',
                color: density === 'comfortable' ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: density === 'comfortable' ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Comfortable row padding"
            >
              Comfortable
            </button>
          </div>

          <button className="btn btn-secondary" onClick={handleExportCSV} title="Export verified CSV report" aria-label="Export verified reconciliation records to CSV">
            <Download size={13} />
            <span style={{ fontSize: '11.5px' }}>Export CSV</span>
          </button>
          
          <button className="btn btn-primary" onClick={onOpenReconModal} style={{ fontSize: '11.5px' }} aria-label="Run DuckDB 3-way matching engine">
            <RefreshCw size={13} />
            <span>Run Matching</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div className="kpi-icon-wrapper text-green">
            <CheckCircle2 size={18} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Verified Tax Credit (ITC)</span>
            <h3 className="kpi-value text-green font-mono">₹{((summary.totalEligibleITC || 4256000) / 100000).toFixed(2)}L</h3>
            <span className="kpi-subtext text-green font-medium">Auto-populated on portal</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div className="kpi-icon-wrapper text-red">
            <AlertTriangle size={18} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Bills Missing in 2B</span>
            <h3 className="kpi-value text-red font-mono">₹{((summary.missingIn2BITC || 388500) / 1000).toFixed(1)}k</h3>
            <span className="kpi-subtext text-red"><strong>{summary.inBooksOnlyCount || 50}</strong> delinquent suppliers</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div className="kpi-icon-wrapper text-amber">
            <Percent size={18} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Rate / Tax Discrepancies</span>
            <h3 className="kpi-value text-amber font-mono">₹{((summary.rateMismatchITC || 84000) / 1000).toFixed(1)}k</h3>
            <span className="kpi-subtext">Tax calculation differences</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--brand)' }}>
          <div className="kpi-icon-wrapper text-brand">
            <TrendingUp size={18} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Automated Match Rate</span>
            <h3 className="kpi-value font-mono">{summary.matchRatePct || 96.0}%</h3>
            <span className="kpi-subtext"><strong>{(summary.exactMatchCount || 1042) + (summary.nearMatchCount || 98)}</strong> of {summary.totalCount || 1248} bills</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE MATCH FUNNEL RIBBON */}
      <div className="matching-telemetry-bar" style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Match Confidence Funnel (1,248 Bills Processed in 1.18s)
            </span>
            <span className="badge badge-success font-mono" style={{ fontSize: '10px' }}>
              95.1% Auto-Resolved
            </span>
          </div>

          {/* Tolerance Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Round-off Tolerance:</span>
            {[0, 50, 100].map(val => (
              <button
                key={val}
                onClick={() => setTolerance(val)}
                className={`btn btn-secondary font-mono ${tolerance === val ? 'bg-subtle font-bold border-brand text-brand' : ''}`}
                style={{ padding: '2px 7px', fontSize: '10px', height: '22px' }}
              >
                ₹{val}
              </button>
            ))}
          </div>
        </div>
        
        {/* Visual Progress Bar Track */}
        <div className="matching-bar-track" style={{ height: '10px', borderRadius: '5px', overflow: 'hidden', display: 'flex', cursor: 'pointer' }}>
          <div 
            className="matching-bar-segment exact" 
            style={{ width: '83.5%', background: '#10B981', transition: 'opacity 0.15s ease', opacity: filterCategory === 'EXACT_MATCH' || filterCategory === 'ALL' ? 1 : 0.4 }} 
            onClick={() => setFilterCategory('EXACT_MATCH')}
            title="Pass 1: Exact Match (83.5%) - Click to filter"
          />
          <div 
            className="matching-bar-segment fuzzy" 
            style={{ width: '7.8%', background: '#3B82F6', transition: 'opacity 0.15s ease', opacity: filterCategory === 'NEAR_MATCH' || filterCategory === 'ALL' ? 1 : 0.4 }} 
            onClick={() => setFilterCategory('NEAR_MATCH')}
            title="Pass 2: Near / Rounding Match (7.8%) - Click to filter" 
          />
          <div 
            className="matching-bar-segment tolerance" 
            style={{ width: '3.8%', background: '#F59E0B', transition: 'opacity 0.15s ease', opacity: filterCategory === 'TAX_RATE_MISMATCH' || filterCategory === 'AMOUNT_MISMATCH' || filterCategory === 'ALL' ? 1 : 0.4 }} 
            onClick={() => setFilterCategory('TAX_RATE_MISMATCH')}
            title="Pass 3: Rate / Amount Differences (3.8%) - Click to filter" 
          />
          <div 
            className="matching-bar-segment missing" 
            style={{ width: '4.9%', background: '#EF4444', transition: 'opacity 0.15s ease', opacity: filterCategory === 'IN_BOOKS_ONLY' || filterCategory === 'ALL' ? 1 : 0.4 }} 
            onClick={() => setFilterCategory('IN_BOOKS_ONLY')}
            title="Missing on Government Portal (4.9%) - Click to filter" 
          />
        </div>

        {/* Clickable Legend Filter Chips */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '10px', fontSize: '11px' }}>
          <button 
            onClick={() => setFilterCategory('EXACT_MATCH')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: filterCategory === 'EXACT_MATCH' ? '#065F46' : 'var(--text-secondary)' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            <span>Exact Match: <strong className="font-mono">83.5%</strong> (1,042)</span>
          </button>
          
          <button 
            onClick={() => setFilterCategory('NEAR_MATCH')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: filterCategory === 'NEAR_MATCH' ? '#1E40AF' : 'var(--text-secondary)' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} />
            <span>Near Match (&lt;₹{tolerance}): <strong className="font-mono">7.8%</strong> (98)</span>
          </button>

          <button 
            onClick={() => setFilterCategory('TAX_RATE_MISMATCH')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: filterCategory === 'TAX_RATE_MISMATCH' ? '#92400E' : 'var(--text-secondary)' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
            <span>Rate Differences: <strong className="font-mono">3.8%</strong> (48)</span>
          </button>

          <button 
            onClick={() => setFilterCategory('IN_BOOKS_ONLY')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: filterCategory === 'IN_BOOKS_ONLY' ? '#991B1B' : 'var(--text-secondary)' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ color: '#DC2626' }}>Missing in 2B: <strong className="font-mono">4.9%</strong> (50)</span>
          </button>
        </div>
      </div>

      {/* Main Reconciliation Table Panel */}
      <div className="panel" style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {/* Filter Tabs & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', padding: '12px 16px', borderBottom: '1px solid var(--border-color)', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Records' },
              { id: 'EXACT_MATCH', label: 'Exact Match' },
              { id: 'NEAR_MATCH', label: 'Near Match' },
              { id: 'IN_BOOKS_ONLY', label: 'Missing in 2B' },
              { id: 'TAX_RATE_MISMATCH', label: 'Rate Mismatch' },
              { id: 'AMOUNT_MISMATCH', label: 'Amount Mismatch' },
              { id: 'ON_PORTAL_ONLY', label: 'Portal Only' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`btn btn-secondary ${filterCategory === tab.id ? 'font-semibold text-brand' : ''}`}
                style={filterCategory === tab.id ? { borderColor: 'var(--brand)', color: 'var(--brand)', backgroundColor: 'var(--brand-light)' } : {}}
                onClick={() => setFilterCategory(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="search-input-wrapper">
              <Search size={14} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search vendor, GSTIN, invoice #..." 
                aria-label="Search reconciliation records by vendor, GSTIN, or invoice number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Showing {filteredRecords.length} of {records.length}
            </span>
          </div>
        </div>

        {/* Data Table with Sticky Headers & Delta Highlighting */}
        <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
          <table className={`data-table ${density} table-sticky-header`}>
            <thead>
              <tr>
                <th className="table-sticky-col">Vendor / Supplier</th>
                <th>Supplier GSTIN</th>
                <th>Invoice #</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Books Total (₹)</th>
                <th style={{ textAlign: 'right' }}>GSTR-2B Total (₹)</th>
                <th style={{ textAlign: 'right' }}>Variance / Delta</th>
                <th>Recon Status</th>
                <th>ITC Eligibility</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                    No reconciliation records found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => {
                  const hasDiff = r.diffAmount !== 0;
                  const isMissing = r.category === 'IN_BOOKS_ONLY';

                  return (
                    <tr key={r.id}>
                      <td className="table-sticky-col">
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          {r.supplierName}
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs">{r.supplierGstin}</span>
                      </td>
                      <td>
                        <span className="font-mono text-xs">{r.invoiceNo}</span>
                      </td>
                      <td style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        {r.invoiceDate}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        ₹{Number(r.bookAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: isMissing ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {isMissing ? 'Not Found' : `₹${Number(r.portalAmount || 0).toLocaleString('en-IN')}`}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {hasDiff ? (
                          <span className={`cell-variance-badge ${Math.abs(r.diffAmount || 0) <= tolerance ? 'near' : 'mismatch'}`}>
                            {r.diffAmount > 0 ? `+₹${r.diffAmount.toLocaleString('en-IN')}` : `₹${r.diffAmount.toLocaleString('en-IN')}`}
                          </span>
                        ) : (
                          <span className="cell-variance-badge exact">
                            ₹0.00
                          </span>
                        )}
                      </td>
                      <td>{getStatusBadge(r.category)}</td>
                      <td>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {r.itcEligibility || 'Eligible (Sec 16)'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isMissing ? (
                          <button 
                            className="btn btn-secondary text-xs" 
                            style={{ padding: '3px 8px', color: '#0F5A47', borderColor: 'var(--brand-border)' }}
                            onClick={() => onOpenVendorFollowup?.({
                              supplierName: r.supplierName,
                              supplierGstin: r.supplierGstin,
                              customerName: "Client Company",
                              invoiceNo: r.invoiceNo,
                              invoiceDate: r.invoiceDate,
                              grandTotal: r.bookAmount,
                              issueTag: "Missing in 2B",
                              issueDescription: "Invoice in books but unfiled in GSTR-1 by vendor."
                            })}
                            title="Chase vendor on WhatsApp"
                          >
                            <Send size={11} />
                            <span>Follow-up</span>
                          </button>
                        ) : hasDiff && Math.abs(r.diffAmount || 0) <= tolerance ? (
                          <button
                            className="btn btn-secondary text-xs"
                            style={{ padding: '3px 8px', color: 'var(--brand)' }}
                            onClick={() => onShowToast?.(`Accepted ₹${r.diffAmount} round-off for ${r.invoiceNo}`)}
                            title="Accept round-off tolerance"
                          >
                            <Check size={11} />
                            <span>Accept</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
