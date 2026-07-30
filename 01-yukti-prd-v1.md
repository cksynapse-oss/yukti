# Yukti — Product Requirements Document (V1)

**The GST Compliance Capacity Engine for Small CA Firms**

*Version: 1.0*
*Status: Ready to build*
*Last updated: July 2026*
*Authors: [You], Rajnish [surname]*
*Target ship: 14 weeks from kickoff*

---

## 0. How to read this document

This PRD defines exactly what V1 of Yukti does — and more importantly, what it does *not* do. It is opinionated. Scope creep is the single largest risk to shipping in 14 weeks, so every section includes an explicit "Out of scope" note. When in doubt, defer.

Engineers should be able to start building from Section 7 onward. Rajnish should be able to validate product behavior from Section 5 onward. Everyone should internalize Section 1 before doing either.

---

## 1. The product in one sentence

**Yukti makes a CA firm's existing team 2× more productive — starting with GST compliance — by automating invoice intake, reconciliation, and return preparation, and presenting only the exceptions that need human judgment.**

If a proposed feature doesn't make that sentence more true, it doesn't ship in V1.

---

## 2. Problem statement

### 2.1 The user's problem

A typical small CA firm in India looks like this: 1 principal CA, 1-2 senior CAs, 3-6 junior staff (article clerks, B.Com graduates, CA finalists), servicing 25-60 client businesses. The firm's biggest operational cost after rent is junior salaries. The firm's biggest constraint is not cost — it is throughput. They turn away new clients every quarter because their juniors cannot absorb more work.

Of the work the juniors do, 65–70% is fully automatable, another ~20% is semi-automatable (needs review, not creation):
- Collecting invoices from clients (WhatsApp, email, paper)
- Typing invoices into Tally
- Downloading GSTR-2B from the GSTN portal
- Matching purchases with GSTR-2B (the reconciliation grind)
- Preparing GSTR-1 and GSTR-3B
- Chasing clients and vendors for missing data
- Generating challans, filing returns, saving acknowledgments

This work is repetitive, deadline-driven, error-prone, and increasingly punitive — GSTR-3B has moved toward hard-lock, meaning a single unresolved mismatch can block a client's filing and trigger penalties. The firm spends ~10 hours per month per client on GST alone.

### 2.2 Why this problem, why now

Three forces have converged in 2025-2026 that make this solvable now and urgent:

**The regulatory push.** GSTR-3B hard-lock, e-invoicing expansion below ₹5Cr turnover, AIS/TIS auto-population, and pre-filled ITR forms mean compliance quality is enforced upstream by the government itself. "Close enough" no longer works. CAs need reconciliation-grade accuracy or their clients get blocked.

**The AI capability shift.** Document intelligence that required custom ML teams in 2022 is now a Claude API call in 2026. What took 50 engineer-months to build in-house can be assembled in 14 weeks by a small team using modern foundation models plus targeted custom code.

**The competitive vacuum.** ClearTax dropped accounts below ₹50K/year in late 2025 and is migrating small users elsewhere. Optotax is stuck in GST-only mode. EasyOffice is a desktop product from a different era. Munim, CAGos, and PracticeStacks offer practice management but lack AI document intelligence. TallyPrime has Connected GST and AI invoice features, but serves the business's accountant — not the CA firm managing 40+ clients. Nobody has built a product that combines AI-powered document intake + intelligent reconciliation + exception-first review + practice management — specifically for the CA firm principal.

### 2.3 The reframe we use internally

Yukti is not "GST software." It is **a capacity-expansion tool** that happens to start with GST as its first automated role. We sell growth, not cost savings. Cost savings is the side effect; growth is the hook.

**Positioning vs. Tally:** Tally is the client's bookkeeping engine. Yukti is the CA's operating system. We work *with* Tally (importing Tally exports, generating Tally vouchers), never against it. Our value is the multi-client intelligence layer that sits on top of Tally data.

---

## 3. Target users & personas

### 3.1 The buyer: CA firm principal

**Who they are:** Chartered Accountant, firm partner or proprietor, 35-55 years old, typically in tier-1 or tier-2 city. Runs a 5-15 person firm servicing 25-60 client businesses. Has been in practice 10-25 years.

