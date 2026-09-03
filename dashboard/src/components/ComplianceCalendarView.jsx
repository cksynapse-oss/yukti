import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  ShieldAlert, 
  Building2, 
  FileText,
  ChevronRight
} from 'lucide-react';

export default function ComplianceCalendarView({ onSelectClient }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'PENDING', 'CRITICAL'

  const milestones = [
    {
      id: 'm1',
      date: '11 AUG 2026',
      returnType: 'Form GSTR-1',
      title: 'Monthly Outward Supplies & B2B Invoices',
      statutoryRef: 'Section 37(1) CGST Act • Turnover > ₹5 Cr',
      status: 'READY',
      urgency: 'medium',
      dueInDays: 3,
      totalClients: 38,
      completedCount: 36,
      pendingClients: [
        { id: 'c1', name: 'Reliance Logistics Pvt Ltd', gstin: '27AAACR5055K1Z2', risk: '₹2.1L Unreconciled B2B' },
        { id: 'c2', name: 'Sunrise Heavy Engineering', gstin: '27AAACR9981K1Z1', risk: '₹84K Missing E-Way Bill' }
      ]
    },
    {
      id: 'm2',
      date: '13 AUG 2026',
      returnType: 'IFF (QRMP)',
      title: 'Invoice Furnishing Facility (Quarterly Filers)',
      statutoryRef: 'Rule 59(2) CGST Rules • Optional B2B Upload',
      status: 'CLEAN',
      urgency: 'low',
      dueInDays: 5,
      totalClients: 2,
      completedCount: 2,
      pendingClients: []
    },
    {
      id: 'm3',
      date: '20 AUG 2026',
      returnType: 'Form GSTR-3B',
      title: 'Monthly Summary Return & Statutory Cash Payment',
      statutoryRef: 'Section 39(1) CGST Act • Late fee: ₹50/day + 18% Interest',
      status: 'CRITICAL',
      urgency: 'critical',
      dueInDays: 7,
      totalClients: 40,
      completedCount: 31,
      pendingClients: [
        { id: 'c1', name: 'Reliance Logistics Pvt Ltd', gstin: '27AAACR5055K1Z2', risk: '₹4.72L Sec 16(2)(aa) at risk' },
        { id: 'c3', name: 'Bharat Agro Tech Industries', gstin: '27AABCB4091M1Z8', risk: 'Rule 37 180-Day unpaid bills' },
        { id: 'c4', name: 'Apex Pharma Distributors', gstin: '27AABCA3012L1Z3', risk: 'Ineligible 17(5) motor vehicle ITC' }
      ]
    },
    {
      id: 'm4',
      date: '24 AUG 2026',
      returnType: 'ASMT-10 Notice',
      title: 'Scrutiny of Returns Response (Section 61)',
      statutoryRef: 'Notice issued under Rule 99(1) • GSTR-3B vs 2B Discrepancy',
      status: 'CRITICAL',
      urgency: 'critical',
      dueInDays: 9,
      totalClients: 2,
      completedCount: 0,
      pendingClients: [
        { id: 'c1', name: 'Reliance Logistics Pvt Ltd', gstin: '27AAACR5055K1Z2', risk: 'Demand: ₹2,45,600 (ITC mismatch)' },
        { id: 'c5', name: 'Mahalaxmi Packaging Material', gstin: '27AABCM7712K1Z9', risk: 'Demand: ₹69,440 (GSTR-1 vs 3B)' }
      ]
    }
  ];

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="view-pretitle">
            <Calendar size={14} className="text-brand" />
            <span>Firm-Wide Statutory Milestones</span>
          </div>
          <h1 className="view-title">Statutory Compliance Calendar</h1>
          <p className="view-subtitle">
            Track firm-wide statutory deadlines across all 40 clients for GSTR-1, GSTR-3B, and Department Scrutiny Notices.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '3px solid var(--brand)' }}>
          <div className="kpi-icon-wrapper text-brand"><Clock size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Next Statutory Due Date</span>
            <h3 className="kpi-value font-mono">11 Aug 2026</h3>
            <span className="kpi-subtext text-primary font-medium">GSTR-1 Outward Supplies</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div className="kpi-icon-wrapper text-red"><AlertTriangle size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">GSTR-3B at Risk</span>
            <h3 className="kpi-value text-red font-mono">9 Clients</h3>
            <span className="kpi-subtext text-red font-medium">Due 20th Aug • Cash exposure</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid #D97706' }}>
          <div className="kpi-icon-wrapper text-amber"><ShieldAlert size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Active Scrutiny Notices</span>
            <h3 className="kpi-value text-amber font-mono">2 Notices</h3>
            <span className="kpi-subtext font-medium">ASMT-10 Legal replies drafted</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div className="kpi-icon-wrapper text-green"><CheckCircle2 size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Filing Completion</span>
            <h3 className="kpi-value text-green font-mono">77.5%</h3>
            <span className="kpi-subtext font-mono text-green">31 of 40 clients on track</span>
          </div>
        </div>
      </div>

      {/* Milestone Cards Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {milestones.map((m) => (
          <div key={m.id} className="panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ 
                  background: m.urgency === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-subtle)', 
                  border: `1px solid ${m.urgency === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`,
                  padding: '8px 14px', 
                  borderRadius: '8px', 
                  textAlign: 'center',
                  minWidth: '85px'
                }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: m.urgency === 'critical' ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
                    Due In {m.dueInDays} Days
                  </span>
                  <strong style={{ fontSize: '14px', color: m.urgency === 'critical' ? 'var(--danger)' : 'var(--text-primary)', display: 'block', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {m.date.split(' ')[0]} {m.date.split(' ')[1]}
                  </strong>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${m.urgency === 'critical' ? 'badge-danger' : 'badge-brand'} font-mono`}>
                      {m.returnType}
                    </span>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {m.title}
                    </h3>
                  </div>
                  <span className="text-xs text-muted" style={{ display: 'block', marginTop: '4px' }}>
                    {m.statutoryRef}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="text-xs text-muted block">Status</span>
                <strong style={{ 
                  fontSize: '13px', 
                  color: m.status === 'CLEAN' ? 'var(--success)' : m.status === 'CRITICAL' ? 'var(--danger)' : 'var(--brand)' 
                }}>
                  {m.completedCount} / {m.totalClients} Clients Ready
                </strong>
              </div>
            </div>

            {/* Pending Clients Drawer */}
            {m.pendingClients.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Clients Requiring Immediate Action ({m.pendingClients.length})
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '10px', marginTop: '8px' }}>
                  {m.pendingClients.map((client, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => onSelectClient?.({ id: client.id, business_name: client.name, primary_gstin: client.gstin })}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '10px 14px', 
                        background: 'var(--bg-subtle)', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      className="hover-lift"
                      title="Click to open Client 360 Workspace"
                    >
                      <div>
                        <strong style={{ fontSize: '12px', color: 'var(--brand)', display: 'block' }}>{client.name}</strong>
                        <span className="font-mono text-muted text-xs" style={{ fontSize: '10px' }}>{client.gstin}</span>
                        <span className="text-xs text-red block font-medium" style={{ fontSize: '11px', marginTop: '2px' }}>
                          ⚠️ {client.risk}
                        </span>
                      </div>

                      <button 
                        className="btn btn-secondary" 
                        style={{ fontSize: '11px', padding: '3px 8px', whiteSpace: 'nowrap' }}
                      >
                        <span>Open Hub</span>
                        <ArrowUpRight size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
