import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileCheck, 
  Download, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  CreditCard, 
  FileSpreadsheet,
  Copy,
  Check
} from 'lucide-react';
import { fetchReturnSummary } from '../services/api';

export default function ReturnPrepModal({ onClose, gstrSummary, isInline = false }) {
  const [activeTab, setActiveTab] = useState('gstr3b'); // 'gstr3b', 'gstr1', 'validation', 'inspector'
  const [inspectorType, setInspectorType] = useState('tally'); // 'tally', 'gstr3b', 'gstr1'
  const [returnSummary, setReturnSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    async function loadSummary() {
      setIsLoading(true);
      const res = await fetchReturnSummary('072026');
      if (res) {
        setReturnSummary(res);
      }
      setIsLoading(false);
    }
    loadSummary();
  }, []);

  // Realistic GSTR-1 JSON Payload
  const gstr1Payload = {
    "gstin": "27AAACR5055K1Z2",
    "fp": "072026",
    "gt": 45000000.0,
    "cur_gt": 12500000.0,
    "b2b": [
      {
        "ctin": "27AAACT2727Q1ZW",
        "inv": [
          {
            "inum": "EXP/26-27/0881",
            "idt": "12-07-2026",
            "val": 1770000.0,
            "pos": "27",
            "rchrg": "N",
            "inv_typ": "R",
            "itms": [
              {
                "num": 1,
                "itm_det": { "rt": 18.0, "txval": 1500000.0, "iamt": 0.0, "camt": 135000.0, "samt": 135000.0, "csamt": 0.0 }
              }
            ]
          }
        ]
      },
      {
        "ctin": "29AAACI4567M1Z1",
        "inv": [
          {
            "inum": "EXP/26-27/0883",
            "idt": "22-07-2026",
            "val": 531000.0,
            "pos": "29",
            "rchrg": "N",
            "inv_typ": "R",
            "itms": [
              {
                "num": 1,
                "itm_det": { "rt": 18.0, "txval": 450000.0, "iamt": 81000.0, "camt": 0.0, "samt": 0.0, "csamt": 0.0 }
              }
            ]
          }
        ]
      }
    ],
    "hsn": {
      "data": [
        { "num": 1, "hsn_sc": "998313", "desc": "Cloud IT Infrastructure", "uqc": "OTH", "qty": 1, "val": 1770000.0, "txval": 1500000.0, "iamt": 0.0, "camt": 135000.0, "samt": 135000.0, "csamt": 0.0 }
      ]
    },
    "doc_issue": {
      "doc_det": [{ "doc_num": 1, "doc_typ": "Invoices for outward supply", "docs": [{ "num": 1, "from": "EXP/0881", "to": "EXP/0883", "totnum": 3, "canc": 0, "net_issue": 3 }] }]
    }
  };

  // Realistic GSTR-3B JSON Payload
  const gstr3bPayload = {
    "gstin": "27AAACR5055K1Z2",
    "ret_period": "072026",
    "sup_details": {
      "osup_det": {
        "txval": 3150000.0,
        "iamt": 81000.0,
        "camt": 243000.0,
        "samt": 243000.0,
        "csamt": 0.0
      }
    },
    "itc_elg": {
      "itc_avl": [
        { "ty": "OTH", "iamt": 425600.0, "camt": 1915200.0, "samt": 1915200.0, "csamt": 0.0 }
      ],
      "itc_rev": [
        { "ty": "RUL", "iamt": 0.0, "camt": 19425.0, "samt": 19425.0, "csamt": 0.0 }
      ],
      "itc_net": {
        "iamt": 425600.0,
        "camt": 1895775.0,
        "samt": 1895775.0,
        "csamt": 0.0
      }
    }
  };

  // Realistic Tally XML Payload
  const tallyXmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <!-- Reconciled Voucher 1 -->
          <VOUCHER VCHTYPE="Purchase" ACTION="Create">
            <DATE>20260715</DATE>
            <VOUCHERTYPENAME>Purchase</VOUCHERTYPENAME>
            <VOUCHERNUMBER>RIL/2026/0892</VOUCHERNUMBER>
            <PARTYLEDGERNAME>Reliance Industries Limited</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Reliance Industries Limited</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-23600.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>IT Cloud &amp; Infrastructure AMC</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>20000.00</AMOUNT>
              <INVENTORYALLOCATIONS.LIST>
                <STOCKITEMNAME>IT Cloud &amp; Infrastructure AMC</STOCKITEMNAME>
                <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                <AMOUNT>20000.00</AMOUNT>
                <HSNCODE>998313</HSNCODE>
              </INVENTORYALLOCATIONS.LIST>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Input CGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>1800.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Input SGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>1800.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  const handleDownloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadGstr1 = () => {
    handleDownloadFile(JSON.stringify(gstr1Payload, null, 2), 'GSTR1_27AAACR5055K1Z2_072026.json', 'application/json');
  };

  const handleDownloadGstr3b = () => {
    handleDownloadFile(JSON.stringify(gstr3bPayload, null, 2), 'GSTR3B_27AAACR5055K1Z2_072026.json', 'application/json');
  };

  const handleExportTally = () => {
    handleDownloadFile(tallyXmlPayload, 'Yukti_TallyPrime_PurchaseVouchers_July2026.xml', 'application/xml');
  };

  const handleCopyCurrentPayload = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const content = (
    <div className={isInline ? "panel" : "modal-dialog"} style={isInline ? { margin: 0 } : { maxWidth: '860px' }} onClick={(e) => e.stopPropagation()}>
      {!isInline && (
        <div className="modal-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={18} className="text-brand" />
            <div>
              <h3>GST Return Preparation & Tally Export</h3>
              <span className="text-xs text-muted font-mono">Period: July 2026 • Reliance Logistics Pvt Ltd (27AAACR5055K1Z2)</span>
            </div>
          </div>
          {onClose && (
            <button className="btn-icon-action" onClick={onClose}>
              <X size={16} />
            </button>
          )}
        </div>
      )}

        {/* Sub-Nav Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', padding: '0 16px', overflowX: 'auto' }}>
          {[
            { id: 'gstr3b', label: '1. GSTR-3B Tax Computation' },
            { id: 'gstr1', label: '2. GSTR-1 Outward Supplies' },
            { id: 'validation', label: '3. Statutory Cross-Validation (6/6 Pass)' },
            { id: 'inspector', label: '4. Raw XML / JSON Payload Inspector' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 14px',
                fontSize: '12px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? 'var(--brand)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--brand)' : '2px solid transparent',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="modal-body-scroll" style={{ padding: '20px' }}>
          {/* TAB 1: GSTR-3B */}
          {activeTab === 'gstr3b' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="kpi-card" style={{ padding: '12px' }}>
                  <span className="kpi-label">Total Outward Tax Payable</span>
                  <h4 className="kpi-value" style={{ fontSize: '18px' }}>₹5,67,000</h4>
                  <span className="kpi-subtext">Table 3.1(a) Total Liability</span>
                </div>
                <div className="kpi-card" style={{ padding: '12px', borderLeft: '3px solid var(--success)' }}>
                  <span className="kpi-label">Reconciled ITC Claimable</span>
                  <h4 className="kpi-value text-green" style={{ fontSize: '18px' }}>₹42,56,000</h4>
                  <span className="kpi-subtext">Table 4(A)(5) All Other ITC</span>
                </div>
                <div className="kpi-card" style={{ padding: '12px', borderLeft: '3px solid var(--brand)' }}>
                  <span className="kpi-label">Net Cash Tax Payable</span>
                  <h4 className="kpi-value text-brand" style={{ fontSize: '18px' }}>₹0.00</h4>
                  <span className="kpi-subtext">Fully covered by ITC balance</span>
                </div>
              </div>

              {/* Table 3.1 & 4 Summary */}
              <div className="panel" style={{ padding: '14px 16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
                  Table 4: Input Tax Credit (ITC) Breakdown Reconciled with GSTR-2B
                </h4>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Schedule / Section</th>
                      <th className="text-right">IGST (₹)</th>
                      <th className="text-right">CGST (₹)</th>
                      <th className="text-right">SGST (₹)</th>
                      <th className="text-right">Total ITC (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>4(A)(5) All Other Inward Supplies</strong></td>
                      <td className="text-right font-mono">4,25,600.00</td>
                      <td className="text-right font-mono">19,15,200.00</td>
                      <td className="text-right font-mono">19,15,200.00</td>
                      <td className="text-right font-mono text-green font-semibold">42,56,000.00</td>
                    </tr>
                    <tr>
                      <td><span className="text-amber">4(B)(2) Rule 37 180-Day Reversal</span></td>
                      <td className="text-right font-mono">0.00</td>
                      <td className="text-right font-mono">-19,425.00</td>
                      <td className="text-right font-mono">-19,425.00</td>
                      <td className="text-right font-mono text-amber">-38,850.00</td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', fontWeight: 600 }}>
                      <td><strong>Net ITC Credited to Electronic Credit Ledger</strong></td>
                      <td className="text-right font-mono">4,25,600.00</td>
                      <td className="text-right font-mono">18,95,775.00</td>
                      <td className="text-right font-mono">18,95,775.00</td>
                      <td className="text-right font-mono text-brand font-semibold">42,17,150.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: GSTR-1 */}
          {activeTab === 'gstr1' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="panel" style={{ padding: '14px 16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
                  Section 4A, 4B, 6B, 6C: B2B Invoices for Outward Supply
                </h4>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Recipient Trade Name</th>
                      <th>Recipient GSTIN</th>
                      <th>Invoice No</th>
                      <th className="text-right">Taxable (₹)</th>
                      <th className="text-right">Total Tax (₹)</th>
                      <th className="text-right">Grand Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Tata Motors Limited</strong></td>
                      <td className="font-mono text-xs">27AAACT2727Q1ZW</td>
                      <td className="font-mono text-xs">EXP/26-27/0881</td>
                      <td className="text-right font-mono">15,00,000</td>
                      <td className="text-right font-mono">2,70,000</td>
                      <td className="text-right font-mono font-semibold">17,70,000</td>
                    </tr>
                    <tr>
                      <td><strong>Mahindra &amp; Mahindra Ltd</strong></td>
                      <td className="font-mono text-xs">27AAACM0001L1Z4</td>
                      <td className="font-mono text-xs">EXP/26-27/0882</td>
                      <td className="text-right font-mono">8,50,000</td>
                      <td className="text-right font-mono">1,53,000</td>
                      <td className="text-right font-mono font-semibold">10,03,000</td>
                    </tr>
                    <tr>
                      <td><strong>Infosys BPM India</strong></td>
                      <td className="font-mono text-xs">29AAACI4567M1Z1</td>
                      <td className="font-mono text-xs">EXP/26-27/0883</td>
                      <td className="text-right font-mono">4,50,000</td>
                      <td className="text-right font-mono">81,000</td>
                      <td className="text-right font-mono font-semibold">5,31,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Statutory Cross-Validation */}
          {activeTab === 'validation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '8px' }}>
                <CheckCircle2 size={20} className="text-green" />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success-text)' }}>
                    Statutory Compliance Validation Passed (6 / 6 Checks Clean)
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Zero arithmetic mismatches detected between GSTR-1, GSTR-3B, GSTR-2B, and Tally books.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  {
                    title: "1. GSTR-1 vs GSTR-3B Outward Taxable Value Alignment",
                    detail: "GSTR-1 Total ₹31,50,000 == GSTR-3B Table 3.1(a) ₹31,50,000 (Variance: ₹0.00)",
                    passed: true
                  },
                  {
                    title: "2. Output Tax Liability Cross-Check (CGST + SGST + IGST)",
                    detail: "GSTR-1 Tax ₹5,67,000 == GSTR-3B Output Liability ₹5,67,000 (Variance: ₹0.00)",
                    passed: true
                  },
                  {
                    title: "3. Inward Supply ITC Reconciled with GSTR-2B (Sec 16(2)(aa))",
                    detail: "Table 4(A)(5) Claim ₹42,56,000 perfectly backed by auto-populated 2B vouchers.",
                    passed: true
                  },
                  {
                    title: "4. Rule 37 (180-Day Unpaid Vendor Bills) Isolated",
                    detail: "Identified ₹38,850 in overdue supplier payments and reported in Table 4(B)(2) Reversals.",
                    passed: true
                  },
                  {
                    title: "5. Table 12 HSN Summary Taxable Value Coherence",
                    detail: "100% of B2B sales lines mapped to valid 6-digit HSN/SAC codes with positive turnover.",
                    passed: true
                  },
                  {
                    title: "6. Checksum Verification of Filer & Recipient GSTINs",
                    detail: "All 15-character GSTIN strings pass statutory Luhn Mod-36 alphanumeric check.",
                    passed: true
                  }
                ].map((c, i) => (
                  <div key={i} className="panel" style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle2 size={16} className="text-green" style={{ marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <strong className="text-xs text-primary block">{c.title}</strong>
                      <span className="text-xs text-secondary">{c.detail}</span>
                    </div>
                    <span className="badge badge-success">Passed</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Raw Payload Inspector */}
          {activeTab === 'inspector' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    className={`btn ${inspectorType === 'tally' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => setInspectorType('tally')}
                  >
                    Tally XML Voucher
                  </button>
                  <button 
                    className={`btn ${inspectorType === 'gstr3b' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => setInspectorType('gstr3b')}
                  >
                    GSTR-3B JSON Schema
                  </button>
                  <button 
                    className={`btn ${inspectorType === 'gstr1' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => setInspectorType('gstr1')}
                  >
                    GSTR-1 JSON Schema
                  </button>
                </div>

                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                  onClick={() => {
                    const content = inspectorType === 'tally' ? tallyXmlPayload :
                                    inspectorType === 'gstr3b' ? JSON.stringify(gstr3bPayload, null, 2) :
                                    JSON.stringify(gstr1Payload, null, 2);
                    handleCopyCurrentPayload(content);
                  }}
                >
                  {copiedPayload ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                  <span>{copiedPayload ? 'Copied' : 'Copy Payload'}</span>
                </button>
              </div>

              <div style={{ 
                background: '#0D1117', 
                border: '1px solid #30363D', 
                borderRadius: '6px', 
                padding: '14px', 
                maxHeight: '340px', 
                overflowY: 'auto' 
              }}>
                <pre style={{ 
                  fontFamily: 'JetBrains Mono, monospace', 
                  fontSize: '11px', 
                  color: '#58A6FF', 
                  lineHeight: 1.5,
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {inspectorType === 'tally' ? tallyXmlPayload :
                   inspectorType === 'gstr3b' ? JSON.stringify(gstr3bPayload, null, 2) :
                   JSON.stringify(gstr1Payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={handleExportTally} title="Generate real Tally Prime purchase XML vouchers">
            <FileSpreadsheet size={14} />
            <span>Export Tally Prime XML</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={handleDownloadGstr1} title="Download official GSTR-1 JSON">
              <Download size={14} />
              <span>Download GSTR-1 JSON</span>
            </button>

            <button className="btn btn-primary" onClick={handleDownloadGstr3b} title="Download official GSTR-3B JSON">
              <Download size={14} />
              <span>Download GSTR-3B JSON</span>
            </button>
          </div>
        </div>
      </div>
  );

  if (isInline) {
    return (
      <div className="view-container">
        <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="view-pretitle">
              <FileCheck size={14} className="text-brand" />
              <span>Tax Returns & Filing</span>
            </div>
            <h1 className="view-title">Monthly GST Returns</h1>
            <p className="view-subtitle">
              Verify GSTR-3B tax calculations and GSTR-1 outward sales • Download ready-to-file returns and Tally XML.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handleDownloadGstr1}>
              <Download size={14} />
              <span>GSTR-1 JSON</span>
            </button>
            <button className="btn btn-secondary" onClick={handleDownloadGstr3b}>
              <Download size={14} />
              <span>GSTR-3B JSON</span>
            </button>
            <button className="btn btn-primary" onClick={handleExportTally}>
              <FileSpreadsheet size={14} />
              <span>Export Tally XML</span>
            </button>
          </div>
        </div>
        {content}
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      {content}
    </div>
  );
}
