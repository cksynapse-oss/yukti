import React, { useState } from 'react';
import HeaderNav from './components/HeaderNav';
import ClientOverview from './components/ClientOverview';
import ReviewQueue from './components/ReviewQueue';
import ReconciliationView from './components/ReconciliationView';
import DocumentInspectorModal from './components/DocumentInspectorModal';
import VendorFollowupModal from './components/VendorFollowupModal';
import ReturnPrepModal from './components/ReturnPrepModal';
import NoticeAssistant from './components/NoticeAssistant';

import { FIRM_INFO, GLOBAL_STATS, CLIENTS, REVIEW_ITEMS, RECONCILIATION_DATA, GSTR_SUMMARY, NOTICES } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('queue'); // 'clients', 'queue', 'reconciliation'
  const [reviewItems, setReviewItems] = useState(REVIEW_ITEMS);
  const [clients, setClients] = useState(CLIENTS);
  
  // Modals state
  const [inspectingItem, setInspectingItem] = useState(null);
  const [followupItem, setFollowupItem] = useState(null);
  const [isReturnPrepOpen, setIsReturnPrepOpen] = useState(false);

  // Global Toast
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Actions
  const handleApprove = (itemId) => {
    setReviewItems(prev => prev.filter(item => item.id !== itemId));
    showToast("Invoice approved & queued for Tally voucher posting!");
  };

  const handleReject = (itemId) => {
    setReviewItems(prev => prev.filter(item => item.id !== itemId));
    showToast("Invoice rejected and flagged in exception log.");
  };

  const handleBulkApproveNearMatches = () => {
    const count = reviewItems.filter(i => i.confidenceScore >= 90).length;
    setReviewItems(prev => prev.filter(i => i.confidenceScore < 90));
    showToast(`⚡ Bulk approved ${count} high-confidence invoices!`);
  };

  const handleSaveAndPost = (updatedItem) => {
    setReviewItems(prev => prev.filter(item => item.id !== updatedItem.id));
    setInspectingItem(null);
    showToast(`Saved & Auto-Posted: Invoice #${updatedItem.invoiceNo}`);
  };

  const handleSendFollowup = (channel, text) => {
    setFollowupItem(null);
    showToast(`Automated follow-up sent via ${channel} to vendor!`);
  };

  const handleOpenClientReview = (client) => {
    setActiveTab('queue');
    showToast(`Viewing exception queue filtered for ${client.name}`);
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <HeaderNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        firmInfo={FIRM_INFO}
        onOpenReturnPrep={() => setIsReturnPrepOpen(true)}
        pendingCount={reviewItems.length}
        autoPostRate={GLOBAL_STATS.autoPostedPct}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'clients' && (
          <ClientOverview 
            firmInfo={FIRM_INFO}
            globalStats={GLOBAL_STATS}
            clients={clients}
            onSelectClient={handleOpenClientReview}
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
          />
        )}

        {activeTab === 'reconciliation' && (
          <ReconciliationView 
            reconData={RECONCILIATION_DATA}
            onOpenVendorFollowup={(bucket) => {
              setFollowupItem({
                supplierName: "Vardhman Textiles & Yarn",
                supplierGstin: "03AAACV9876G1Z4",
                customerName: "BlueSky Retails",
                invoiceNo: "VT/JUL/2026/411",
                invoiceDate: "2026-07-14",
                grandTotal: 134400,
                issueTag: bucket.title,
                issueDescription: bucket.desc,
              });
            }}
          />
        )}

        {activeTab === 'notices' && (
          <NoticeAssistant notices={NOTICES} />
        )}
      </main>

      {/* Side-by-Side Inspector Modal */}
      {inspectingItem && (
        <DocumentInspectorModal 
          item={inspectingItem}
          onClose={() => setInspectingItem(null)}
          onSaveAndPost={handleSaveAndPost}
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

      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className="toast">
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