**What they want:** More clients without more chaos. They've turned away work in the last 6 months. They've considered hiring but training takes 6 months and good juniors leave after 18. They'd rather pay for software if it actually worked.

**How they buy:** Referrals from other CAs, demos that prove ₹ impact in under 10 minutes, ability to trial with 1-2 clients before committing the full book. They are skeptical of marketing, allergic to long sales cycles, and will walk away the first time your software makes them look bad to their client.

**Their risk calculation:** Every mistake Yukti makes is *their* reputation. They won't use a tool that acts autonomously on their clients. They will use a tool that does the work and asks for approval.

### 3.2 The primary user: senior CA / review authority

**Who they are:** Qualified CA, 28-45 years old, either partner or senior associate. Currently spends their day supervising juniors, catching their errors, and approving filings.

**What they want:** To stop being a code reviewer for junior data entry. They want to focus on client advisory, complex compliance cases, and growing the firm. They want a tool that filters the 500 invoices per client down to the 20 that actually need human judgment.

**What they fear:** Losing audit trails. Missing something the tool processed "automatically." Being unable to explain a filing to a client six months later.

### 3.3 The secondary user: junior staff / compliance operator

**Who they are:** Article clerks, semi-qualified CAs, B.Com graduates. 22-28 years old. The ones whose work we're automating.

**Product stance:** Yukti does not hide from the junior. It replaces the rote parts of their job but shows its work. The firm keeps 1-2 juniors who operate Yukti (upload, trigger runs, handle the truly exceptional cases) rather than typing invoices. Their job becomes *more interesting*, not eliminated entirely.

This matters for adoption. If juniors feel threatened, they will sabotage the rollout inside the firm. Yukti's UX for juniors should position them as "Yukti operators" — the people who run the system, not the people it replaces.

### 3.4 The invisible user: the CA's client

**Who they are:** The CA's end client — a small business owner who sends invoices to their CA every month.

**What changes for them:** Instead of emailing a zip file once a month, they forward invoices to a WhatsApp number or email address as they receive them. They get real-time status: "your GST return for March is ready, please approve." They answer auto-generated queries about missing invoices.

**Why this matters:** The client's behavior change is the pipeline that makes Yukti work. If clients can't be moved from "dump a folder on deadline day" to "forward as you receive," the whole system stalls.

### 3.5 Missing but relevant personas

**The client's accountant/bookkeeper:** In many SMEs, an in-house bookkeeper sends invoices to the CA firm. Their willingness to adopt email/WhatsApp forwarding is a critical adoption gate. Yukti's intake UX must be simple enough that a non-technical bookkeeper can use it without training.

**Semi-qualified CAs (CA-Intermediate pass):** A large segment runs their own small practices. They fit our target profile but may have fewer clients (10–20) and tighter budgets. They are a V2 expansion segment, not V1 pilot targets.

---

## 4. Jobs to be done

A firm hires Yukti to do these six jobs. Each job is independently valuable. All six together replace the GST compliance role.

**Job 0: Track deadlines and compliance calendar across all clients.** Auto-generated from client registrations. Reminders to team members and clients. This is the foundation — CAs live and die by filing deadlines (GSTR-1 by 11th, GSTR-3B by 20th, TDS quarterly, ITR annual).

**Job 1: Collect invoices from clients as they happen, not on deadline day.** The CA firm has a WhatsApp number / email address per client. The client forwards invoices in real-time. Yukti intakes, classifies, stores.

**Job 2: Extract structured data from unstructured documents.** Raw WhatsApp photo of a crumpled invoice → vendor, GSTIN, invoice number, date, line items, taxes, total — all structured, all confidence-scored.

**Job 3: Keep books up to date continuously.** Every processed invoice becomes a voucher ready to post to Tally. The firm's Tally data stays 80-90% current without a junior typing.

**Job 4: Match books with the GSTN portal and find every rupee of ITC at risk.** Purchase register versus GSTR-2B, with mismatches classified and prioritized by ₹ impact.

