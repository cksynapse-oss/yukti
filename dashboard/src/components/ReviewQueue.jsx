import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Keyboard, 
  Eye, 
  Check, 
  X, 
  Zap, 
  Sparkles,
  Filter,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function ReviewQueue({ 
  reviewItems, 
  onApprove, 
  onReject, 
  onInspect, 
  onBulkApproveNearMatches,
  onOpenVendorFollowup 
}) {
  const [selectedId, setSelectedId] = useState(reviewItems[0]?.id || null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Filter items
  const filteredItems = reviewItems.filter(item => {
    const matchesCategory = 
      categoryFilter === 'All' ? true :
      categoryFilter === 'Critical' ? item.issueSeverity === 'CRITICAL' :
      categoryFilter === 'Math Mismatch' ? item.issueCategory === 'Math Mismatch' :
      categoryFilter === 'New Vendor' ? item.issueCategory === 'New Vendor' : true;

    const matchesSearch = 
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierGstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const selectedIndex = filteredItems.findIndex(i => i.id === selectedId);
  const activeItem = filteredItems[selectedIndex] || filteredItems[0];

  // Show Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid hotkeys when typing in search input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        if (selectedIndex < filteredItems.length - 1) {
          const nextId = filteredItems[selectedIndex + 1].id;
          setSelectedId(nextId);
          showToast(`Selected: ${filteredItems[selectedIndex + 1].supplierName}`);
        }
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        if (selectedIndex > 0) {
          const prevId = filteredItems[selectedIndex - 1].id;
          setSelectedId(prevId);
          showToast(`Selected: ${filteredItems[selectedIndex - 1].supplierName}`);
        }
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (activeItem) {
          onApprove(activeItem.id);
          showToast(`Approved: ${activeItem.invoiceNo}`);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (activeItem) {
          onReject(activeItem.id);
          showToast(`Rejected: ${activeItem.invoiceNo}`);
        }
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (activeItem) {
          onInspect(activeItem);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredItems, activeItem, onApprove, onReject, onInspect]);

  return (
    <div className="review-queue-container">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <Sparkles style={{ width: 18, height: 18, color: '#6366f1' }} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="queue-controls-bar">
        <div className="filter-tabs">
          {['All', 'Critical', 'Math Mismatch', 'New Vendor'].map(tab => (
            <button
              key={tab}
              className={`btn-tab ${categoryFilter === tab ? 'active' : ''}`}
              onClick={() => setCategoryFilter(tab)}
            >
              {tab}
              <span className="tab-count">
                {tab === 'All' ? reviewItems.length :
                 tab === 'Critical' ? reviewItems.filter(i => i.issueSeverity === 'CRITICAL').length :
                 tab === 'Math Mismatch' ? reviewItems.filter(i => i.issueCategory === 'Math Mismatch').length :
                 reviewItems.filter(i => i.issueCategory === 'New Vendor').length}
              </span>
            </button>
          ))}
        </div>

        <div className="search-and-actions">
          <div className="search-box">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search vendor, GSTIN, invoice #..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            className="btn btn-success"
            onClick={onBulkApproveNearMatches}
          >
            <Zap style={{ width: 16, height: 16 }} />
            <span>Approve Near-Matches (&lt; ₹1,000)</span>
          </button>
        </div>
      </div>

      {/* Keyboard Helper Bar */}
      <div className="kbd-bar">
        <div className="kbd-info">
          <Keyboard style={{ width: 16, height: 16, color: '#6366f1' }} />
          <span className="kbd-title">Senior Keyboard Controls:</span>
        </div>
        <div className="kbd-keys">
          <span><kbd>J</kbd> Next</span>
          <span><kbd>K</kbd> Prev</span>
          <span><kbd>A</kbd> Approve</span>
          <span><kbd>R</kbd> Reject</span>
          <span><kbd>E</kbd> Inspect &amp; Edit</span>
        </div>
      </div>

      {/* Main Split Layout: Left List, Right Active Detail */}
      <div className="queue-main-grid">
        {/* Left: Queue Item Cards */}
        <div className="queue-list-panel">
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <CheckCircle style={{ width: 48, height: 48, color: '#10b981' }} />
              <h3>All Exception Reviews Clear!</h3>
              <p className="text-muted">No pending invoice exceptions matching your filter.</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const isSelected = item.id === (activeItem?.id);
              return (
                <div
                  key={item.id}
                  className={`queue-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="card-header">
                    <div className="supplier-group">
                      <span className="supplier-name">{item.supplierName}</span>
                      <span className="supplier-gstin">{item.supplierGstin}</span>
                    </div>
                    <span className={`badge ${
                      item.confidenceScore >= 90 ? 'badge-green' :
                      item.confidenceScore >= 75 ? 'badge-amber' : 'badge-red'
                    }`}>
                      {item.confidenceScore}% Confidence
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="meta-line">
                      <span>Inv #{item.invoiceNo}</span>
                      <span>•</span>
                      <span>{item.invoiceDate}</span>
                      <span>•</span>
                      <span className="text-muted">Client: {item.customerName}</span>
                    </div>

                    <div className="issue-pill-row">
                      <span className={`badge ${
                        item.issueSeverity === 'CRITICAL' ? 'badge-red' :
                        item.issueSeverity === 'HIGH' ? 'badge-amber' : 'badge-indigo'
                      }`}>
                        <ShieldAlert style={{ width: 12, height: 12 }} />
                        {item.issueTag}
                      </span>
                      <span className="gstr2b-status">{item.gstr2bMatchStatus}</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="amount-group">
                      <span className="amount-label">Grand Total:</span>
                      <span className="amount-val">₹{item.grandTotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="quick-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn-icon-action btn-inspect"
                        onClick={() => onInspect(item)}
                        title="Inspect & Edit (E)"
                      >
                        <Eye style={{ width: 14, height: 14 }} />
                      </button>
                      <button 
                        className="btn-icon-action btn-reject"
                        onClick={() => {
                          onReject(item.id);
                          showToast(`Rejected: ${item.invoiceNo}`);
                        }}
                        title="Reject (R)"
                      >
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                      <button 
                        className="btn-icon-action btn-approve"
                        onClick={() => {
                          onApprove(item.id);
                          showToast(`Approved: ${item.invoiceNo}`);
                        }}
                        title="Approve (A)"
                      >
                        <Check style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Active Item Intelligence Panel */}
        {activeItem && (
          <div className="queue-detail-panel">
            <div className="detail-header">
              <div>
                <span className="detail-tag">Active Review Selection</span>
                <h2>{activeItem.supplierName}</h2>
                <span className="text-muted">GSTIN: {activeItem.supplierGstin}</span>
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => onInspect(activeItem)}
              >
                <Eye style={{ width: 16, height: 16 }} />
                <span>Side-by-Side Inspect (E)</span>
              </button>
            </div>

            <div className="detail-body">
              <div className="reasoning-box">
                <div className="reasoning-title">
                  <Sparkles style={{ width: 16, height: 16, color: '#6366f1' }} />
                  <span>Sarvam AI Confidence Explanation</span>
                </div>
                <p>{activeItem.reasoning}</p>
              </div>

              <div className="financial-summary-card">
                <h3>Extracted Invoice Figures</h3>
                <div className="fig-grid">
                  <div className="fig-item">
                    <span className="fig-lbl">Taxable Value</span>
                    <span className="fig-val">₹{activeItem.taxableValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="fig-item">
                    <span className="fig-lbl">CGST (9%)</span>
                    <span className="fig-val">₹{activeItem.cgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="fig-item">
                    <span className="fig-lbl">SGST (9%)</span>
                    <span className="fig-val">₹{activeItem.sgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="fig-item">
                    <span className="fig-lbl">IGST</span>
                    <span className="fig-val">₹{activeItem.igst.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="grand-total-row">
                  <span>Grand Total Payable:</span>
                  <span className="total-highlight">₹{activeItem.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="tally-ledger-box">
                <label>Target Tally Ledger Head:</label>
                <div className="ledger-val">
                  <span>{activeItem.suggestedLedger}</span>
                  <span className="badge badge-green">Auto-Mapped</span>
                </div>
              </div>

              <div className="detail-action-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => onOpenVendorFollowup(activeItem)}
                >
                  <span>Draft WhatsApp Follow-up</span>
                </button>
                <div className="footer-right">
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      onReject(activeItem.id);
                      showToast(`Rejected ${activeItem.invoiceNo}`);
                    }}
                  >
                    <X style={{ width: 16, height: 16 }} />
                    <span>Reject (R)</span>
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      onApprove(activeItem.id);
                      showToast(`Approved ${activeItem.invoiceNo}`);
                    }}
                  >
                    <Check style={{ width: 16, height: 16 }} />
                    <span>Approve &amp; Post to Tally (A)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
