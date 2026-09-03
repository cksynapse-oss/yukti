import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  CheckCircle2, 
  FileText,
  Users,
  Sparkles,
  PieChart,
  Target
} from 'lucide-react';
import { GLOBAL_STATS } from '../data/mockData';

export default function AnalyticsView({ firmInfo, onNavigateTab }) {
  const metrics = {
    totalClients: 8,
    totalInvoices: 1248,
    autoPostRate: 84.2,
    hoursSavedThisMonth: 126,
    hoursSavedToday: "3h 42m",
    itcProtected: "₹12.45L",
    reconciledCount: 1198,
    exactMatchCount: 1042,
    smartMatchCount: 98,
    roundingCount: 48,
    exceptionsCleared: 60
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="view-pretitle">
            <BarChart3 size={14} className="text-brand" />
            <span>Operational Capacity & Work Removed</span>
          </div>
          <h1 className="view-title">Practice Capacity</h1>
          <p className="view-subtitle">
            Measurable elimination of repetitive CA grunt work for {firmInfo?.name || "Rajnish & Associates"}.
          </p>
        </div>
      </div>

      {/* Primary Operational Capacity Banner (Item 11 & 39) */}
      <div className="panel" style={{ background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)', color: '#FFFFFF', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge font-mono" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', fontSize: '11px', marginBottom: '8px', display: 'inline-flex' }}>
              <Clock size={12} /> JULY 2026 PRACTICE SAVINGS
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0 6px 0', color: '#FFFFFF' }}>
              You saved 126 hours this month.
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '600px', margin: 0 }}>
              Yukti handled <strong>1,051 invoices</strong>, resolved <strong>842 reconciliations</strong>, and intercepted <strong>127 anomaly checks</strong> without human typing—safeguarding <strong>{metrics.itcProtected}</strong> in eligible tax credits.
            </p>
          </div>

          <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', paddingLeft: '24px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, display: 'block' }}>
              Yukti Saved Today
            </span>
            <strong style={{ fontSize: '28px', color: '#A7F3D0', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginTop: '2px' }}>
              {metrics.hoursSavedToday}
            </strong>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>~47 senior manual checks avoided</span>
          </div>
        </div>
      </div>

      {/* 4 Quantified "Work Removed" KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '3px solid var(--brand)' }}>
          <div className="kpi-icon-wrapper text-brand"><Clock size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Partner Time Saved</span>
            <h3 className="kpi-value font-mono">126 Hours</h3>
            <span className="kpi-subtext text-primary font-medium">~15.7 full working days</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div className="kpi-icon-wrapper text-green"><Zap size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Zero-Touch Vouchers</span>
            <h3 className="kpi-value text-green font-mono">1,051 Bills</h3>
            <span className="kpi-subtext font-mono text-green">84.2% posted to Tally</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid #D97706' }}>
          <div className="kpi-icon-wrapper text-amber"><ShieldCheck size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Tax Credit Shield</span>
            <h3 className="kpi-value text-amber font-mono">₹12.45L</h3>
            <span className="kpi-subtext font-medium">Zero Section 16(2) lapses</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid #3B82F6' }}>
          <div className="kpi-icon-wrapper" style={{ color: '#3B82F6' }}><TrendingUp size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Manual Reviews Avoided</span>
            <h3 className="kpi-value font-mono">126 Reviews</h3>
            <span className="kpi-subtext font-medium">Auto-resolved exceptions</span>
          </div>
        </div>
      </div>

      {/* Operational Breakdown: What Yukti Handled vs Where Team Still Spends Time */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Left: What Yukti Handled */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckCircle2 size={16} className="text-green" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
              What Yukti Handled Autonomously This Month
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: "1,051 Purchase Invoices", desc: "OCR extracted, tax split validated, auto-posted to Tally Prime without human typing.", saved: "52.5 hrs saved" },
              { label: "842 3-Way Portal Reconciliations", desc: "Matched books against GSTR-2B; rounding variances under ₹100 settled automatically.", saved: "38.0 hrs saved" },
              { label: "127 Anomaly & Rule 37 Checks", desc: "Monitored 180-day vendor payment clocks, duplicate invoices, and rate discrepancies.", saved: "18.5 hrs saved" },
              { label: "39 Statutory Return Schedules", desc: "Prepared Table 4 eligible ITC, reverse charge allocations, and B2B return JSONs.", saved: "17.0 hrs saved" }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>{item.label}</strong>
                  <span className="text-xs text-secondary" style={{ display: 'block', marginTop: '2px' }}>{item.desc}</span>
                </div>
                <span className="badge badge-success font-mono" style={{ fontSize: '11px', flexShrink: 0, marginLeft: '12px' }}>
                  {item.saved}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Where Team Still Spends Time */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <PieChart size={16} className="text-brand" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
              Where Your Team Still Spends Time
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { activity: "Client Follow-ups for Missing Bills", pct: 34, hours: "31.2 hrs", tone: "#DC2626" },
              { activity: "Edge Exception Review (Queue)", pct: 27, hours: "24.8 hrs", tone: "#D97706" },
              { activity: "In-Person Advisory & Tax Planning", pct: 21, hours: "19.3 hrs", tone: "#10B981" },
              { activity: "GSTN Portal Latency / Captchas", pct: 18, hours: "16.5 hrs", tone: "#6B7280" }
            ].map((act, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span className="font-semibold text-primary">{act.activity}</span>
                  <span className="font-mono text-muted">{act.pct}% ({act.hours})</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${act.pct}%`, height: '100%', background: act.tone, borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Biggest Automation Opportunity */}
          <div style={{ marginTop: '20px', padding: '12px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px' }}>
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-green" />
              <strong style={{ fontSize: '12px', color: '#064E3B' }}>Biggest Automation Opportunity:</strong>
            </div>
            <p style={{ fontSize: '11px', color: '#065F46', margin: '2px 0 6px 0', lineHeight: 1.4 }}>
              <strong>Automated Supplier Follow-up Dispatch</strong>: Automatically sending WhatsApp/email notices for 2B missing bills can save an estimated <strong>21 hours/month</strong>.
            </p>
            <button 
              className="btn btn-secondary"
              onClick={() => onNavigateTab ? onNavigateTab('policy') : null}
              style={{ fontSize: '11px', padding: '4px 10px', background: '#FFFFFF', borderColor: '#86EFAC', color: '#065F46' }}
            >
              Configure Follow-up Policy →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