**Job 5: Turn mismatches into action.** Auto-drafted vendor follow-up emails for "not on portal" cases. Client queries for "missing documents." Flagged review items for the senior CA.

**Job 6: Prepare GSTR-1 and GSTR-3B for the senior's one-click approval.** Returns generated from reconciled data. Senior reviews summary, approves, downloads JSON for portal upload.

**Job 7: Give clients real-time status on their filings.** 'Where is my return?' is the #1 client call to CA firms. Yukti auto-generates status updates via WhatsApp/email so the CA doesn't have to answer this question manually.

---

## 5. V1 goals & non-goals

### 5.1 In scope (V1 — ships in 14 weeks)

- Multi-tenant firm + client management
- Client onboarding with Tally purchase register import (Excel/XML)
- Invoice intake: web upload, email forwarding (standard), WhatsApp Business API (premium add-on)
- Document intelligence pipeline powered by Sarvam AI (OCR → classify → extract → validate → score)
- GSTR-2B upload (CA pastes downloaded file; no portal API in V1)
- Reconciliation engine with 3-pass matching + ITC impact scoring
- Senior review dashboard with exception-first UI
- Vendor follow-up generation and sending (email + WhatsApp)
- GSTR-1 and GSTR-3B draft generation with one-click approval
- JSON export for manual upload to GSTN portal
- Compliance deadline calendar with auto-reminders
- Client filing status notifications (email, WhatsApp)
- Analytics: monthly value dashboard (ITC recovered, invoices processed, hours saved)
- Basic user management with RBAC (principal, senior, junior, read-only)
- Audit trail for every state change

### 5.2 Out of scope (V1 — explicit deferrals)

- **Direct GSTN API filing.** Requires GSP partnership; 6-month parallel track.
- **TDS/TCS automation** (Role 2). Phase 2.
- **ITR filing** (Role 3). Phase 3.
- **MCA/ROC compliance** (Role 4). Phase 4.
- **Bank feed integration** (Role 5). Phase 3.
- **Real-time Tally sync via agent.** V1 uses manual Tally export imports. Live sync in V2.
- **AI notice reader / drafter.** Phase 3.
- **Client-facing portal.** V1 clients only interact via WhatsApp and email.
- **Mobile app.** Web-responsive only in V1.
- **Multi-region deployment.** AWS Mumbai only.
- **Custom rule builder UI.** V1 rules are code-defined. Configurable UI in Phase 4.
- **SSO / SAML.** Email + password + MFA only.

Anything not in 5.1 does not get built in V1. No exceptions. Scope creep is handled by writing the feature into the V2 backlog, not by building it.

### 5.3 Success metrics for V1

The V1 release is successful if, 90 days after going live with the 5 pilot firms:

- **Primary:** At least 3 of 5 firms report they have redeployed or not-hired at least one FTE because of Yukti.
- **Primary:** 80%+ of processed invoices are auto-posted to books without human correction (confidence ≥ 90) by month 3 of each firm's usage.
- **Primary:** Reconciliation reports identify ITC-at-risk averaging ≥ ₹50,000 per client per month across the pilot cohort.
- **Secondary:** Monthly time spent on GST work per client drops from ~10 hours to ≤ 2 hours (measured by CA self-report).
- **Secondary:** At least 4 of 5 pilot firms commit to renew for a 6-month second term at ≥ ₹12,000/month (pilot pricing).
- **Secondary:** At least 2 of the 5 pilot firms refer a new paying firm.

If fewer than 3 of these are hit, V1 has failed product-market fit and we do not proceed to V2 without a redesign.

---

## 6. Product principles

These are the tie-breakers when two reasonable designs compete.

**Principle 1: Exception-first, not dashboard-first.** The senior CA should see the 5-10% that needs judgment, not the 100% that was processed. Every UI defaults to "show me what needs me."

**Principle 2: Show your work.** Every automated decision has a confidence score, an audit trail, and a one-click "show me why" explanation. Black boxes lose in this market.

**Principle 3: Approval is one click. Exceptions take a conversation.** Happy paths should be friction-less. Edge cases are where the product earns its price.

