export const FIRM_INFO = {
  name: "Rajnish & Associates CA Firm",
  location: "Mumbai, Maharashtra",
  activePeriod: "July 2026",
  totalClients: 8,
  activeSeason: "GSTR-3B Hard-Lock Period",
  principalCA: "CA Rajnish Sharma, FCA",
  firmGstin: "27AAAFR1234A1Z0"
};

export const GLOBAL_STATS = {
  totalInvoices: 1248,
  autoPosted: 1051,
  autoPostedPct: 84.2,
  pendingReview: 8,
  criticalExceptions: 2,
  totalITCRisk: 472500,
  itcSavedThisMonth: 1245000,
  reconciledCount: 1198,
  matchRate: 96.0,
  hoursSavedToday: "3h 42m",
  hoursSavedThisMonth: 126,
  manualReviewsAvoided: 126
};

export const TODAY_BRIEFING = {
  greeting: "Good morning, Rajnish.",
  headline: "Yukti handled 87% of routine work overnight.",
  decisionsNeededCount: 6,
  summaryBadges: [
    { label: "Yukti Saved Today", value: "3h 42m", tone: "green" },
    { label: "Hours Saved This Month", value: "126 hrs", tone: "brand" },
    { label: "Auto-Resolved Overnight", value: "842 records", tone: "blue" },
    { label: "Tax Credit Protected", value: "₹12.45L", tone: "green" }
  ],
  criticalDecisions: [
    {
      id: "dec_itc_reliance",
      severity: "CRITICAL",
      client: "Reliance Logistics Pvt Ltd",
      clientId: "c1",
      title: "₹38,850 ITC at risk",
      subtitle: "50 supplier invoices missing in GSTR-2B",
      whyMatters: "₹38,850 of input tax credit will be permanently blocked if unfiled prior to the 20th August 3B reconciliation cutoff.",
      recommendation: "Dispatch Section 16(2)(aa) statutory reminder to 50 delinquent suppliers via WhatsApp & Email.",
      confidence: 96,
      exposure: 38850,
      evidence: [
        "50 supplier purchase bills unfiled on portal",
        "Rule 37 180-day interest exposure: ₹6,993",
        "Last GSTN Portal Sync: 08:42 AM IST"
      ],
      actionLabel: "Review & Dispatch Notices",
      actionType: "supplier_followup"
    },
    {
      id: "dec_tax_tcs",
      severity: "HIGH",
      client: "Metro Tech Solutions LLP",
      clientId: "c3",
      title: "Tax classification variance (18% vs 12%)",
      subtitle: "Tata Consultancy Services Ltd • Inv #TCS/2026/891",
      whyMatters: "Books state ₹2,83,200 (18% GST), whereas GST-2B reflects ₹2,91,600 (rate variance of ₹8,400). Potential incorrect HSN mapping on vendor side.",
      recommendation: "Inspect GST classification against learned vendor pattern #18 and apply rate override.",
      confidence: 93,
      exposure: 8400,
      evidence: [
        "Books: ₹2,83,200 (18% GST)",
        "GSTR-2B: ₹2,91,600 (Tax difference: ₹8,400)",
        "Learned vendor pattern #18 indicates 18% standard rate"
      ],
      actionLabel: "Inspect Classification",
      actionType: "inspect_queue"
    },
    {
      id: "dec_anomaly_bharat",
      severity: "HIGH",
      client: "Bharat Agro Foods Ltd",
      clientId: "c8",
      title: "Unusual vendor amount spike (4.3× normal)",
      subtitle: "Reliance Industries • Inv #RIL/26-27/0991",
      whyMatters: "This month's invoice is ₹1.42L vs historical vendor average of ₹18k–₹42k. Possible bulk packaging order or digit error.",
      recommendation: "Request confirmation from client accounts lead before posting to Tally.",
      confidence: 88,
      exposure: 142000,
      evidence: [
        "Historical range: ₹18,000 – ₹42,000",
        "Current bill: ₹1,42,000 (4.3× standard)",
        "HSN 998313 verified"
      ],
      actionLabel: "Verify Anomaly",
      actionType: "inspect_queue"
    }
  ],
  readyApprovals: {
    count: 4,
    totalAmount: 842000,
    label: "4 verified invoices ready for posting",
    detail: "Zero arithmetic discrepancies, 99.1% average confidence score, pre-matched against Tally Chart of Accounts.",
    actionLabel: "Approve & Post All (4)"
  },
  deadlines: [
    {
      client: "Apex General Traders",
      type: "GSTR-1 Monthly",
      due: "11 Aug 2026",
      status: "Overdue (2 Days)",
      urgency: "HIGH"
    },
    {
      client: "Sunrise Heavy Engineering",
      type: "GSTR-1 Monthly",
      due: "11 Aug 2026",
      status: "Overdue (2 Days)",
      urgency: "HIGH"
    },
    {
      client: "Reliance Logistics Pvt Ltd",
      type: "GSTR-3B Monthly",
      due: "20 Aug 2026",
      status: "Due in 7 Days",
      urgency: "MEDIUM"
    }
  ],
  handledOvernight: [
    { metric: "1,051 invoices", desc: "auto-processed & posted into Tally Prime without human typing" },
    { metric: "842 reconciliations", desc: "resolved across 3-way match (exact matches + rounding tolerances under ₹50)" },
    { metric: "19 routine anomalies", desc: "dismissed automatically using firm-approved confidence thresholds" },
    { metric: "142 vendor patterns", desc: "verified against historical accounting books" }
  ]
};

