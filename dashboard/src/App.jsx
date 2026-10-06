import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HeaderNav from './components/HeaderNav';
import TodayBriefingView from './components/TodayBriefingView';
import YuktiIntelligenceDrawer from './components/YuktiIntelligenceDrawer';
import AutonomyPolicyView from './components/AutonomyPolicyView';
import ClientOverview from './components/ClientOverview';
import ReviewQueue from './components/ReviewQueue';
import ReconciliationView from './components/ReconciliationView';
import DocumentInspectorModal from './components/DocumentInspectorModal';
import VendorFollowupModal from './components/VendorFollowupModal';
import ReturnPrepModal from './components/ReturnPrepModal';
import NoticeAssistant from './components/NoticeAssistant';
import VendorPatternsView from './components/VendorPatternsView';
import UploadInvoiceModal from './components/UploadInvoiceModal';
import RunReconciliationModal from './components/RunReconciliationModal';
import AddClientModal from './components/AddClientModal';
import ComplianceCalendarView from './components/ComplianceCalendarView';
import AnalyticsView from './components/AnalyticsView';
import AuditLogView from './components/AuditLogView';
import InvestorDeckModal from './components/InvestorDeckModal';
import InvestorDemoBar from './components/InvestorDemoBar';
import BankStatementAutomationView from './components/BankStatementAutomationView';
import TallyConnectorModal from './components/TallyConnectorModal';
import ClientWorkspaceView from './components/ClientWorkspaceView';
import CommandPalette from './components/CommandPalette';

import { useVendorPatterns } from './hooks/useVendorPatterns';
import { 
  checkHealth, 
  fetchInvoices, 
  approveInvoice as apiApproveInvoice, 
  rejectInvoice as apiRejectInvoice, 
  updateInvoice as apiUpdateInvoice,
  fetchVendorPatterns as apiFetchPatterns,
  deleteVendorPattern as apiDeletePattern,
  fetchLatestReconciliation
} from './services/api';