**Principle 4: Defer irreversible actions.** Yukti drafts emails; CA sends them. Yukti prepares returns; CA approves and files them. Yukti never takes an external action without explicit human authorization in V1.

**Principle 5: Data privacy is sacred.** Financial PII is encrypted at column level. All data stays in India (AWS Mumbai). DPDP Act compliant from Day 1. Formal Data Processing Agreements with every firm. When a CA asks 'where is my client's data?', the answer must be immediate and complete.

**Principle 6: Graceful degradation.** If AI is down, the review queue still works manually. If WhatsApp fails, email works. If the internet is spotty, previously-loaded data remains usable. Every automated path has a manual fallback. We never leave a CA stranded during filing week.

**Principle 7: Fast is a feature.** Reconciliation runs on 10,000 records should complete in under 30 seconds. Invoice processing should complete in under 15 seconds. Every second of lag is a CA who closes the tab.

**Principle 8: Every output is client-ready.** Reports, follow-up emails, and return summaries must be presentable to the CA's client without reformatting.

**Principle 9: Learn from every correction.** When a CA edits an AI-extracted field, that correction feeds back into the per-vendor pattern store. By month 3, the product should be noticeably smarter for each firm than it was on day 1.

---

## 7. User flows (the core ten)

Each flow below is a critical path for V1. Any flow broken at launch is a launch blocker.

### Flow 1: Firm onboarding (day 1)

1. Principal CA signs up via email invite link.
2. Enters firm details: name, address, GSTIN (if applicable), PAN, primary contact.
3. Invites up to 5 team members with roles (senior, junior, viewer).
4. Sees onboarding checklist: add first client, import purchase register, set up WhatsApp number.
5. Clicks "add first client."

**Time to complete: under 5 minutes.**

### Flow 2: Client onboarding

1. Senior clicks "Add client."
2. Enters client business name, GSTIN, primary contact.
3. Uploads Tally purchase register (Excel export) for the current financial year.
4. Yukti parses and previews: "Found 1,247 purchase entries across 84 vendors for FY 2025-26. Proceed?"
5. Senior confirms. Data is imported into the client's master table.
6. Optional: uploads historical GSTR-2B Excel files for back-reconciliation.
7. Client is now active. Assigned a unique WhatsApp intake number + email address.
8. Senior copies those to send to the client's staff.

**Time to complete: under 10 minutes per client.**

### Flow 3: Invoice intake — WhatsApp

1. Client's staff forwards or sends an invoice photo/PDF to the client's dedicated Yukti WhatsApp number.
2. Yukti bot auto-acknowledges: "Got it. Processing invoice. I'll update you in 30 seconds."
3. Document enters the processing pipeline (see Flow 4).
4. On completion, bot replies: "Invoice from [Vendor] for ₹[amount] received. Added to your books."
5. On failure or low confidence: "Invoice from [Vendor] received but we need your CA to review. We'll be in touch."

**Latency target: full acknowledgment within 30 seconds of receipt.**

### Flow 4: Document processing pipeline (automated)

Every document — regardless of intake channel — passes through:

1. **Normalize**: fix compression, deskew, enhance, crop.
2. **Classify**: determine document type (purchase invoice, sales invoice, bank statement, etc.).
3. **OCR**: Sarvam Vision API (primary, 22 Indian languages), Google Vision (fallback), Surya (self-hosted fallback for edge cases).
4. **Extract**: regex for deterministic fields (GSTIN, PAN, dates), Sarvam 30B self-hosted for contextual (line items, vendor name, tax breakdown).
5. **Validate**: GSTIN checksum, math checks, duplicate detection.
6. **Categorize**: auto-assign Tally ledger from vendor history; use Sarvam 30B if new vendor.
7. **Score**: composite confidence 0-100.
8. **Route**: ≥90 = auto-posted; 75-89 = posted-but-flagged; <75 = review queue.

**Latency target: 12 seconds p50, 25 seconds p95.**

Technical specifics are in the Technical Architecture document, Section 5.

### Flow 5: Monthly reconciliation run