export const CLIENTS = [
  {
    id: "c1",
    name: "Reliance Logistics Pvt Ltd",
    gstin: "27AAACR5055K1Z2",
    category: "B2B Logistics & Freight",
    invoicesCount: 342,
    autoPostedPct: 91.5,
    itcAtRisk: 124000,
    status: "GSTR-1 Ready",
    gstr1Status: "Filed",
    gstr3bStatus: "Draft",
    pendingExceptions: 1,
    nextDeadline: "20 Aug 2026",
    unclaimedITC: 124000,
    primaryContact: "Anand Verma (+91 98200 11223)",
    turnoverBracket: "₹25Cr - ₹50Cr",
    healthScore: 87,
    healthBreakdown: { hygiene: 94, recon: 96, compliance: 82, risk: 72, completeness: 91 },
    healthDelta: "Decreased 6 pts this month due to 50 missing supplier 2B bills",
    recommendation: "Resolve 50 missing 2B supplier invoices before 20th August GSTR-3B hard-lock.",
    topIssues: [
      "₹38,850 ITC exposure from unfiled supplier returns",
      "50 invoices missing on GSTN portal",
      "2 vendor tax-rate variances flagged vs historical baseline"
    ]
  },
  {
    id: "c2",
    name: "Apex General Traders",
    gstin: "27AAAAA1234B1Z5",
    category: "Wholesale FMCG Distribution",
    invoicesCount: 189,
    autoPostedPct: 82.0,
    itcAtRisk: 88500,
    status: "Mismatches Open",
    gstr1Status: "Draft",
    gstr3bStatus: "Overdue",
    pendingExceptions: 3,
    nextDeadline: "11 Aug 2026",
    unclaimedITC: 88500,
    primaryContact: "Deepak Mehta (+91 98211 44556)",
    turnoverBracket: "₹10Cr - ₹25Cr",
    healthScore: 68,
    healthBreakdown: { hygiene: 72, recon: 65, compliance: 60, risk: 58, completeness: 85 },
    healthDelta: "Decreased 14 pts due to overdue GSTR-1 and 3 critical mismatches",
    recommendation: "Approve 3 critical math mismatches and file overdue GSTR-1 immediately.",
    topIssues: [
      "GSTR-1 filing overdue by 2 days",
      "₹88,500 total ITC discrepancy in FMCG supplier bills",
      "Rule 37 180-day reversal warning on Apex Fasteners"
    ]
  },
  {
    id: "c3",
    name: "Metro Tech Solutions LLP",
    gstin: "27AAACM9876C1Z8",
    category: "IT & Cloud Consulting",
    invoicesCount: 94,
    autoPostedPct: 88.3,
    itcAtRisk: 42000,
    status: "GSTR-3B Pending",
    gstr1Status: "Filed",
    gstr3bStatus: "Draft",
    pendingExceptions: 1,
    nextDeadline: "20 Aug 2026",
    unclaimedITC: 42000,
    primaryContact: "Rohit Kulkarni (+91 99300 77889)",
    turnoverBracket: "₹5Cr - ₹10Cr",
    healthScore: 84,
    healthBreakdown: { hygiene: 90, recon: 88, compliance: 86, risk: 75, completeness: 92 },
    healthDelta: "Stable (+2 pts) with GSTR-1 filed clean",
    recommendation: "Review Tata Consultancy tax rate variance of ₹8,400 to finalize 3B return.",
    topIssues: [
      "Tax rate classification variance (18% vs 12%) on software AMC",
      "Export of services zero-rated documentation pending LUT verification",
      "1 unmapped consulting vendor ledger head"
    ]
  },
  {
    id: "c4",
    name: "Sunrise Heavy Engineering",
    gstin: "27AAACS4321D1Z1",
    category: "Industrial Manufacturing",
    invoicesCount: 215,
    autoPostedPct: 79.1,
    itcAtRisk: 165000,
    status: "Mismatches Open",
    gstr1Status: "Overdue",
    gstr3bStatus: "Overdue",
    pendingExceptions: 2,
    nextDeadline: "11 Aug 2026",
    unclaimedITC: 165000,
    primaryContact: "Sanjay Gupta (+91 98199 66778)",
    turnoverBracket: "₹15Cr - ₹30Cr",
    healthScore: 62,
    healthBreakdown: { hygiene: 65, recon: 60, compliance: 55, risk: 50, completeness: 80 },
    healthDelta: "Decreased 18 pts due to dual overdue returns and ₹1.65L credit exposure",
    recommendation: "Immediate intervention: clear raw material yarn mismatches and file GSTR-1.",
    topIssues: [
      "Both GSTR-1 and GSTR-3B overdue",
      "₹1,65,000 ITC at risk on Vardhman Textiles interstate purchase",
      "E-Invoicing validation failed on 4 outbound export invoices"
    ]
  },
  {
    id: "c5",
    name: "BlueSky Retails & Distribution",
    gstin: "27AAACB5678E1Z9",
    category: "Multi-Brand Retail Chain",
    invoicesCount: 120,
    autoPostedPct: 85.0,
    itcAtRisk: 53000,
    status: "Ready for Filing",
    gstr1Status: "Filed",
    gstr3bStatus: "Filed",
    pendingExceptions: 0,
    nextDeadline: "20 Sep 2026",
    unclaimedITC: 53000,
    primaryContact: "Priya Nair (+91 98205 33445)",
    turnoverBracket: "₹8Cr - ₹15Cr",
    healthScore: 95,
    healthBreakdown: { hygiene: 98, recon: 96, compliance: 95, risk: 92, completeness: 95 },
    healthDelta: "Increased 8 pts: all July returns successfully filed with zero exceptions",
    recommendation: "Maintain automated ingestion; prepare preliminary September data sync.",
    topIssues: [
      "Verify RCM applicability for BlueSky Logistics GTA payments",
      "Minor bank charges ₹1,416 auto-categorized",
      "Periodic ledger reconciliation due 15 Aug"
    ]
  },
  {
    id: "c6",
    name: "Kalyani Industrial Gases Ltd",
    gstin: "27AABCK2389P1ZM",
    category: "Industrial Gases & Chemicals",
    invoicesCount: 142,
    autoPostedPct: 86.4,
    itcAtRisk: 24500,
    status: "GSTR-1 Ready",
    gstr1Status: "Draft",
    gstr3bStatus: "Pending Recon",
    pendingExceptions: 1,
    nextDeadline: "20 Aug 2026",
    unclaimedITC: 24500,
    primaryContact: "Vikram Kalyani (+91 98220 55667)",
    turnoverBracket: "₹12Cr - ₹20Cr",
    healthScore: 81,
    healthBreakdown: { hygiene: 85, recon: 83, compliance: 80, risk: 78, completeness: 88 },
    healthDelta: "Stable: near-match rounding difference of ₹18 auto-approved",
    recommendation: "Submit GSTR-1 draft and perform final 2B bank reconciliation.",
    topIssues: [
      "Rounding difference of ₹18 settled within 0.01% tolerance",
      "Reverse charge mechanism (RCM) check strictly false verified",
      "Bank statement auto-settled against invoice #10492"
    ]
  },
  {
    id: "c7",
    name: "Vardhman Polytex Mills",
    gstin: "24AAACV1234A1Z1",
    category: "Textiles & Synthetic Yarn",
    invoicesCount: 98,
    autoPostedPct: 94.0,
    itcAtRisk: 0,
    status: "Reconciled Clean",
    gstr1Status: "Filed",
    gstr3bStatus: "Filed",
    pendingExceptions: 0,
    nextDeadline: "20 Sep 2026",
    unclaimedITC: 0,
    primaryContact: "Ramesh Oswal (+91 98140 11224)",
    turnoverBracket: "₹18Cr - ₹35Cr",
    healthScore: 98,
    healthBreakdown: { hygiene: 99, recon: 100, compliance: 98, risk: 97, completeness: 98 },
    healthDelta: "Top practice benchmark: 100% clean 3-way reconciliation",
    recommendation: "No CA action needed. Books & portal perfectly aligned.",
    topIssues: [
      "Zero exceptions across 98 monthly vouchers",
      "100% eligible ITC claimed without scrutiny flags",
      "Tally integration fully synced"
    ]
  },
  {
    id: "c8",
    name: "Bharat Agro Foods Ltd",
    gstin: "27AAACB9999P1Z3",
    category: "Agro & Food Processing",
    invoicesCount: 110,
    autoPostedPct: 87.5,
    itcAtRisk: 31000,
    status: "Pending Recon",
    gstr1Status: "Ready to Review",
    gstr3bStatus: "Pending Recon",
    pendingExceptions: 1,
    nextDeadline: "20 Aug 2026",
    unclaimedITC: 31000,
    primaryContact: "Manoj Deshmukh (+91 98230 44551)",
    turnoverBracket: "₹15Cr - ₹30Cr",
    healthScore: 79,
    healthBreakdown: { hygiene: 82, recon: 78, compliance: 80, risk: 71, completeness: 85 },
    healthDelta: "Flagged: anomaly detected on high-value purchase bill",
    recommendation: "Inspect 4.3× normal invoice anomaly before booking purchase voucher.",
    topIssues: [
      "Sudden spike invoice (₹1.42L vs ₹32k baseline)",
      "Unmatched portal invoice on packaging materials",
      "Bank settlement pending 15-day clearance window"
    ]
  }
];

export const SEED_VENDOR_PATTERNS = [
  {
    supplierGstin: "27AAACR5055K1Z2",
    supplierName: "Reliance Industries Limited",
    defaultLedger: "IT Cloud & Network Infrastructure",
    defaultGstRate: 18.0,
    hsnOverride: "998313",
    dateFormatHint: "YYYY-MM-DD",
    invoiceRegex: "^RIL/[0-9]{4}/[0-9]{4}$",
    correctionsCount: 14,
    lastCorrected: "2026-07-22",
    typicalAmountRange: "₹18,000 – ₹42,000",
    typicalGstRate: "18.0%",
    typicalTiming: "15th – 20th of month",
    typicalFormat: "Computer-Generated PDF",
    reconciliationTolerance: "₹1 – ₹5",
    anomaly: {
      hasAnomaly: true,
      headline: "Current bill is ₹1.42L (4.3× normal baseline)",
      explanation: "Current invoice #RIL/26-27/0991 amount ₹1,42,000 is 4.3× the historical average of ₹32,400 across 14 past invoices.",
      confidence: 91
    },
    notes: "Requires HSN 998313 for cloud computing tax compliance."
  },
  {
    supplierGstin: "27AAACT2727Q1ZW",
    supplierName: "Tata Consultancy Services Ltd",
    defaultLedger: "Software Consulting & ERP AMC",
    defaultGstRate: 18.0,
    hsnOverride: "998314",
    dateFormatHint: "DD/MM/YYYY",
    invoiceRegex: "^TCS/[0-9]{4}/[0-9]{3}$",
    correctionsCount: 9,
    lastCorrected: "2026-07-18",
    typicalAmountRange: "₹2,50,000 – ₹3,10,000",
    typicalGstRate: "18.0%",
    typicalTiming: "18th – 22nd of month",
    typicalFormat: "Digitally Signed PDF",
    reconciliationTolerance: "₹0 (Strict)",
    anomaly: {
      hasAnomaly: true,
      headline: "Portal tax rate mismatch (12% filed vs 18% historical)",
      explanation: "Portal GSTR-2B entry reflects 12% GST whereas TCS historically files under SAC 998314 at 18%. Variance of ₹8,400.",
      confidence: 93
    },
    notes: "Intrastate CGST/SGST split applies."
  },
  {
    supplierGstin: "03AAACV9876G1Z4",
    supplierName: "Vardhman Textiles & Yarn",
    defaultLedger: "Raw Material - Cotton & Synthetic Yarn",
    defaultGstRate: 5.0,
    hsnOverride: "5205",
    dateFormatHint: "DD-MM-YYYY",
    invoiceRegex: "^VT/[A-Z]{3}/[0-9]{4}/[0-9]{3}$",
    correctionsCount: 6,
    lastCorrected: "2026-07-15",
    typicalAmountRange: "₹1,20,000 – ₹1,50,000",
    typicalGstRate: "5.0%",
    typicalTiming: "10th – 15th of month",
    typicalFormat: "Scanned Paper Bill",
    reconciliationTolerance: "₹10",
    anomaly: {
      hasAnomaly: false,
      headline: "Behavior consistent with seasonal yarn pattern",
      explanation: "Amount and tax rates match historical range within 2.1% standard deviation.",
      confidence: 97
    },
    notes: "Interstate IGST 5% applicable for Punjab to Maharashtra supply."
  },
  {
    supplierGstin: "27AAACK1234J1Z8",
    supplierName: "Kalyani Industrial Gases Ltd",
    defaultLedger: "Consumable Factory Gases",
    defaultGstRate: 18.0,
    hsnOverride: "2804",
    dateFormatHint: "DD/MM/YYYY",
    invoiceRegex: "^KIG/26/[0-9]{5}$",
    correctionsCount: 4,
    lastCorrected: "2026-07-10",
    typicalAmountRange: "₹2,00,000 – ₹2,40,000",
    typicalGstRate: "18.0%",
    typicalTiming: "14th – 18th of month",
    typicalFormat: "Electronic Tax Invoice",
    reconciliationTolerance: "₹50 (Rounding)",
    anomaly: {
      hasAnomaly: false,
      headline: "Fractional rounding variance (₹18)",
      explanation: "Matches line-item fractional cent tax calculations. Fully within auto-resolution policy.",
      confidence: 99
    },
    notes: "Reverse charge mechanism check is strictly false."
  }
];

