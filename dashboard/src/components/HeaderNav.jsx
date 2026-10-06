import React, { useState } from 'react';
import { 
  Calendar, 
  Keyboard, 
  Upload, 
  X, 
  RotateCcw, 
  Sparkles,
  Command,
  Search,
  Building2
} from 'lucide-react';

export default function HeaderNav({ 
  activeTab, 
  onNavigateTab,
  firmInfo, 
  onOpenUpload,
  onOpenTallyConnector,
  onResetDemoData,
  onOpenIntelligence,
  onOpenCommandPalette,
  activeClient,
  onClearActiveClient,
  pendingCount = 0,
  isBackendConnected = false
}) {
  const [showHotkeys, setShowHotkeys] = useState(false);

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'today': return 'Today Briefing';
      case 'clients': return 'Client Accounts';
      case 'queue': return 'Universal Review Queue';
      case 'bank-automation': return 'Bank & Rule 37 Settlement';
      case 'reconciliation': return '3-Way Match (GSTR-2B)';
      case 'returns': return 'Monthly Returns Filing';
      case 'calendar': return 'Statutory Tax Calendar';
      case 'analytics': return 'Practice Capacity & ROI';
      case 'patterns': return 'Vendor Intelligence';
      case 'policy': return 'Automation Policy';
      case 'audit': return 'Audit Trail & Decision Replay';
      case 'notices': return 'Tax Notice Assistant';
      default: return 'Practice Operating System';
    }
  };

  const hotkeys = [
    { key: '⌘K', desc: 'Open Command Palette & Universal Search' },
    { key: 'I', desc: 'Toggle Yukti Intelligence Drawer' },
    { key: 'J', desc: 'Select next invoice in queue' },
    { key: 'K', desc: 'Select previous invoice' },
    { key: 'A', desc: 'Approve & post to Tally' },
    { key: 'R', desc: 'Reject / flag invoice' },
    { key: 'E', desc: 'Open inspector & edit ledgers' },
    { key: 'P', desc: 'Open Investor Pitch Deck' },
    { key: 'Esc', desc: 'Close active modal / drawer' },
  ];

  return (
    <>
      <header className="top-header" style={{ height: '52px', padding: '0 20px', background: '#FFFFFF', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30, gap: '16px' }}>
        {/* Left: Dynamic Context Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand)' }}>Yukti</span>
          <span style={{ color: 'var(--border-color)' }}>/</span>
          {activeClient && (
            <>
              <button
                onClick={onClearActiveClient}
                className="badge badge-brand"
                style={{ 
                  cursor: 'pointer', 
                  border: '1px solid var(--brand-border)',
                  background: 'var(--brand-light)',
                  padding: '2px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600
                }}
                title="Click to exit client deep-dive"
              >
                <Building2 size={11} />
                <span>{activeClient.name || activeClient.business_name}</span>
                <span style={{ opacity: 0.6 }}>✕</span>
              </button>
              <span style={{ color: 'var(--border-color)' }}>/</span>
            </>
          )}
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            {getBreadcrumbTitle()}
          </span>
          {pendingCount > 0 && activeTab === 'queue' && (
            <span className="badge badge-warning font-mono" style={{ fontSize: '11px', padding: '1px 6px' }}>
              {pendingCount} to review
            </span>
          )}
        </div>

        {/* Center: Universal Command Bar (⌘K) */}
        <div style={{ flex: 1, maxWidth: '420px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            className="header-search-trigger"
            onClick={onOpenCommandPalette}
            title="Press ⌘K to search clients, invoices, or jump to views"
            aria-label="Universal search and command palette (⌘K)"
            style={{ width: '100%', maxWidth: '380px' }}
          >
            <Search size={13} />
            <span>Search clients, invoices, actions...</span>
            <kbd>⌘K</kbd>
          </button>
        </div>

        {/* Right Tools: Clean & High Productivity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={onOpenIntelligence}
            className="intelligence-pill-button"
            title="Open Yukti Intelligence Drawer (Hotkey: I)"
            aria-label="Open Yukti Intelligence Drawer (I)"
          >
            <Sparkles size={12} className="text-brand" />
            <span style={{ fontWeight: 600, fontSize: '11px' }}>Intelligence</span>
            <span className="badge badge-danger font-mono" style={{ fontSize: '10px', padding: '0 5px' }}>
              6
            </span>
            <kbd style={{ fontSize: '9px', background: 'rgba(15, 90, 71, 0.1)', padding: '1px 4px', borderRadius: '3px', marginLeft: '2px' }}>I</kbd>
          </button>

          <button
            onClick={onResetDemoData}
            className="btn-ghost"
            style={{ padding: '5px 7px', fontSize: '11px', color: 'var(--text-muted)' }}
            title="Reset to pristine pilot dataset"
            aria-label="Reset demo dataset to pristine pilot state"
          >
            <RotateCcw size={12} />
          </button>

          <div className="period-badge" style={{ padding: '4px 8px', fontSize: '11px' }}>
            <Calendar size={11} />
            <span className="font-mono">{firmInfo?.activePeriod || 'July 2026'}</span>
            <span 
              style={{ 
                width: 6, 
                height: 6, 
                borderRadius: '50%', 
                background: isBackendConnected ? '#10B981' : '#D97706', 
                display: 'inline-block' 
              }} 
              title={isBackendConnected ? 'Backend Connected' : 'Local Demo Mode'} 
            />
          </div>

          <button 
            onClick={onOpenTallyConnector}
            className="engine-pulse-active" 
            style={{ 
              fontSize: '11px', 
              padding: '4px 8px', 
              cursor: 'pointer',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.08)'
            }}
            title="Desktop Tally Prime 4.1 Sync Active (Click to inspect)"
            aria-label="Inspect Desktop Tally Prime sync status"
          >
            <span className="pulse-dot" />
            <span className="font-mono">Tally :9000</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={() => setShowHotkeys(true)}
            style={{ fontSize: '11px', padding: '5px 8px' }}
            title="Keyboard Shortcuts"
            aria-label="View keyboard shortcuts (?)"
          >
            <Keyboard size={12} />
            <kbd style={{ fontSize: '9px', background: 'var(--bg-subtle)', padding: '1px 4px', borderRadius: '3px' }}>?</kbd>
          </button>

          <button className="btn btn-primary" onClick={onOpenUpload} style={{ fontSize: '11px', padding: '5px 10px' }} aria-label="Upload invoices">
            <Upload size={12} />
            <span>+ Upload</span>
          </button>
        </div>
      </header>

      {showHotkeys && (
        <div className="modal-overlay" onClick={() => setShowHotkeys(false)}>
          <div className="modal-dialog" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Keyboard Shortcuts">
            <div className="modal-header-bar">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Keyboard size={16} /> Keyboard Shortcuts
              </h3>
              <button className="btn-ghost btn" style={{ padding: '4px' }} onClick={() => setShowHotkeys(false)} aria-label="Close keyboard shortcuts dialog">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body-scroll" style={{ padding: '16px 20px' }}>
              {hotkeys.map(({ key, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{desc}</span>
                  <kbd style={{ padding: '2px 10px', borderRadius: '4px', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>{key}</kbd>
                </div>
              ))}
            </div>
            <div className="modal-footer-bar" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowHotkeys(false)}>Got it</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
