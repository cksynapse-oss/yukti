import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  FileText, 
  Landmark, 
  RefreshCw, 
  FileCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Download, 
  ExternalLink, 
  Check, 
  Send, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Sparkles,
  Server,
  FileSpreadsheet
} from 'lucide-react';

import ReviewQueue from './ReviewQueue';
import BankStatementAutomationView from './BankStatementAutomationView';
import ReconciliationView from './ReconciliationView';
import ReturnPrepModal from './ReturnPrepModal';
import { NOTICES, RECONCILIATION_DATA, GSTR_SUMMARY } from '../data/mockData';

export default function ClientWorkspaceView({
  client,
  onBack,
  invoices = [],
  onApproveInvoice,
  onRejectInvoice,
  onInspectInvoice,
  getPattern,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'invoices', 'bank', 'recon', 'returns', 'notices'
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Filter client-specific invoices & notices
  const clientInvoices = invoices.filter(i => 
    i.customerName?.toLowerCase().includes(client?.business_name?.toLowerCase()) ||
    i.customer_name?.toLowerCase().includes(client?.business_name?.toLowerCase()) ||
    i.clientId === client?.id || i.client_id === client?.id
  );

  const clientNotices = NOTICES.filter(n => 
    n.clientName?.toLowerCase().includes(client?.business_name?.toLowerCase()) ||
    n.clientGstin === client?.primary_gstin
  );

  const displayInvoices = clientInvoices.length > 0 ? clientInvoices : invoices.slice(0, 3);
  const displayNotices = clientNotices.length > 0 ? clientNotices : NOTICES;

  return (
    <div className="view-container">
      {/* Client Command Bar (Breadcrumb & Identity) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onBack}
            className="btn btn-secondary"
            style={{ padding: '5px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
          >
            <ArrowLeft size={14} />
            <span>All Clients</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {client?.business_name || "Reliance Logistics Pvt Ltd"}
              </h1>
              <span className="badge badge-brand font-mono" style={{ fontSize: '11px' }}>
                {client?.primary_gstin || "27AAACR5055K1Z2"}
              </span>
              <span className="badge badge-success font-mono" style={{ fontSize: '10px' }}>
                ACTIVE
              </span>
            </div>
            <span className="text-xs text-muted" style={{ display: 'block', marginTop: '2px' }}>
              PAN: <strong>{client?.pan || "AAACR5055K"}</strong> • Industry: {client?.industry || "Logistics & Supply Chain"} • Turnover: {client?.turnover || "₹12.5 Cr"}
            </span>
          </div>
        </div>

        {/* Client Fast-Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right', padding: '4px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <span className="text-xs text-muted block" style={{ fontSize: '10px' }}>GSTR-1 Status</span>
            <strong className="text-xs text-primary" style={{ color: 'var(--brand)' }}>Ready to Review</strong>
          </div>

          <div style={{ textAlign: 'right', padding: '4px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <span className="text-xs text-muted block" style={{ fontSize: '10px' }}>GSTR-3B Status</span>
            <strong className="text-xs text-amber" style={{ color: '#D97706' }}>Pending Verification</strong>
          </div>

          <div style={{ textAlign: 'right', padding: '4px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <span className="text-xs text-muted block" style={{ fontSize: '10px' }}>Tax Credit at Risk</span>
            <strong className="text-xs text-red font-mono" style={{ color: '#DC2626' }}>
              ₹{(client?.itcAtRisk || 472500).toLocaleString('en-IN')}
            </strong>
          </div>
        </div>
      </div>

      {/* Executive Summary & Client Health Score Hero (Items 12 & 13) */}
      <div className="panel" style={{ padding: '20px', marginBottom: '16px', background: '#FFFFFF', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', alignItems: 'center' }}>
          {/* Left: Composite Health Score */}
          <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={15} className="text-brand" />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Client Health Index
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="font-mono" style={{ fontSize: '38px', fontWeight: 800, color: (client?.healthScore || 87) >= 80 ? 'var(--brand)' : '#D97706', lineHeight: 1 }}>
                {client?.healthScore || 87}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
              <span className="badge badge-warning font-mono" style={{ fontSize: '10px', marginLeft: '6px' }}>
                -6 pts this month
              </span>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 12px 0', lineHeight: 1.4 }}>
              {client?.healthDelta || "Health decreased 6 points this month because of 50 missing supplier 2B filings."}
            </p>

            {/* Sub-Dimension Micro Bars */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
              <div>
                <span className="text-muted block text-xs">Financial Hygiene:</span>
                <strong className="font-mono text-green">{client?.healthBreakdown?.hygiene || 94}/100</strong>
              </div>
              <div>
                <span className="text-muted block text-xs">3-Way Recon:</span>
                <strong className="font-mono text-green">{client?.healthBreakdown?.recon || 96}/100</strong>
              </div>
              <div>
                <span className="text-muted block text-xs">Statutory Compliance:</span>
                <strong className="font-mono text-amber">{client?.healthBreakdown?.compliance || 82}/100</strong>
              </div>
              <div>
                <span className="text-muted block text-xs">Credit Exposure Risk:</span>
                <strong className="font-mono text-red">{client?.healthBreakdown?.risk || 72}/100</strong>
              </div>
            </div>
          </div>

          {/* Right: Executive Priorities & Top 3 Issues */}
          <div>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '10px 14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <Sparkles size={13} className="text-green" />
                <strong style={{ fontSize: '12px', color: '#064E3B' }}>Yukti Recommendation:</strong>
              </div>
              <span style={{ fontSize: '12px', color: '#065F46' }}>
                {client?.recommendation || "Resolve 50 missing 2B supplier invoices before 20th August GSTR-3B hard-lock."}
              </span>
            </div>

            <span className="text-xs text-muted block uppercase tracking-wider font-semibold mb-1" style={{ fontSize: '10px', marginBottom: '6px' }}>
              Top 3 Practice Priorities for this Client:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(client?.topIssues || [
                "₹38,850 ITC exposure from unfiled supplier returns",
                "50 invoices missing on GSTN portal",
                "2 vendor tax-rate variances flagged vs historical baseline"
              ]).map((issue, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: '4px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="font-mono font-bold text-muted">{idx + 1}.</span>
                    <span className="text-primary">{issue}</span>
                  </div>
                  <button 
                    className="btn-ghost-link text-xs font-semibold"
                    onClick={() => {
                      if (idx === 0) setActiveTab('recon');
                      else if (idx === 1) setActiveTab('recon');
                      else setActiveTab('invoices');
                    }}
                  >
                    Action →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: '#FFFFFF', padding: '0 16px', borderRadius: '8px 8px 0 0', overflowX: 'auto', gap: '4px' }}>
        {[
          { id: 'overview', label: '1. Client Profile & Hub', icon: Building2 },
          { id: 'invoices', label: `2. Invoices to Tally (${displayInvoices.length})`, icon: FileText },
          { id: 'bank', label: '3. Bank & Rule 37', icon: Landmark },
          { id: 'recon', label: '4. Match Bills (2B Recon)', icon: RefreshCw },
          { id: 'returns', label: '5. Monthly Returns', icon: FileCheck },
          { id: 'notices', label: `6. Tax Notices (${displayNotices.length})`, icon: ShieldAlert, badge: displayNotices.length > 0 ? String(displayNotices.length) : null }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '12px 16px',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--brand)' : '2px solid transparent',
                background: 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s ease'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="badge badge-danger font-mono" style={{ fontSize: '9px', padding: '0 5px' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Client Overview & Profile */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {/* Top 3 Profile Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {/* Card 1: Statutory Registration */}
            <div className="panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Building2 size={16} className="text-brand" />
                <h3 style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>GST & Entity Registration</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Legal Name:</span>
                  <span className="font-semibold">{client?.business_name || "Reliance Logistics Pvt Ltd"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">GSTIN:</span>
                  <span className="font-mono font-semibold">{client?.primary_gstin || "27AAACR5055K1Z2"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">PAN:</span>
                  <span className="font-mono font-semibold">{client?.pan || "AAACR5055K"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Filing Frequency:</span>
                  <span className="font-semibold text-green">Monthly (GSTR-1 & 3B)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">E-Invoicing:</span>
                  <span className="badge badge-brand" style={{ fontSize: '10px' }}>Applicable (&gt;₹5 Cr)</span>
                </div>
              </div>
            </div>

            {/* Card 2: Connected Accounting & Books */}
            <div className="panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Server size={16} className="text-brand" />
                <h3 style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>Books & Tally Integration</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Tally Connection:</span>
                  <span className="engine-pulse-active" style={{ fontSize: '10px', padding: '2px 7px' }}>
                    <span className="pulse-dot" /> Port 9000 Active
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Tally Company:</span>
                  <span className="font-semibold">Reliance Logistics Pvt Ltd</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Ledgers Synced:</span>
                  <span className="font-semibold">142 Chart of Accounts</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Primary Bank:</span>
                  <span className="font-semibold">HDFC Current A/c #9812</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Auto-Post Rate:</span>
                  <span className="font-semibold text-green">84.2% Zero-Touch</span>
                </div>
              </div>
            </div>

            {/* Card 3: Contact & Signatory */}
            <div className="panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <User size={16} className="text-brand" />
                <h3 style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>Authorized Signatory</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Contact Person:</span>
                  <span className="font-semibold">Rajesh Verma (Director)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Phone:</span>
                  <span className="font-mono font-semibold">+91 98200 11223</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Email:</span>
                  <span className="font-semibold">accounts@reliancelogistics.in</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Assigned CA:</span>
                  <span className="font-semibold">Rajnish (Principal)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Audit Due:</span>
                  <span className="font-semibold">30 Sept 2026 (Tax Audit)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filing Timeline & History */}
          <div className="panel" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
              Filing Track Record & Compliance Timeline (FY 2026-27)
            </h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Return</th>
                  <th>Statutory Due Date</th>
                  <th>Filing Date</th>
                  <th>Tax Paid / Reconciled</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono font-semibold">June 2026</td>
                  <td>GSTR-1 (Outward Supplies)</td>
                  <td className="font-mono text-muted">11-07-2026</td>
                  <td className="font-mono">10-07-2026</td>
                  <td className="font-mono">₹18,45,200</td>
                  <td><span className="badge badge-success">✓ Filed (On Time)</span></td>
                </tr>
                <tr>
                  <td className="font-mono font-semibold">June 2026</td>
                  <td>GSTR-3B (Monthly Return)</td>
                  <td className="font-mono text-muted">20-07-2026</td>
                  <td className="font-mono">19-07-2026</td>
                  <td className="font-mono">₹4,20,200 Cash</td>
                  <td><span className="badge badge-success">✓ Filed (On Time)</span></td>
                </tr>
                <tr style={{ background: 'rgba(245, 158, 11, 0.04)' }}>
                  <td className="font-mono font-semibold text-primary">July 2026</td>
                  <td>GSTR-1 (Outward Supplies)</td>
                  <td className="font-mono text-muted">11-08-2026</td>
                  <td className="font-mono text-amber">Ready to File</td>
                  <td className="font-mono">₹21,14,000</td>
                  <td><span className="badge badge-brand">Review Complete</span></td>
                </tr>
                <tr style={{ background: 'rgba(239, 68, 68, 0.04)' }}>
                  <td className="font-mono font-semibold text-primary">July 2026</td>
                  <td>GSTR-3B (Monthly Return)</td>
                  <td className="font-mono text-muted">20-08-2026</td>
                  <td className="font-mono text-red">Pending 2B Match</td>
                  <td className="font-mono">₹4,72,500 ITC at Risk</td>
                  <td><span className="badge badge-warning">Needs Attention</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Invoices to Tally */}
      {activeTab === 'invoices' && (
        <div style={{ marginTop: '16px' }}>
          <ReviewQueue 
            items={displayInvoices}
            onApprove={onApproveInvoice}
            onReject={onRejectInvoice}
            onInspect={onInspectInvoice}
            getPattern={getPattern}
          />
        </div>
      )}

      {/* Tab 3: Bank Statements & Rule 37 */}
      {activeTab === 'bank' && (
        <div style={{ marginTop: '16px' }}>
          <BankStatementAutomationView onShowToast={onShowToast} />
        </div>
      )}

      {/* Tab 4: Match Bills (2B Recon) */}
      {activeTab === 'recon' && (
        <div style={{ marginTop: '16px' }}>
          <ReconciliationView 
            reconData={RECONCILIATION_DATA}
            onOpenReconModal={() => {}}
          />
        </div>
      )}

      {/* Tab 5: File Returns */}
      {activeTab === 'returns' && (
        <div style={{ marginTop: '16px' }}>
          <ReturnPrepModal 
            isInline={true}
            gstrSummary={GSTR_SUMMARY}
          />
        </div>
      )}

      {/* Tab 6: Department Tax Notices */}
      {activeTab === 'notices' && (
        <div style={{ marginTop: '16px' }}>
          <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="view-pretitle">
                <ShieldAlert size={14} className="text-red" />
                <span>Departmental Scrutiny & Notices</span>
              </div>
              <h2 className="view-title" style={{ fontSize: '18px' }}>
                Active GST Notices for {client?.business_name || "Reliance Logistics Pvt Ltd"}
              </h2>
              <p className="view-subtitle">
                Statutory notices issued by GST authorities under Section 61 (ASMT-10) and Section 73 (DRC-01) with AI legal replies.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {displayNotices.map((notice) => (
              <div key={notice.id} className="panel" style={{ padding: '20px', borderLeft: notice.noticeType === 'DRC-01' ? '4px solid var(--danger)' : '4px solid var(--warning)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${notice.noticeType === 'DRC-01' ? 'badge-danger' : 'badge-warning'} font-mono`}>
                        {notice.noticeType}
                      </span>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{notice.subject}</strong>
                    </div>
                    <p className="text-xs text-secondary mt-1" style={{ marginTop: '4px', maxWidth: '720px' }}>
                      {notice.description}
                    </p>
                    <div className="text-xs text-muted font-mono" style={{ marginTop: '6px' }}>
                      Issuing Authority: {notice.issuingAuthority} • Notice Date: {notice.noticeDate}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="text-xs text-muted block">Demand Amount</span>
                    <strong className="text-red font-mono" style={{ fontSize: '16px', color: 'var(--danger)' }}>
                      ₹{notice.demandAmount.toLocaleString('en-IN')}
                    </strong>
                    <div className="text-xs text-red font-mono" style={{ marginTop: '3px' }}>
                      Deadline: <strong>{notice.responseDeadline}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#065F46' }}>
                    <CheckCircle2 size={14} className="text-green" />
                    <span>Statutory Reply Drafted & Reconciled against GSTR-2B</span>
                  </div>

                  <button 
                    className="btn btn-primary"
                    onClick={() => setSelectedNotice(notice)}
                    style={{ fontSize: '12px', padding: '5px 12px' }}
                  >
                    <span>Inspect & Download Legal Reply</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Legal Reply Inspector Modal */}
          {selectedNotice && (
            <div className="modal-overlay" onClick={() => setSelectedNotice(null)}>
              <div className="modal-dialog" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header-bar">
                  <h3>Formal Legal Reply: Form GST {selectedNotice.noticeType}</h3>
                  <button className="btn-icon-action" onClick={() => setSelectedNotice(null)}>✕</button>
                </div>
                <div className="modal-body-scroll" style={{ padding: '16px 20px' }}>
                  <pre style={{ background: '#0D1117', color: '#E6EDF3', padding: '16px', borderRadius: '6px', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {selectedNotice.draftReply}
                  </pre>
                </div>
                <div className="modal-footer-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-xs text-muted">Legal reference: Section 16(4) CGST Act & W.P. No. 1290/2024</span>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedNotice.draftReply);
                      onShowToast?.("Statutory legal reply copied to clipboard.");
                      setSelectedNotice(null);
                    }}
                  >
                    <Check size={14} />
                    <span>Copy & Submit Reply</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
