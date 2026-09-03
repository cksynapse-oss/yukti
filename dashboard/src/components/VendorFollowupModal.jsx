import React, { useState } from 'react';
import { X, Send, Mail, Copy, Check, MessageSquare } from 'lucide-react';

export default function VendorFollowupModal({ item, onClose, onSend }) {
  if (!item) return null;

  const defaultDraft = `Respected Manager,

Greetings from Rajnish & Associates (Chartered Accountants for ${item.customerName || "our client"}).

Ref: Invoice #${item.invoiceNo} dated ${item.invoiceDate} (Amount: ₹${item.grandTotal?.toLocaleString('en-IN') || 0}).

During our monthly GSTR-2B reconciliation for July 2026, we noticed the following compliance issue:
Issue: ${item.issueDescription || "Invoice not reflected in auto-generated GSTR-2B statement."}

Kindly ensure that your GSTR-1 return for July 2026 is filed on the GST portal before the 11th deadline to avoid ITC blockage under Section 16(2)(aa).

Regards,
GST Compliance Desk
Rajnish & Associates CA Firm`;

  const [message, setMessage] = useState(defaultDraft);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} className="text-brand" />
            <div>
              <h3>Draft Vendor Compliance Notice</h3>
              <span className="text-xs text-muted">{item.supplierName} ({item.supplierGstin})</span>
            </div>
          </div>
          <button className="btn-icon-action" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-scroll">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: '6px', marginBottom: '14px' }}>
            <span className="text-xs font-semibold text-amber">Flagged Issue: {item.issueTag || "Missing in GSTR-2B"}</span>
            <span className="text-xs text-muted">Auto-generated draft</span>
          </div>

          <div className="form-group">
            <label className="form-label">Communication Text Body</label>
            <textarea 
              rows={8} 
              className="form-textarea font-mono text-xs"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="modal-footer-bar">
          <button className="btn btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy Text"}</span>
          </button>

          <button className="btn btn-secondary" onClick={() => onSend("EMAIL", message)}>
            <Mail size={14} />
            <span>Send Email</span>
          </button>

          <button className="btn btn-primary" onClick={() => onSend("WHATSAPP", message)}>
            <Send size={14} />
            <span>Send via WhatsApp BSP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
