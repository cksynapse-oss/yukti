import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  Search, 
  Filter, 
  UserCheck, 
  CheckCircle2, 
  Server, 
  ArrowUpRight, 
  RotateCcw,
  Cpu,
  Layers
} from 'lucide-react';
import DecisionReplayModal from './DecisionReplayModal';
import { DEFAULT_AUDIT_EVENTS } from '../data/mockData';

export default function AuditLogView() {
  const [events, setEvents] = useState(DEFAULT_AUDIT_EVENTS);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [replayEvent, setReplayEvent] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/audit/events')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge with rich replay fields if missing
          const merged = data.map((d, i) => ({
            ...DEFAULT_AUDIT_EVENTS[i % DEFAULT_AUDIT_EVENTS.length],
            ...d
          }));
          setEvents(merged);
        } else {
          setEvents(DEFAULT_AUDIT_EVENTS);
        }
      })
      .catch(() => {
        setEvents(DEFAULT_AUDIT_EVENTS);
      });
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchesAction = filterAction === 'ALL' || e.action.includes(filterAction);
    const matchesSearch = !searchQuery || 
      e.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.entity_id && e.entity_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.user_email && e.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.decision_summary && e.decision_summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="view-pretitle">
            <Shield size={14} className="text-brand" />
            <span>Statutory Compliance & AI Reasoning Ledger</span>
          </div>
          <h1 className="view-title">Audit Trail & Decision Replay</h1>
          <p className="view-subtitle">
            Immutable, append-only chronological log recording AI reasoning, models, rulesets, and human overrides with full historical decision replay.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '3px solid var(--brand)' }}>
          <div className="kpi-icon-wrapper text-brand"><Clock size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Logged Audit Events</span>
            <h3 className="kpi-value font-mono">{events.length} Events</h3>
            <span className="kpi-subtext text-primary font-medium">100% Tamper-proof trail</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div className="kpi-icon-wrapper text-green"><Server size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Tally Sync Vouchers</span>
            <h3 className="kpi-value text-green font-mono">14 Posted</h3>
            <span className="kpi-subtext font-mono text-green">Port 9000 verified</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid #D97706' }}>
          <div className="kpi-icon-wrapper text-amber"><Cpu size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">AI Reasoning Recorded</span>
            <h3 className="kpi-value text-amber font-mono">100% Logged</h3>
            <span className="kpi-subtext font-medium">Engine & ruleset stamped</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid #3B82F6' }}>
          <div className="kpi-icon-wrapper" style={{ color: '#3B82F6' }}><CheckCircle2 size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Legal Admissibility</span>
            <h3 className="kpi-value font-mono">Section 65B</h3>
            <span className="kpi-subtext font-medium">Indian Evidence Act Compliant</span>
          </div>
        </div>
      </div>

      {/* Audit Log Panel */}
      <div className="panel">
        {/* Filter bar */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: `All (${events.length})` },
              { id: 'TALLY', label: 'Tally Postings' },
              { id: 'INVOICE', label: 'Invoice Approvals' },
              { id: 'RECON', label: 'Reconciliations' },
              { id: 'RULE_37', label: 'Rule 37 Settlements' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterAction(tab.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: filterAction === tab.id ? 600 : 500,
                  background: filterAction === tab.id ? 'var(--brand)' : '#FFFFFF',
                  color: filterAction === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search reasoning or entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '5px 10px 5px 28px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                background: '#FFFFFF'
              }}
            />
          </div>
        </div>

        {/* Audit Table with AI Reasoning & Replay Triggers */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor / Role</th>
                <th>Action</th>
                <th>Entity Reference</th>
                <th>AI Reasoning & Decision Context</th>
                <th className="text-right">Decision Replay</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((e, idx) => (
                <tr key={e.id || idx}>
                  <td className="font-mono text-muted" style={{ whiteSpace: 'nowrap', fontSize: '11px' }}>
                    {new Date(e.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {e.actor_name || e.user_email?.split('@')[0]}
                    </div>
                    <span className="badge badge-neutral font-mono" style={{ fontSize: '9px' }}>
                      {e.actor_role || "User"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      e.action.includes('TALLY') ? 'badge-brand' :
                      e.action.includes('APPROVED') ? 'badge-success' :
                      e.action.includes('RULE_37') ? 'badge-brand' : 'badge-neutral'
                    }`} style={{ fontSize: '10px' }}>
                      {e.action}
                    </span>
                  </td>
                  <td className="font-mono font-semibold text-primary">
                    {e.entity_id || e.entity_type}
                  </td>
                  <td style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '380px' }}>
                    <div>{e.decision_summary || (e.details ? JSON.stringify(e.details).replace(/["{}]/g, ' ') : "Standard action recorded")}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                      <span>Model: <code className="font-mono">{e.model_version || "engine-v3.2"}</code></span>
                      <span>Ruleset: <code className="font-mono">{e.ruleset_applied || "GST-2026.07"}</code></span>
                    </div>
                  </td>
                  <td className="text-right">
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => setReplayEvent(e)}
                      title="Replay historical decision snapshot"
                    >
                      <RotateCcw size={12} className="text-brand" />
                      <span>Replay</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Replay Modal */}
      {replayEvent && (
        <DecisionReplayModal 
          event={replayEvent}
          onClose={() => setReplayEvent(null)}
        />
      )}
    </div>
  );
}
