import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  BookOpen, 
  Building2,
  Calendar,
  IndianRupee
} from 'lucide-react';
import VendorPatternBanner from './VendorPatternBanner';

export default function DocumentInspectorModal({ 
  item, 
  onClose, 
  onSaveAndPost,
  vendorPattern = null
}) {
  if (!item) return null;

  const [supplierName, setSupplierName] = useState(item.supplierName || '');
  const [supplierGstin, setSupplierGstin] = useState(item.supplierGstin || '');
  const [invoiceNo, setInvoiceNo] = useState(item.invoiceNo || '');
  const [invoiceDate, setInvoiceDate] = useState(item.invoiceDate || '');
  const [taxableValue, setTaxableValue] = useState(item.taxableValue || 0);
  const [cgst, setCgst] = useState(item.cgst || 0);
  const [sgst, setSgst] = useState(item.sgst || 0);
  const [igst, setIgst] = useState(item.igst || 0);
  const [grandTotal, setGrandTotal] = useState(item.grandTotal || 0);
  const [ledger, setLedger] = useState(item.suggestedLedger || '');
  const [hsnCode, setHsnCode] = useState(item.hsnCode || '847130');
  const [saveAsVendorRule, setSaveAsVendorRule] = useState(true);

  // Recalculate tax & total when values change
  const handleTaxableChange = (val) => {
    const num = parseFloat(val) || 0;
    setTaxableValue(num);
    if (item.supplyType === 'INTERSTATE') {
      const newIgst = Math.round(num * 0.05); // default 5% for interstate demo or keep proportional
      setIgst(newIgst);
      setGrandTotal(num + newIgst);
    } else {
      const newCgst = Math.round(num * 0.09);
      const newSgst = Math.round(num * 0.09);
      setCgst(newCgst);
      setSgst(newSgst);
      setGrandTotal(num + newCgst + newSgst);
    }
  };

  const handleSave = () => {
    onSaveAndPost({
      ...item,
      supplierName,
      supplierGstin,
      invoiceNo,
      invoiceDate,
      taxableValue: parseFloat(taxableValue) || 0,
      cgst: parseFloat(cgst) || 0,
      sgst: parseFloat(sgst) || 0,
      igst: parseFloat(igst) || 0,
      grandTotal: parseFloat(grandTotal) || 0,
      suggestedLedger: ledger,
      hsnCode,
    }, saveAsVendorRule);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-bar">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-brand" />
            <div>
              <h3>Side-by-Side Document Inspection</h3>
              <span className="text-xs text-muted">
                Invoice #{invoiceNo} • {supplierName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`badge ${
              item.confidenceScore >= 90 ? 'badge-success' :
              item.confidenceScore >= 75 ? 'badge-warning' : 'badge-danger'
            }`}>
              AI Confidence: {item.confidenceScore}%
            </span>
            <button className="btn-icon-action" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body-scroll" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
          {/* Left Panel: Simulated Source Document Graphic */}
          <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', overflowY: 'auto' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '20px', boxShadow: 'var(--shadow-xs)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, right: 14, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                TAX INVOICE
              </div>

              {/* Vendor Header */}
              <div style={{ marginBottom: '14px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {supplierName || "SUPPLIER NAME"}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Plot 45, MIDC Industrial Area, Andheri East, Mumbai 400093
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
                  GSTIN: <strong>{supplierGstin}</strong>
                </p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color)', margin: '12px 0' }} />

              {/* Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px', fontSize: '11px' }}>
                <div>
                  <span className="text-muted block text-xs">Customer:</span>
                  <strong className="text-primary">{item.customerName}</strong>
                </div>
                <div>
                  <span className="text-muted block text-xs">Invoice No:</span>
                  <strong className="text-primary font-mono">{invoiceNo}</strong>
                </div>
                <div>
                  <span className="text-muted block text-xs">Date:</span>
                  <strong className="text-primary">{invoiceDate}</strong>
                </div>
              </div>

              {/* Items Table Mockup */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px', fontSize: '11px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '6px 10px', backgroundColor: 'var(--bg-subtle)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <span>Description</span>
                  <span>HSN</span>
                  <span className="text-right">Rate</span>
                  <span className="text-right">Taxable</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '8px 10px', borderTop: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  <span>{item.suggestedLedger || "Product / Services"}</span>
                  <span className="font-mono">{hsnCode}</span>
                  <span className="text-right">18%</span>
                  <span className="text-right font-mono">₹{taxableValue?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Totals Summary */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Taxable Value:</span>
                  <span className="font-mono">₹{taxableValue?.toLocaleString('en-IN')}</span>
                </div>
                {cgst > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>CGST (9%):</span>
                    <span className="font-mono">₹{cgst?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sgst > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>SGST (9%):</span>
                    <span className="font-mono">₹{sgst?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {igst > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>IGST (5%):</span>
                    <span className="font-mono">₹{igst?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px', color: 'var(--brand)', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                  <span>Grand Total:</span>
                  <span className="font-mono">₹{grandTotal?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Editable Extraction Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Vendor Pattern Banner */}
            {vendorPattern && <VendorPatternBanner pattern={vendorPattern} />}

            <div className="form-grid">
              <div className="form-group col-span-2">
                <label className="form-label">Supplier / Vendor Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={supplierName} 
                  onChange={(e) => setSupplierName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supplier GSTIN</label>
                <input 
                  type="text" 
                  className="form-input font-mono uppercase" 
                  value={supplierGstin} 
                  onChange={(e) => setSupplierGstin(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Invoice Number</label>
                <input 
                  type="text" 
                  className="form-input font-mono" 
                  value={invoiceNo} 
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Invoice Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={invoiceDate} 
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">HSN / SAC Code</label>
                <input 
                  type="text" 
                  className="form-input font-mono" 
                  value={hsnCode} 
                  onChange={(e) => setHsnCode(e.target.value)}
                />
              </div>

              <div className="form-group col-span-2">
                <label className="form-label">Suggested Tally Purchase Ledger Head</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={ledger} 
                  onChange={(e) => setLedger(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Taxable Value (₹)</label>
                <input 
                  type="number" 
                  className="form-input font-mono" 
                  value={taxableValue} 
                  onChange={(e) => handleTaxableChange(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Grand Total (₹)</label>
                <input 
                  type="number" 
                  className="form-input font-mono font-semibold" 
                  value={grandTotal} 
                  onChange={(e) => setGrandTotal(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Vendor Learning Checkbox (Rillet-style) */}
            <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                id="saveRuleCheck" 
                checked={saveAsVendorRule}
                onChange={(e) => setSaveAsVendorRule(e.target.checked)}
                style={{ accentColor: 'var(--brand)' }}
              />
              <label htmlFor="saveRuleCheck" style={{ fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <strong>Save as Vendor Intelligence Rule:</strong> Auto-apply this Tally ledger & format to future invoices from <code>{supplierGstin}</code>.
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer-bar">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Check size={14} />
            <span>Save & Auto-Post to Tally</span>
          </button>
        </div>
      </div>
    </div>
  );
}
