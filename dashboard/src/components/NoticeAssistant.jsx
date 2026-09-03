import React, { useState } from 'react';
import { 
  FileWarning, 
  Upload, 
  Calendar, 
  IndianRupee, 
  Clock, 
  X, 
  Download, 
  Send, 
  Sparkles, 
  AlertTriangle,
  Copy,
  Check,
  Building2,
  FileText,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function NoticeAssistant({ notices = [] }) {
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleCopyReply = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateNoticeUpload = () => {
    setIsSimulatingUpload(true);
    setTimeout(() => {
      setIsSimulatingUpload(false);
      // Open the first notice as newly parsed
      if (notices.length > 0) {
        setSelectedNotice(notices[0]);
      }
    }, 900);
  };

  const handleDownloadDoc = (notice) => {
    const textContent = `BEFORE THE SUPERINTENDENT OF CENTRAL GST & EXCISE
RANGE-IV, DIVISION-MUMBAI WEST

REPLY TO STATUTORY NOTICE: ${notice.noticeType}
REFERENCE NUMBER: ZD2707260018921
DATED: ${notice.noticeDate}

IN THE MATTER OF:
M/s Reliance Logistics Pvt Ltd
GSTIN: ${notice.clientGstin}

SUBJECT: ${notice.subject}

RESPECTED SIR/MADAM,

${notice.draftReply}

PRAYER:
In view of the above statutory facts, substantiated by certified purchase registers and GSTR-2B filing records, it is most respectfully prayed that the proposed demand of ₹${notice.demandAmount?.toLocaleString('en-IN')} be dropped in full without levy of interest or penalty.

Yours faithfully,
For Reliance Logistics Pvt Ltd

(Authorized Signatory / Tax Practitioner)
Date: 18th July 2026
Place: Mumbai`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Statutory_Reply_${notice.noticeType}_${notice.clientGstin}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const getNoticeBadge = (type) => {
    switch (type) {
      case 'ASMT-10':
        return <span className="badge badge-warning">ASMT-10 (Scrutiny)</span>;
      case 'DRC-01':
        return <span className="badge badge-danger">DRC-01 (Show Cause)</span>;
      default:
        return <span className="badge badge-neutral">{type}</span>;
    }
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="view-pretitle">
            <Sparkles size={14} className="text-brand" />
            <span>AI Legal & Tax Intelligence (Sarvam 30B LLM)</span>
          </div>
          <h1 className="view-title">GST Scrutiny Notice Assistant</h1>
          <p className="view-subtitle">
            Upload departmental scrutiny notices (ASMT-10, DRC-01, DRC-07) to extract allegations, auto-reconcile with books, and draft statutory replies.
          </p>
        </div>
      </div>

      {/* Upload Dropzone with Live Demo Simulation */}
      <div 
        className="panel" 
        style={{ 
          padding: '24px', 
          textAlign: 'center', 
          border: '2px dashed var(--border-color)', 
          cursor: 'pointer',
          backgroundColor: isSimulatingUpload ? 'var(--bg-subtle)' : 'var(--bg-surface)',
          transition: 'all 0.2s ease'
        }}
        onClick={handleSimulateNoticeUpload}
        title="Click to simulate analyzing an ASMT-10 departmental notice PDF"
      >
        {isSimulatingUpload ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Loader2 size={26} className="text-brand animate-spin" />
            <strong className="text-sm text-primary">Sarvam Indic Vision Parsing ASMT-10 PDF...</strong>
            <span className="text-xs text-muted">Extracting Section 16(2)(aa) discrepancy allegations & matching with GSTR-2B</span>
          </div>
        ) : (
          <>
            <Upload size={26} className="text-brand mx-auto mb-2" style={{ margin: '0 auto 6px', color: 'var(--brand)' }} />
            <h4 className="font-semibold text-primary" style={{ fontSize: '13px' }}>
              Drag & drop departmental notice PDF or <span className="text-brand underline">Click for Live Pilot Demo</span>
            </h4>
            <p className="text-xs text-muted mt-1">Supports ASMT-10, DRC-01, DRC-07 PDFs in English, Hindi, and regional Indic scripts.</p>
          </>
        )}
      </div>

      {/* Active Notices List */}
      <div className="panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="panel-title">Active Departmental Notices ({notices.length})</span>
            <span className="text-xs text-muted" style={{ marginLeft: '8px' }}>Auto-reconciled against books</span>
          </div>
          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Sarvam 30B Active</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {notices.map(notice => (
            <div 
              key={notice.id}
              style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid var(--border-color)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                gap: '16px' 
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {getNoticeBadge(notice.noticeType)}
                  <span className="font-semibold text-primary">{notice.clientName}</span>
                  <span className="font-mono text-xs text-muted">({notice.clientGstin})</span>
                </div>

                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {notice.subject}
                </h4>

                <p className="text-xs text-secondary mb-2" style={{ lineHeight: 1.5 }}>
                  {notice.description}
                </p>

                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Authority: <strong>{notice.issuingAuthority}</strong></span>
                  <span>Issued: <strong>{notice.noticeDate}</strong></span>
                  <span>Deadline: <strong className="text-red font-semibold">{notice.responseDeadline}</strong></span>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div className="text-right">
                  <span className="text-xs text-muted block">Alleged Tax Demand</span>
                  <span className="font-mono font-bold text-red text-sm">₹{notice.demandAmount?.toLocaleString('en-IN')}</span>
                </div>

                <button 
                  className="btn btn-primary text-xs"
                  onClick={() => setSelectedNotice(notice)}
                >
                  <FileText size={13} />
                  <span>Review AI Legal Reply</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notice Detail & Draft Reply Modal */}
      {selectedNotice && (
        <div className="modal-overlay" onClick={() => setSelectedNotice(null)}>
          <div className="modal-dialog" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} className="text-brand" />
                <div>
                  <h3>AI-Drafted Statutory Response: {selectedNotice.noticeType}</h3>
                  <span className="text-xs text-muted">{selectedNotice.clientName} • Alleged Demand: ₹{selectedNotice.demandAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button className="btn-icon-action" onClick={() => setSelectedNotice(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="vendor-pattern-banner mb-4" style={{ marginBottom: '14px' }}>
                <Sparkles size={16} className="text-brand mr-1" />
                <div className="text-xs">
                  <strong>Sarvam 30B Legal Grounding:</strong> Reconciled with Tally purchase vouchers #RIL/2026/0892 and Section 16(4) statutory time-limits.
                </div>
              </div>

              <div style={{ 
                backgroundColor: '#0D1117', 
                border: '1px solid #30363D', 
                borderRadius: '6px', 
                padding: '16px', 
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: '11px', 
                whiteSpace: 'pre-wrap', 
                lineHeight: 1.6, 
                color: '#E6EDF3',
                maxHeight: '340px',
                overflowY: 'auto'
              }}>
                {selectedNotice.draftReply}
              </div>
            </div>

            <div className="modal-footer-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => handleCopyReply(selectedNotice.draftReply)}
              >
                {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                <span>{copied ? "Copied Legal Text!" : "Copy Reply Text"}</span>
              </button>

              <button 
                className="btn btn-primary"
                onClick={() => handleDownloadDoc(selectedNotice)}
              >
                {downloadSuccess ? <Check size={14} /> : <Download size={14} />}
                <span>{downloadSuccess ? "Document Downloaded!" : "Download Statutory Reply (.TXT)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