export const REVIEW_ITEMS = [
  {
    id: "ri1",
    supplierName: "TechPro Systems India",
    supplierGstin: "27AAACT1234F1Z8",
    customerName: "Reliance Logistics Pvt Ltd",
    clientGstin: "27AAACR5055K1Z2",
    invoiceNo: "TPS/26-27/0912",
    invoiceDate: "2026-07-14",
    taxableValue: 85000,
    cgst: 7650,
    sgst: 7650,
    igst: 0,
    grandTotal: 100300,
    confidenceScore: 71.5,
    issueCategory: "Math Mismatch",
    issueSeverity: "CRITICAL",
    itcAtRisk: "₹15,300",
    issueTag: "Sum Mismatch ₹15,300",
    reasoningText: "Calculated sum (Taxable ₹85,000 + CGST ₹7,650 + SGST ₹7,650 = ₹100,300) differs from extracted printed total ₹1,15,600. Potential OCR digit confusion on 0 vs 5 in printed total.",
    suggestedLedger: "IT Hardware & Server Maintenance",
    gstr2bMatchStatus: "Missing in 2B (Vendor GSTR-1 unfiled)",
    supplyType: "INTRASTATE",
    hsnCode: "847130",
    riskModel: {
      severity: "CRITICAL",
      confidence: 71.5,
      confidenceTier: "Queue for Review (70–90%)",
      confidenceLabel: "71.5% — Human decision required",
      financialImpact: 15300,
      complianceImpact: "HIGH",
      reversibility: "Easy (Tally Draft)",
      recommendedAction: "Inspect printed document and correct OCR digit",
      auditImplication: "Statutory Section 16 invoice discrepancy flag recorded"
    },
    evidence: {
      extractedFields: [
        { field: "Supplier GSTIN", value: "27AAACT1234F1Z8", confidence: 99.8, status: "VALID" },
        { field: "Invoice No", value: "TPS/26-27/0912", confidence: 99.6, status: "VALID" },
        { field: "Taxable Value", value: "₹85,000", confidence: 98.4, status: "VALID" },
        { field: "CGST (9%)", value: "₹7,650", confidence: 99.1, status: "VALID" },
        { field: "SGST (9%)", value: "₹7,650", confidence: 99.1, status: "VALID" },
        { field: "Stated Grand Total", value: "₹1,15,600", confidence: 71.2, status: "DISCREPANCY" }
      ],
      rulesApplied: [
        { ruleId: "RULE_1.4", name: "Section 16 Format Validation", status: "PASSED" },
        { ruleId: "RULE_3.7", name: "Deterministic Arithmetic Verification", status: "FAILED (₹15,300 variance)" },
        { ruleId: "VENDOR_HIST_04", name: "TechPro Systems Rate Pattern", status: "PASSED (18% matches baseline)" }
      ],
      vendorPatternNotes: "TechPro Systems historically invoices IT hardware with 18% GST (average ₹40k–₹90k)."
    },
    validationChecks: [
      { check_name: "supplier_gstin_valid", passed: true, message: "Valid 15-char Maharashtra GSTIN format" },
      { check_name: "math_totals_match", passed: false, message: "Math mismatch: Taxable+Tax ₹100,300 vs Stated ₹115,600" },
      { check_name: "tax_type_coherence", passed: true, message: "Intrastate CGST==SGST, IGST=0" }
    ]
  },
  {
    id: "ri2",
    supplierName: "Vardhman Textiles & Yarn",
    supplierGstin: "03AAACV9876G1Z4",
    customerName: "Sunrise Heavy Engineering",
    clientGstin: "27AAACS4321D1Z1",
    invoiceNo: "VT/JUL/2026/411",
    invoiceDate: "2026-07-10",
    taxableValue: 128000,
    cgst: 0,
    sgst: 0,
    igst: 6400,
    grandTotal: 134400,
    confidenceScore: 84.0,
    issueCategory: "Missing in GSTR-2B",
    issueSeverity: "HIGH",
    itcAtRisk: "₹6,400",
    issueTag: "Section 16(2)(aa) Warning",
    reasoningText: "Invoice is recorded in client's purchase register, but does not appear in auto-generated GSTR-2B. Vendor (Punjab) has not uploaded GSTR-1 for July 2026.",
    suggestedLedger: "Raw Material - Cotton & Synthetic Yarn",
    gstr2bMatchStatus: "Missing in 2B",
    supplyType: "INTERSTATE",
    hsnCode: "5205",
    riskModel: {
      severity: "HIGH",
      confidence: 84.0,
      confidenceTier: "Queue for Review (70–90%)",
      confidenceLabel: "84.0% — Review recommended",
      financialImpact: 6400,
      complianceImpact: "HIGH",
      reversibility: "Easy (Pre-filing holds)",
      recommendedAction: "Dispatch Section 16(2)(aa) notice to Punjab supplier",
      auditImplication: "ITC claim blocked until vendor GSTR-1 appearance"
    },
    evidence: {
      extractedFields: [
        { field: "Supplier GSTIN", value: "03AAACV9876G1Z4", confidence: 99.9, status: "VALID" },
        { field: "Invoice No", value: "VT/JUL/2026/411", confidence: 99.4, status: "VALID" },
        { field: "Taxable Value", value: "₹1,28,000", confidence: 98.9, status: "VALID" },
        { field: "IGST (5%)", value: "₹6,400", confidence: 99.2, status: "VALID" },
        { field: "Grand Total", value: "₹1,34,400", confidence: 99.5, status: "VALID" }
      ],
      rulesApplied: [
        { ruleId: "RULE_SEC16", name: "Section 16(2)(aa) 2B Eligibility Check", status: "FAILED (Not in 2B)" },
        { ruleId: "RULE_INTERSTATE", name: "Interstate Supply Jurisdiction", status: "PASSED (Punjab -> MH)" },
        { ruleId: "VENDOR_HIST_02", name: "Learned Pattern Vardhman", status: "PASSED (5% cotton HSN 5205)" }
      ],
      vendorPatternNotes: "Vardhman typically files by 14th of the month. Filing is currently 10 days delayed."
    },
    validationChecks: [
      { check_name: "supplier_gstin_valid", passed: true, message: "Valid Punjab GSTIN: 03AAACV9876G1Z4" },
      { check_name: "math_totals_match", passed: true, message: "Taxable ₹128,000 + IGST 5% ₹6,400 == ₹134,400" },
      { check_name: "tax_type_coherence", passed: true, message: "Interstate IGST applied cleanly" }
    ]
  },
  {
    id: "ri3",
    supplierName: "Om Sai Logistics & Warehousing",
    supplierGstin: "27AAAFO4567M1Z3",
    customerName: "Apex General Traders",
    clientGstin: "27AAAAA1234B1Z5",
    invoiceNo: "OSL/2026/894",
    invoiceDate: "2026-07-18",
    taxableValue: 45000,
    cgst: 4050,
    sgst: 4050,
    igst: 0,
    grandTotal: 53100,
    confidenceScore: 74.0,
    issueCategory: "New Vendor",
    issueSeverity: "MEDIUM",
    itcAtRisk: "₹8,100",
    issueTag: "Unmapped Tally Ledger",
    reasoningText: "First-time supplier detected in books. No historical Tally ledger mapping exists for GSTIN 27AAAFO4567M1Z3. Yukti AI suggests 'Freight & Cartage Inward'.",
    suggestedLedger: "Freight & Cartage Inward (Recommended)",
    gstr2bMatchStatus: "Exact Match in 2B",
    supplyType: "INTRASTATE",
    hsnCode: "996511",
    riskModel: {
      severity: "MEDIUM",
      confidence: 74.0,
      confidenceTier: "Queue for Review (70–90%)",
      confidenceLabel: "74.0% — Ledger confirmation needed",
      financialImpact: 8100,
      complianceImpact: "MEDIUM",
      reversibility: "Easy (Tally Chart update)",
      recommendedAction: "Confirm suggested ledger and save as learned rule",
      auditImplication: "Chart of Accounts mapping record established"
    },
    evidence: {
      extractedFields: [
        { field: "Supplier GSTIN", value: "27AAAFO4567M1Z3", confidence: 99.8, status: "VALID" },
        { field: "Invoice No", value: "OSL/2026/894", confidence: 98.7, status: "VALID" },
        { field: "Taxable Value", value: "₹45,000", confidence: 98.2, status: "VALID" },
        { field: "CGST/SGST (18%)", value: "₹8,100", confidence: 98.9, status: "VALID" }
      ],
      rulesApplied: [
        { ruleId: "RULE_NEW_PARTY", name: "New Master Creation Gate", status: "FLAGGED (New Master)" },
        { ruleId: "RULE_SAC_CLASSIFY", name: "SAC 996511 Mapping", status: "PASSED (Freight)" }
      ],
      vendorPatternNotes: "No historical patterns exist. First encounter in July 2026."
    },
    validationChecks: [
      { check_name: "supplier_gstin_valid", passed: true, message: "Valid Maharashtra GSTIN" },
      { check_name: "math_totals_match", passed: true, message: "Taxable ₹45,000 + Taxes ₹8,100 == ₹53,100" }
    ]
  },
  {
    id: "ri4",
    supplierName: "Mahalaxmi Packaging Material",
    supplierGstin: "27AAAPM3344K1Z1",
    customerName: "Apex General Traders",
    clientGstin: "27AAAAA1234B1Z5",
    invoiceNo: "MPM/26-27/302",
    invoiceDate: "2026-07-21",
    taxableValue: 62000,
    cgst: 5580,
    sgst: 5580,
    igst: 0,
    grandTotal: 73160,
    confidenceScore: 81.0,
    issueCategory: "Tax Rate Mismatch",
    issueSeverity: "HIGH",
    itcAtRisk: "₹3,720",
    issueTag: "Rate Discrepancy (18% vs 12%)",
    reasoningText: "Purchase register records 18% GST (₹11,160 tax), but GSTR-2B portal record reflects 12% GST (₹7,440 tax) under HSN 4819. Discrepancy of ₹3,720 ITC.",
    suggestedLedger: "Packing Material Expenses",
    gstr2bMatchStatus: "Rate Mismatch in 2B",
    supplyType: "INTRASTATE",
    hsnCode: "4819",
    riskModel: {
      severity: "HIGH",
      confidence: 81.0,
      confidenceTier: "Queue for Review (70–90%)",
      confidenceLabel: "81.0% — Review recommended",
      financialImpact: 3720,
      complianceImpact: "HIGH",
      reversibility: "Easy (Tax rate override)",
      recommendedAction: "Inspect HSN 4819 statutory rate and adjust purchase ledger",
      auditImplication: "Rate discrepancy note logged for annual audit"
    },
    evidence: {
      extractedFields: [
        { field: "Supplier GSTIN", value: "27AAAPM3344K1Z1", confidence: 99.8, status: "VALID" },
        { field: "HSN Code", value: "4819 (Cartons/Boxes)", confidence: 99.2, status: "VALID" },
        { field: "Books Rate", value: "18% (₹11,160)", confidence: 99.0, status: "DISCREPANCY" },
        { field: "Portal 2B Rate", value: "12% (₹7,440)", confidence: 99.9, status: "VALID" }
      ],
      rulesApplied: [
        { ruleId: "RULE_RATE_MATCH", name: "2B Portal Tax Rate Consistency", status: "FAILED (18% vs 12%)" }
      ],
      vendorPatternNotes: "Corrugated boxes under HSN 4819 were revised to 12% in recent GST Council notifications."
    },
    validationChecks: [
      { check_name: "supplier_gstin_valid", passed: true, message: "Valid GSTIN" },
      { check_name: "tax_rate_check", passed: false, message: "Portal filed at 12%, books entered at 18%" }
    ]
  },
  {
    id: "ri5",
    supplierName: "Kalyani Industrial Gases Ltd",
    supplierGstin: "27AAACK1234J1Z8",
    customerName: "Sunrise Heavy Engineering",
    clientGstin: "27AAACS4321D1Z1",
    invoiceNo: "KIG/26/10492",
    invoiceDate: "2026-07-16",
    taxableValue: 195000,
    cgst: 17550,
    sgst: 17550,
    igst: 0,
    grandTotal: 230100,
    confidenceScore: 92.5,
    issueCategory: "Near Match (<₹1,000)",
    issueSeverity: "LOW",
    itcAtRisk: "₹18",
    issueTag: "Rounding Diff ₹18",
    reasoningText: "Invoice matches GSTR-2B with minor ₹18 difference due to fractional tax rounding at line-item level. Safe for 1-click bulk approval.",
    suggestedLedger: "Consumable Factory Gases",
    gstr2bMatchStatus: "Near Match in 2B (₹18 diff)",
    supplyType: "INTRASTATE",
    hsnCode: "2804",
    riskModel: {
      severity: "LOW",
      confidence: 92.5,
      confidenceTier: "Process & Notify (90–98%)",
      confidenceLabel: "92.5% — Safe to auto-post",
      financialImpact: 18,
      complianceImpact: "LOW",
      reversibility: "Easy (Rounding Ledger Auto-entry)",
      recommendedAction: "1-Click approve rounding tolerance",
      auditImplication: "Auto-posted under Section 1.4 Rounding Threshold"
    },
    evidence: {
      extractedFields: [
        { field: "Supplier GSTIN", value: "27AAACK1234J1Z8", confidence: 99.9, status: "VALID" },
        { field: "Taxable Value", value: "₹1,95,000", confidence: 99.8, status: "VALID" },
        { field: "Rounding Variance", value: "₹18.00", confidence: 99.9, status: "VALID" }
      ],
      rulesApplied: [
        { ruleId: "RULE_TOLERANCE", name: "Rounding Rule (Threshold: ₹100)", status: "PASSED (₹18 <= ₹100)" }
      ],
      vendorPatternNotes: "Matches past 4 invoices from Kalyani Industrial Gases within ₹25 rounding range."
    },
    validationChecks: [
      { check_name: "supplier_gstin_valid", passed: true, message: "Valid GSTIN" },
      { check_name: "math_totals_match", passed: true, message: "Within 0.01% rounding tolerance" }
    ]
  },
  {
    id: "ri6",
    supplierName: "Tata Consultancy Services Ltd",
    supplierGstin: "27AAACT2727Q1ZW",
    customerName: "Metro Tech Solutions LLP",
    clientGstin: "27AAACM9876C1Z8",
    invoiceNo: "TCS/2026/891",
    invoiceDate: "2026-07-20",
    taxableValue: 240000,
    cgst: 21600,
    sgst: 21600,
    igst: 0,
    grandTotal: 283200,
    confidenceScore: 94.0,
    issueCategory: "Near Match (<₹1,000)",
    issueSeverity: "LOW",
    itcAtRisk: "₹0",
    issueTag: "Pattern Verified",
    reasoningText: "Vendor pattern auto-applied from past 9 approvals. Ready for senior approval and Tally voucher generation.",
    suggestedLedger: "Software Consulting & ERP AMC",
    gstr2bMatchStatus: "Exact Match in 2B",
    supplyType: "INTRASTATE",
    hsnCode: "998314",
    riskModel: {
      severity: "LOW",
      confidence: 94.0,
      confidenceTier: "Process & Notify (90–98%)",
      confidenceLabel: "94.0% — Safe to auto-post",
      financialImpact: 0,
      complianceImpact: "LOW",
      reversibility: "Easy",
      recommendedAction: "Approve to Tally",
      auditImplication: "Learned vendor pattern #18 verified"
    },
    evidence: {
      extractedFields: [
        { field: "Supplier GSTIN", value: "27AAACT2727Q1ZW", confidence: 99.9, status: "VALID" },
        { field: "Grand Total", value: "₹2,83,200", confidence: 99.8, status: "VALID" },
        { field: "Pattern Rule", value: "Pattern #18 (9 past approvals)", confidence: 99.0, status: "VALID" }
      ],
      rulesApplied: [
        { ruleId: "VENDOR_PAT_18", name: "TCS Software AMC Mapping", status: "PASSED" }
      ],
      vendorPatternNotes: "Consistent monthly recurring software AMC voucher."
    },
    validationChecks: [
      { check_name: "supplier_gstin_valid", passed: true, message: "Valid GSTIN" },
      { check_name: "vendor_pattern_matched", passed: true, message: "Auto-applied rule from Tata Consultancy Services" }
    ]
  },
  {
    id: "ri7",
    supplierName: "Apex Fasteners & Hardware",
    supplierGstin: "27AAACA9012E1Z6",
    customerName: "Apex General Traders",
    clientGstin: "27AAAAA1234B1Z5",
    invoiceNo: "AFH/26/0048",
    invoiceDate: "2026-02-14",
    taxableValue: 110000,
    cgst: 9900,
    sgst: 9900,
    igst: 0,
    grandTotal: 129800,
    confidenceScore: 78.0,
    issueCategory: "Rule 37 Warning",
    issueSeverity: "CRITICAL",
    itcAtRisk: "₹19,800",
    issueTag: "180-Day Payment Overdue",
    reasoningText: "GST Rule 37 Alert: Invoice date is 14 Feb 2026 (163 days ago). Tally shows unpaid balance. ITC of ₹19,800 must be reversed with 18% interest if payment is not cleared by 13 Aug 2026.",
    suggestedLedger: "Hardware & Consumables Store",
    gstr2bMatchStatus: "Exact Match in 2B (February 2026)",
    supplyType: "INTRASTATE",
    hsnCode: "7318",
    riskModel: {
      severity: "CRITICAL",
      confidence: 78.0,
      confidenceTier: "Queue for Review (70–90%)",
      confidenceLabel: "78.0% — Statutory warning",
      financialImpact: 19800,
      complianceImpact: "HIGH",
      reversibility: "Difficult (Interest clock running)",
      recommendedAction: "Alert client to issue payment advice before 180-day deadline",
      auditImplication: "Rule 37 interest statutory liability tracked"
    },
    evidence: {
      extractedFields: [
        { field: "Invoice Date", value: "14 Feb 2026 (163 days elapsed)", confidence: 99.8, status: "FLAG" },
        { field: "Pending Payment", value: "₹1,29,800 unpaid in Tally", confidence: 99.4, status: "FLAG" },
        { field: "ITC at Risk", value: "₹19,800 + 18% interest", confidence: 99.9, status: "FLAG" }
      ],
      rulesApplied: [
        { ruleId: "RULE_37", name: "180-Day Second Proviso to Section 16(2)", status: "FAILED (163 Days Elapsed)" }
      ],
      vendorPatternNotes: "Statutory mandatory reversal occurs at 180 days from invoice date if unpaid."
    },
    validationChecks: [
      { check_name: "rule_37_payment_age", passed: false, message: "Payment pending for 163 days (>150 day warning threshold)" }
    ]
  },
  {
    id: "ri8",
    supplierName: "BlueSky Logistics India",
    supplierGstin: "27AAACB5678E1Z9",
    customerName: "BlueSky Retails & Distribution",
    clientGstin: "27AAACB5678E1Z9",
    invoiceNo: "BLI/JUL/109",
    invoiceDate: "2026-07-24",
    taxableValue: 50000,
    cgst: 4500,
    sgst: 4500,
    igst: 0,
    grandTotal: 59000,
    confidenceScore: 89.0,
    issueCategory: "Unrecognized HSN",
    issueSeverity: "MEDIUM",
    itcAtRisk: "₹9,000",
    issueTag: "HSN Verification Needed",
    reasoningText: "HSN code 996519 extracted. Requires verification whether transport service attracts RCM (Reverse Charge) under Notification 13/2017.",
    suggestedLedger: "Goods Transport Agency (GTA) Services",
    gstr2bMatchStatus: "Exact Match in 2B",
    supplyType: "INTRASTATE",
    hsnCode: "996519",
    riskModel: {
      severity: "MEDIUM",
      confidence: 89.0,
      confidenceTier: "Queue for Review (70–90%)",
      confidenceLabel: "89.0% — RCM determination needed",
      financialImpact: 9000,
      complianceImpact: "MEDIUM",
      reversibility: "Easy",
      recommendedAction: "Confirm forward charge or RCM applicability",
      auditImplication: "Notification 13/2017-Central Tax classification"
    },
    evidence: {
      extractedFields: [
        { field: "HSN/SAC", value: "996519 (Road Transport GTA)", confidence: 99.1, status: "FLAG" },
        { field: "Tax Rate", value: "18% forward charge indicated", confidence: 97.4, status: "VALID" }
      ],
      rulesApplied: [
        { ruleId: "RULE_RCM_GTA", name: "Goods Transport Agency RCM Verification", status: "FLAGGED" }
      ],
      vendorPatternNotes: "GTA suppliers opting for forward charge must file declaration on invoice."
    },
    validationChecks: [
      { check_name: "rcm_applicability", passed: false, message: "Potential RCM applicability on GTA supply" }
    ]
  }
];

