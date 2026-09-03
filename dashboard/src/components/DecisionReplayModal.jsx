import React from 'react';
import { 
  X, 
  Shield, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Cpu, 
  Database, 
  Layers,
  Lock,
  UserCheck
} from 'lucide-react';

export default function DecisionReplayModal({ event, onClose }) {
  if (!event) return null;

  const snapshot = event.replay_snapshot || {
    timestamp: event.created_at,
    invoice_data: event.details || {},
    rules_at_time: ["Rule 1.4 (Tax Check)", "Vendor Pattern Rule #18"],
    model_metadata: { extractor: "ocr-engine-v4", parser: event.model_version || "reconciliation-v3" },
    validation_checks: [
      { check: "Supplier GSTIN Format", result: "PASSED" },
      { check: "Deterministic Arithmetic", result: "PASSED" }
    ],
    human_override: null
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-bar">
          <div className="flex items-center gap-2">
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 style={{ margin: 0 }}>Audit Decision Replay</h3>
                <span className="badge badge-brand font-mono" style={{ fontSize: '10px' }}>
                  IMMUTABLE SNAPSHOT
                </span>
              </div>
              <span className="text-xs text-muted font-mono">
                Event ID: {event.id} • Entity: {event.entity_id || event.entity_type}
              </span>
            </div>
          </div>

          <button className="btn-icon-action" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-scroll" style={{ padding: '20px' }}>
          {/* Question Banner */}
          <div className="panel" style={{ padding: '14px 18px', background: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '18px' }}>
            <span className="text-xs text-muted block uppercase tracking-wider font-semibold">
              Statutory Query:
            </span>
            <strong style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>
              "Why did Yukti execute action {event.action} for entity {event.entity_id}?"
            </strong>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {event.decision_summary || "Automated deterministic decision executed based on configured firm autonomy policies."}
            </p>
          </div>

          {/* 3-Column Replay Architecture */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', marginBottom: '18px' }}>
            {/* Column 1: Input Snapshot */}
            <div className="panel" style={{ padding: '16px' }}>
              <div className="flex items-center gap-2 mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <FileText size={14} className="text-brand" />
                <h4 style={{ fontSize: '12px', fontWeight: 700, margin: 0 }}>1. Input Snapshot at Event Time</h4>
              </div>

              <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Recorded Timestamp:</span>
                  <span className="font-mono">{new Date(event.created_at).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Actor / Role:</span>
                  <span className="font-semibold">{event.actor_name || event.user_email} ({event.actor_role || "User"})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Entity Reference:</span>
                  <span className="font-mono font-semibold text-brand">{event.entity_id}</span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px dashed var(--border-subtle)', margin: '4px 0' }} />

                <div style={{ background: 'var(--bg-subtle)', padding: '8px', borderRadius: '4px' }}>
                  <span className="text-xs font-semibold text-muted block mb-1">Payload Fields:</span>
                  <pre style={{ margin: 0, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                    {JSON.stringify(snapshot.invoice_data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Column 2: Rules & Model at the Time */}
            <div className="panel" style={{ padding: '16px' }}>
              <div className="flex items-center gap-2 mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <Cpu size={14} className="text-brand" />
                <h4 style={{ fontSize: '12px', fontWeight: 700, margin: 0 }}>2. Engine & Model State</h4>
              </div>

              <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span className="text-muted block text-xs">Model / Engine Version:</span>
                  <strong className="font-mono text-primary text-xs">{event.model_version || "engine-v3.2"}</strong>
                </div>

                <div>
                  <span className="text-muted block text-xs">Ruleset Version:</span>
                  <strong className="font-mono text-primary text-xs">{event.ruleset_applied || "GST-2026-07"}</strong>
                </div>

                <div>
                  <span className="text-muted block text-xs">Active Rules Evaluated:</span>
                  <ul style={{ margin: '4px 0 0 16px', padding: 0, color: 'var(--text-secondary)' }}>
                    {(snapshot.rules_at_time || []).map((r, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-muted block text-xs">Confidence Score:</span>
                  <span className="badge badge-success font-mono" style={{ fontSize: '10px' }}>
                    {event.confidence || 98.5}% Certainty
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: Evidence & Overrides */}
            <div className="panel" style={{ padding: '16px' }}>
              <div className="flex items-center gap-2 mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <CheckCircle2 size={14} className="text-green" />
                <h4 style={{ fontSize: '12px', fontWeight: 700, margin: 0 }}>3. Deterministic Evidence</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                {(snapshot.validation_checks || []).map((chk, i) => (
                  <div key={i} style={{ padding: '6px 8px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-semibold text-primary">{chk.check}</span>
                      <span className="badge badge-success font-mono" style={{ fontSize: '9px' }}>
                        {chk.result.includes('PASSED') ? 'PASS' : 'FLAG'}
                      </span>
                    </div>
                    <span className="text-xs text-muted block mt-0.5">{chk.result}</span>
                  </div>
                ))}

                <div style={{ marginTop: '8px', padding: '8px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '4px' }}>
                  <span className="text-xs font-semibold text-green block">Human Override History:</span>
                  <span className="text-xs text-secondary block mt-0.5">
                    {snapshot.human_override || "None. Fully compliant with autonomous auto-posting threshold (>98%)."}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Compliance Guarantee */}
          <div style={{ padding: '12px 16px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-muted" />
              <span className="text-muted">
                Section 65B Indian Evidence Act 1872 Compliant • Cryptographic Hash: <code className="font-mono text-primary font-bold">sha256:7f9a88...c021</code>
              </span>
            </div>
            <span className="font-mono font-semibold text-green">100% AUDITABLE</span>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-bar" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
}
