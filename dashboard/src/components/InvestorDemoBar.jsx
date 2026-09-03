import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Presentation, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Zap,
  Users,
  RefreshCw,
  FileText,
  Send,
  Download,
  Landmark
} from 'lucide-react';

export default function InvestorDemoBar({ 
  currentTab, 
  onNavigateTab, 
  onOpenDeck, 
  onOpenReconModal, 
  onOpenReturnPrep,
  onResetDemoData 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const demoSteps = [
    {
      step: 1,
      id: 'clients',
      label: '1. Portfolio Bottleneck',
      shortLabel: 'Portfolio Crisis',
      tag: '₹4.72L at Risk',
      icon: Users,
      action: () => onNavigateTab('clients'),
      hint: 'Show 40 clients, real-time filing status, and ₹4.72L at risk from delinquent suppliers.'
    },
    {
      step: 2,
      id: 'reconciliation',
      label: '2. 3-Way DuckDB Recon',
      shortLabel: '3-Pass Matcher',
      tag: '10K in 1.2s',
      icon: RefreshCw,
      action: () => {
        onNavigateTab('reconciliation');
        if (onOpenReconModal) onOpenReconModal();
      },
      hint: 'Reconcile 1,248 transactions in 1.2s across Exact, RapidFuzz, and Rule 37 buckets.'
    },
    {
      step: 3,
      id: 'queue',
      label: '3. Senior Review Triage',
      shortLabel: 'Keyboard Triage',
      tag: 'Hotkeys [J/K/A/E]',
      icon: FileText,
      action: () => onNavigateTab('queue'),
      hint: 'Demonstrate Linear-style high-speed keyboard approval and vendor pattern auto-learning.'
    },
    {
      step: 4,
      id: 'bank-automation',
      label: '4. Bank Auto & Rule 37',
      shortLabel: 'Bank & Rule 37',
      tag: '₹53.5k Protected',
      icon: Landmark,
      action: () => onNavigateTab('bank-automation'),
      hint: 'Auto-convert bank statements to Tally and settle Rule 37 180-day vendor invoices.'
    },
    {
      step: 5,
      id: 'returns',
      label: '5. Tally & GSTN Export',
      shortLabel: 'Certified XML/JSON',
      tag: 'Tally 4.1 Validated',
      icon: Download,
      action: () => {
        onNavigateTab('returns');
        if (onOpenReturnPrep) onOpenReturnPrep();
      },
      hint: 'Export official balanced Tally Prime XML purchase vouchers and GSTN-compliant JSON.'
    }
  ];

  return (
    <div className={`demo-bar-container ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="demo-bar-inner">
        {/* Left Badge */}
        <div className="demo-bar-left">
          <div className="demo-bar-pulse">
            <span className="demo-pulse-dot" />
            <span className="demo-badge-text">INVESTOR WALKTHROUGH</span>
          </div>
          <button 
            className="demo-btn-deck"
            onClick={onOpenDeck}
            title="Open Pitch Deck (Shortcut: P)"
          >
            <Presentation size={13} />
            <span>Pitch Deck (P)</span>
          </button>
        </div>

        {/* Middle Step Buttons */}
        {!isCollapsed && (
          <div className="demo-bar-steps">
            {demoSteps.map((s) => {
              const Icon = s.icon;
              const isActive = currentTab === s.id;
              return (
                <button
                  key={s.step}
                  className={`demo-step-btn ${isActive ? 'active' : ''}`}
                  onClick={s.action}
                  title={s.hint}
                >
                  <Icon size={12} className={isActive ? 'text-brand' : 'text-muted'} />
                  <span className="demo-step-name">{s.label}</span>
                  <span className="demo-step-tag">{s.tag}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right Tools */}
        <div className="demo-bar-right">
          <button 
            className="demo-btn-reset"
            onClick={onResetDemoData}
            title="Reset All Invoices & Reconciliations to Pristine Demo State"
          >
            <RotateCcw size={12} />
            <span>Reset Demo</span>
          </button>

          <button 
            className="demo-btn-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Demo Walkthrough' : 'Collapse Demo Walkthrough'}
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
