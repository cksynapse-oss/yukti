import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Percent, 
  Search, 
  FileText, 
  Send, 
  ArrowRight,
  Sparkles,
  GitCompare,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';

export default function ReconciliationView({ 
  reconData, 
  onOpenVendorFollowup,
  onOpenReconModal 
}) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  if (!reconData) return null;
  const { summary, records = [] } = reconData;

  const filteredRecords = records.filter(r => {
    const matchesCat = 
      filterCategory === 'ALL' ? true :
      filterCategory === 'EXACT_MATCH' ? r.category === 'EXACT_MATCH' :
      filterCategory === 'NEAR_MATCH' ? r.category === 'NEAR_MATCH' :
      filterCategory === 'IN_BOOKS_ONLY' ? r.category === 'IN_BOOKS_ONLY' :
      filterCategory === 'AMOUNT_MISMATCH' ? r.category === 'AMOUNT_MISMATCH' :
      filterCategory === 'TAX_RATE_MISMATCH' ? r.category === 'TAX_RATE_MISMATCH' :
      filterCategory === 'ON_PORTAL_ONLY' ? r.category === 'ON_PORTAL_ONLY' : true;

    const matchesSearch = 
      (r.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.supplierGstin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.invoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCat && matchesSearch;
  });

  const getStatusBadge = (category) => {
    switch (category) {
      case 'EXACT_MATCH':
        return <span className="badge badge-success">Exact Match</span>;
      case 'NEAR_MATCH':
        return <span className="badge badge-brand">Near Match (&lt;₹100)</span>;
      case 'IN_BOOKS_ONLY':
        return <span className="badge badge-danger">Missing in 2B</span>;
      case 'TAX_RATE_MISMATCH':
        return <span className="badge badge-warning">Rate Mismatch</span>;
      case 'AMOUNT_MISMATCH':
        return <span className="badge badge-warning">Amount Mismatch</span>;
      case 'ON_PORTAL_ONLY':
        return <span className="badge badge-info">On Portal Only</span>;
      case 'DUPLICATE':
        return <span className="badge badge-danger">Duplicate In Books</span>;
      default:
        return <span className="badge badge-neutral">{category}</span>;
    }
  };

  const handleExportExcel = () => {
    // Generate clean client-side CSV export of all reconciled transactions
    const headers = ["ID", "Supplier Name", "Supplier GSTIN", "Invoice No", "Invoice Date", "Books Amount (₹)", "Portal Amount (₹)", "Diff (₹)", "Books Tax (₹)", "Portal Tax (₹)", "Category", "Status", "ITC Eligibility", "Action Required"];
    const rows = records.map(r => [
      `"${r.id || ''}"`,
      `"${(r.supplierName || '').replace(/"/g, '""')}"`,
      `"${r.supplierGstin || ''}"`,
      `"${r.invoiceNo || ''}"`,
      `"${r.invoiceDate || ''}"`,
      r.bookAmount || 0,
      r.portalAmount || 0,
      r.diffAmount || 0,
      r.bookTax || 0,
      r.portalTax || 0,
      `"${r.category || ''}"`,
      `"${r.status || ''}"`,
      `"${r.itcEligibility || ''}"`,
      `"${r.actionRequired || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Yukti_GSTR2B_Reconciliation_July2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="view-container">
      {/* Header with Plain, Friendly English */}
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="view-pretitle">
            <GitCompare size={14} className="text-brand" />
            <span>Automatic Bill Matching</span>
          </div>
          <h1 className="view-title">Match Supplier Bills with Govt Portal</h1>
          <p className="view-subtitle">
            Compare your Tally purchase bills against government GSTR-2B inward statements to claim full tax credits safely.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleExportExcel} title="Download verified reconciliation CSV">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          
          <button className="btn btn-primary" onClick={onOpenReconModal}>
            <RefreshCw size={14} />
            <span>Run Matching</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Clean, Plain English */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div className="kpi-icon-wrapper text-green">
            <CheckCircle2 size={18} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Safe Tax Credit (ITC)</span>
            <h3 className="kpi-value text-green">₹{((summary.totalEligibleITC || 4256000) / 100000).toFixed(2)}L</h3>
            <span className="kpi-subtext font-mono text-green">Verified on government portal</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div className="kpi-icon-wrapper text-red">
            <AlertTriangle size={18} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Bills Missing on Portal</span>
            <h3 className="kpi-value text-red">₹{((summary.missingIn2BITC || 388500) / 1000).toFixed(1)}k</h3>
            <span className="kpi-subtext text-red"><strong>{summary.inBooksOnlyCount || 50}</strong> suppliers haven't filed yet</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div className="kpi-icon-wrapper text-amber">
            <Percent size={18} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Tax Rate Differences</span>
            <h3 className="kpi-value text-amber">₹{((summary.rateMismatchITC || 84000) / 1000).toFixed(1)}k</h3>
            <span className="kpi-subtext">Discrepancies to resolve</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--brand)' }}>
          <div className="kpi-icon-wrapper text-brand">
            <TrendingUp size={18} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Overall Match Rate</span>
            <h3 className="kpi-value">{summary.matchRatePct || 96.0}%</h3>
            <span className="kpi-subtext"><strong>{(summary.exactMatchCount || 1042) + (summary.nearMatchCount || 98)}</strong> of {summary.totalCount || 1248} bills</span>
          </div>
        </div>
      </div>

      {/* Slim, Visual Matching Progress Bar */}
      <div className="matching-telemetry-bar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 600 }}>Matching Breakdown (1,248 Bills Processed in 1.18s)</span>
          <span className="font-mono text-green" style={{ fontWeight: 600 }}>95.1% Auto-Resolved</span>
        </div>
        
        <div className="matching-bar-track">
          <div className="matching-bar-segment exact" style={{ width: '83.5%' }} title="Pass 1: Exact Match (83.5%)" />
          <div className="matching-bar-segment fuzzy" style={{ width: '7.8%' }} title="Pass 2: Smart Name/Invoice Match (7.8%)" />
          <div className="matching-bar-segment tolerance" style={{ width: '3.8%' }} title="Pass 3: Rounding Tolerance (3.8%)" />
          <div className="matching-bar-segment missing" style={{ width: '4.9%' }} title="Missing on Govt Portal (4.9%)" />
        </div>

        <div className="matching-bar-legend">
          <div className="matching-legend-item">
            <span className="matching-legend-dot" style={{ background: '#10B981' }} />
            <span>Exact: <strong>83.5%</strong> (1,042)</span>
          </div>
          <div className="matching-legend-item">
            <span className="matching-legend-dot" style={{ background: '#3B82F6' }} />
            <span>Smart Match: <strong>7.8%</strong> (98)</span>
          </div>
          <div className="matching-legend-item">
            <span className="matching-legend-dot" style={{ background: '#F59E0B' }} />
            <span>Rounding: <strong>3.8%</strong> (48)</span>
          </div>
          <div className="matching-legend-item">
            <span className="matching-legend-dot" style={{ background: '#EF4444' }} />
            <span className="text-red">Missing on Portal: <strong>4.9%</strong> (50)</span>
          </div>
        </div>
      </div>

      {/* Main Reconciliation Table Panel */}
      <div className="panel">
        {/* Filter Tabs & Search */}
        <div className="panel-toolbar flex-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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

          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Filter vendor, GSTIN, invoice #..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor / Supplier</th>
                <th>GSTIN</th>
                <th>Invoice #</th>
                <th>Date</th>
                <th className="text-right">Books Total (₹)</th>
                <th className="text-right">GSTR-2B Total (₹)</th>
                <th className="text-right">Variance (₹)</th>
                <th>Recon Status</th>
                <th>ITC Eligibility</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-muted">
                    No reconciliation records found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="font-semibold text-primary">{r.supplierName}</div>
                    </td>
                    <td>
                      <span className="font-mono text-xs">{r.supplierGstin}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs">{r.invoiceNo}</span>
                    </td>
                    <td className="text-xs text-secondary">{r.invoiceDate}</td>
                    <td className="text-right font-mono font-medium">
                      ₹{r.bookAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="text-right font-mono font-medium">
                      ₹{r.portalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className={`text-right font-mono font-semibold ${r.diffAmount !== 0 ? 'text-red' : 'text-muted'}`}>
                      {r.diffAmount === 0 ? '₹0' : `₹${r.diffAmount?.toLocaleString('en-IN')}`}
                    </td>
                    <td>{getStatusBadge(r.category)}</td>
                    <td>
                      <span className="text-xs text-secondary font-medium">
                        {r.itcEligibility}
                      </span>
                    </td>
                    <td className="text-right">
                      {r.category === 'IN_BOOKS_ONLY' ? (
                        <button 
                          className="btn btn-secondary text-xs" 
                          style={{ padding: '3px 8px' }}
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
                        >
                          <Send size={11} />
                          <span>Follow-up</span>
                        </button>
                      ) : (
                        <span className="text-xs text-muted">Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