export const RECONCILIATION_DATA = {
  summary: {
    totalEligibleITC: 4256000,
    totalIneligibleITC: 184000,
    missingIn2BITC: 388500,
    rateMismatchITC: 84000,
    pass1_exact_count: 1042,
    pass2_fuzzy_count: 98,
    pass3_smart_count: 58,
    unmatched_count: 50,
    totalCount: 1248,
    matchRatePct: 96.0
  },
  records: [
    {
      id: "rec-1",
      supplierName: "Reliance Industries Limited",
      supplierGstin: "27AAACR5055K1Z2",
      invoiceNo: "RIL/2026/0892",
      invoiceDate: "2026-07-15",
      bookAmount: 23600.0,
      portalAmount: 23600.0,
      diffAmount: 0.0,
      bookTax: 3600.0,
      portalTax: 3600.0,
      category: "EXACT_MATCH",
      status: "Exact Match",
      itcEligibility: "Eligible (Auto-Reconciled)",
      actionRequired: "None"
    },
    {
      id: "rec-2",
      supplierName: "Tata Consultancy Services Ltd",
      supplierGstin: "27AAACT2727Q1ZW",
      invoiceNo: "TCS/2026/891",
      invoiceDate: "2026-07-20",
      bookAmount: 283200.0,
      portalAmount: 283200.0,
      diffAmount: 0.0,
      bookTax: 43200.0,
      portalTax: 43200.0,
      category: "EXACT_MATCH",
      status: "Exact Match",
      itcEligibility: "Eligible (Auto-Reconciled)",
      actionRequired: "None"
    },
    {
      id: "rec-3",
      supplierName: "Kalyani Industrial Gases Ltd",
      supplierGstin: "27AAACK1234J1Z8",
      invoiceNo: "KIG/26/10492",
      invoiceDate: "2026-07-16",
      bookAmount: 230100.0,
      portalAmount: 230082.0,
      diffAmount: 18.0,
      bookTax: 35100.0,
      portalTax: 35082.0,
      category: "NEAR_MATCH",
      status: "Near Match (<₹100)",
      itcEligibility: "Eligible (Rounding Variance)",
      actionRequired: "1-Click Approve"
    },
    {
      id: "rec-4",
      supplierName: "Vardhman Textiles & Yarn",
      supplierGstin: "03AAACV9876G1Z4",
      invoiceNo: "VT/JUL/2026/411",
      invoiceDate: "2026-07-10",
      bookAmount: 134400.0,
      portalAmount: 0.0,
      diffAmount: 134400.0,
      bookTax: 6400.0,
      portalTax: 0.0,
      category: "IN_BOOKS_ONLY",
      status: "Missing in 2B",
      itcEligibility: "Ineligible (Sec 16(2)(aa) Blocked)",
      actionRequired: "Send Vendor Follow-up"
    },
    {
      id: "rec-5",
      supplierName: "Mahalaxmi Packaging Material",
      supplierGstin: "27AAAPM3344K1Z1",
      invoiceNo: "MPM/26-27/302",
      invoiceDate: "2026-07-21",
      bookAmount: 73160.0,
      portalAmount: 69440.0,
      diffAmount: 3720.0,
      bookTax: 11160.0,
      portalTax: 7440.0,
      category: "TAX_RATE_MISMATCH",
      status: "Rate Mismatch (18% vs 12%)",
      itcEligibility: "Partially Claimable (₹7,440)",
      actionRequired: "Review Rate Difference"
    },
    {
      id: "rec-6",
      supplierName: "TechPro Systems India",
      supplierGstin: "27AAACT1234F1Z8",
      invoiceNo: "TPS/26-27/0912",
      invoiceDate: "2026-07-14",
      bookAmount: 100300.0,
      portalAmount: 115600.0,
      diffAmount: 15300.0,
      bookTax: 15300.0,
      portalTax: 17633.0,
      category: "AMOUNT_MISMATCH",
      status: "Amount Mismatch",
      itcEligibility: "Flagged Pending Resolution",
      actionRequired: "Inspect Invoice PDF"
    },
    {
      id: "rec-7",
      supplierName: "Bharat Petroleum Corporation Ltd",
      supplierGstin: "27AAACB0099P1Z7",
      invoiceNo: "BPCL/MUM/8821",
      invoiceDate: "2026-07-22",
      bookAmount: 0.0,
      portalAmount: 48500.0,
      diffAmount: -48500.0,
      bookTax: 0.0,
      portalTax: 7400.0,
      category: "ON_PORTAL_ONLY",
      status: "On Portal Only",
      itcEligibility: "Unclaimed ITC (Rupees at Risk)",
      actionRequired: "Request Bill from Client"
    },
    {
      id: "rec-8",
      supplierName: "Precision Steel Fabricators",
      supplierGstin: "27AAACP5566L1Z3",
      invoiceNo: "PSF/2026/041",
      invoiceDate: "2026-07-19",
      bookAmount: 88500.0,
      portalAmount: 88500.0,
      diffAmount: 0.0,
      bookTax: 13500.0,
      portalTax: 13500.0,
      category: "DUPLICATE",
      status: "Duplicate Entry in Books",
      itcEligibility: "Double Claim Risk (₹13,500)",
      actionRequired: "Delete Duplicate Voucher"
    }
  ]
};

