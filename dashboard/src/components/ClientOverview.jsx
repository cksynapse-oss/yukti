import React, { useState, useMemo } from 'react';
import { 
  Users, FileCheck, TrendingUp, ShieldAlert,
  Search, ArrowUpRight, ArrowUp, ArrowDown, ArrowUpDown,
  CheckCircle2, AlertCircle, Copy, Check
} from 'lucide-react';

export default function ClientOverview({ 
  firmInfo, 
  globalStats, 
  clients = [], 
  onSelectClient,
  onOpenAddClient
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedArn, setCopiedArn] = useState(null);
  const [density, setDensity] = useState('compact');

  // Normalize & deduplicate clients
  const normalizedClients = useMemo(() => {
    const seen = new Set();
    const result = [];
    clients.forEach((c, i) => {
      const gstin = (c.gstin || c.primary_gstin || `TEMP${i}`).toUpperCase();
      if (seen.has(gstin)) return;
      seen.add(gstin);
      result.push({
        id: c.id || `c-${i}`,
        name: c.name || c.business_name || 'Client Business',
        gstin,
        category: c.category || c.industry || 'General Business',
        primaryContact: c.primaryContact || c.primary_contact || 'Accounts Team',
        invoicesCount: Number(c.invoicesCount ?? c.monthlyInvoices ?? c.monthly_invoices ?? 120),
        autoPostedPct: Number(c.autoPostedPct ?? c.autoPostRate ?? c.auto_post_pct ?? 85.0),
        itcAtRisk: Number(c.itcAtRisk ?? c.itc_at_risk ?? 0),
        gstr1Status: c.gstr1Status || c.gstr1_status || 'Ready to Review',
        gstr3bStatus: c.gstr3bStatus || c.gstr3b_status || 'Pending Recon',
        nextDeadline: c.nextDeadline || c.nextDue || c.next_due || '20 Aug 2026',
        pendingExceptions: Number(c.pendingExceptions ?? c.exceptions_count ?? 0)
      });
    });
    return result;
  }, [clients]);

  const counts = useMemo(() => ({
    all: normalizedClients.length,
    exceptions: normalizedClients.filter(c => c.pendingExceptions > 0).length,
    pending3b: normalizedClients.filter(c => {
      const s = (c.gstr3bStatus || '').toLowerCase();
      return s.includes('pending') || s.includes('draft') || s.includes('overdue');
    }).length,
    itcRisk: normalizedClients.filter(c => c.itcAtRisk > 0).length,
    filed: normalizedClients.filter(c =>
      c.gstr1Status.toLowerCase().includes('filed') && c.gstr3bStatus.toLowerCase().includes('filed')
    ).length
  }), [normalizedClients]);

  const filtered = useMemo(() => {
    let r = normalizedClients.filter(c => {
      const q = searchTerm.toLowerCase();
      const match = !q || c.name.toLowerCase().includes(q) || c.gstin.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) || c.primaryContact.toLowerCase().includes(q);
      if (!match) return false;
      if (statusFilter === 'EXCEPTIONS') return c.pendingExceptions > 0;
      if (statusFilter === 'PENDING_3B') {
        const s = (c.gstr3bStatus || '').toLowerCase();
        return s.includes('pending') || s.includes('draft') || s.includes('overdue');
      }
      if (statusFilter === 'ITC_RISK') return c.itcAtRisk > 0;
      if (statusFilter === 'FILED') return c.gstr1Status.toLowerCase().includes('filed') && c.gstr3bStatus.toLowerCase().includes('filed');
      return true;
    });

    r.sort((a, b) => {
      const va = a[sortField], vb = b[sortField];
      if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });
    return r;
  }, [normalizedClients, searchTerm, statusFilter, sortField, sortAsc]);

  const totalPages = pageSize === 'ALL' ? 1 : Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    if (pageSize === 'ALL') return filtered;
    const s = (currentPage - 1) * pageSize;
    return filtered.slice(s, s + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} style={{ color: '#D1D5DB' }} />;
    return sortAsc ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const copyArn = (arn) => {
    navigator.clipboard.writeText(arn);
    setCopiedArn(arn);
    setTimeout(() => setCopiedArn(null), 2000);
  };

  const StatusCell = ({ status }) => {
    const s = (status || '').toLowerCase();
    const isFiled = s.includes('filed');
    const isOverdue = s.includes('overdue');
    const isDraft = s.includes('draft') || s.includes('ready') || s.includes('pending');
    const color = isFiled ? '#065F46' : isOverdue ? '#991B1B' : isDraft ? '#92400E' : '#6B7280';
    const dotColor = isFiled ? '#10B981' : isOverdue ? '#EF4444' : isDraft ? '#D97706' : '#9CA3AF';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', fontWeight: isFiled || isOverdue ? 600 : 400, color }}>{status}</span>
      </div>
    );
  };

  const filterBtnStyle = (id, color = 'brand') => {
    const isActive = statusFilter === id;
    const colors = {
      brand: { bg: '#0F5A47', text: '#fff', border: '#0F5A47', inactBg: '#F4F5F7', inactText: '#4B5563', inactBorder: '#E5E7EB' },
      amber: { bg: '#B45309', text: '#fff', border: '#B45309', inactBg: '#FFFBEB', inactText: '#92400E', inactBorder: '#FDE68A' },
      red: { bg: '#B91C1C', text: '#fff', border: '#B91C1C', inactBg: '#FEF2F2', inactText: '#991B1B', inactBorder: '#FECACA' },
      green: { bg: '#065F46', text: '#fff', border: '#065F46', inactBg: '#ECFDF5', inactText: '#065F46', inactBorder: '#A7F3D0' },
    };
    const c = colors[color];
    return {
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '5px 11px', fontSize: '12px', fontWeight: 600,
      borderRadius: '6px', cursor: 'pointer', border: `1px solid ${isActive ? c.border : c.inactBorder}`,
      background: isActive ? c.bg : c.inactBg, color: isActive ? c.text : c.inactText,
      transition: 'all 0.12s ease'
    };
  };

  return (
    <div className="view-container">
      {/* Page Header with Quick Demo CTA */}
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="view-pretitle">
            <Users size={13} className="text-brand" />
            <span>Practice Overview</span>
          </div>
          <h1 className="view-title">Client Accounts</h1>
          <p className="view-subtitle">
            {normalizedClients.length} businesses · {firmInfo?.activePeriod || 'July 2026'} tax cycle · Track filing progress and protect client tax credits
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ 
              borderColor: 'var(--brand)', 
              color: 'var(--brand)', 
              backgroundColor: 'var(--brand-light)',
              fontWeight: 600
            }}
            onClick={() => {
              const highRisk = normalizedClients.find(c => c.itcAtRisk > 100000) || normalizedClients[0];
              onSelectClient?.(highRisk);
            }}
          >
            <span>⚡ Demo: Inspect High-Risk Client</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

      {/* Elevated KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '3px solid var(--brand)' }}>
          <div className="kpi-icon-wrapper"><Users size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Active Clients</span>
            <h3 className="kpi-value">{normalizedClients.length}</h3>
            <span className="kpi-subtext"><strong>2.3×</strong> team capacity</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div className="kpi-icon-wrapper text-green"><TrendingUp size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Tax Credit Protected</span>
            <h3 className="kpi-value text-green">₹{((globalStats?.itcSavedThisMonth || 1245000) / 100000).toFixed(2)}L</h3>
            <span className="kpi-subtext font-mono text-green">↑ +18.4% vs last month</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div className="kpi-icon-wrapper text-amber"><FileCheck size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Auto-Posted to Tally</span>
            <h3 className="kpi-value">{globalStats?.autoPostedPct || 84.2}%</h3>
            <span className="kpi-subtext"><strong>1,051</strong> bills zero-touch</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div className="kpi-icon-wrapper text-red"><ShieldAlert size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Supplier Bills at Risk</span>
            <h3 className="kpi-value text-red">₹{((globalStats?.totalITCRisk || 472500) / 100000).toFixed(2)}L</h3>
            <span className="kpi-subtext text-red"><strong>50</strong> unfiled supplier bills</span>
          </div>
        </div>
      </div>

      {/* Table Panel */}
      <div className="panel">

        {/* Toolbar — filter chips + search + add */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
          {/* Filter chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button style={filterBtnStyle('ALL', 'brand')} onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}>
              All ({counts.all})
            </button>
            <button style={filterBtnStyle('EXCEPTIONS', 'amber')} onClick={() => { setStatusFilter('EXCEPTIONS'); setCurrentPage(1); }}>
              <AlertCircle size={12} /> Needs Attention ({counts.exceptions})
            </button>
            <button style={filterBtnStyle('PENDING_3B', 'brand')} onClick={() => { setStatusFilter('PENDING_3B'); setCurrentPage(1); }}>
              Pending 3B ({counts.pending3b})
            </button>
            <button style={filterBtnStyle('ITC_RISK', 'red')} onClick={() => { setStatusFilter('ITC_RISK'); setCurrentPage(1); }}>
              ITC at Risk ({counts.itcRisk})
            </button>
            <button style={filterBtnStyle('FILED', 'green')} onClick={() => { setStatusFilter('FILED'); setCurrentPage(1); }}>
              <CheckCircle2 size={12} /> Fully Filed ({counts.filed})
            </button>
          </div>

          {/* Right side — density + search + add */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Density Toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px' }}>
              <button
                onClick={() => setDensity('compact')}
                style={{
                  border: 'none',
                  background: density === 'compact' ? '#FFFFFF' : 'transparent',
                  color: density === 'compact' ? 'var(--text-primary)' : 'var(--text-muted)',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  fontSize: '10.5px',
                  fontWeight: density === 'compact' ? 600 : 500,
                  cursor: 'pointer'
                }}
                title="Compact density"
              >
                Compact
              </button>
              <button
                onClick={() => setDensity('comfortable')}
                style={{
                  border: 'none',
                  background: density === 'comfortable' ? '#FFFFFF' : 'transparent',
                  color: density === 'comfortable' ? 'var(--text-primary)' : 'var(--text-muted)',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  fontSize: '10.5px',
                  fontWeight: density === 'comfortable' ? 600 : 500,
                  cursor: 'pointer'
                }}
                title="Comfortable density"
              >
                Comfortable
              </button>
            </div>

            <div className="search-input-wrapper">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search client, GSTIN..."
                aria-label="Search clients by business name or GSTIN"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="search-input"
                style={{ width: '200px' }}
              />
            </div>
            {onOpenAddClient && (
              <button className="btn btn-primary" style={{ fontSize: '11.5px', padding: '5px 11px' }} onClick={onOpenAddClient}>
                <Users size={13} /> Add Client
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className={`data-table ${density} table-sticky-header`}>
            <thead>
              <tr>
                <th className="table-sticky-col" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('name')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Client Business <SortIcon field="name" /></span>
                </th>
                <th>GSTIN</th>
                <th>Industry</th>
                <th className="text-right" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('invoicesCount')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>Invoices/Mo <SortIcon field="invoicesCount" /></span>
                </th>
                <th className="text-right" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('autoPostedPct')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>Auto-Post% <SortIcon field="autoPostedPct" /></span>
                </th>
                <th className="text-right" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('itcAtRisk')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>ITC at Risk <SortIcon field="itcAtRisk" /></span>
                </th>
                <th>GSTR-1</th>
                <th>GSTR-3B</th>
                <th>Next Due</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No clients match the current filter.
                </td></tr>
              ) : paginated.map(c => (
                <tr 
                  key={c.id} 
                  onClick={() => onSelectClient?.(c)}
                  style={{ cursor: 'pointer' }}
                  title="Click to open Client 360 Workspace"
                >
                  <td className="table-sticky-col">
                    <div style={{ fontWeight: 600, color: 'var(--brand)', fontSize: '13px' }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{c.primaryContact}</div>
                  </td>
                  <td><span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{c.gstin}</span></td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.category}</td>
                  <td className="text-right font-mono" style={{ fontWeight: 500, fontSize: '13px' }}>{c.invoicesCount}</td>
                  <td className="text-right">
                    <span className={`badge ${c.autoPostedPct >= 85 ? 'badge-success' : 'badge-warning'}`}>
                      {c.autoPostedPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-right font-mono" style={{ fontWeight: 600 }}>
                    {c.itcAtRisk > 0
                      ? <span style={{ color: 'var(--danger)' }}>₹{c.itcAtRisk.toLocaleString('en-IN')}</span>
                      : <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>—</span>
                    }
                  </td>
                  <td><StatusCell status={c.gstr1Status} /></td>
                  <td><StatusCell status={c.gstr3bStatus} /></td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{c.nextDeadline}</td>
                  <td className="text-right">
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 10px', fontWeight: 600, borderColor: 'var(--brand)', color: 'var(--brand)' }}
                      onClick={(e) => { e.stopPropagation(); onSelectClient?.(c); }}
                    >
                      <span>Open Workspace</span>
                      <ArrowUpRight size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAFA', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)); setCurrentPage(1); }}
              style={{ padding: '3px 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff', color: 'var(--text-primary)' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value="ALL">All</option>
            </select>
            <span style={{ color: 'var(--text-secondary)' }}>
              Showing {paginated.length} of {filtered.length} clients
            </span>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                style={{ padding: '3px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, fontSize: '12px' }}>
                ← Prev
              </button>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>
                Page {currentPage} / {totalPages}
              </span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                style={{ padding: '3px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, fontSize: '12px' }}>
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
