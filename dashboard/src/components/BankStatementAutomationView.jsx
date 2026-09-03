import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Download, 
  FileSpreadsheet, 
  ShieldCheck, 
  Filter, 
  Search, 
  FileText, 
  RefreshCw,
  Landmark,
  CreditCard,
  Layers,
  Check,
  Edit2
} from 'lucide-react';
import { BANK_TRANSACTIONS } from '../data/mockData';

export default function BankStatementAutomationView({ onShowToast }) {
  const [transactions, setTransactions] = useState(BANK_TRANSACTIONS);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank Current Account #9812');
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Summary Metrics
  const totalWithdrawals = transactions.reduce((acc, t) => acc + (t.withdrawal || 0), 0);
  const totalDeposits = transactions.reduce((acc, t) => acc + (t.deposit || 0), 0);
  const rule37Transactions = transactions.filter(t => t.rule37Settled);
  const totalItcProtected = rule37Transactions.reduce((acc, t) => acc + (t.itcProtected || 0), 0);
  const paymentCount = transactions.filter(t => t.voucherType === 'Payment').length;
  const receiptCount = transactions.filter(t => t.voucherType === 'Receipt').length;
  const contraCount = transactions.filter(t => t.voucherType === 'Contra').length;

  // Filter & Search
  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = 
      filterType === 'ALL' ? true :
      filterType === 'PAYMENT' ? t.voucherType === 'Payment' :
      filterType === 'RECEIPT' ? t.voucherType === 'Receipt' :
      filterType === 'CONTRA' ? t.voucherType === 'Contra' :
      filterType === 'RULE37' ? t.rule37Settled : true;

    const matchesSearch = 
      (t.narration || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.counterparty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.suggestedLedger || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.matchedInvoiceNo || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleSimulateUpload = () => {
    setIsLoadingSample(true);
    setTimeout(() => {
      setTransactions(BANK_TRANSACTIONS);
      setIsLoadingSample(false);
      if (onShowToast) {
        onShowToast("HDFC Bank statement parsed: 15 transactions auto-mapped with 4 Rule 37 linkages.");
      }
    }, 800);
  };

  const handleUpdateVoucherType = (id, newType) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, voucherType: newType } : t));
  };

  const handleUpdateLedger = (id, newLedger) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, suggestedLedger: newLedger } : t));
    setEditingId(null);
  };

  const handleExportTallyXml = () => {
    // Generate valid Tally Prime XML for all filtered or all transactions
    const fmt = (v) => Number(v || 0).toFixed(2);
    const tallyDate = (d) => String(d || '20260715').replace(/[-/]/g, '');

    const xmlVouchers = transactions.map((t, idx) => {
      const vDate = tallyDate(t.date);
      const vNum = t.chqRef || `BNK/${vDate}/${idx + 1}`;
      const vType = t.voucherType;
      const amt = t.withdrawal > 0 ? t.withdrawal : t.deposit;
      const partyLedger = t.suggestedLedger || t.counterparty;
      const billRef = t.matchedInvoiceNo;

      if (vType === 'Payment') {
        return `
        <VOUCHER VCHTYPE="Payment" ACTION="Create">
          <DATE>${vDate}</DATE>
          <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${vNum}</VOUCHERNUMBER>
          <PARTYLEDGERNAME>${partyLedger}</PARTYLEDGERNAME>
          <NARRATION>${t.narration}</NARRATION>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${partyLedger}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <AMOUNT>-${fmt(amt)}</AMOUNT>
            ${billRef ? `
            <BILLALLOCATIONS.LIST>
              <NAME>${billRef}</NAME>
              <BILLTYPE>Agst Ref</BILLTYPE>
              <AMOUNT>-${fmt(amt)}</AMOUNT>
            </BILLALLOCATIONS.LIST>` : ''}
          </ALLLEDGERENTRIES.LIST>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${selectedBank}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${fmt(amt)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
        </VOUCHER>`;
      } else if (vType === 'Receipt') {
        return `
        <VOUCHER VCHTYPE="Receipt" ACTION="Create">
          <DATE>${vDate}</DATE>
          <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${vNum}</VOUCHERNUMBER>
          <PARTYLEDGERNAME>${partyLedger}</PARTYLEDGERNAME>
          <NARRATION>${t.narration}</NARRATION>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${selectedBank}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <AMOUNT>-${fmt(amt)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${partyLedger}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${fmt(amt)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
        </VOUCHER>`;
      } else {
        // Contra
        const isWdl = t.withdrawal > 0;
        return `
        <VOUCHER VCHTYPE="Contra" ACTION="Create">
          <DATE>${vDate}</DATE>
          <VOUCHERTYPENAME>Contra</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${vNum}</VOUCHERNUMBER>
          <PARTYLEDGERNAME>${selectedBank}</PARTYLEDGERNAME>
          <NARRATION>${t.narration}</NARRATION>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${isWdl ? partyLedger : selectedBank}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <AMOUNT>-${fmt(amt)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${isWdl ? selectedBank : partyLedger}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${fmt(amt)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
        </VOUCHER>`;
      }
    }).join('\n');

    const xmlEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
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
          ${xmlVouchers}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    const blob = new Blob([xmlEnvelope], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Yukti_Tally_Bank_Vouchers_July2026.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onShowToast) onShowToast("Downloaded valid Tally Prime Bank Vouchers XML.");
  };

  const handleExportCsv = () => {
    const headers = ["ID", "Date", "Narration", "Chq/Ref No", "Withdrawal (₹)", "Deposit (₹)", "Balance (₹)", "Counterparty", "Voucher Type", "Tally Ledger Head", "Rule 37 Linkage", "Matched Invoice No", "Protected ITC (₹)"];
    const rows = transactions.map(t => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.narration.replace(/"/g, '""')}"`,
      `"${t.chqRef}"`,
      t.withdrawal || 0,
      t.deposit || 0,
      t.balance || 0,
      `"${t.counterparty}"`,
      `"${t.voucherType}"`,
      `"${t.suggestedLedger}"`,
      t.rule37Settled ? "YES" : "NO",
      `"${t.matchedInvoiceNo || ''}"`,
      t.itcProtected || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Yukti_Bank_Statement_Reconciliation_July2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="view-container">
      {/* View Header with Plain English */}
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="view-pretitle">
            <Landmark size={14} className="text-brand" />
            <span>Bank Data Automation</span>
          </div>
          <h1 className="view-title">Bank Statements to Tally</h1>
          <p className="view-subtitle">
            Turn bank statement PDFs into Tally vouchers in seconds and verify vendor payments on time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary"
            onClick={handleSimulateUpload}
            disabled={isLoadingSample}
            style={{ borderColor: 'var(--brand)', color: 'var(--brand)', background: 'var(--brand-light)', fontWeight: 600 }}
          >
            {isLoadingSample ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
            <span>⚡ Load HDFC Demo</span>
          </button>

          <button className="btn btn-secondary" onClick={handleExportCsv}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button className="btn btn-primary" onClick={handleExportTallyXml} title="Export verified Payment, Receipt, and Contra vouchers into Tally Prime">
            <FileSpreadsheet size={14} />
            <span>Export Tally Bank XML</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '3px solid var(--brand)' }}>
          <div className="kpi-icon-wrapper text-brand"><CreditCard size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Payments (Money Out)</span>
            <h3 className="kpi-value">₹{(totalWithdrawals / 100000).toFixed(2)}L</h3>
            <span className="kpi-subtext"><strong>{paymentCount}</strong> Payments + <strong>{contraCount}</strong> Cash</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div className="kpi-icon-wrapper text-green"><CheckCircle2 size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Receipts (Money In)</span>
            <h3 className="kpi-value text-green">₹{(totalDeposits / 100000).toFixed(2)}L</h3>
            <span className="kpi-subtext"><strong>{receiptCount}</strong> Customer Receipts</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid #10B981' }}>
          <div className="kpi-icon-wrapper text-green"><ShieldCheck size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Rule 37 Tax Shield</span>
            <h3 className="kpi-value text-green">₹{(totalItcProtected / 1000).toFixed(1)}k</h3>
            <span className="kpi-subtext font-mono text-green"><strong>{rule37Transactions.length}</strong> supplier bills paid &lt; 180 days</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div className="kpi-icon-wrapper text-amber"><Sparkles size={18} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Auto-Mapped to Tally</span>
            <h3 className="kpi-value">97.4%</h3>
            <span className="kpi-subtext">Zero-touch ledger mapping</span>
          </div>
        </div>
      </div>

      {/* Main Transactions Panel (Directly Visible) */}
      <div className="panel">
        {/* Filter Pills, Account Info & Search */}
        <div className="panel-toolbar flex-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'ALL', label: `All (${transactions.length})` },
                { id: 'PAYMENT', label: `Payments (${paymentCount})` },
                { id: 'RECEIPT', label: `Receipts (${receiptCount})` },
                { id: 'CONTRA', label: `Cash (${contraCount})` },
                { id: 'RULE37', label: `Rule 37 Safe (${rule37Transactions.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`btn btn-secondary ${filterType === tab.id ? 'bg-subtle font-semibold border-brand text-brand' : ''}`}
                  style={filterType === tab.id ? { borderColor: 'var(--brand)', color: 'var(--brand)', backgroundColor: 'var(--brand-light)' } : {}}
                  onClick={() => setFilterType(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="badge badge-success font-mono" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} /> ₹{(totalItcProtected / 1000).toFixed(1)}k Tax Credit Safe
            </span>
          </div>

          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search narration, party, invoice ref..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '85px' }}>Date</th>
                <th>Bank Narration / Description</th>
                <th className="text-right" style={{ width: '110px' }}>Withdrawal (₹)</th>
                <th className="text-right" style={{ width: '110px' }}>Deposit (₹)</th>
                <th style={{ width: '95px' }}>Type</th>
                <th>Suggested Tally Ledger</th>
                <th style={{ width: '160px' }}>Rule 37 Statutory Link</th>
                <th style={{ width: '80px' }} className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(txn => (
                <tr key={txn.id}>
                  <td className="font-mono text-xs text-secondary">{txn.date}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                      {txn.counterparty}
                    </div>
                    <div className="font-mono text-muted" style={{ fontSize: '10px', marginTop: '2px' }}>
                      {txn.narration}
                    </div>
                  </td>
                  <td className="text-right font-mono font-semibold" style={{ color: txn.withdrawal > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {txn.withdrawal > 0 ? `-₹${txn.withdrawal.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="text-right font-mono font-semibold" style={{ color: txn.deposit > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                    {txn.deposit > 0 ? `+₹${txn.deposit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td>
                    <select
                      value={txn.voucherType}
                      onChange={(e) => handleUpdateVoucherType(txn.id, e.target.value)}
                      style={{
                        padding: '3px 6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 
                          txn.voucherType === 'Payment' ? 'rgba(239, 68, 68, 0.08)' :
                          txn.voucherType === 'Receipt' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                        color:
                          txn.voucherType === 'Payment' ? '#991B1B' :
                          txn.voucherType === 'Receipt' ? '#065F46' : '#1E40AF'
                      }}
                    >
                      <option value="Payment">Payment</option>
                      <option value="Receipt">Receipt</option>
                      <option value="Contra">Contra</option>
                    </select>
                  </td>
                  <td>
                    {editingId === txn.id ? (
                      <input 
                        type="text" 
                        defaultValue={txn.suggestedLedger} 
                        onBlur={(e) => handleUpdateLedger(txn.id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateLedger(txn.id, e.target.value)}
                        autoFocus
                        style={{ fontSize: '11px', padding: '2px 6px', width: '100%', border: '1px solid var(--brand)', borderRadius: '4px' }}
                      />
                    ) : (
                      <div 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                        onClick={() => setEditingId(txn.id)}
                        title="Click to edit Tally ledger"
                      >
                        <span className="text-xs font-medium text-primary">{txn.suggestedLedger}</span>
                        <Edit2 size={10} className="text-muted" style={{ opacity: 0.6 }} />
                      </div>
                    )}
                  </td>
                  <td>
                    {txn.rule37Settled ? (
                      <div>
                        <span className="badge badge-success font-mono" style={{ fontSize: '10px' }}>
                          ✓ Agst Ref #{txn.matchedInvoiceNo}
                        </span>
                        <div className="text-green font-mono" style={{ fontSize: '10px', marginTop: '2px' }}>
                          +₹{txn.itcProtected.toLocaleString('en-IN')} ITC Safe
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted font-mono">-</span>
                    )}
                  </td>
                  <td className="text-right">
                    <button 
                      className="btn-icon-action" 
                      onClick={() => onShowToast?.(`Voucher #${txn.chqRef} approved for Tally sync.`)}
                      title="Approve & Lock Voucher"
                    >
                      <Check size={14} className="text-brand" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>Showing {filteredTransactions.length} of {transactions.length} statement rows</span>
          <span className="font-mono text-xs">Bank Ledger: {selectedBank}</span>
        </div>
      </div>
    </div>
  );
}