1. Senior opens client's GST page.
2. Uploads the GSTR-2B Excel file downloaded from the portal for the filing month.
3. Clicks "Run reconciliation."
4. Yukti executes 3-pass matching (exact → fuzzy → smart) across purchase register and GSTR-2B.
5. Progress bar shows live status; typical 10K-record run completes in 15-25 seconds.
6. Reconciliation report renders:
   - Matched: X records, ₹Y ITC claimable — auto-reconciled.
   - Near match: X records — review with one-click approve.
   - Amount mismatch: X records — flagged.
   - In books not on portal: X records — vendor follow-up ready.
   - On portal not in books: X records — ITC being missed, action needed.
   - Duplicates: X records — urgent review.
7. Summary line at top: "₹X ITC safely claimable. ₹Y at risk pending resolution."
8. Senior clicks into each category to resolve.

### Flow 6: Senior review dashboard

**This is the heart of the product.** Described in full in Section 8.1.

Core flow: senior lands on dashboard, sees prioritized queue across all clients, works top-to-bottom resolving exceptions, approves bulk-auto-matches with single clicks, resolves individual items with 2-3 clicks each.

**Efficiency target: senior can close 500+ review items per hour.**

### Flow 7: Vendor follow-up

1. After reconciliation, "In books not on portal" items are listed with auto-drafted follow-up emails.
2. Senior reviews the drafts (all visible in a single scrollable panel).
3. Senior clicks "Send all" to dispatch the entire batch, or reviews individually.
4. Emails sent via the firm's configured outbound email address.
5. Follow-up status tracked: sent → reminder at 7 days → escalation at 14 days → marked-resolved when vendor files.
6. When GSTR-2B updates show the missing invoice now present, Yukti auto-marks the follow-up resolved and notifies the senior.

### Flow 8: Return preparation & approval

1. Senior opens "GST Returns" page for a client.
2. Sees two draft returns: GSTR-1 and GSTR-3B for the filing month.
3. Each shows summary: outward supplies, inward supplies, tax payable, ITC claimable, net payable.
4. Senior clicks into each to review line items (drill-down).
5. Once satisfied, senior clicks "Approve and generate JSON."
6. Yukti generates the GSTN-compliant JSON files.
7. Senior downloads them.
8. Senior manually uploads to the GSTN portal and files. (In V2, direct API filing.)
9. Senior pastes the filing acknowledgment back into Yukti or uploads the receipt PDF.
10. Yukti marks the return as filed for audit trail.

### Flow 9: Analytics (monthly value proof)

1. Principal opens "Firm Analytics" on the 1st of every month.
2. Sees, for the previous month:
   - Clients serviced
   - Invoices processed
   - Auto-post rate %
   - ITC recovered from reconciliation
   - Hours saved (estimated by invoices × 2 min manual vs auto)
   - Returns filed / on time
   - Cost of Yukti for the month
   - ROI: (ITC recovered + hours saved value) / cost
3. Can export as PDF for firm records.

**This dashboard exists to justify renewal. Never skimp on it.**

### Flow 10: Junior operator view

1. Junior logs in, sees their dashboard: clients assigned to them.
2. For each client: count of items in review queue, deadlines approaching, pending client uploads.
3. Junior can process review items up to their permission level.
4. Items requiring senior judgment are flagged and escalated.
5. Junior sees their own productivity: invoices handled this week, accuracy score.

---

## 8. Feature specifications

### 8.1 Senior review dashboard (the central product)

**Purpose:** Enable a senior CA to supervise the compliance work of 40+ clients in under 2 hours per week.

**Default view:** Exception queue across all clients, sorted by ₹ impact descending.

**Columns:**
- Client name
- Issue type (amount mismatch / missing document / duplicate / etc.)
- ₹ impact (the ITC or exposure at risk)
- Severity tag (auto-assigned: critical / high / medium / low)
- Age (days since flagged)
- Suggested action (one-click button)

**Bulk actions:**
- "Approve all near-matches under ₹1,000" (clears 70% of noise in one click)
- "Send all vendor follow-ups"
- "Mark all duplicates reviewed" (after spot-check)