export const GSTR_SUMMARY = {
  filingPeriod: "July 2026",
  gstr1_outwardLiability: "₹18,45,200",
  gstr3b_eligibleITC: "₹14,25,000",
  ineligibleITC_sec17_5: "₹1,84,000",
  itcReversalRule37: "₹19,800",
  netTaxPayable: "₹4,20,200",
  cashChallanRequired: "₹4,20,200",
  crossValidationStatus: "PASSED (GSTR-1 & 3B Outward Totals Match 100%)",
  hsnSummaryCount: 42
};

export const NOTICES = [
  {
    id: "n1",
    clientName: "Reliance Logistics Pvt Ltd",
    clientGstin: "27AAACR5055K1Z2",
    noticeType: "ASMT-10",
    issuingAuthority: "State GST Ward 08, Andheri East, Mumbai",
    noticeDate: "2026-07-28",
    responseDeadline: "2026-08-12",
    demandAmount: 184500,
    status: "Draft Ready (Sarvam 30B)",
    subject: "Discrepancy in ITC claimed in GSTR-3B vs GSTR-2B for FY 2024-25",
    description: "Department observed excess ITC claim of ₹1,84,500 in Table 4(A)(5) compared to GSTR-2B inward supplies under Section 16(2)(aa).",
    draftReply: `To,\nThe State Tax Officer,\nWard 08, Mumbai Division, Maharashtra.\n\nSubject: Formal Response to Scrutiny Notice in Form GST ASMT-10 dated 28-07-2026\nReference: DIN-20260728990142 | GSTIN: 27AAACR5055K1Z2 (M/s Reliance Logistics Pvt Ltd)\n\nRespected Officer,\n\nWith reference to the notice regarding the alleged variance of ₹1,84,500 in ITC between GSTR-3B and GSTR-2B for FY 2024-25, we respectfully submit on behalf of our client:\n\n1. Factual Reconciliation & Vendor Confirmation:\n   The impugned differential ITC pertains to inward supplies from M/s Tata Steel Ltd (GSTIN: 27AAACT0001A1Z5, Inv #TSL/24/091) which was filed in GSTR-1 for Q4 FY 2024-25 in subsequent month May 2025 as permitted under Section 16(4) of the CGST Act.\n\n2. Documentary Evidence Enclosed:\n   - Tax Invoice #TSL/24/091 with valid payment proof via RTGS (UTR #N240328991204).\n   - CA certificate under Rule 36(4) certifying receipt of goods and tax payment by supplier.\n   - GSTR-2B reflection extract for May 2025.\n\nIn light of the above statutory compliance and judicial precedent in W.P. No. 1290/2024, we request your good office to drop the proposed proceedings.\n\nYours faithfully,\nFor Rajnish & Associates Chartered Accountants\n(Authorized Representative)`
  },
  {
    id: "n2",
    clientName: "Sunrise Heavy Engineering",
    clientGstin: "27AAACS4321D1Z1",
    noticeType: "DRC-01",
    issuingAuthority: "Central GST Range II, Thane West",
    noticeDate: "2026-07-25",
    responseDeadline: "2026-08-08",
    demandAmount: 342000,
    status: "Urgent Review Required",
    subject: "Show Cause Notice for outward tax mismatch between GSTR-1 and E-Way Bills",
    description: "Alleged clandestine clearance of ₹19,00,000 taxable value based on active E-Way Bills generated without corresponding GSTR-1 entries in Table 4.",
    draftReply: `To,\nThe Assistant Commissioner of Central Tax,\nRange II, Division III, Thane.\n\nSubject: Preliminary Objections and Reply to Show Cause Notice in Form GST DRC-01\n\nRespected Sir/Madam,\n\nRegarding the alleged turnover discrepancy of ₹19,00,000 between E-Way Bills and GSTR-1:\n\n1. We submit that E-Way Bill #281099238819 was generated for Job Work movement under Section 143 via Delivery Challan #DC/25/088, which does not constitute a taxable outward supply.\n2. Form GST ITC-04 for the corresponding quarter has been duly filed.\n\nDetailed reconciliation statement with reconciliation annexures is attached.\n\nYours faithfully,\nRajnish & Associates CA Firm`
  }
];

