import React, { useState } from 'react';
import { X, Send, MessageSquare, Mail, Copy, Check } from 'lucide-react';

export default function VendorFollowupModal({ item, onClose, onSend }) {
  if (!item) return null;

  const defaultDraft = `Respected Manager,

Greetings from Rajnish & Associates (CAs for ${item.customerName}).

Reg: Invoice #${item.invoiceNo} dated ${item.invoiceDate} (Amount: ₹${item.grandTotal.toLocaleString('en-IN')}).

We noticed an issue during our GSTR-2B monthly reconciliation:
Issue: ${item.issueDescription}

Please ensure your GSTR-1 return for July 2026 is filed/amended before the 11th deadline to avoid ITC blockage under Section 16(2)(aa).

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
      <div className="modal-content followup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title-group">
            <MessageSquare style={{ width: 22, height: 22, color: '#10b981' }} />
            <div>
              <h2>Draft Automated Vendor Follow-up</h2>
              <span className="text-muted">Vendor: {item.supplierName} ({item.supplierGstin})</span>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div className="modal-body p-4">
          <div className="followup-info-banner">
            <span>Issue Flagged: <strong>{item.issueTag}</strong></span>
            <span className="text-muted">Channel: WhatsApp BSP / Email</span>
          </div>

          <div className="form-group full mt-3">
            <label>Communication Message Draft:</label>
            <textarea 
              rows={8} 
              className="followup-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCopy}>
            {copied ? <Check style={{ width: 16, height: 16 }} /> : <Copy style={{ width: 16, height: 16 }} />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Text"}</span>
          </button>

          <div className="footer-right">
            <button className="btn btn-secondary" onClick={() => onSend("EMAIL", message)}>
              <Mail style={{ width: 16, height: 16 }} />
              <span>Send via Email</span>
            </button>

            <button className="btn btn-success" onClick={() => onSend("WHATSAPP", message)}>
              <Send style={{ width: 16, height: 16 }} />
              <span>Send via WhatsApp BSP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