**Individual item view (modal on click):**
- Left panel: the original invoice image / PDF
- Right panel: extracted fields, editable
- Bottom: the matched (or unmatched) GSTR-2B entry
- Actions: Approve / Reject / Edit / Ask client / Flag for partner

**Keyboard-first:**
- `J` / `K` = next / previous item
- `A` = approve
- `R` = reject
- `E` = edit
- `?` = shortcuts help

A senior CA on a laptop should be able to work through 100 review items in under 30 minutes without touching the mouse. This is non-negotiable.

### 8.2 Document intelligence pipeline

See Section 5 of the Technical Architecture document for full specification. PRD-level behavior:

- **Supported formats:** JPG, PNG, PDF (scanned or digital), Excel (for purchase registers), JSON (for e-invoices).
- **Supported languages:** English primary, Hindi secondary, mixed acceptable.
- **Output contract:** every invoice produces a structured JSON object with 30+ fields and per-field confidence scores.
- **Feedback loop:** every CA correction is captured and used to improve future extractions for that vendor. Corrections feed the Sarvam 30B fine-tuning pipeline — by month 6, each firm's Yukti is measurably smarter than Day 1.

### 8.3 Reconciliation engine

See Section 6 of the Technical Architecture document for algorithmic detail. PRD-level behavior:

- **Speed:** 10,000 records reconciled in under 30 seconds.
- **Accuracy:** 98%+ match rate on records that *should* match; under 0.1% false-positive rate.
- **Output:** seven-bucket classification of every record — Exact / Near / Amount-mismatch / Tax-rate-mismatch / Books-only / Portal-only / Duplicate.
- **ITC impact:** every mismatch annotated with ₹ value at risk, used for prioritization.
- **Learning:** repeated corrections of specific vendor patterns (common typos in invoice numbers, etc.) tune the matcher per firm.

### 8.4 Vendor follow-up system

- **Trigger:** "In books not on portal" mismatch detected during reconciliation.
- **Template:** Pre-written professional email / WhatsApp text with the CA firm's branding. Includes invoice details (number, date, amount), clear ask (file your GSTR-1 reflecting this invoice), deadline (ideally 7 days before GSTR-3B due date), contact for questions.
- **Channels:** Email (primary), WhatsApp (if vendor contact includes a phone number).
- **Cadence:** Initial send → 7-day reminder → 14-day escalation with partner CC'd.
- **Auto-resolution:** When next GSTR-2B upload shows the invoice, follow-up is closed and CA is notified of the win.

### 8.5 GSTR-1 and GSTR-3B preparation

