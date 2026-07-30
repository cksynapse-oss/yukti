import React, { useState } from 'react';
import { X, Check, FileText, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

export default function DocumentInspectorModal({ item, onClose, onSaveAndPost }) {
  if (!item) return null;

  const [supplierName, setSupplierName] = useState(item.supplierName);
  const [supplierGstin, setSupplierGstin] = useState(item.supplierGstin);
  const [invoiceNo, setInvoiceNo] = useState(item.invoiceNo);
  const [invoiceDate, setInvoiceDate] = useState(item.invoiceDate);
  const [taxableValue, setTaxableValue] = useState(item.taxableValue);
  const [cgst, setCgst] = useState(item.cgst);
  const [sgst, setSgst] = useState(item.sgst);
  const [igst, setIgst] = useState(item.igst);
  const [grandTotal, setGrandTotal] = useState(item.grandTotal);
  const [ledger, setLedger] = useState(item.suggestedLedger);

  const handleSave = () => {
    onSaveAndPost({
      ...item,
      supplierName,
      supplierGstin,
      invoiceNo,
      invoiceDate,
      taxableValue: parseFloat(taxableValue),
      cgst: parseFloat(cgst),
      sgst: parseFloat(sgst),
      igst: parseFloat(igst),
      grandTotal: parseFloat(grandTotal),
      suggestedLedger: ledger,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content inspector-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-title-group">
            <FileText style={{ width: 22, height: 22, color: '#6366f1' }} />
            <div>
              <h2>Side-by-Side Invoice Inspection</h2>
              <span className="text-muted">Invoice #{invoiceNo} • {item.supplierName}</span>
            </div>
          </div>

          <div className="header-right">
            <span className={`badge ${
              item.confidenceScore >= 90 ? 'badge-green' :
              item.confidenceScore >= 75 ? 'badge-amber' : 'badge-red'
            }`}>
              Sarvam AI Confidence: {item.confidenceScore}%
            </span>
            <button className="btn-close" onClick={onClose}>
              <X style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Document Scan, Right Fields */}
        <div className="inspector-body">
          {/* Left Panel: Simulated Indian Invoice Graphic */}
          <div className="left-doc-panel">
            <div className="doc-canvas">
              <div className="doc-watermark">CONFIDENTIAL • TAX INVOICE</div>
              <div className="doc-header">
                <div>
                  <h3 className="doc-vendor-title">{supplierName || "SUPPLIER NAME"}</h3>
                  <p className="doc-address">Plot 45, MIDC Industrial Area, Andheri East, Mumbai 400093</p>
                  <p className="doc-gstin">GSTIN: <strong>{supplierGstin}</strong></p>
                </div>
                <div className="doc-tax-stamp">
                  <span>TAX INVOICE</span>
                  <p>ORIGINAL FOR RECIPIENT</p>
                </div>
              </div>

              <hr className="doc-hr" />

              <div className="doc-meta-grid">
                <div>
                  <span className="meta-lbl">Billed To (Customer):</span>
                  <p className="meta-val">{item.customerName}</p>
                </div>
                <div>
                  <span className="meta-lbl">Invoice No:</span>
                  <p className="meta-val">{invoiceNo}</p>
                </div>
                <div>
                  <span className="meta-lbl">Invoice Date:</span>
                  <p className="meta-val">{invoiceDate}</p>
                </div>
              </div>

              <div className="doc-table">
                <div className="doc-th">
                  <span>Item Description</span>
                  <span>HSN</span>
                  <span>Qty</span>
                  <span>Rate</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="doc-tr">
                  <span>Freight &amp; Transportation Charges</span>
                  <span>996511</span>
                  <span>1</span>
                  <span>{taxableValue}</span>
                  <span>{taxableValue}</span>
                </div>
              </div>

              <div className="doc-totals-box">
                <div className="total-line"><span>Taxable Amount:</span> <span>₹{taxableValue}</span></div>
                <div className="total-line"><span>CGST (9%):</span> <span>₹{cgst}</span></div>
                <div className="total-line"><span>SGST (9%):</span> <span>₹{sgst}</span></div>
                <div className="total-line"><span>IGST:</span> <span>₹{igst}</span></div>
                <div className="total-line final"><span>Grand Total:</span> <span>₹{grandTotal}</span></div>
              </div>

              <div className="doc-footer">
                <p>E-Way Bill No: 271049201948 • Verified via E-Invoice Portal</p>
                <div className="signature-box">For {supplierName}</div>
              </div>
            </div>
          </div>

          {/* Right Panel: Side-by-Side Editable Fields & GSTR-2B Entry */}
          <div className="right-fields-panel">
            <div className="reasoning-card">
              <Sparkles style={{ width: 18, height: 18, color: '#6366f1' }} />
              <div>
                <h4>Sarvam AI OCR &amp; Verification Reasoning</h4>
                <p>{item.reasoning}</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group full">
                <label>Supplier Legal Name</label>
                <input 
                  type="text" 
                  value={supplierName} 
                  onChange={(e) => setSupplierName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Supplier GSTIN (15-Char)</label>
                <input 
                  type="text" 
                  value={supplierGstin} 
                  onChange={(e) => setSupplierGstin(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Invoice Number</label>
                <input 
                  type="text" 
                  value={invoiceNo} 
                  onChange={(e) => setInvoiceNo(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Invoice Date</label>
                <input 
                  type="date" 
                  value={invoiceDate} 
                  onChange={(e) => setInvoiceDate(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Taxable Value (₹)</label>
                <input 
                  type="number" 
                  value={taxableValue} 
                  onChange={(e) => setTaxableValue(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>CGST Amount (₹)</label>
                <input 
                  type="number" 
                  value={cgst} 
                  onChange={(e) => setCgst(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>SGST Amount (₹)</label>
                <input 
                  type="number" 
                  value={sgst} 
                  onChange={(e) => setSgst(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>IGST Amount (₹)</label>
                <input 
                  type="number" 
                  value={igst} 
                  onChange={(e) => setIgst(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Grand Total Payable (₹)</label>
                <input 
                  type="number" 
                  className="input-highlight"
                  value={grandTotal} 
                  onChange={(e) => setGrandTotal(e.target.value)} 
                />
              </div>

              <div className="form-group full">
                <label>Tally Ledger Head Target</label>
                <select value={ledger} onChange={(e) => setLedger(e.target.value)}>
                  <option value="Freight Charges - Transport A/c">Freight Charges - Transport A/c</option>
                  <option value="Purchase - Raw Materials 12%">Purchase - Raw Materials 12%</option>
                  <option value="IT Infrastructure Services">IT Infrastructure Services</option>
                  <option value="Electrical Machinery Purchase">Electrical Machinery Purchase</option>
                  <option value="Packing Material Expense">Packing Material Expense</option>
                </select>
              </div>
            </div>

            {/* Portal GSTR-2B Side-by-side Entry */}
            <div className="gstr2b-comparison-box">
              <h4>GSTR-2B Portal Entry Sync</h4>
              <div className="gstr-comparison-grid">
                <div>
                  <span className="lbl">Portal Reported Total:</span>
                  <span className="val">₹{item.grandTotal + 450}</span>
                </div>
                <div>
                  <span className="lbl">Supplier Filing Date:</span>
                  <span className="val">11th July 2026</span>
                </div>
                <div>
                  <span className="lbl">ITC Eligibility:</span>
                  <span className="val text-green">Eligible (Sec 16)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            <span>Cancel (Esc)</span>
          </button>

          <button className="btn btn-success" onClick={handleSave}>
            <Check style={{ width: 18, height: 18 }} />
            <span>Save &amp; Auto-Post to Tally Books</span>
          </button>
        </div>
      </div>
    </div>
  );
}
