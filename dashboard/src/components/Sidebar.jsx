import React from 'react';
import { 
  Users, 
  FileText, 
  RefreshCw, 
  FileCheck,
  ShieldAlert, 
  Sparkles, 
  Building2,
  Calendar, 
  BarChart3, 
  Shield, 
  Landmark,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  firmInfo, 
  pendingCount = 0,
  patternsCount = 4,
  isBackendConnected = false,
  activeClient,
  onClearActiveClient
}) {
  const sections = [
    {
      label: 'Today',
      items: [
        { id: 'today', label: 'Today Briefing', icon: Sparkles, badge: '6 Decisions', isAlert: true },
        { id: 'queue', label: 'Review Queue', icon: FileText, badge: pendingCount > 0 ? String(pendingCount) : null, isAlert: true },
      ]
    },
    {
      label: 'Clients',
      items: [
        { id: 'clients', label: 'Client Accounts', icon: Users, badge: '8 Active' },
      ]
    },
    {
      label: 'Work',
      items: [
        { id: 'reconciliation', label: '3-Way Recon (2B)', icon: RefreshCw },
        { id: 'bank-automation', label: 'Bank & Rule 37', icon: Landmark },
        { id: 'returns', label: 'Monthly Returns', icon: FileCheck },
        { id: 'calendar', label: 'Statutory Calendar', icon: Calendar, badge: '2 Due', isAlert: true },
      ]
    },
    {
      label: 'Intelligence',
      items: [
        { id: 'patterns', label: 'Vendor Intelligence', icon: Sparkles, badge: `${patternsCount} profiles`, isNeutral: true },
        { id: 'policy', label: 'Automation Policy', icon: Sliders },
        { id: 'analytics', label: 'Practice Capacity', icon: BarChart3 },
      ]
    },
    {
      label: 'System',
      items: [
        { id: 'audit', label: 'Audit Trail & Replay', icon: Shield },
      ]
    }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-icon">
          <Sparkles size={15} />
        </div>
        <div className="sidebar-brand-text">
          <h2>Yukti</h2>
          <span>CA Intelligence OS</span>
        </div>
      </div>

      {/* Active Client Deep Focus Banner */}
      {activeClient && (
        <div style={{ padding: '10px 12px 0' }}>
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', padding: '8px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#065F46' }}>
                Active Client
              </span>
              <button 
                onClick={onClearActiveClient}
                style={{ background: 'transparent', border: 'none', color: '#065F46', cursor: 'pointer', fontSize: '10px', fontWeight: 600 }}
                title="Return to Firm Portfolio"
              >
                ✕ Exit
              </button>
            </div>
            <strong style={{ fontSize: '12px', color: '#064E3B', display: 'block', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeClient.business_name || activeClient.name}
            </strong>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {sections.map(section => (
          <React.Fragment key={section.label}>
            <div className="nav-section-title">{section.label}</div>
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="nav-item-content">
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`nav-badge${item.isNeutral ? ' nav-badge-neutral' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* Footer — Engine & Firm Status */}
      <div className="sidebar-footer">
        <div style={{ marginBottom: '10px' }}>
          <div className="engine-pulse-active" style={{ width: '100%', justifyContent: 'center' }}>
            <span className="pulse-dot" />
            <span>DuckDB Engine Active • Tally 4.1</span>
          </div>
        </div>

        <div className="firm-profile">
          <div className="firm-avatar"><Building2 size={16} /></div>
          <div className="firm-info-block">
            <span className="firm-info-name" title={firmInfo?.name}>
              {firmInfo?.name || 'Rajnish & Associates'}
            </span>
            <span className="firm-info-role">
              {firmInfo?.principalCA || 'CA Rajnish Sharma, FCA'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