export const BANK_TRANSACTIONS = [
  {
    id: "bnk_01",
    date: "2026-07-16",
    narration: "NEFT-AXIS-RELIANCE INDUSTRIES LTD-RIL20260892-IT INFRA",
    chqRef: "AXISN009821034",
    withdrawal: 23600.0,
    deposit: 0,
    balance: 4281400.0,
    counterparty: "Reliance Industries Limited",
    voucherType: "Payment",
    suggestedLedger: "Reliance Industries Limited",
    confidence: 99.2,
    rule37Settled: true,
    matchedInvoiceNo: "RIL/2026/0892",
    itcProtected: 3600.0,
    status: "Auto-Matched"
  },
  {
    id: "bnk_02",
    date: "2026-07-17",
    narration: "NEFT-KKBK-KALYANI INDUSTRIAL GASES-KIG2610492-GAS SUPPLY",
    chqRef: "KKBKN081290331",
    withdrawal: 230082.0,
    deposit: 0,
    balance: 4051318.0,
    counterparty: "Kalyani Industrial Gases Ltd",
    voucherType: "Payment",
    suggestedLedger: "Kalyani Industrial Gases Ltd",
    confidence: 98.6,
    rule37Settled: true,
    matchedInvoiceNo: "KIG/26/10492",
    itcProtected: 35082.0,
    status: "Auto-Matched"
  },
  {
    id: "bnk_03",
    date: "2026-07-18",
    narration: "RTGS-HDFC-TATA CONSULTANCY SERVICES-EXP881-LOGISTICS",
    chqRef: "HDFCR2026071801",
    withdrawal: 0,
    deposit: 283200.0,
    balance: 4334518.0,
    counterparty: "Tata Consultancy Services Ltd",
    voucherType: "Receipt",
    suggestedLedger: "Tata Consultancy Services Ltd",
    confidence: 99.0,
    rule37Settled: false,
    matchedInvoiceNo: null,
    itcProtected: 0,
    status: "Auto-Matched"
  },
  {
    id: "bnk_04",
    date: "2026-07-19",
    narration: "ATM CASH WDL-MUMBAI FORT BR-SELF PETTY CASH",
    chqRef: "ATM9021992",
    withdrawal: 45000.0,
    deposit: 0,
    balance: 4289518.0,
    counterparty: "Self / Petty Cash",
    voucherType: "Contra",
    suggestedLedger: "Cash in Hand",
    confidence: 100.0,
    rule37Settled: false,
    matchedInvoiceNo: null,
    itcProtected: 0,
    status: "Auto-Matched"
  },
  {
    id: "bnk_05",
    date: "2026-07-21",
    narration: "NEFT-ICIC-MAHALAXMI PACKAGING MATERIAL-MPM26302",
    chqRef: "ICICN029910245",
    withdrawal: 69440.0,
    deposit: 0,
    balance: 4220078.0,
    counterparty: "Mahalaxmi Packaging Material",
    voucherType: "Payment",
    suggestedLedger: "Mahalaxmi Packaging Material",
    confidence: 97.8,
    rule37Settled: true,
    matchedInvoiceNo: "MPM/26-27/302",
    itcProtected: 7440.0,
    status: "Auto-Matched"
  },
  {
    id: "bnk_06",
    date: "2026-07-22",
    narration: "CMS-BPCL-MUMBAI TERMINAL-BULK DIESEL FLEET",
    chqRef: "CMSBPCL99210",
    withdrawal: 48500.0,
    deposit: 0,
    balance: 4171578.0,
    counterparty: "Bharat Petroleum Corporation Ltd",
    voucherType: "Payment",
    suggestedLedger: "Bharat Petroleum Corporation Ltd",
    confidence: 98.1,
    rule37Settled: true,
    matchedInvoiceNo: "BPCL/MUM/8821",
    itcProtected: 7400.0,
    status: "Auto-Matched"
  },
  {
    id: "bnk_07",
    date: "2026-07-23",
    narration: "RTGS-SBIN-INFOSYS BPM INDIA-FREIGHT CLEARANCE",
    chqRef: "SBINR2026072381",
    withdrawal: 0,
    deposit: 531000.0,
    balance: 4702578.0,
    counterparty: "Infosys BPM India",
    voucherType: "Receipt",
    suggestedLedger: "Infosys BPM India",
    confidence: 99.4,
    rule37Settled: false,
    matchedInvoiceNo: null,
    itcProtected: 0,
    status: "Auto-Matched"
  },
  {
    id: "bnk_08",
    date: "2026-07-24",
    narration: "CHQ DEP-CASH SALE PROCEEDS-DADAR COUNTER",
    chqRef: "CHQ009211",
    withdrawal: 0,
    deposit: 120000.0,
    balance: 4822578.0,
    counterparty: "Cash Counter Collection",
    voucherType: "Contra",
    suggestedLedger: "Cash in Hand",
    confidence: 100.0,
    rule37Settled: false,
    matchedInvoiceNo: null,
    itcProtected: 0,
    status: "Auto-Matched"
  },
  {
    id: "bnk_09",
    date: "2026-07-25",
    narration: "UPI-9820011223@okicici-INDIAN OIL PETROL PUMP VASHI",
    chqRef: "UPI62071982103",
    withdrawal: 4200.0,
    deposit: 0,
    balance: 4818378.0,
    counterparty: "Indian Oil Petrol Pump",
    voucherType: "Payment",
    suggestedLedger: "Vehicle Running & Maintenance",
    confidence: 94.2,
    rule37Settled: false,
    matchedInvoiceNo: null,
    itcProtected: 0,
    status: "Auto-Categorized"
  },
  {
    id: "bnk_10",
    date: "2026-07-25",
    narration: "UPI-bluedart@hdfcbank-URGENT TENDER COURIER CHARGES",
    chqRef: "UPI62072091104",
    withdrawal: 2150.0,
    deposit: 0,
    balance: 4816228.0,
    counterparty: "Blue Dart Express",
    voucherType: "Payment",
    suggestedLedger: "Courier & Postage Expenses",
    confidence: 96.0,
    rule37Settled: false,
    matchedInvoiceNo: null,
    itcProtected: 0,
    status: "Auto-Categorized"
  },
  {
    id: "bnk_11",
    date: "2026-07-26",
    narration: "ACH-MSEDCL-MAHARASHTRA STATE ELECTRICITY-WH WAREHOUSE",
    chqRef: "ACHMSEDCL00192",
    withdrawal: 38400.0,
    deposit: 0,
    balance: 4777828.0,
    counterparty: "Maharashtra State Electricity Distribution",
    voucherType: "Payment",
    suggestedLedger: "Electricity & Power Utility",
    confidence: 99.1,
    rule37Settled: false,
    matchedInvoiceNo: null,
    itcProtected: 0,
    status: "Auto-Categorized"
  },
  {
    id: "bnk_12",
    date: "2026-07-27",
    narration: "POS-OFFICE DEPOT-A4 PAPER & PRINTER RIBBONS",
    chqRef: "POS77810293",
    withdrawal: 8900.0,
    deposit: 0,
    balance: 4768928.0,
    counterparty: "Office Depot Stationery",
    voucherType: "Payment",
    suggestedLedger: "Printing & Stationery",
    confidence: 93.5,
    rule37Settled: false,
    matchedInvoiceNo: null,
    itcProtected: 0,
    status: "Auto-Categorized"
  },
  {
    id: "bnk_13",
    date: "2026-07-28",
    narration: "CONSOL CHRG/QTR END JUN26 + GST @ 18%",
    chqRef: "CHRG990124",
    withdrawal: 1416.0,
    deposit: 0,
    balance: 4767512.0,
    counterparty: "HDFC Bank Ltd",
    voucherType: "Payment",
    suggestedLedger: "Bank Charges & Commission",
    confidence: 99.8,
    rule37Settled: false,
    matchedInvoiceNo: null,
    itcProtected: 0,
    status: "Auto-Categorized"
  },
  {
    id: "bnk_14",
    date: "2026-07-29",
    narration: "INT COLL-FIXED DEPOSIT MATURITY INTEREST #FD09912",
    chqRef: "INT992014",
    withdrawal: 0,
    deposit: 24850.0,
    balance: 4792362.0,
    counterparty: "HDFC Bank Ltd",
    voucherType: "Receipt",
    suggestedLedger: "Bank Interest Income",
    confidence: 99.5,
    rule37Settled: false,
    matchedInvoiceNo: null,
    itcProtected: 0,
    status: "Auto-Categorized"
  },
  {
    id: "bnk_15",
    date: "2026-07-30",
    narration: "NEFT-DIRECTOR REMUNERATION-RAJESH VERMA-JULY26",
    chqRef: "HDFCN091240182",
    withdrawal: 150000.0,
    deposit: 0,
    balance: 4642362.0,
    counterparty: "Rajesh Verma (Director)",
    voucherType: "Payment",
    suggestedLedger: "Director Remuneration & Fees",
    confidence: 98.9,
    rule37Settled: false,
    matchedInvoiceNo: null,
    itcProtected: 0,
    status: "Auto-Matched"
  }
];

