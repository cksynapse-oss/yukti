import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Users, 
  FileText, 
  RefreshCw, 
  FileCheck, 
  Calendar, 
  Sliders, 
  BarChart3, 
  Shield, 
  Landmark, 
  Upload, 
  Server,
  Presentation,
  CornerDownLeft
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigateTab,
  clients = [],
  onSelectClient,
  reviewItems = [],
  onInspectItem,
  onOpenUpload,
  onOpenReconModal,
  onOpenTallyConnector,
  onOpenIntelligence,
  onOpenDeck
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const itemRefs = useRef([]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filtered Results
  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Navigation Items
    const navigationActions = [
      { id: 'nav-today', title: 'Today Briefing', subtitle: 'Urgent morning decisions and practice status', icon: Sparkles, action: () => onNavigateTab('today') },
      { id: 'nav-queue', title: 'Universal Review Queue', subtitle: 'Triage invoice exceptions & learn patterns', icon: FileText, badge: `${reviewItems.length} items`, action: () => onNavigateTab('queue') },
      { id: 'nav-clients', title: 'Client Accounts Directory', subtitle: 'All 40+ client GSTIN compliance cards', icon: Users, badge: `${clients.length} active`, action: () => onNavigateTab('clients') },
      { id: 'nav-recon', title: '3-Way Reconciliation (GSTR-2B)', subtitle: 'Books vs 2B vs Bank statement match engine', icon: RefreshCw, action: () => onNavigateTab('reconciliation') },
      { id: 'nav-bank', title: 'Bank Statement & Rule 37', subtitle: '180-day ITC clawback clock & settlement', icon: Landmark, action: () => onNavigateTab('bank-automation') },
      { id: 'nav-returns', title: 'Monthly Returns Filing', subtitle: 'GSTR-1 & 3B lock preparation and JSON export', icon: FileCheck, action: () => onNavigateTab('returns') },
      { id: 'nav-calendar', title: 'Statutory Tax Calendar', subtitle: 'GST deadlines, GSTR-1 (11th) & 3B (20th)', icon: Calendar, action: () => onNavigateTab('calendar') },
      { id: 'nav-patterns', title: 'Vendor Intelligence Engine', subtitle: 'Rillet-style auto-learned accounting memory', icon: Sparkles, action: () => onNavigateTab('patterns') },
      { id: 'nav-policy', title: 'Autonomy Policy', subtitle: 'Firm-wide auto-posting thresholds and tolerances', icon: Sliders, action: () => onNavigateTab('policy') },
      { id: 'nav-analytics', title: 'Practice Capacity & ROI', subtitle: 'Client capacity expansion and hours saved', icon: BarChart3, action: () => onNavigateTab('analytics') },
      { id: 'nav-audit', title: 'Audit Trail & Decision Replay', subtitle: 'Tamper-evident logs of every auto-post', icon: Shield, action: () => onNavigateTab('audit') },
    ];

    // Quick Action Items
    const quickActions = [
      { id: 'action-upload', title: 'Upload Invoices', subtitle: 'Intake scanned PDFs, photos, or Excel sheets', icon: Upload, action: onOpenUpload },
      { id: 'action-recon', title: 'Run 3-Way DuckDB Reconciliation', subtitle: 'Process 1,200+ invoices against GSTR-2B', icon: RefreshCw, action: onOpenReconModal },
      { id: 'action-tally', title: 'Check Tally Prime Status (:9000)', subtitle: 'Inspect local Tally XML connector and vouchers', icon: Server, action: onOpenTallyConnector },
      { id: 'action-intel', title: 'Open Yukti Intelligence Drawer', subtitle: 'Cross-client anomaly alerts and risk digest', icon: Sparkles, shortcut: 'I', action: onOpenIntelligence },
      { id: 'action-deck', title: 'Open Investor Pitch Deck', subtitle: 'The GST Capacity Engine investment thesis', icon: Presentation, shortcut: 'P', action: onOpenDeck },
    ];

    // 1. Navigation
    const navs = navigationActions.filter(n => 
      !q || n.title.toLowerCase().includes(q) || n.subtitle.toLowerCase().includes(q)
    );

    // 2. Clients
    const matchedClients = clients
      .filter(c => {
        if (!q) return true;
        const name = (c.name || c.business_name || '').toLowerCase();
        const gstin = (c.gstin || c.primary_gstin || '').toLowerCase();
        const contact = (c.primaryContact || '').toLowerCase();
        return name.includes(q) || gstin.includes(q) || contact.includes(q);
      })
      .slice(0, 5)
      .map(c => ({
        id: `client-${c.id || c.gstin}`,
        title: c.name || c.business_name,
        subtitle: `GSTIN: ${c.gstin || c.primary_gstin} • ${c.category || 'Business'}`,
        icon: Users,
        badge: c.pendingExceptions > 0 ? `${c.pendingExceptions} Exceptions` : 'Compliant',
        badgeType: c.pendingExceptions > 0 ? 'warning' : 'success',
        action: () => {
          if (onSelectClient) onSelectClient(c);
        }
      }));

    // 3. Exception Invoices
    const matchedInvoices = reviewItems
      .filter(i => {
        if (!q) return false; // only show on search
        const supplier = (i.supplierName || '').toLowerCase();
        const invNo = (i.invoiceNo || '').toLowerCase();
        const issue = (i.issueCategory || '').toLowerCase();
        return supplier.includes(q) || invNo.includes(q) || issue.includes(q);
      })
      .slice(0, 4)
      .map(i => ({
        id: `inv-${i.id}`,
        title: `${i.supplierName} (${i.invoiceNo || 'INV'})`,
        subtitle: `${i.issueCategory} • Total: ₹${Number(i.totalAmount || 0).toLocaleString('en-IN')}`,
        icon: FileText,
        badge: i.issueSeverity || 'Review',
        badgeType: i.issueSeverity === 'CRITICAL' ? 'danger' : 'warning',
        action: () => {
          if (onInspectItem) onInspectItem(i);
        }
      }));

    // 4. Quick Actions
    const acts = quickActions.filter(a =>
      !q || a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
    );

    const groups = [];
    if (matchedClients.length > 0) groups.push({ title: 'Client Workspaces', items: matchedClients });
    if (matchedInvoices.length > 0) groups.push({ title: 'Invoice Exceptions', items: matchedInvoices });
    if (navs.length > 0) groups.push({ title: 'Views & Workflows', items: navs });
    if (acts.length > 0) groups.push({ title: 'Quick Actions', items: acts });

    return groups;
  }, [
    query, 
    clients, 
    reviewItems, 
    onNavigateTab, 
    onSelectClient, 
    onInspectItem, 
    onOpenUpload, 
    onOpenReconModal, 
    onOpenTallyConnector, 
    onOpenIntelligence, 
    onOpenDeck
  ]);

  // Flatten items for single keyboard index
  const flattenedItems = useMemo(() => {
    return filteredGroups.flatMap(g => g.items);
  }, [filteredGroups]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= flattenedItems.length) {
      setSelectedIndex(Math.max(0, flattenedItems.length - 1));
    }
  }, [flattenedItems, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    const el = itemRefs.current[selectedIndex];
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, flattenedItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flattenedItems.length) % Math.max(1, flattenedItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentItem = flattenedItems[selectedIndex];
      if (currentItem && currentItem.action) {
        currentItem.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  let flatCounter = 0;

  return (
    <div className="command-palette-backdrop" onClick={onClose} role="presentation">
      <div 
        className="command-palette-dialog" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Universal Command Palette"
      >
        {/* Search Input Bar */}
        <div className="command-palette-input-wrap">
          <Search size={18} />
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="Search clients, invoices, views, or actions..."
            aria-label="Search clients, invoices, views, or actions"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <span className="command-palette-esc">ESC</span>
        </div>

        {/* Results List */}
        <div className="command-palette-results">
          {flattenedItems.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '13px', fontWeight: 500 }}>No results found for "{query}"</p>
              <p style={{ fontSize: '11px', marginTop: '4px' }}>Try searching by client name, GSTIN, invoice #, or view title.</p>
            </div>
          ) : (
            filteredGroups.map(group => (
              <div key={group.title}>
                <div className="command-palette-group-title">{group.title}</div>
                {group.items.map(item => {
                  const currentIndex = flatCounter++;
                  const isSelected = currentIndex === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      ref={el => (itemRefs.current[currentIndex] = el)}
                      className={`command-palette-item ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                    >
                      <div className="command-palette-item-left">
                        <div className="command-palette-icon">
                          <Icon size={14} />
                        </div>
                        <div className="command-palette-item-text">
                          <span className="command-palette-title">{item.title}</span>
                          <span className="command-palette-subtitle">{item.subtitle}</span>
                        </div>
                      </div>

                      <div className="command-palette-item-right">
                        {item.badge && (
                          <span 
                            className={`badge ${
                              item.badgeType === 'danger' ? 'badge-danger' : 
                              item.badgeType === 'warning' ? 'badge-warning' : 
                              item.badgeType === 'success' ? 'badge-success' : 'badge-neutral'
                            } font-mono`}
                            style={{ fontSize: '10px' }}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.shortcut && (
                          <kbd style={{ 
                            fontSize: '9px', 
                            background: 'var(--bg-subtle)', 
                            border: '1px solid var(--border-color)', 
                            padding: '1px 5px', 
                            borderRadius: '3px',
                            fontFamily: 'var(--font-mono)' 
                          }}>
                            {item.shortcut}
                          </kbd>
                        )}
                        {isSelected && (
                          <CornerDownLeft size={13} style={{ color: 'var(--brand)', opacity: 0.8 }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="command-palette-footer">
          <div className="command-palette-hints">
            <div className="command-palette-hint">
              <kbd>↑</kbd><kbd>↓</kbd>
              <span>navigate</span>
            </div>
            <div className="command-palette-hint">
              <kbd>↵</kbd>
              <span>select</span>
            </div>
            <div className="command-palette-hint">
              <kbd>esc</kbd>
              <span>close</span>
            </div>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand)' }}>Yukti OS ⌘K</span>
        </div>
      </div>
    </div>
  );
}
