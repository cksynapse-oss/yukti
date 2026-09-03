import React, { useState } from 'react';
import { 
  Shield, 
  Sliders, 
  Check, 
  AlertTriangle, 
  Lock, 
  UserCheck, 
  FileCheck, 
  Zap, 
  Save, 
  Info, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { AUTONOMY_POLICIES } from '../data/mockData';

export default function AutonomyPolicyView({ onShowToast }) {
  const [policies, setPolicies] = useState(AUTONOMY_POLICIES);
  const [nearMatchTolerance, setNearMatchTolerance] = useState(100);
  const [isSaved, setIsSaved] = useState(false);

  const handleRuleToggle = (ruleId, newMode) => {
    setPolicies(prev => ({
      ...prev,
      actionRules: prev.actionRules.map(r => r.id === ruleId ? { ...r, mode: newMode } : r)
    }));
  };

  const handleSavePolicy = () => {
    setIsSaved(true);
    if (onShowToast) {
      onShowToast("Firm Autonomy Policy v2026.07 updated & cryptographically signed.");
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="view-pretitle">
            <Shield size={14} className="text-brand" />
            <span>Firm Automation Governance</span>
          </div>
          <h1 className="view-title">Autonomy & Execution Policy</h1>
          <p className="view-subtitle">
            Define explicit machine boundaries for your CA practice: <strong>"What is Yukti allowed to execute without partner sign-off?"</strong>
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleSavePolicy}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {isSaved ? <Check size={14} /> : <Save size={14} />}
          <span>{isSaved ? "Policy Active" : "Save & Enforce Policy"}</span>
        </button>
      </div>

      {/* Policy Governance Status Banner */}
      <div className="panel" style={{ padding: '16px 20px', background: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '13px', color: '#064E3B' }}>Active Firm Policy: {policies.policyVersion}</strong>
                <span className="badge badge-success font-mono" style={{ fontSize: '10px' }}>ENFORCED</span>
              </div>
              <span style={{ fontSize: '11px', color: '#065F46' }}>
                Principal CA Sign-off: {policies.updatedBy} • Last Audit Stamp: {policies.lastUpdated}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#065F46', textAlign: 'right' }}>
            <span className="font-mono">Zero Unauthorized Filings</span> Guaranteed
          </div>
        </div>
      </div>

      {/* Grid: Action Boundary Rules & Confidence Tiers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Left Column: Action Permissions */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Action Autonomy Boundaries</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Specify operational authority per workflow module
              </p>
            </div>
            <Sliders size={15} className="text-muted" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {policies.actionRules.map(rule => (
              <div 
                key={rule.id}
                style={{ 
                  padding: '12px 14px', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge badge-neutral font-mono" style={{ fontSize: '9px' }}>
                        {rule.category}
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{rule.title}</strong>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                      {rule.description}
                    </p>
                  </div>

                  {/* Mode Selector */}
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {['AUTOMATIC', 'RECOMMEND', 'APPROVAL_REQUIRED'].map(m => {
                      const isSelected = rule.mode === m || (rule.mode === 'AUTO_TOLERANCE' && m === 'AUTOMATIC');
                      const label = m === 'AUTOMATIC' ? 'Auto' : m === 'RECOMMEND' ? 'Recommend' : 'Require Sign-off';
                      const badgeClass = m === 'AUTOMATIC' ? 'badge-success' : m === 'RECOMMEND' ? 'badge-warning' : 'badge-danger';
                      return (
                        <button
                          key={m}
                          onClick={() => handleRuleToggle(rule.id, m)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            border: isSelected ? '1px solid currentColor' : '1px solid var(--border-color)',
                            background: isSelected ? (m === 'AUTOMATIC' ? '#ECFDF5' : m === 'RECOMMEND' ? '#FFFBEB' : '#FEF2F2') : '#FFFFFF',
                            color: isSelected ? (m === 'AUTOMATIC' ? '#065F46' : m === 'RECOMMEND' ? '#92400E' : '#991B1B') : 'var(--text-muted)'
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-settings if Near-Match */}
                {rule.id === 'rule_near_match' && (
                  <div style={{ marginTop: '10px', padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Auto-approval tolerance threshold:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="font-mono text-xs font-semibold text-brand">₹{nearMatchTolerance}</span>
                      <input 
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={nearMatchTolerance}
                        onChange={e => setNearMatchTolerance(Number(e.target.value))}
                        style={{ width: '100px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed var(--border-subtle)', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span>Engine: <strong>{rule.executionEngine}</strong></span>
                  <span>Permission: <strong>{rule.permissionRequired}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Calibrated Confidence Tiers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0' }}>
              Calibrated Confidence Thresholds
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
              How Yukti categorizes operational certainty before taking action
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {policies.confidenceThresholds.map((tier, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    padding: '12px', 
                    borderRadius: '6px', 
                    border: '1px solid var(--border-color)',
                    background: tier.color === 'green' ? '#F0FDF4' : tier.color === 'blue' ? '#EFF6FF' : tier.color === 'amber' ? '#FFFBEB' : '#FEF2F2'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                      {tier.range}
                    </span>
                    <span className={`badge badge-${tier.color === 'green' ? 'success' : tier.color === 'blue' ? 'brand' : tier.color === 'amber' ? 'warning' : 'danger'} font-mono`} style={{ fontSize: '10px' }}>
                      {tier.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 6px 0', lineHeight: 1.4 }}>
                    {tier.action}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <span>Processed this month:</span>
                    <strong className="font-mono text-primary">{tier.countThisMonth} records</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notice: Safe Guardrail */}
          <div className="panel" style={{ padding: '16px', background: '#F9FAFB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Lock size={14} className="text-brand" />
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>Statutory Guardrail Guarantee</strong>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Yukti deterministically blocks all outward GSTN portal transmissions (returns, notice replies, LUTs) unless signed by an authorized CA Partner digital token.
            </p>
          </div>
        </div>
      </div>

      {/* Practice Workspace Roles & Granular Permissions */}
      <div className="panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0' }}>
          Workspace Roles & Machine Permissions
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
          Explicit capabilities granted to team members and the autonomous AI agent
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th>Workspace Role</th>
                <th>Description</th>
                <th>Approve Invoices</th>
                <th>Post to Tally</th>
                <th>File Returns</th>
                <th>Modify Autonomy Policy</th>
                <th>Override Rules</th>
              </tr>
            </thead>
            <tbody>
              {policies.workspaceRoles.map((r, i) => (
                <tr key={i}>
                  <td>
                    <strong style={{ color: r.role === 'Automation Agent' ? 'var(--brand)' : 'var(--text-primary)' }}>
                      {r.role}
                    </strong>
                  </td>
                  <td className="text-xs text-muted">{r.description}</td>
                  <td>
                    {r.canApproveInvoices ? (
                      <span className="badge badge-success font-mono" style={{ fontSize: '10px' }}>ALLOW</span>
                    ) : (
                      <span className="badge badge-neutral font-mono" style={{ fontSize: '10px' }}>DENY</span>
                    )}
                  </td>
                  <td>
                    {r.canPostToTally ? (
                      <span className="badge badge-success font-mono" style={{ fontSize: '10px' }}>ALLOW</span>
                    ) : (
                      <span className="badge badge-neutral font-mono" style={{ fontSize: '10px' }}>DENY</span>
                    )}
                  </td>
                  <td>
                    {r.canFileReturns ? (
                      <span className="badge badge-success font-mono" style={{ fontSize: '10px' }}>ALLOW</span>
                    ) : (
                      <span className="badge badge-danger font-mono" style={{ fontSize: '10px' }}>RESTRICTED</span>
                    )}
                  </td>
                  <td>
                    {r.canConfigurePolicy ? (
                      <span className="badge badge-brand font-mono" style={{ fontSize: '10px' }}>ADMIN</span>
                    ) : (
                      <span className="badge badge-neutral font-mono" style={{ fontSize: '10px' }}>READ ONLY</span>
                    )}
                  </td>
                  <td>
                    {r.canOverrideRules ? (
                      <span className="badge badge-success font-mono" style={{ fontSize: '10px' }}>ALLOW</span>
                    ) : (
                      <span className="badge badge-neutral font-mono" style={{ fontSize: '10px' }}>DENY</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
