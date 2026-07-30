import React from 'react';
import { 
  Building2, 
  Calendar, 
  Keyboard, 
  Download, 
  Sparkles, 
  Layers, 
  CheckSquare, 
  RefreshCw,
  Zap,
  HelpCircle,
  FileJson,
  FileWarning
} from 'lucide-react';

export default function HeaderNav({ 
  activeTab, 
  setActiveTab, 
  firmInfo, 
  onOpenReturnPrep, 
  pendingCount,
  autoPostRate
}) {
  return (
    <header className="header-nav">
      <div className="header-top">
        <div className="brand-group">
          <div className="brand-logo">
            <Sparkles className="logo-icon" />
            <span className="brand-name">Yukti</span>
          </div>
          <span className="brand-tag">CA Intelligence OS</span>
          <div className="firm-selector">
            <Building2 className="firm-icon" />
            <span className="firm-name">{firmInfo.name}</span>
            <span className="firm-badge">{firmInfo.totalClients} Clients</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="period-pill">
            <Calendar className="pill-icon" />
            <span>Period: <strong>{firmInfo.activePeriod}</strong></span>
            <span className="live-dot" title="Live Portal Connection Active"></span>
          </div>

          <button 
            className="btn btn-secondary btn-kbd-help"
            onClick={() => alert("Keyboard Shortcuts:\n\nJ : Select Next Item\nK : Select Previous Item\nA : Approve Item\nR : Reject Item\nE : Inspect & Edit Item\nEsc : Close Modals")}
          >
            <Keyboard className="btn-icon" />
            <span>Shortcuts</span>
            <kbd>J</kbd><kbd>K</kbd><kbd>A</kbd><kbd>R</kbd>
          </button>

          <button 
            className="btn btn-primary btn-export"
            onClick={onOpenReturnPrep}
          >
            <FileJson className="btn-icon" />
            <span>Export Returns & Tally</span>
          </button>
        </div>
      </div>

      <div className="header-bottom">
        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            <Building2 className="tab-icon" />
            <span>Client Practices</span>
            <span className="tab-badge">{firmInfo.totalClients}</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <CheckSquare className="tab-icon" />
            <span>Exception Review Queue</span>
            {pendingCount > 0 && (
              <span className="tab-badge badge-amber-solid">{pendingCount}</span>
            )}
          </button>

          <button 
            className={`nav-tab ${activeTab === 'reconciliation' ? 'active' : ''}`}
            onClick={() => setActiveTab('reconciliation')}
          >
            <Layers className="tab-icon" />
            <span>3-Pass Reconciliation</span>
            <span className="tab-badge badge-green">96.8% Match</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => setActiveTab('notices')}
          >
            <FileWarning className="tab-icon" />
            <span>Notices</span>
            <span className="tab-badge badge-amber-solid">3</span>
          </button>
        </nav>

        <div className="header-live-stats">
          <div className="live-stat">
            <span className="stat-label">AI Auto-Post Rate</span>
            <span className="stat-val text-green">
              <Zap className="inline-icon" /> {autoPostRate}%
            </span>
          </div>
          <div className="live-stat">
            <span className="stat-label">Sarvam OCR Engine</span>
            <span className="stat-val text-indigo">22 Languages Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