- **GSTR-1:** Generated from outward supply data (sales invoices + credit/debit notes in the client's books). Sections: B2B, B2C large, B2C small, exports, nil-rated, HSN summary, documents issued.
- **GSTR-3B:** Generated from reconciled inward supplies + sales + tax payable calculation. Sections: outward supplies summary, ITC eligibility, tax liability, interest/late fee if applicable.
- **Format:** Exported as GSTN-compliant JSON. Also displayed as human-readable preview with drill-down to source transactions.
- **Validations before approval:** GSTR-1 cross-check against GSTR-3B outward totals; ITC claimed matches reconciled inward supplies; HSN summary matches line items.

### 8.6 Analytics

- **Firm-level monthly:** see Flow 9.
- **Client-level monthly:** per-client report CA can share with the client.
- **Operator-level:** junior productivity (for performance review context).

---

## 9. Non-functional requirements

### 9.1 Performance

| Metric | Target |
|---|---|
| Dashboard initial load (p50) | < 2 seconds |
| Dashboard initial load (p95) | < 4 seconds |
| Document OCR + extraction (p50) | < 12 seconds |
| Document OCR + extraction (p95) | < 25 seconds |
| Reconciliation run on 10K records | < 30 seconds |
| Reconciliation run on 50K records | < 2 minutes |
| WhatsApp bot acknowledgment latency | < 5 seconds |

### 9.2 Reliability

- 99.5% uptime target in year 1 (equivalent to ~3.6 hours downtime/month).
- Planned maintenance windows outside filing deadline weeks (1st-20th of each month).
- RPO (recovery point objective): 1 hour. RTO (recovery time objective): 4 hours.
- Daily automated backups with 30-day retention; quarterly restore drills.

### 9.3 Security & compliance

- **Data residency:** All customer data stored in AWS Mumbai (ap-south-1). No data leaves India without explicit consent.
- **Encryption at rest:** AES-256 for RDS, S3, EBS.
- **Encryption in transit:** TLS 1.3 enforced; HSTS on all endpoints.
- **Authentication:** Email + password + mandatory MFA for principal and senior roles.
- **Authorization:** Role-based (principal, senior, junior, viewer) with firm-level isolation via Postgres row-level security.
- **PII handling:** PAN and GSTIN encrypted at the column level using KMS.
- **Audit logging:** Every state-changing action logged with user, timestamp, IP, old-value, new-value. Immutable append-only log.
- **Compliance roadmap:** SOC2 Type I in year 1, ISO 27001 + Type II in year 2. DPDP Act 2023 compliance from day 1.

### 9.4 Usability

- **Browser support:** Chrome, Edge, Safari, Firefox — last 2 major versions.
- **Responsive:** desktop-first, tablet usable, phone view-only (no bulk operations on phone in V1).
- **Accessibility:** WCAG 2.1 AA minimum. Keyboard navigation for all primary flows.
- **Language:** English UI in V1. Hindi UI in V2.
- **Onboarding time:** new firm should reach "first reconciliation complete" in under 90 minutes of sign-up.

### 9.5 Scalability

V1 must handle:
- 25 active firms
- 500 total active clients across all firms
- 100,000 documents processed per month
- 5 million reconciliation records per month

V2 architecture must be positioned to scale 10x without rewrite.

---

## 10. Release criteria (definition of done for V1)

V1 ships when:

- All 10 user flows are implemented end-to-end and tested with Rajnish's firm data.
- 5 pilot firms are onboarded and active at pilot pricing of ₹12,000/month.
- Document pipeline processes ≥ 95% of real test documents at ≥ 80 confidence score on first pass.
- Reconciliation engine achieves ≥ 98% match rate on Rajnish's 3 largest clients' historical data.
- Full audit trail operational; every user action is traceable.
- Security review passed: no critical or high-severity vulnerabilities in OWASP Top 10.
- Documentation: user guide, admin guide, onboarding checklist, internal runbooks.
- Monitoring: Sentry for errors, uptime monitoring for critical endpoints, daily automated health report.
- 30-day support plan: founder + engineer on call for the first 30 days of each pilot firm's usage.

Not ready to ship until all of the above are true. No "soft launches."

---

## 11. Explicitly out of scope for V1

This list exists so that when someone proposes one of these in week 8, the conversation is short.

- Direct GSTN portal filing
- TDS/TCS automation
- ITR preparation and filing
- ROC/MCA filings
- Bank feed integration
- Real-time Tally sync (we use Tally Excel exports)
- AI notice reader / drafter
- Dedicated client-facing portal
- Mobile apps (iOS, Android)
- Multi-currency
- Multi-region deployment
- White-label / custom branding for firms
- Public API for third-party integrations
- SSO / SAML
- Custom report builder
- A built-in billing / invoicing product for the CA firm
- Email marketing to the CA's clients
- Tax advisory content library

Every one of these is a reasonable future feature. None of them ship in V1.

---

## 12. Open questions & decisions needed before code

These must be resolved before week 1 of the build. Tracked in a separate decision log.

1. **Which WhatsApp Business Solution Provider (BSP) do we use?** Gupshup vs. Wati vs. AiSensy vs. direct Meta. Depends on pricing, template approval speed, and API quality. WhatsApp is premium add-on tier. Pricing model changed to per-message (July 2025). Get binding Gupshup quote before committing. **Owner: [You]. Due: week of kickoff.**

2. **How do we handle GSP partnership for future direct GSTN API?** Start conversations with Masters India, Cygnet, or TCS. **Owner: Rajnish. Due: week 2 of build.**

3. **Pricing contract form.** Monthly invoice vs. annual prepay? Auto-debit vs. manual? **Owner: [You] + finance advisor. Due: week 4.**

4. **Pilot SLA.** What uptime and support response do we commit to the 5 pilot firms? **Owner: [You] + Rajnish. Due: before pilot contracts go out.**

5. **Data migration for pilot firms.** How do we handle the firm's existing 6 months of historical data? Do we back-reconcile or start fresh? **Owner: Rajnish. Due: week 6.**

6. **Brand, logo, name confirmation.** Is "Yukti" the final product name? Trademark search + domain registration. **Owner: [You]. Due: week 2.**

7. **Junior operator training materials.** Who produces the training content for the juniors in the pilot firms? **Owner: Rajnish + you. Due: week 10.**

8. **What happens if a pilot firm wants to add a 6th client mid-pilot?** Pricing, onboarding flow. **Owner: [You]. Due: week 8.**

9. **Data Processing Agreement (DPA).** Yukti is a data processor under DPDP Act. CA firms are data fiduciaries. Formal DPA required with every firm. Engage compliance lawyer by week 2. Budget ₹2–3L. **Owner: [You]. Due: week 2.**

10. **Sarvam AI partnership/pricing.** Get enterprise pricing from Sarvam for Vision API. Evaluate Sarvam 30B self-hosting costs on AWS GPU instances. **Owner: [You]. Due: week 1.**

---

## 13. Beyond V1 — The CA Operating System roadmap

V1 GST compliance is the foot in the door. The product vision extends to five roles:

**Role 1 (V1, weeks 1–14): GST Compliance Engine.** Invoice intake, AI extraction, reconciliation, return preparation, vendor follow-ups, deadline calendar.

**Role 2 (V2, months 4–6): TDS/TCS Automation.** Deductee management, challan generation, quarterly returns (24Q/26Q/27Q), Form 16/16A, TDS reconciliation with 26AS/AIS.

**Role 3 (V3, months 7–10): ITR Preparation.** AIS/TIS import, income computation, deduction optimization, ITR form auto-selection, JSON generation, bulk e-filing. This targets the July–September peak when firms actually turn away clients.

**Role 4 (V2 parallel track, months 4–6): Practice Management.** Client CRM, compliance deadline calendar, task assignment and tracking, credential vault (encrypted portal passwords), billing and invoicing, renewal tracking (DSCs, licenses), team performance analytics. This is the stickiness feature — once firm operations run on Yukti, switching cost is very high.

**Role 5 (V4, months 10+): Notice & Advisory Intelligence.** AI notice parsing (Sarvam 30B), response draft generation, notice lifecycle tracking, compliance risk scoring per client, advisory reports.

Each role is independently valuable. All five together make Yukti the operating system for a CA practice — something Tally (a bookkeeping engine) and ClearTax (an enterprise filing tool) are not positioned to build.

---

## Appendix A: Glossary

- **GSTR-1:** Monthly return of outward supplies (sales) filed on the GSTN portal.
- **GSTR-3B:** Monthly summary return with self-declared tax liability and ITC claim.
- **GSTR-2B:** Auto-generated statement of inward supplies (purchases) based on suppliers' GSTR-1 filings.
- **ITC (Input Tax Credit):** Tax already paid on purchases, claimable against tax payable on sales.
- **GSP (GST Suvidha Provider):** Authorized third party providing API access to the GSTN.
- **ERI (E-Return Intermediary):** Entity authorized by Income Tax Department to file ITRs on behalf of taxpayers.
- **TDL (Tally Definition Language):** Tally's plugin/customization language.
- **ICAI:** Institute of Chartered Accountants of India; professional body.
- **DPDP Act:** Digital Personal Data Protection Act, 2023.

---

## Appendix B: References

- ICAI firm statistics (Oct 2025): https://www.icai.org/post/list-of-firms
- GSTN API and GSP program: https://www.gstn.org.in
- ERI registration portal: https://tin.tin.nsdl.com/eri
- GSTR-3B hard-lock advisory: GSTN portal advisories, 2024-2025.

---

*End of PRD V1. Last reviewed [date]. Next review: week 6 of build.*
