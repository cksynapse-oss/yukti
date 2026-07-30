import React, { useState } from 'react';
import { FileWarning, Upload, Calendar, IndianRupee, Clock, X, Download, Send, Sparkles, AlertTriangle } from 'lucide-react';

const NoticeAssistant = ({ notices = [] }) => {
  const [selectedNotice, setSelectedNotice] = useState(null);

  const handleUploadClick = () => {
    alert('Feature available in production build');
  };

  const closeModal = () => {
    setSelectedNotice(null);
  };

  const getNoticeTypeColor = (type) => {
    switch (type) {
      case 'ASMT-10': return { bg: '#FEF3C7', color: '#92400E' }; // Amber
      case 'DRC-01': return { bg: '#FEE2E2', color: '#991B1B' }; // Red
      case 'DRC-07': return { bg: '#FECACA', color: '#7F1D1D' }; // Darker Red
      default: return { bg: '#E0F2FE', color: '#075985' };
    }
  };

  const getStatusColor = (status) => {
    if (status.includes('Pending') || status.includes('Pending Reply')) return { bg: '#FEF3C7', color: '#92400E' }; // Amber
    if (status.includes('Ready') || status.includes('Draft Ready')) return { bg: '#D1FAE5', color: '#065F46' }; // Green
    if (status.includes('Urgent')) return { bg: '#FEE2E2', color: '#991B1B' }; // Red
    return { bg: '#E5E7EB', color: '#374151' };
  };

  return (
    <div className="notice-container" style={{
      '--bg-surface': '#F2F9F5',
      '--bg-card': '#FFFFFF',
      '--border-color': '#D1E7DD',
      '--text-primary': '#062E24',
      '--text-secondary': '#3D6B5E',
      '--text-muted': '#6B8F82',
      '--accent-green': '#0F5A47',
      '--emerald': '#10B981',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: 'var(--bg-surface)',
      minHeight: '100vh',
      padding: '2rem',
      color: 'var(--text-primary)'
    }}>
      <style>{`
        .notice-container { box-sizing: border-box; }
        .notice-header { margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; }
        .notice-title-area h1 { margin: 0 0 0.5rem 0; font-size: 2rem; color: var(--text-primary); }
        .notice-title-area p { margin: 0; color: var(--text-secondary); font-size: 1.1rem; }
        .sarvam-badge { display: flex; align-items: center; gap: 0.5rem; background-color: var(--accent-green); color: white; padding: 0.5rem 1rem; border-radius: 999px; font-weight: 500; font-size: 0.875rem; }
        
        .notice-upload-zone { border: 2px dashed var(--accent-green); border-radius: 12px; padding: 3rem; text-align: center; cursor: pointer; background-color: rgba(15, 90, 71, 0.03); transition: all 0.2s; margin-bottom: 2.5rem; }
        .notice-upload-zone:hover { background-color: rgba(15, 90, 71, 0.08); border-color: var(--emerald); }
        .notice-upload-zone svg { color: var(--accent-green); margin-bottom: 1rem; width: 48px; height: 48px; }
        .notice-upload-zone p { margin: 0; color: var(--text-secondary); font-size: 1.2rem; font-weight: 500; }
        
        .notice-grid { display: flex; flex-direction: column; gap: 1.5rem; }
        
        .notice-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .notice-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .badges-container { display: flex; gap: 0.75rem; }
        .badge { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .notice-subject { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin: 0 0 1rem 0; line-height: 1.4; }
        
        .notice-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.25rem; background: var(--bg-surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); }
        .notice-meta-item { display: flex; align-items: center; gap: 0.5rem; }
        .notice-meta-icon { color: var(--text-muted); width: 16px; height: 16px; flex-shrink: 0; }
        .notice-meta-content { display: flex; flex-direction: column; }
        .notice-meta-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
        .notice-meta-value { font-size: 0.875rem; color: var(--text-secondary); font-weight: 500; }
        
        .notice-description { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; }
        
        .notice-actions { display: flex; gap: 1rem; }
        
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; border: none; }
        .btn-primary { background-color: var(--accent-green); color: white; }
        .btn-primary:hover { background-color: var(--text-primary); }
        .btn-secondary { background-color: var(--bg-surface); color: var(--accent-green); border: 1px solid var(--accent-green); }
        .btn-secondary:hover { background-color: var(--accent-green); color: white; }
        .btn-success { background-color: var(--emerald); color: white; }
        .btn-success:hover { background-color: #059669; }
        
        .notice-detail-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(6, 46, 36, 0.6); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 2rem; backdrop-filter: blur(4px); }
        .notice-detail-modal { background-color: var(--bg-card); border-radius: 16px; width: 100%; max-width: 800px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .notice-detail-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-surface); }
        .modal-title-area { display: flex; flex-direction: column; gap: 0.5rem; }
        .close-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: background-color 0.2s; }
        .close-btn:hover { background-color: rgba(0,0,0,0.05); color: var(--text-primary); }
        
        .notice-detail-body { padding: 2rem; overflow-y: auto; flex: 1; }
        .draft-reply-section { margin-top: 2rem; }
        .draft-reply-header { display: flex; align-items: center; gap: 0.5rem; color: var(--accent-green); margin-bottom: 1rem; font-weight: 600; font-size: 1.1rem; }
        .draft-reply-box { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 1.5rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.9rem; line-height: 1.6; color: #334155; white-space: pre-wrap; }
        
        .notice-detail-footer { padding: 1.5rem 2rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 1rem; background-color: var(--bg-surface); }
      `}</style>

      <div className="notice-header">
        <div className="notice-title-area">
          <h1>GST Notice & Reply Assistant</h1>
          <p>AI-assisted notice parsing and response drafting</p>
        </div>
        <div className="sarvam-badge">
          <Sparkles size={18} />
          Sarvam AI Powered
        </div>
      </div>

      <div className="notice-upload-zone" onClick={handleUploadClick}>
        <Upload />
        <p>Drop a GST Notice PDF here or click to upload</p>
      </div>

      <div className="notice-grid">
        {notices.map(notice => {
          const typeColor = getNoticeTypeColor(notice.type);
          const statusColor = getStatusColor(notice.status);

          return (
            <div key={notice.id} className="notice-card">
              <div className="notice-card-header">
                <div className="badges-container">
                  <span className="badge notice-type-badge" style={{ backgroundColor: typeColor.bg, color: typeColor.color }}>
                    {notice.type}
                  </span>
                  <span className="badge" style={{ backgroundColor: statusColor.bg, color: statusColor.color }}>
                    {notice.status}
                  </span>
                </div>
              </div>

              <h2 className="notice-subject">{notice.subject}</h2>

              <div className="notice-meta">
                <div className="notice-meta-item">
                  <div className="notice-meta-content">
                    <span className="notice-meta-label">Client</span>
                    <span className="notice-meta-value">{notice.clientName}</span>
                  </div>
                </div>
                <div className="notice-meta-item">
                  <div className="notice-meta-content">
                    <span className="notice-meta-label">GSTIN</span>
                    <span className="notice-meta-value" style={{ fontFamily: 'monospace' }}>{notice.gstin}</span>
                  </div>
                </div>
                <div className="notice-meta-item">
                  <Calendar className="notice-meta-icon" />
                  <div className="notice-meta-content">
                    <span className="notice-meta-label">Issue Date</span>
                    <span className="notice-meta-value">{notice.issueDate}</span>
                  </div>
                </div>
                <div className="notice-meta-item">
                  <Clock className="notice-meta-icon" />
                  <div className="notice-meta-content">
                    <span className="notice-meta-label">Due Date</span>
                    <span className="notice-meta-value">{notice.replyDueDate} ({notice.daysLeft} days left)</span>
                  </div>
                </div>
                <div className="notice-meta-item">
                  <IndianRupee className="notice-meta-icon" />
                  <div className="notice-meta-content">
                    <span className="notice-meta-label">Demand</span>
                    <span className="notice-meta-value">{notice.demandAmount}</span>
                  </div>
                </div>
              </div>

              <div className="notice-description">
                {notice.description}
              </div>

              <div className="notice-actions">
                <button className="btn btn-primary" onClick={() => setSelectedNotice(notice)}>
                  <FileWarning size={18} />
                  View Draft Reply
                </button>
                <button className="btn btn-secondary">
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
            </div>
          );
        })}
        {notices.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No notices found. Upload a notice to get started.
          </div>
        )}
      </div>

      {selectedNotice && (
        <div className="notice-detail-overlay" onClick={closeModal}>
          <div className="notice-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="notice-detail-header">
              <div className="modal-title-area">
                <div className="badges-container">
                  <span className="badge notice-type-badge" style={{ 
                    backgroundColor: getNoticeTypeColor(selectedNotice.type).bg, 
                    color: getNoticeTypeColor(selectedNotice.type).color 
                  }}>
                    {selectedNotice.type}
                  </span>
                </div>
                <h2 className="notice-subject" style={{ margin: 0 }}>{selectedNotice.subject}</h2>
              </div>
              <button className="close-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className="notice-detail-body">
              <div className="notice-meta">
                <div className="notice-meta-item">
                  <div className="notice-meta-content">
                    <span className="notice-meta-label">Client</span>
                    <span className="notice-meta-value">{selectedNotice.clientName}</span>
                  </div>
                </div>
                <div className="notice-meta-item">
                  <div className="notice-meta-content">
                    <span className="notice-meta-label">GSTIN</span>
                    <span className="notice-meta-value" style={{ fontFamily: 'monospace' }}>{selectedNotice.gstin}</span>
                  </div>
                </div>
                <div className="notice-meta-item">
                  <div className="notice-meta-content">
                    <span className="notice-meta-label">Due Date</span>
                    <span className="notice-meta-value">{selectedNotice.replyDueDate}</span>
                  </div>
                </div>
                <div className="notice-meta-item">
                  <div className="notice-meta-content">
                    <span className="notice-meta-label">Demand</span>
                    <span className="notice-meta-value">{selectedNotice.demandAmount}</span>
                  </div>
                </div>
              </div>
              
              <div className="notice-description" style={{ marginTop: '1.5rem', marginBottom: '0' }}>
                <strong>Description:</strong> {selectedNotice.description}
              </div>

              <div className="draft-reply-section">
                <div className="draft-reply-header">
                  <Sparkles size={20} />
                  AI Generated Draft Reply
                </div>
                <div className="draft-reply-box">
                  {selectedNotice.draftReply}
                </div>
              </div>
            </div>

            <div className="notice-detail-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                <Download size={18} />
                Download Draft Reply
              </button>
              <button className="btn btn-success" onClick={closeModal}>
                <Send size={18} />
                Send to Client for Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeAssistant;
