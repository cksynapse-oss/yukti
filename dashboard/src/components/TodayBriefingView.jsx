import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  Check, 
  Calendar, 
  TrendingUp, 
  Zap, 
  FileText, 
  Building2, 
  Layers,
  ChevronRight,
  Send,
  ShieldCheck
} from 'lucide-react';
import { TODAY_BRIEFING, GLOBAL_STATS } from '../data/mockData';

export default function TodayBriefingView({
  onNavigateTab,
  onSelectClient,
  clients = [],
  reviewItems = [],
  onApproveAllNearMatches,
  onOpenVendorFollowup,
  onInspectItem,
  onShowToast
}) {
  const [approvedBatch, setApprovedBatch] = useState(false);
  const briefing = TODAY_BRIEFING;

  const handleBatchApprove = () => {
    setApprovedBatch(true);
    if (onApproveAllNearMatches) {
      const nearMatches = reviewItems.filter(i => 
        i.issueCategory?.includes('Near Match') || i.issueCategory?.includes('Rounding')
      );
      if (nearMatches.length > 0) {
        onApproveAllNearMatches(nearMatches);
      }
    }
    if (onShowToast) {
      onShowToast("All 4 verified vouchers approved & posted to Tally Prime Port 9000.");
    }
  };

  return (
    <div className="view-container today-briefing-page">
      {/* Morning Executive Greeting Hero */}
      <div className="today-hero-card">
        <div className="today-hero-header">
          <div>
            <div className="today-badge-pill">
              <Sparkles size={13} className="text-brand" />
              <span>YUKTI PRACTICE INTELLIGENCE • MORNING BRIEFING</span>
            </div>
            <h1 className="today-greeting-title">{briefing.greeting}</h1>
            <p className="today-greeting-subtitle">
              <strong>{briefing.headline}</strong> Here are the{' '}
              <span className="today-highlight-count">{briefing.decisionsNeededCount} decisions</span>{' '}
              that need your attention today.
            </p>
          </div>

          <div className="today-live-pulse">
            <span className="pulse-dot" />
            <span>Autonomous Engine Active • Local DuckDB :9000</span>
          </div>
        </div>

        {/* Quantified Work Removed Bar */}
        <div className="today-stats-strip">
          <div className="today-stat-col">
            <div className="today-stat-label">Yukti Saved Today</div>
            <div className="today-stat-val text-green font-mono">{GLOBAL_STATS.hoursSavedToday}</div>
            <div className="today-stat-sub">~47 senior manual tasks avoided</div>
          </div>
          <div className="today-stat-col">
            <div className="today-stat-label">Hours Saved This Month</div>
            <div className="today-stat-val font-mono">{GLOBAL_STATS.hoursSavedThisMonth} hrs</div>
            <div className="today-stat-sub">Across 8 active client pods</div>
          </div>
          <div className="today-stat-col">
            <div className="today-stat-label">Tax Credit Shielded</div>
            <div className="today-stat-val text-brand font-mono">{GLOBAL_STATS.itcSavedThisMonth ? `₹${(GLOBAL_STATS.itcSavedThisMonth / 100000).toFixed(2)}L` : '₹12.45L'}</div>
            <div className="today-stat-sub">Zero Section 16 leakage</div>
          </div>
          <div className="today-stat-col">
            <div className="today-stat-label">Zero-Touch Auto-Post</div>
            <div className="today-stat-val text-green font-mono">{GLOBAL_STATS.autoPostedPct}%</div>
            <div className="today-stat-sub">1,051 vouchers to Tally</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Decisions Left, Autonomous Proof Right */}
      <div className="today-grid-layout">
        {/* Left 65%: The Decisions That Matter */}
        <div className="today-decisions-col">
          {/* Section 1: Critical Decisions */}
          <div className="today-section-card">
            <div className="today-section-heading">
              <div className="flex items-center gap-2">
                <span className="status-dot red" />
                <h2>Critical Risks Requiring Action</h2>
              </div>
              <span className="badge badge-danger font-mono">
                {briefing.criticalDecisions.length} Critical
              </span>
            </div>

            <div className="today-decision-items-list">
              {briefing.criticalDecisions.map((dec) => {
                const clientObj = clients.find(c => c.id === dec.clientId || c.name.includes(dec.client.split(' ')[0]));
                return (
                  <div key={dec.id} className="today-decision-card">
                    <div className="today-decision-card-top">
                      <div>
                        <div className="today-client-row">
                          <Building2 size={13} className="text-muted" />
                          <span className="today-client-name">{dec.client}</span>
                          <span className={`badge ${dec.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'} font-mono`}>
                            {dec.severity}
                          </span>
                        </div>
                        <h3 className="today-decision-title">{dec.title}</h3>
                        <p className="today-decision-sub">{dec.subtitle}</p>
                      </div>

                      <div className="today-decision-confidence">
                        <span className="text-xs text-muted block">Yukti Confidence</span>
                        <strong className="font-mono text-sm text-brand">{dec.confidence}%</strong>
                      </div>
                    </div>

                    <div className="today-why-box">
                      <div className="today-why-label">Why this matters:</div>
                      <p className="today-why-text">{dec.whyMatters}</p>
                    </div>

                    <div className="today-recommendation-box">
                      <div className="today-rec-label">Yukti recommends:</div>
                      <p className="today-rec-text">{dec.recommendation}</p>
                    </div>

                    <div className="today-evidence-pills">
                      <span className="today-evidence-tag-title">Evidence:</span>
                      {dec.evidence.map((ev, i) => (
                        <span key={i} className="today-evidence-pill">{ev}</span>
                      ))}
                    </div>

                    <div className="today-decision-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          if (clientObj) {
                            onSelectClient(clientObj);
                          } else {
                            onNavigateTab('queue');
                          }
                        }}
                      >
                        <span>{dec.actionLabel}</span>
                        <ArrowRight size={13} />
                      </button>

                      {dec.actionType === 'supplier_followup' && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            const relItem = reviewItems.find(i => i.supplierName?.includes('TechPro') || i.issueCategory?.includes('2B'));
                            if (relItem && onOpenVendorFollowup) {
                              onOpenVendorFollowup(relItem);
                            } else if (onShowToast) {
                              onShowToast("Opening automated supplier dispatch batch modal...");
                            }
                          }}
                        >
                          <Send size={13} />
                          <span>Contact Suppliers</span>
                        </button>
                      )}

                      <button 
                        className="btn btn-secondary text-muted"
                        onClick={() => onShowToast(`Anomaly for ${dec.client} acknowledged.`)}
                        style={{ marginLeft: 'auto' }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: 1-Click Batch Approvals */}
          <div className="today-section-card">
            <div className="today-section-heading">
              <div className="flex items-center gap-2">
                <span className="status-dot green" />
                <h2>Verified Approvals Ready for Tally Posting</h2>
              </div>
              <span className="badge badge-success font-mono">
                {approvedBatch ? '0 Pending' : `${briefing.readyApprovals.count} Ready`}
              </span>
            </div>

            {approvedBatch ? (
              <div className="today-cleared-banner">
                <CheckCircle2 size={24} className="text-green" />
                <div>
                  <strong>All 4 verified vouchers posted to Tally Prime.</strong>
                  <p className="text-xs text-muted">DuckDB sync recorded in immutable audit trail.</p>
                </div>
              </div>
            ) : (
              <div className="today-approval-box">
                <div className="today-approval-info">
                  <div className="today-approval-amount font-mono">
                    ₹{(briefing.readyApprovals.totalAmount / 100000).toFixed(2)} Lakhs
                  </div>
                  <div className="today-approval-detail">
                    <strong>{briefing.readyApprovals.label}</strong>
                    <p className="text-xs text-muted mt-0.5">{briefing.readyApprovals.detail}</p>
                  </div>
                </div>

                <div className="today-approval-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => onNavigateTab('queue')}
                  >
                    Inspect in Queue
                  </button>
                  <button 
                    className="btn btn-primary"
                    style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: '#FFFFFF' }}
                    onClick={handleBatchApprove}
                  >
                    <Check size={14} />
                    <span>{briefing.readyApprovals.actionLabel}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 35%: Deadlines + "Yukti Already Handled" Overnight Log */}
        <div className="today-sidebar-col">
          {/* Statutory Deadlines Widget */}
          <div className="panel today-widget-card">
            <div className="today-widget-header">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-brand" />
                <h3>Upcoming Filing Deadlines</h3>
              </div>
              <button 
                className="btn-ghost-link"
                onClick={() => onNavigateTab('calendar')}
              >
                Calendar →
              </button>
            </div>

            <div className="today-deadlines-list">
              {briefing.deadlines.map((dl, i) => (
                <div key={i} className="today-deadline-row">
                  <div>
                    <strong className="today-dl-client">{dl.client}</strong>
                    <span className="today-dl-type">{dl.type}</span>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${dl.status.includes('Overdue') ? 'badge-danger' : 'badge-warning'} font-mono text-xs`}>
                      {dl.due}
                    </span>
                    <span className="today-dl-status block mt-0.5">{dl.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* "Yukti Already Handled" Overnight Card */}
          <div className="panel today-widget-card today-autonomous-card">
            <div className="today-widget-header">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-green" />
                <h3>Yukti Handled Overnight</h3>
              </div>
              <span className="badge badge-brand font-mono" style={{ fontSize: '10px' }}>
                AUTONOMOUS
              </span>
            </div>

            <p className="text-xs text-muted mb-3" style={{ marginBottom: '12px' }}>
              While your team was offline, Yukti ran scheduled OCR extraction, 3-way reconciliation, and rule learning:
            </p>

            <div className="today-handled-list">
              {briefing.handledOvernight.map((item, idx) => (
                <div key={idx} className="today-handled-item">
                  <div className="today-handled-check">
                    <CheckCircle2 size={14} className="text-green" />
                  </div>
                  <div>
                    <strong className="text-xs text-primary">{item.metric}</strong>
                    <span className="text-xs text-secondary block">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="today-autonomous-footer">
              <span className="text-xs text-muted font-mono">Autonomy Policy: STRICT (v2026.07)</span>
              <button 
                className="btn-ghost-link text-xs"
                onClick={() => onNavigateTab('policy')}
              >
                Inspect Policies →
              </button>
            </div>
          </div>

          {/* Quick Jump to Clients */}
          <div className="panel today-widget-card">
            <div className="today-widget-header">
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-brand" />
                <h3>Client Health Highlights</h3>
              </div>
              <button 
                className="btn-ghost-link"
                onClick={() => onNavigateTab('clients')}
              >
                All 8 Clients →
              </button>
            </div>

            <div className="today-client-pills-list">
              {clients.slice(0, 4).map((c) => (
                <div 
                  key={c.id} 
                  className="today-client-pill-row"
                  onClick={() => onSelectClient(c)}
                >
                  <div>
                    <span className="font-semibold text-xs text-primary block">{c.name}</span>
                    <span className="text-xs text-muted font-mono">ITC at risk: ₹{(c.itcAtRisk || 0).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`badge ${c.healthScore >= 85 ? 'badge-success' : c.healthScore >= 70 ? 'badge-warning' : 'badge-danger'} font-mono`}>
                      {c.healthScore || 85}/100
                    </span>
                    <ChevronRight size={13} className="text-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