export const AUTONOMY_POLICIES = {
  firmName: "Rajnish & Associates CA Firm",
  policyVersion: "v2026.07-STRICT",
  lastUpdated: "2026-07-28",
  updatedBy: "CA Rajnish Sharma, FCA (Partner)",
  actionRules: [
    {
      id: "rule_ocr",
      category: "Ingestion",
      title: "Invoice OCR & Field Extraction",
      description: "Extract GSTIN, invoice date, amounts, tax split, and HSN codes from incoming scanned/PDF bills.",
      mode: "AUTOMATIC",
      permissionRequired: "None (Autonomous)",
      reversible: true,
      executionEngine: "Sarvam Vision + Regex Verifier"
    },
    {
      id: "rule_exact_recon",
      category: "Reconciliation",
      title: "Exact 3-Way Portal Match",
      description: "Auto-reconcile where GSTIN, Invoice #, and Total Amount match GSTR-2B with zero variance.",
      mode: "AUTOMATIC",
      permissionRequired: "None (Autonomous)",
      reversible: true,
      executionEngine: "DuckDB Vectorized Matcher"
    },
    {
      id: "rule_near_match",
      category: "Reconciliation",
      title: "Near-Match / Rounding Difference",
      description: "Auto-reconcile fractional cent discrepancies and line-item rounding up to defined tolerance threshold.",
      mode: "AUTO_TOLERANCE",
      toleranceAmount: 100,
      permissionRequired: "None (Auto under ₹100)",
      reversible: true,
      executionEngine: "Rule 1.4 Tolerance Engine"
    },
    {
      id: "rule_tax_classify",
      category: "Accounting",
      title: "Tally Purchase Ledger Classification",
      description: "Auto-map Chart of Accounts ledgers based on learned vendor patterns and HSN codes.",
      mode: "RECOMMEND",
      permissionRequired: "Staff / Reviewer 1-Click Approval",
      reversible: true,
      executionEngine: "Vendor Pattern Learned Weights"
    },
    {
      id: "rule_return_filing",
      category: "Statutory",
      title: "GST Return Filing & Portal Submission",
      description: "Generate and submit GSTR-1, GSTR-3B JSON payloads directly to GSTN API.",
      mode: "APPROVAL_REQUIRED",
      permissionRequired: "Senior Partner Digital Signature (Strict)",
      reversible: false,
      executionEngine: "GSTN API Gateway Connector"
    },
    {
      id: "rule_portal_notices",
      category: "Statutory",
      title: "ASMT-10 / DRC-01 Legal Notice Dispatch",
      description: "Dispatch statutory rebuttal replies and supplier payment demand letters.",
      mode: "APPROVAL_REQUIRED",
      permissionRequired: "Senior Partner Review & Authorization",
      reversible: false,
      executionEngine: "Statutory Notice Assistant"
    }
  ],
  confidenceThresholds: [
    {
      tier: "tier_auto",
      range: "> 98.0%",
      label: "Safe to Auto-Process",
      action: "Auto-process & log directly to immutable audit ledger without human queue.",
      countThisMonth: 1051,
      color: "green"
    },
    {
      tier: "tier_notify",
      range: "90.0% – 98.0%",
      label: "Process & Notify",
      action: "Execute posting to Tally draft vouchers and send digest notification.",
      countThisMonth: 147,
      color: "blue"
    },
    {
      tier: "tier_review",
      range: "70.0% – 90.0%",
      label: "Queue for Review",
      action: "Queue in Universal Review Queue with recommended action & evidence drawer.",
      countThisMonth: 38,
      color: "amber"
    },
    {
      tier: "tier_decision",
      range: "< 70.0%",
      label: "Human Decision Required",
      action: "Halt automation; require partner or client verification before posting.",
      countThisMonth: 12,
      color: "red"
    }
  ],
  workspaceRoles: [
    {
      role: "Partner",
      description: "Senior CA with full practice authority",
      canApproveInvoices: true,
      canPostToTally: true,
      canFileReturns: true,
      canConfigurePolicy: true,
      canOverrideRules: true
    },
    {
      role: "Manager",
      description: "Audit senior supervising client pods",
      canApproveInvoices: true,
      canPostToTally: true,
      canFileReturns: false,
      canConfigurePolicy: false,
      canOverrideRules: true
    },
    {
      role: "Reviewer",
      description: "Junior CA / Article clerk inspecting exceptions",
      canApproveInvoices: true,
      canPostToTally: false,
      canFileReturns: false,
      canConfigurePolicy: false,
      canOverrideRules: false
    },
    {
      role: "Staff",
      description: "Data entry and document uploader",
      canApproveInvoices: false,
      canPostToTally: false,
      canFileReturns: false,
      canConfigurePolicy: false,
      canOverrideRules: false
    },
    {
      role: "Automation Agent",
      description: "Yukti Background Autonomous Daemon",
      canApproveInvoices: true,
      canPostToTally: true,
      canFileReturns: false,
      canConfigurePolicy: false,
      canOverrideRules: false
    }
  ]
};

