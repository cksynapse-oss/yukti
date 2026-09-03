import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Send, 
  Building2, 
  Check, 
  ShieldCheck, 
  Info, 
  FileText,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function YuktiIntelligenceDrawer({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectClient,
  clients = [],
  onOpenVendorFollowup,
  onInspectItem,
  reviewItems = [],
  onShowToast
}) {
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'CRITICAL', 'ANOMALIES', 'RESOLVED'
  const [dismissedIds, setDismissedIds] = useState(new Set());

  if (!isOpen) return null;

  const handleDismiss = (id) => {
    setDismissedIds(prev => new Set(prev).add(id));
    if (onShowToast) onShowToast("Intelligence item dismissed.");
  };

  const intelligenceItems = [
    {
      id: "intel_1",
      category: "CRITICAL",
      severity: "critical",
      color: "red",
      icon: AlertTriangle,
      title: "₹38,850 ITC at risk",
      client: "Reliance Logistics Pvt Ltd",
      clientId: "c1",
      detail: "50 supplier invoices have not appeared in auto-populated GSTR-2B.",
      whyMatters: "₹38,850 of input tax credit will be permanently blocked under Section 16(2)(aa) if unfiled prior to 20 Aug.",
      recommendation: "Dispatch Section 16(2)(aa) statutory reminder to 50 delinquent suppliers.",
      evidence: [
        "50 supplier invoices unfiled on portal",
        "Total credit exposure: ₹38,850",
        "Rule 37 interest exposure: ₹6,993",
        "Last GSTN portal sync: 08:42 AM IST"
      ],
      actionLabel: "Review Invoices",
      actionSecondary: "Contact Suppliers"
    },
    {
      id: "intel_2",
      category: "ANOMALIES",
      severity: "high",
      color: "amber",
      icon: AlertTriangle,
      title: "Vendor tax-rate shift (18% vs 12%)",
      client: "Metro Tech Solutions LLP",
      clientId: "c3",
      detail: "Tata Consultancy Services Ltd • Inv #TCS/2026/891",
      whyMatters: "Books show 18% GST (₹43,200), whereas portal GSTR-2B reflects 12% GST under HSN 4819. Discrepancy of ₹8,400.",
      recommendation: "Inspect GST classification against learned vendor pattern #18.",
      evidence: [
        "Books: ₹2,83,200 (18% GST)",
        "GSTR-2B: ₹2,91,600 (Tax delta ₹8,400)",
        "Learned Rule #18: Confidence 93%"
      ],
      actionLabel: "Inspect Pattern",
      actionSecondary: null
    },
    {
      id: "intel_3",
      category: "ANOMALIES",
      severity: "high",
      color: "amber",
      icon: Sparkles,
      title: "Unusual vendor amount spike (4.3× normal)",
      client: "Bharat Agro Foods Ltd",
      clientId: "c8",
      detail: "Reliance Industries • Current bill: ₹1.42L vs historical ₹18k–₹42k.",
      whyMatters: "Current invoice exceeds normal range by 4.3×. Potential digit typo or unapproved bulk order.",
      recommendation: "Verify invoice copy with client accounts lead before posting.",
      evidence: [
        "Historical range: ₹18,000 – ₹42,000",
        "Current bill: ₹1,42,000",
        "14 historical vouchers verified"
      ],
      actionLabel: "Verify Anomaly",
      actionSecondary: null
    },
    {
      id: "intel_4",
      category: "CRITICAL",
      severity: "critical",
      color: "red",
      icon: Clock,
      title: "Rule 37 180-day interest clock (163 days elapsed)",
      client: "Apex General Traders",
      clientId: "c2",
      detail: "Apex Fasteners & Hardware • Inv #AFH/26/0048 dated 14 Feb 2026",
      whyMatters: "Payment unpaid for 163 days. Mandatory reversal of ₹19,800 ITC with 18% interest if unpaid by 13 Aug.",
      recommendation: "Advise client to release payment advice within 7 days.",
      evidence: [
        "163 days elapsed since invoice date",
        "Unpaid balance: ₹1,29,800",
        "Reversal penalty at 18% p.a."
      ],
      actionLabel: "View Bill",
      actionSecondary: null
    },
    {
      id: "intel_5",
      category: "RESOLVED",
      severity: "resolved",
      color: "green",
      icon: CheckCircle2,
      title: "17 reconciliations auto-resolved",
      client: "Practice-Wide Overnight",
      clientId: null,
      detail: "14 exact matches & 3 fractional rounding differences (<₹50) settled.",
      whyMatters: "Zero human intervention required under Practice Autonomy Policy v2026.07.",
      recommendation: "No action required. Immutable ledger record generated.",
      evidence: [
        "14 exact hash matches",
        "3 rounding tolerances (< ₹50)",
        "Audit batch #AUT-202607-091"
      ],
      actionLabel: "Inspect Audit Trail",
      actionSecondary: null
    },
    {
      id: "intel_6",
      category: "CRITICAL",
      severity: "high",
      color: "blue",
      icon: Clock,
      title: "2 Statutory filings due within 48 hours",
      client: "Apex General & Sunrise Heavy",
      clientId: "c2",
      detail: "Monthly GSTR-1 returns are overdue since 11th August.",
      whyMatters: "Late fee of ₹50/day and interest applies under Section 47.",
      recommendation: "Export GSTR-1 JSON payloads and upload to GSTN portal.",
      evidence: [
        "Apex General Traders (Overdue 2 days)",
        "Sunrise Heavy Engineering (Overdue 2 days)"
      ],
      actionLabel: "Open Returns",
      actionSecondary: null
    }
  ].filter(i => !dismissedIds.has(i.id));

  const filteredItems = intelligenceItems.filter(item => {
    if (filter === 'ALL') return true;
    return item.category === filter;
  });

  return (
    <div className="intelligence-drawer-overlay" onClick={onClose}>
      <div className="intelligence-drawer-panel" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="intelligence-drawer-header">
          <div className="flex items-center gap-2">
            <div className="intelligence-icon-badge">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="intelligence-drawer-title">Yukti Intelligence</h3>
              <span className="text-xs text-muted font-mono">
                {intelligenceItems.length} active findings across practice
              </span>
            </div>
          </div>

          <button className="btn-icon-action" onClick={onClose} title="Close Intelligence Drawer (Esc)">
            <X size={16} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="intelligence-filter-bar">
          {[
            { id: 'ALL', label: `All (${intelligenceItems.length})` },
            { id: 'CRITICAL', label: 'Critical Risks' },
            { id: 'ANOMALIES', label: 'Vendor Anomalies' },
            { id: 'RESOLVED', label: 'Auto-Resolved' }
          ].map(f => (
            <button
              key={f.id}
              className={`intelligence-filter-btn ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Intelligence Stream List */}
        <div className="intelligence-stream-scroll">
          {filteredItems.length === 0 ? (
            <div className="panel" style={{ padding: '30px', textAlign: 'center', margin: '16px' }}>
              <CheckCircle2 size={28} className="text-green mx-auto mb-2" />
              <strong className="text-sm text-primary block">No items in this category</strong>
              <p className="text-xs text-muted mt-1">Yukti is continuously monitoring portal syncs and bank feeds.</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.id} className={`intel-card intel-card-${item.severity}`}>
                  <div className="intel-card-top">
                    <div className="flex items-start gap-2">
                      <div className={`intel-status-icon ${item.color}`}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="intel-client-name">{item.client}</span>
                          <span className={`badge badge-${item.color === 'red' ? 'danger' : item.color === 'green' ? 'success' : 'warning'} font-mono`} style={{ fontSize: '9px' }}>
                            {item.category}
                          </span>
                        </div>
                        <h4 className="intel-card-title">{item.title}</h4>
                      </div>
                    </div>
                  </div>

                  <p className="intel-card-detail">{item.detail}</p>

                  <div className="intel-box-why">
                    <span className="intel-label">Why this matters:</span>
                    <p>{item.whyMatters}</p>
                  </div>

                  <div className="intel-box-rec">
                    <span className="intel-label">Yukti recommends:</span>
                    <p>{item.recommendation}</p>
                  </div>

                  {item.evidence && item.evidence.length > 0 && (
                    <div className="intel-evidence-box">
                      <span className="intel-label">Evidence:</span>
                      <ul className="intel-evidence-list">
                        {item.evidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="intel-actions-row">
                    <button
                      className="btn btn-primary intel-btn"
                      onClick={() => {
                        onClose();
                        if (item.category === 'RESOLVED') {
                          onNavigateTab('audit');
                        } else if (item.title.includes('filings')) {
                          onNavigateTab('returns');
                        } else if (item.clientId) {
                          const c = clients.find(cl => cl.id === item.clientId);
                          if (c) onSelectClient(c);
                          else onNavigateTab('queue');
                        } else {
                          onNavigateTab('queue');
                        }
                      }}
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight size={12} />
                    </button>

                    {item.actionSecondary && (
                      <button
                        className="btn btn-secondary intel-btn"
                        onClick={() => {
                          onClose();
                          const relItem = reviewItems.find(i => i.supplierName?.includes('TechPro') || i.issueCategory?.includes('2B'));
                          if (relItem && onOpenVendorFollowup) {
                            onOpenVendorFollowup(relItem);
                          } else if (onShowToast) {
                            onShowToast("Opening automated supplier dispatch batch modal...");
                          }
                        }}
                      >
                        <Send size={12} />
                        <span>{item.actionSecondary}</span>
                      </button>
                    )}

                    <button
                      className="btn-ghost-link text-xs text-muted"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => handleDismiss(item.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="intelligence-drawer-footer">
          <span className="text-xs text-muted">
            Yukti Autonomous Reasoning Layer • Deterministic Rules Verified
          </span>
        </div>
      </div>
    </div>
  );
}