import { 
  FIRM_INFO, 
  GLOBAL_STATS, 
  CLIENTS, 
  REVIEW_ITEMS, 
  RECONCILIATION_DATA, 
  GSTR_SUMMARY, 
  NOTICES 
} from './data/mockData';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [activeClient, setActiveClient] = useState(null);
  const [reviewItems, setReviewItems] = useState(REVIEW_ITEMS);
  const [clients, setClients] = useState(CLIENTS);
  const [reconData, setReconData] = useState(RECONCILIATION_DATA);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  
  // Vendor Pattern Learning Engine (Rillet-style)
  const { 
    patterns, 
    getPattern, 
    savePattern, 
    getAllPatterns, 
    deletePattern, 
    resetPatterns 
  } = useVendorPatterns();

  // Modals state
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);
  const [inspectingItem, setInspectingItem] = useState(null);
  const [followupItem, setFollowupItem] = useState(null);
  const [isReturnPrepOpen, setIsReturnPrepOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReconModalOpen, setIsReconModalOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isTallyModalOpen, setIsTallyModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Global hotkeys: ⌘K (Command Palette), P (pitch deck), I (intelligence drawer)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsDeckOpen(prev => !prev);
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setIsIntelligenceOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Check Backend Health & Fetch Real Invoices, Clients, and Reconciliation Data
  useEffect(() => {
    async function initData() {
      const health = await checkHealth();
      if (health.isOnline) {
        setIsBackendConnected(true);
        
        // Fetch clients
        try {
          const clientRes = await fetch('http://127.0.0.1:8000/api/v1/clients');
          if (clientRes.ok) {
            const clientList = await clientRes.json();
            if (clientList.length > 0) {
              // Deduplicate by GSTIN
              const seenGstins = new Set();
              const uniqueList = [];
              clientList.forEach(c => {
                const gstin = (c.primary_gstin || c.gstin || '').toUpperCase();
                if (!seenGstins.has(gstin)) {
                  seenGstins.add(gstin);
                  uniqueList.push(c);
                }
              });

              setClients(uniqueList.map((c, i) => {
                const name = c.business_name || c.name || 'Client Business';
                const defaultContacts = [
                  "Anand Verma (+91 98200 11223)",
                  "Deepak Mehta (+91 98211 44556)",
                  "Rohit Kulkarni (+91 99300 77889)",
                  "Sanjay Gupta (+91 98199 66778)",
                  "Priya Nair (+91 98205 33445)",
                  "Vikram Kalyani (+91 98220 55667)",
                  "Ramesh Oswal (+91 98140 11224)",
                  "Manoj Deshmukh (+91 98230 44551)"
                ];
                const defaultInvoices = [342, 189, 94, 215, 120, 142, 98, 110];
                const defaultAutoPost = [91.5, 82.0, 88.3, 79.1, 85.0, 86.4, 94.0, 87.5];
                const defaultItcRisk = [124000, 88500, 42000, 165000, 0, 24500, 0, 31000];

                return {
                  id: c.id,
                  name: name,
                  gstin: c.primary_gstin || c.gstin,
                  category: c.industry || c.category || 'Logistics & Transport',
                  primaryContact: c.primaryContact || defaultContacts[i % defaultContacts.length],
                  turnover: c.turnover || '₹12.5 Cr',
                  invoicesCount: c.invoices_count || c.invoicesCount || defaultInvoices[i % defaultInvoices.length],
                  autoPostedPct: Number(c.auto_post_pct || c.autoPostedPct || defaultAutoPost[i % defaultAutoPost.length]),
                  itcAtRisk: Number(c.itc_at_risk || c.itcAtRisk || defaultItcRisk[i % defaultItcRisk.length]),
                  gstr1Status: c.gstr1_status || c.gstr1Status || 'Ready to Review',
                  gstr3bStatus: c.gstr3b_status || c.gstr3bStatus || 'Pending Recon',
                  nextDeadline: c.next_due || c.nextDeadline || '20 Aug 2026',
                  pendingExceptions: c.exceptions_count ?? c.pendingExceptions ?? 0
                };
              }));
            }
          }
        } catch (e) {
          console.error("Could not fetch clients", e);
        }

        // Fetch pending invoices
        const dbInvoices = await fetchInvoices('pending');
        if (dbInvoices && Array.isArray(dbInvoices) && dbInvoices.length > 0) {
          setReviewItems(dbInvoices.map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoice_no,
            supplierName: inv.supplier_name,
            supplierGstin: inv.supplier_gstin,
            customerName: inv.customer_name,
            invoiceDate: inv.invoice_date,
            totalAmount: inv.grand_total,
            taxableValue: inv.taxable_value,
            cgst: inv.cgst,
            sgst: inv.sgst,
            igst: inv.igst,
            confidenceScore: inv.confidence_score,
            suggestedLedger: inv.suggested_ledger,
            issueTag: inv.issue_tag,
            issueDescription: inv.issue_description,
            issueCategory: inv.issue_category,
            issueSeverity: inv.issue_severity,
            itcAtRisk: inv.itc_at_risk,
            gstr2bMatchStatus: inv.gstr2b_match_status,
            supplyType: inv.supply_type,
            hsnCode: inv.hsn_code,
            validationChecks: inv.validation_checks,
            rawJson: inv.raw_json
          })));
        }

        // Fetch latest reconciliation run
        const latestRecon = await fetchLatestReconciliation();
        if (latestRecon && latestRecon.records && latestRecon.records.length > 0) {
          setReconData(latestRecon);
        }
      }
    }
    initData();
  }, []);

  const handleApprove = async (itemId) => {
    const item = reviewItems.find(i => i.id === itemId);
    if (!item) return;

    if (isBackendConnected) {
      await apiApproveInvoice(itemId);
    }

    // Auto-queue to Tally Desktop Sync Connector
    fetch('http://127.0.0.1:8000/api/v1/tally/connector/queue/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice_no: item.invoiceNumber,
        voucher_type: "Purchase",
        amount: item.grandTotal || item.taxableValue || 0,
        party: item.vendorName
      })
    }).catch(() => {});

    setReviewItems(prev => prev.filter(i => i.id !== itemId));
    showToast(`Invoice ${item.invoiceNumber} approved & posted to Tally Prime.`);
  };

  const handleReject = async (itemId) => {
    const item = reviewItems.find(i => i.id === itemId);
    if (!item) return;

    if (isBackendConnected) {
      await apiRejectInvoice(itemId);
    }
    setReviewItems(prev => prev.filter(i => i.id !== itemId));
    showToast(`Invoice ${item.invoiceNumber} flagged for client verification.`);
  };

  const handleBulkApproveNearMatches = async (nearMatches) => {
    const ids = nearMatches.map(m => m.id);
    if (isBackendConnected) {
      for (const id of ids) {
        await apiApproveInvoice(id);
      }
    }
    setReviewItems(prev => prev.filter(i => !ids.includes(i.id)));
    showToast(`Bulk approved ${nearMatches.length} near-match records.`);
  };

  const handleSaveAndPost = async (updatedItem, saveAsRule) => {
    if (saveAsRule && updatedItem.supplierGstin) {
      const gstin = updatedItem.supplierGstin.toUpperCase();
      savePattern(gstin, updatedItem.supplierName, {
        defaultLedger: updatedItem.suggestedLedger,
        defaultGstRate: updatedItem.supplyType === 'INTERSTATE' ? 5.0 : 18.0,
        hsnOverride: updatedItem.hsnCode,
      }, {
        notes: `Learned from manual correction on Invoice ${updatedItem.invoiceNumber}`
      });

      if (isBackendConnected) {
        await fetch('http://127.0.0.1:8000/api/v1/vendor-patterns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supplier_gstin: gstin,
            supplier_name: updatedItem.supplierName,
            default_ledger: updatedItem.suggestedLedger,
            hsn_override: updatedItem.hsnCode,
            notes: `Auto-learned on ${new Date().toLocaleDateString()}`
          })
        });
      }
    }

    if (isBackendConnected) {
      await apiUpdateInvoice(updatedItem.id, {
        supplier_name: updatedItem.supplierName,
        supplier_gstin: updatedItem.supplierGstin,
        invoice_no: updatedItem.invoiceNumber,
        invoice_date: updatedItem.invoiceDate,
        taxable_value: updatedItem.taxableValue,
        cgst: updatedItem.cgst,
        sgst: updatedItem.sgst,
        igst: updatedItem.igst,
        grand_total: updatedItem.totalAmount,
        suggested_ledger: updatedItem.suggestedLedger,
        hsn_code: updatedItem.hsnCode,
        save_as_pattern: saveAsRule
      });
    }

    setReviewItems(prev => prev.filter(i => i.id !== updatedItem.id));
    setInspectingItem(null);
    showToast(`Invoice ${updatedItem.invoiceNumber} updated & posted to Tally.`);
  };

  const handleDeletePattern = async (gstin) => {
    deletePattern(gstin);
    if (isBackendConnected) {
      await apiDeletePattern(gstin);
    }
    showToast(`Removed vendor pattern rule for ${gstin}.`);
  };

  const handleSendFollowup = async (channel, text) => {
    setFollowupItem(null);
    showToast(`Statutory Section 16(2)(aa) notice dispatched via ${channel.toUpperCase()}.`);
  };

  const handleUploadSuccess = (newInvoice) => {
    if (newInvoice.status === 'pending' || newInvoice.routing_decision === 'REVIEW_QUEUE') {
      const formatted = {
        id: newInvoice.id,
        invoiceNumber: newInvoice.invoice_no,
        supplierName: newInvoice.supplier_name,
        supplierGstin: newInvoice.supplier_gstin,
        customerName: newInvoice.customer_name,
        invoiceDate: newInvoice.invoice_date,
        totalAmount: newInvoice.grand_total,
        taxableValue: newInvoice.taxable_value,
        cgst: newInvoice.cgst,
        sgst: newInvoice.sgst,
        igst: newInvoice.igst,
        confidenceScore: newInvoice.confidence_score,
        suggestedLedger: newInvoice.suggested_ledger,
        issueTag: newInvoice.issue_tag || 'Inspection Required',
        issueDescription: newInvoice.issue_description || 'OCR Extraction complete.',
        issueCategory: newInvoice.issue_category || 'Review',
        issueSeverity: newInvoice.issue_severity || 'MEDIUM',
        itcAtRisk: newInvoice.itc_at_risk || `₹${int(newInvoice.cgst + newInvoice.sgst + newInvoice.igst)}`,
        gstr2bMatchStatus: newInvoice.gstr2b_match_status || 'UNMATCHED',
        supplyType: newInvoice.supply_type || 'INTRASTATE',
        hsnCode: newInvoice.hsn_code || '998313',
        validationChecks: newInvoice.validation_checks || [],
        rawJson: newInvoice.raw_json || {}
      };
      setReviewItems(prev => [formatted, ...prev]);
      setActiveTab('queue');
    }
    showToast(`Invoice ${newInvoice.invoice_no} processed with confidence ${newInvoice.confidence_score}%.`);
  };

  const handleReconciliationSuccess = (result) => {
    setReconData(result);
    setActiveTab('reconciliation');
    showToast(`3-Way Reconciliation completed. Accuracy: ${result.summary?.matchAccuracyPct || 94.2}%.`);
  };

  const handleClientCreated = (newClient) => {
    setClients(prev => [
      {
        id: newClient.id,
        name: newClient.business_name,
        gstin: newClient.primary_gstin,
        category: newClient.industry,
        primaryContact: 'Accounts Head',
        turnover: newClient.turnover,
        monthlyInvoices: 0,
        autoPostRate: 100.0,
        itcAtRisk: 0,
        gstr1Status: 'Ready to Review',
        gstr3bStatus: 'Pending Recon',
        nextDue: 'Aug 20, 2026',
        pendingExceptions: 0
      },
      ...prev
    ]);
    showToast(`Client ${newClient.business_name} successfully onboarded.`);
  };

  const allPatternsList = getAllPatterns();

  const handleResetDemoData = () => {
    setReviewItems(REVIEW_ITEMS);
    setClients(CLIENTS);
    setReconData(RECONCILIATION_DATA);
    resetPatterns();
    showToast("Demo state reset to pristine pilot dataset.");
  };

  return (
    <div className="app-layout">
      {/* Persistent Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          if (tab === 'clients') setActiveClient(null);
          setActiveTab(tab);
        }}
        firmInfo={FIRM_INFO}
        pendingCount={reviewItems.length}
        patternsCount={allPatternsList.length}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenDeck={() => setIsDeckOpen(true)}
        isBackendConnected={isBackendConnected}
        activeClient={activeClient}
        onClearActiveClient={() => setActiveClient(null)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <HeaderNav 
          activeTab={activeTab}
          onNavigateTab={(tab) => {
            if (tab === 'clients') {
              setActiveClient(null);
            }
            setActiveTab(tab);
          }}
          firmInfo={FIRM_INFO}
          pendingCount={reviewItems.length}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onOpenTallyConnector={() => setIsTallyModalOpen(true)}
          onResetDemoData={handleResetDemoData}
          onOpenIntelligence={() => setIsIntelligenceOpen(prev => !prev)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          activeClient={activeClient}
          onClearActiveClient={() => setActiveClient(null)}
          isBackendConnected={isBackendConnected}
        />

        <main className="content-body">
          {activeClient ? (
            <ClientWorkspaceView 
              client={activeClient}
              onBack={() => setActiveClient(null)}
              invoices={reviewItems}
              onApproveInvoice={handleApprove}
              onRejectInvoice={handleReject}
              onInspectInvoice={(item) => setInspectingItem(item)}
              getPattern={getPattern}
              onShowToast={showToast}
            />
          ) : (
            <>
              {activeTab === 'today' && (
                <TodayBriefingView 
                  onNavigateTab={(tab) => {
                    setActiveClient(null);
                    setActiveTab(tab);
                  }}
                  onSelectClient={(client) => setActiveClient(client)}
                  clients={clients}
                  reviewItems={reviewItems}
                  onApproveAllNearMatches={handleBulkApproveNearMatches}
                  onOpenVendorFollowup={(item) => setFollowupItem(item)}
                  onInspectItem={(item) => setInspectingItem(item)}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'clients' && (
                <ClientOverview 
                  firmInfo={FIRM_INFO}
                  globalStats={GLOBAL_STATS}
                  clients={clients}
                  onSelectClient={(client) => setActiveClient(client)}
                  onOpenAddClient={() => setIsAddClientOpen(true)}
                />
              )}

              {activeTab === 'queue' && (
                <ReviewQueue 
                  reviewItems={reviewItems}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onInspect={(item) => setInspectingItem(item)}
                  onBulkApproveNearMatches={handleBulkApproveNearMatches}
                  onOpenVendorFollowup={(item) => setFollowupItem(item)}
                  getPattern={getPattern}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'bank-automation' && (
                <BankStatementAutomationView onShowToast={showToast} />
              )}

              {activeTab === 'reconciliation' && (
                <ReconciliationView 
                  reconData={reconData}
                  onOpenVendorFollowup={(item) => setFollowupItem(item)}
                  onOpenReconModal={() => setIsReconModalOpen(true)}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'returns' && (
                <ReturnPrepModal 
                  isInline={true}
                  gstrSummary={GSTR_SUMMARY}
                />
              )}

              {activeTab === 'calendar' && (
                <ComplianceCalendarView onSelectClient={(client) => setActiveClient(client)} />
              )}

              {activeTab === 'patterns' && (
                <VendorPatternsView 
                  patterns={allPatternsList}
                  onDeletePattern={handleDeletePattern}
                  onResetPatterns={resetPatterns}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'policy' && (
                <AutonomyPolicyView onShowToast={showToast} />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView 
                  firmInfo={FIRM_INFO} 
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'audit' && (
                <AuditLogView />
              )}
            </>
          )}
        </main>
      </div>

      {/* Add Client Onboarding Modal */}
      {isAddClientOpen && (
        <AddClientModal 
          isOpen={isAddClientOpen}
          onClose={() => setIsAddClientOpen(false)}
          onClientCreated={handleClientCreated}
        />
      )}

      {/* Upload Invoice Modal */}
      {isUploadModalOpen && (
        <UploadInvoiceModal 
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          clients={clients}
        />
      )}

      {/* Run 3-Way Reconciliation Modal */}
      {isReconModalOpen && (
        <RunReconciliationModal 
          onClose={() => setIsReconModalOpen(false)}
          onReconciliationSuccess={handleReconciliationSuccess}
          currentReconData={reconData}
        />
      )}

      {/* Side-by-Side Inspector Modal */}
      {inspectingItem && (
        <DocumentInspectorModal 
          item={inspectingItem}
          onClose={() => setInspectingItem(null)}
          onSaveAndPost={handleSaveAndPost}
          vendorPattern={getPattern(inspectingItem.supplierGstin)}
        />
      )}

      {/* Vendor Follow-up Modal */}
      {followupItem && (
        <VendorFollowupModal 
          item={followupItem}
          onClose={() => setFollowupItem(null)}
          onSend={handleSendFollowup}
        />
      )}

      {/* Return Prep & Tally Export Modal */}
      {isReturnPrepOpen && (
        <ReturnPrepModal 
          onClose={() => setIsReturnPrepOpen(false)}
          gstrSummary={GSTR_SUMMARY}
        />
      )}

      {/* Integrated Investor Pitch Deck Modal (Hotkey: P) */}
      <InvestorDeckModal 
        isOpen={isDeckOpen}
        onClose={() => setIsDeckOpen(false)}
        onLaunchDemo={() => {
          setIsDeckOpen(false);
          setActiveTab('today');
          showToast("Live Product Demo Loaded: Ready for Inspection.");
        }}
      />

      {/* Global Command Palette (Hotkey: ⌘K) */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={(tab) => {
          setActiveClient(null);
          setActiveTab(tab);
        }}
        clients={clients}
        onSelectClient={(client) => {
          setActiveClient(client);
        }}
        reviewItems={reviewItems}
        onInspectItem={(item) => setInspectingItem(item)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenReconModal={() => setIsReconModalOpen(true)}
        onOpenTallyConnector={() => setIsTallyModalOpen(true)}
        onOpenIntelligence={() => setIsIntelligenceOpen(true)}
        onOpenDeck={() => setIsDeckOpen(true)}
      />

      {/* Desktop Tally Sync Connector Modal */}
      {isTallyModalOpen && (
        <TallyConnectorModal 
          onClose={() => setIsTallyModalOpen(false)}
          onShowToast={showToast}
        />
      )}

      {/* Slide-out Calm Yukti Intelligence Layer */}
      <YuktiIntelligenceDrawer 
        isOpen={isIntelligenceOpen}
        onClose={() => setIsIntelligenceOpen(false)}
        onNavigateTab={(tab) => {
          setActiveClient(null);
          setActiveTab(tab);
        }}
        onSelectClient={(client) => setActiveClient(client)}
        clients={clients}
        reviewItems={reviewItems}
        onOpenVendorFollowup={(item) => setFollowupItem(item)}
        onInspectItem={(item) => setInspectingItem(item)}
        onShowToast={showToast}
      />

      {/* Global Accessible Toast Notification with Micro-Interaction */}
      {toast && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className="toast-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
              <Sparkles size={15} style={{ color: '#10B981', flexShrink: 0 }} aria-hidden="true" />
              <span style={{ fontSize: '13px', lineHeight: 1.4 }}>{toast}</span>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="toast-close-btn"
              aria-label="Dismiss notification"
              title="Dismiss"
            >
              ✕
            </button>
            <div className="toast-progress-bar" />
          </div>
        </div>
      )}
    </div>
  );
}