export const DEFAULT_AUDIT_EVENTS = [
  {
    id: "evt_01",
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    user_email: "rajnish@yukti.ai",
    actor_name: "CA Rajnish Sharma",
    actor_role: "Partner",
    action: "TALLY_VOUCHER_POSTED",
    entity_type: "invoice",
    entity_id: "RIL/2026/0892",
    model_version: "tally-gateway-connector-v4.1",
    ruleset_applied: "GST-2026-07-RULE-16",
    inputs_count: 1,
    matched_count: 1,
    flagged_count: 0,
    decision_summary: "Approved automated posting of purchase voucher to Tally Prime Port 9000. Chart of Accounts mapped to 'IT Cloud & Network Infrastructure'.",
    outcome: "POSTED_TO_TALLY",
    confidence: 99.4,
    reversible: true,
    details: { party: "Reliance Industries Limited", amount: 23600, tally_master_id: "40912", port: 9000 },
    replay_snapshot: {
      timestamp: "2026-07-28T10:14:22Z",
      invoice_data: {
        invoice_no: "RIL/2026/0892",
        supplier: "Reliance Industries Limited",
        gstin: "27AAACR5055K1Z2",
        taxable: 20000,
        cgst: 1800,
        sgst: 1800,
        total: 23600
      },
      rules_at_time: ["Rule 1.4 (Tax Check)", "Vendor Pattern #12 (Cloud)"],
      model_metadata: { extractor: "ocr-engine-v4", parser: "sarvam-vision-v2" },
      validation_checks: [
        { check: "GSTIN Checksum", result: "PASSED" },
        { check: "Arithmetic Sum", result: "PASSED" },
        { check: "Tally Ledger Sync", result: "PASSED" }
      ],
      human_override: null
    }
  },
  {
    id: "evt_02",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    user_email: "rajnish@yukti.ai",
    actor_name: "CA Rajnish Sharma",
    actor_role: "Partner",
    action: "INVOICE_APPROVED",
    entity_type: "invoice",
    entity_id: "KIG/26/10492",
    model_version: "vision-extractor-v4",
    ruleset_applied: "GST-2026-07-ROUNDING",
    inputs_count: 1,
    matched_count: 1,
    flagged_count: 0,
    decision_summary: "Senior Partner 1-click approval of near-match invoice with ₹18 fractional cent difference. Safe under firm automation policy.",
    outcome: "APPROVED_AND_QUEUED",
    confidence: 92.5,
    reversible: true,
    details: { party: "Kalyani Industrial Gases Ltd", amount: 230082, auto_mapped_ledger: "Industrial Gases" },
    replay_snapshot: {
      timestamp: "2026-07-28T10:02:11Z",
      invoice_data: {
        invoice_no: "KIG/26/10492",
        supplier: "Kalyani Industrial Gases Ltd",
        gstin: "27AAACK1234J1Z8",
        taxable: 195000,
        tax: 35100,
        total: 230100
      },
      rules_at_time: ["Tolerance Rule 1.4 (<₹100)", "HSN 2804 RCM Exclusion"],
      model_metadata: { extractor: "ocr-engine-v4", matcher: "reconciliation-v3" },
      validation_checks: [
        { check: "Rounding Variance", result: "PASSED (₹18 <= ₹100 tolerance)" },
        { check: "RCM Status", result: "PASSED (Forward charge verified)" }
      ],
      human_override: "Approved by CA Rajnish via Review Queue Hotkey (A)"
    }
  },
  {
    id: "evt_03",
    created_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    user_email: "system@yukti.ai",
    actor_name: "Yukti Autonomous Agent",
    actor_role: "Automation Agent",
    action: "RULE_37_SETTLEMENT_MATCH",
    entity_type: "bank_statement",
    entity_id: "HDFC/2026/0715",
    model_version: "bank-recon-engine-v2",
    ruleset_applied: "GST-RULE-37-180-DAYS",
    inputs_count: 15,
    matched_count: 15,
    flagged_count: 0,
    decision_summary: "Autonomous bank payment match settling invoice payment within 14 days of bill date. Safeguards ₹3,600 ITC from 180-day reversal under Rule 37.",
    outcome: "RULE_37_SETTLED",
    confidence: 99.2,
    reversible: true,
    details: { bank_ref: "NEFT-HDFC-98124", invoice_ref: "RIL/2026/0892", amount: 23600, days_elapsed: 14 },
    replay_snapshot: {
      timestamp: "2026-07-28T09:35:00Z",
      invoice_data: {
        bank_narration: "NEFT-AXIS-RELIANCE INDUSTRIES LTD-RIL20260892",
        invoice_no: "RIL/2026/0892",
        amount_cleared: 23600,
        days_to_pay: 14
      },
      rules_at_time: ["GST Rule 37 (180 Day Payment Window)"],
      model_metadata: { matcher: "narration-fuzzy-matcher-v1.8" },
      validation_checks: [
        { check: "Payment Cleared", result: "PASSED" },
        { check: "Invoice Balance Zeroed", result: "PASSED" }
      ],
      human_override: null
    }
  },
  {
    id: "evt_04",
    created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    user_email: "system@yukti.ai",
    actor_name: "Yukti Autonomous Agent",
    actor_role: "Automation Agent",
    action: "RECONCILIATION_RUN",
    entity_type: "gstr2b_reconciliation",
    entity_id: "RECON-JULY2026",
    model_version: "duckdb-vectorized-recon-v3.2",
    ruleset_applied: "GST-3WAY-PORTAL-V2026.07",
    inputs_count: 1248,
    matched_count: 1198,
    flagged_count: 50,
    decision_summary: "Vectorized 3-way reconciliation completed in 1.18s across 1,248 records. 1,042 exact matches, 98 smart matches, 58 rounding differences resolved. 50 delinquent bills flagged.",
    outcome: "RECONCILIATION_COMPLETED",
    confidence: 96.0,
    reversible: true,
    details: { total_records: 1248, exact_matches: 1042, itc_protected: 1245000, execution_seconds: 1.18 },
    replay_snapshot: {
      timestamp: "2026-07-28T09:02:18Z",
      invoice_data: { total_books_bills: 1248, total_portal_bills: 1198 },
      rules_at_time: ["Pass 1: Exact Hash", "Pass 2: Fuzzy GSTIN/Date", "Pass 3: Rounding Tolerance < ₹100"],
      model_metadata: { engine: "DuckDB columnar engine", execution_ms: 1180 },
      validation_checks: [
        { check: "Exact Matches", result: "1,042 records (100% hash)" },
        { check: "Unmatched Portal Bills", result: "50 records (flagged for Section 16(2)(aa) notices)" }
      ],
      human_override: null
    }
  },
  {
    id: "evt_05",
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    user_email: "rajnish@yukti.ai",
    actor_name: "CA Rajnish Sharma",
    actor_role: "Partner",
    action: "GSTR1_JSON_EXPORT",
    entity_type: "gst_return",
    entity_id: "GSTR1-27AAACR5055K1Z2",
    model_version: "gstn-schema-validator-v1.4",
    ruleset_applied: "GSTN-RETURN-SCHEMA-V3.4",
    inputs_count: 342,
    matched_count: 342,
    flagged_count: 0,
    decision_summary: "Exported schema-validated GSTR-1 payload for Reliance Logistics Pvt Ltd. 100% checksum pass with zero B2B/B2C errors.",
    outcome: "RETURN_PAYLOAD_VALIDATED",
    confidence: 100.0,
    reversible: false,
    details: { client: "Reliance Logistics Pvt Ltd", taxable_val: 2114000, checksum: "Clean Mod-36" },
    replay_snapshot: {
      timestamp: "2026-07-28T08:15:00Z",
      invoice_data: { return_type: "GSTR-1", client_gstin: "27AAACR5055K1Z2", period: "July 2026" },
      rules_at_time: ["GSTN API Schema v3.4", "HSN 6-digit mandatory check"],
      model_metadata: { validator: "gstn-schema-engine-v1.4" },
      validation_checks: [
        { check: "Mod-36 Checksum", result: "PASSED" },
        { check: "Table 4 B2B Invoices", result: "342 vouchers validated" }
      ],
      human_override: null
    }
  },
  {
    id: "evt_06",
    created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    user_email: "rajnish@yukti.ai",
    actor_name: "CA Rajnish Sharma",
    actor_role: "Partner",
    action: "TALLY_CHART_OF_ACCOUNTS_SYNC",
    entity_type: "tally_gateway",
    entity_id: "TALLY-9000",
    model_version: "tally-connector-daemon-v4.1",
    ruleset_applied: "TALLY-XML-ODBC-SYNC",
    inputs_count: 142,
    matched_count: 142,
    flagged_count: 0,
    decision_summary: "Real-time bidirectional sync with Tally Prime 4.1. 142 Chart of Accounts masters synchronized.",
    outcome: "SYNC_SUCCESSFUL",
    confidence: 100.0,
    reversible: true,
    details: { company: "Reliance Logistics Pvt Ltd", ledgers_imported: 142 },
    replay_snapshot: {
      timestamp: "2026-07-28T07:15:00Z",
      invoice_data: { port: 9000, company: "Reliance Logistics Pvt Ltd", host: "127.0.0.1" },
      rules_at_time: ["Tally XML Schema 4.1"],
      model_metadata: { connector: "tally-connector-daemon-v4.1" },
      validation_checks: [
        { check: "Port 9000 Connection", result: "PASSED" },
        { check: "Masters Ingestion", result: "142 ledgers imported" }
      ],
      human_override: null
    }
  }
];

