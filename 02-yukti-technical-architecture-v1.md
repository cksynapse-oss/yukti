# Yukti — Technical Architecture (V1)

**The engineering blueprint for shipping in 14 weeks.**

*Version: 1.0*
*Status: Ready to build*
*Last updated: July 2026*
*Companion document: `01-yukti-prd-v1.md`*

---

## 0. How to read this document

This document describes the complete technical architecture for Yukti V1 — the GST Compliance Capacity Engine. It should be readable by any senior engineer who has built a production web application before. It is opinionated by design: alternative approaches considered are noted, but the chosen path is stated unambiguously.

Every architectural choice in this document answers one question: **what is the simplest design that lets 2 engineers plus a technical co-founder ship a multi-tenant production product in 14 weeks that can scale to 100 firms in year 1 without a rewrite?**

We optimize for three things, in order: (1) shipping speed, (2) correctness of financial data, (3) scalability. Flashy is not on the list.

---

## 1. Architectural principles

These are the decisions that aren't up for debate once code starts. They bind every subsequent technical choice.

### 1.1 Modular monolith, not microservices

V1 is a single deployable backend with clearly separated internal modules. Each module has a defined interface. We do not extract services until we have evidence a module needs independent scaling. Microservices prematurely adopted cost 2-3x the engineering time and give us zero customer-visible value in year 1.

Practically: one Python FastAPI application, one deployment, one database connection pool. Internal modules communicate by function call, not HTTP.

### 1.2 Multi-tenant from commit #1

Every database table carries `firm_id`. Every API endpoint enforces firm-level authorization. Postgres row-level security (RLS) is enabled on every tenant-scoped table. There is no "we'll add multi-tenancy later" phase. Retrofitting multi-tenancy is how startups die at 20 customers.

### 1.3 Event-driven core, synchronous edges

The document processing pipeline, reconciliation engine, and notification systems are event-driven via a queue. User-facing API calls are synchronous except when they explicitly return a job ID (e.g., "upload invoice" returns a job ID immediately; the processing happens asynchronously).

### 1.4 AI is a component, not the architecture

We call Sarvam AI (Vision API for OCR, self-hosted 30B for extraction) as specialized tools within deterministic pipelines. The overall system is not "an AI agent that does CA work." It is a traditional web application where specific steps use AI. This distinction matters enormously for reliability, auditability, and cost.

### 1.5 Every AI output has a confidence score

No AI-generated value is ever stored without an accompanying confidence number. Every UI that shows AI output shows the confidence. Every stored field has a `confidence` column alongside the `value` column.

### 1.6 Human-in-the-loop by design

V1 takes no irreversible external action without human approval. Invoices are posted to the books automatically. Emails to vendors require a click. Return JSONs are generated automatically but filing is manual. This is not a limitation; it is a deliberate risk posture for a financial-compliance product.

### 1.7 Audit trail is a first-class feature, not a log file

Every state change in the system is recorded in a structured, queryable, immutable audit trail. When a client calls in 14 months asking "who approved this ITC claim on March 3rd," the answer must be a single query.

### 1.8 Test with real data from week 1

Rajnish's firm's anonymized client data is our golden test set. We do not build synthetic test data beyond the first week. Real invoices break in real ways that synthetic data never does.

---

## 2. System overview

### 2.1 The three-layer architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         INTAKE LAYER                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│  │  WhatsApp  │ │   Email    │ │  Web Upload│ │Tally Import│    │
│  │   Webhook  │ │  Inbound   │ │    Form    │ │  (Excel)   │    │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘    │
└────────┼──────────────┼──────────────┼──────────────┼───────────┘
         │              │              │              │
         └──────────────┴──────┬───────┴──────────────┘
                               │
                      ┌────────▼─────────┐
                      │   INGESTION API  │
                      │   (FastAPI)      │
                      └────────┬─────────┘
                               │
                      ┌────────▼──────────────────────────────┐
                      │         EVENT QUEUE (Redis/BullMQ)    │
                      └────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                        CORE ENGINE                              │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────────────┐     │
│  │   Document   │ │ Reconciliation│ │  Return Preparation│     │
│  │ Intelligence │ │    Engine     │ │      Service       │     │
│  └──────────────┘ └───────────────┘ └────────────────────┘     │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────────────┐     │
│  │  Workflow    │ │  Notification │ │  Analytics Engine  │     │
│  │ Orchestrator │ │   Hub         │ │                    │     │
│  └──────────────┘ └───────────────┘ └────────────────────┘     │
└────────────────────────────┬────────────────────────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ┌───────▼──────┐       ┌───────▼──────┐
           │  PostgreSQL  │       │   S3 Bucket  │
           │  (Primary)   │       │  (Documents) │
           └──────────────┘       └──────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                        OUTPUT LAYER                             │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐         │
│  │ Senior CA    │ │ Junior       │ │ Client via      │         │
│  │ Dashboard    │ │ Operator UI  │ │ WhatsApp/Email  │         │
│  │ (Next.js)    │ │ (Next.js)    │ │ (bot replies)   │         │
│  └──────────────┘ └──────────────┘ └─────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Request lifecycle example

A client sends a WhatsApp photo of an invoice. Here's what happens:

1. **Meta (WhatsApp)** delivers the message to our BSP (Gupshup). *(WhatsApp intake is a premium add-on; email + web upload are standard.)*
2. **Gupshup** forwards via webhook to `POST /webhooks/whatsapp`.
3. **Ingestion API** validates signature, identifies client from WhatsApp number mapping, saves raw media to S3, creates a `document` row in Postgres, publishes `DocumentReceived` event.
4. **Queue worker** consumes the event, runs the 6-stage document intelligence pipeline.
5. Each stage emits progress events; final stage emits `DocumentProcessed` with confidence score.
6. If confidence ≥ 95: record auto-posted to `invoices` table, book entry created.
7. If confidence < 95: record added to `review_queue`, senior CA notified.
8. **Notification Hub** sends WhatsApp acknowledgment to client.
9. **Audit log** records the full chain of events.

Total elapsed time target: under 30 seconds from WhatsApp send to client acknowledgment.

---

## 3. Component architecture

Each of these is a Python module inside the monolith, with a well-defined interface.

### 3.1 Ingestion API

**Responsibility:** All external data entry points.

**Endpoints:**
- `POST /webhooks/whatsapp` — WhatsApp BSP webhook
- `POST /webhooks/email` — Inbound email parser (SendGrid Inbound Parse or AWS SES)
- `POST /api/v1/documents/upload` — Authenticated web upload
- `POST /api/v1/tally/import` — Tally export upload (Excel/XML)
- `POST /api/v1/gstr2b/upload` — GSTR-2B Excel/JSON upload

**Key concerns:**
- Webhook signature validation (HMAC for Gupshup, DKIM/SPF for email).
- File size limits (25 MB for images/PDFs, 100 MB for Excel).
- Rate limiting per firm (prevents accidental loops).
- Immediate 200 OK to webhooks; processing is async.

### 3.2 Document Intelligence Service

**Responsibility:** Raw document → structured, confidence-scored data.

Detailed in Section 5.

### 3.3 Reconciliation Engine

**Responsibility:** Match purchase register against GSTR-2B; classify and score mismatches.

Detailed in Section 6.

### 3.4 Return Preparation Service

**Responsibility:** Generate GSTR-1 and GSTR-3B from reconciled data.

**Inputs:** reconciled purchase register + sales register + client GSTN details + filing month.

**Outputs:** GSTN-compliant JSON (v4.0 schema), human-readable HTML preview, validation report.

**Key logic:**
- GSTR-1 sections: B2B, B2CL, B2CS, exports, nil-rated, HSN summary, documents issued.
- GSTR-3B sections: outward supplies summary, ITC eligible/ineligible/reversal, tax payable.
- Cross-validation: GSTR-3B outward totals must equal sum of GSTR-1 sections.
- Self-validation: tax totals = rate × taxable value within rounding tolerance.

**Output contract:** every generated return includes a `validation_report` listing any warnings before CA approves.

### 3.5 Workflow Orchestrator

**Responsibility:** Task creation, deadline tracking, assignment, state transitions.

**Core abstractions:**
- `Workflow` — a multi-step process (e.g., "file GSTR-3B for client X for month Y").
- `Task` — a single step within a workflow, with an assignee, deadline, and state.
- `State machine` — workflows have explicit states (draft, pending review, approved, filed, closed).

**Scheduled jobs:**
- Daily: check all active workflows for deadline proximity, send reminders.
- Weekly: generate firm-wide compliance health report.
- Monthly: auto-create next month's workflows on the 1st.

### 3.6 Notification Hub

**Responsibility:** All outbound communication to CAs, juniors, clients, vendors.

**Channels:**
- WhatsApp Business API (via Gupshup)
- Email (outbound via AWS SES)
- In-app notifications (WebSocket to frontend)

**Key concerns:**
- WhatsApp template message approval tracking.
- Rate limiting per channel (WhatsApp business-initiated rules, 24-hour service window).
- Retry logic with exponential backoff.
- Delivery tracking and bounce handling.

### 3.7 Analytics Engine

**Responsibility:** Compute firm-level and client-level metrics for the analytics dashboard.

**Approach:** Materialized views in Postgres, refreshed every 15 minutes. No separate warehouse in V1.

**Key metrics:**
- Per-firm: total invoices processed, auto-post rate, ITC recovered, hours saved estimate, renewal-likelihood score.
- Per-client: filing compliance rate, ITC claimed vs. claimable, notice risk indicators.
- Per-user: review items closed, accuracy vs. senior overrides, productivity trend.

---

## 4. Data architecture

### 4.1 Database choice: PostgreSQL 16

Rationale:
- ACID guarantees for financial data (non-negotiable).
- Row-level security native to Postgres — multi-tenancy with first-class support.
- JSONB for flexible schemas on extracted document data while keeping relational core.
- Full-text search (good enough for V1) without needing Elasticsearch.
- Mature, boring, works. We are not optimizing for operational novelty.

### 4.2 Multi-tenancy model

Every tenant-scoped table has:
- `firm_id UUID NOT NULL` (foreign key to firms)
- Row-level security policy: `firm_id = current_setting('yukti.current_firm_id')::uuid`

The application sets `SET app.current_firm_id = ...` at the start of every database session, scoped to the authenticated user's firm.

This gives us defense-in-depth: even if application-layer authorization is bypassed, the database enforces firm isolation.

### 4.3 Core schema (abbreviated)

```sql
-- Tenant root
CREATE TABLE firms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    pan VARCHAR(10),
    gstin VARCHAR(15),
    subscription_tier TEXT NOT NULL,
    subscription_status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Users within a firm
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id),
    email CITEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('principal','senior','junior','viewer')),
    password_hash TEXT NOT NULL,
    mfa_secret TEXT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- The firm's clients (the businesses they service)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id),
    business_name TEXT NOT NULL,
    primary_gstin VARCHAR(15) NOT NULL,
    pan VARCHAR(10),
    intake_whatsapp_number TEXT UNIQUE,
    intake_email_address CITEXT UNIQUE,
    assigned_senior_id UUID REFERENCES users(id),
    assigned_junior_id UUID REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Raw documents received from any channel
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id),
    client_id UUID REFERENCES clients(id),
    source_channel TEXT NOT NULL, -- whatsapp | email | web_upload | tally_import
    source_metadata JSONB,        -- sender info, message id, etc.
    s3_key TEXT NOT NULL,         -- s3://yukti-docs/<firm_id>/<client_id>/<id>.ext
    file_type TEXT NOT NULL,      -- image/jpeg, application/pdf, etc.
    file_size_bytes BIGINT NOT NULL,
    document_type TEXT,           -- purchase_invoice, sales_invoice, bank_statement, etc.
    processing_status TEXT NOT NULL DEFAULT 'received',
    confidence_score INT,         -- 0-100
    received_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- Structured invoice data extracted from documents
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    document_id UUID REFERENCES documents(id),
    direction TEXT NOT NULL CHECK (direction IN ('purchase','sale')),
    vendor_gstin VARCHAR(15),
    vendor_name TEXT,
    invoice_number TEXT,
    invoice_number_normalized TEXT, -- for matching
    invoice_date DATE,
    taxable_value NUMERIC(14,2),
    cgst NUMERIC(14,2),
    sgst NUMERIC(14,2),
    igst NUMERIC(14,2),
    cess NUMERIC(14,2),
    total NUMERIC(14,2),
    place_of_supply TEXT,
    reverse_charge BOOLEAN DEFAULT false,
    itc_eligible BOOLEAN DEFAULT true,
    ledger_head TEXT,           -- Tally ledger assignment
    tds_section TEXT,           -- applicable TDS section, if any
    raw_extraction JSONB,       -- full Claude output
    field_confidences JSONB,    -- per-field confidence map
    status TEXT NOT NULL DEFAULT 'processed', -- processed | posted | reviewed | rejected
    created_at TIMESTAMPTZ DEFAULT now()
);

-- GSTR-2B records uploaded from the portal
CREATE TABLE gstr2b_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    filing_period TEXT NOT NULL, -- YYYY-MM
    vendor_gstin VARCHAR(15) NOT NULL,
    vendor_name TEXT,
    invoice_number TEXT,
    invoice_number_normalized TEXT,
    invoice_date DATE,
    taxable_value NUMERIC(14,2),
    cgst NUMERIC(14,2),
    sgst NUMERIC(14,2),
    igst NUMERIC(14,2),
    itc_available BOOLEAN,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Reconciliation run + output
CREATE TABLE reconciliation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    filing_period TEXT NOT NULL,
    initiated_by UUID REFERENCES users(id),
    total_invoices INT,
    total_gstr2b_records INT,
    match_breakdown JSONB,       -- count per bucket
    itc_safe NUMERIC(14,2),      -- sum of matched ITC
    itc_at_risk NUMERIC(14,2),   -- sum of unmatched
    run_duration_ms INT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reconciliation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id),
    run_id UUID NOT NULL REFERENCES reconciliation_runs(id),
    invoice_id UUID REFERENCES invoices(id),
    gstr2b_record_id UUID REFERENCES gstr2b_records(id),
    match_bucket TEXT NOT NULL,  -- exact | near | amount_mismatch | ...
    match_score NUMERIC(5,2),    -- 0-100 composite score
    itc_impact NUMERIC(14,2),
    resolution_status TEXT DEFAULT 'pending',
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ
);

-- Returns prepared for filing
CREATE TABLE returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    return_type TEXT NOT NULL,   -- gstr1 | gstr3b
    filing_period TEXT NOT NULL,
    generated_json JSONB,
    preview_html TEXT,
    validation_report JSONB,
    status TEXT NOT NULL,        -- draft | approved | filed
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    filed_at TIMESTAMPTZ,
    filing_acknowledgment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Vendor follow-ups
CREATE TABLE vendor_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    vendor_gstin VARCHAR(15),
    vendor_email TEXT,
    vendor_phone TEXT,
    invoice_id UUID REFERENCES invoices(id),
    drafted_message TEXT,
    channel TEXT,
    sent_at TIMESTAMPTZ,
    reminder_count INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'drafted',
    resolved_at TIMESTAMPTZ
);

-- Per-firm, per-vendor learning for categorization
CREATE TABLE vendor_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id),
    client_id UUID REFERENCES clients(id),
    vendor_gstin VARCHAR(15),
    vendor_name_pattern TEXT,
    usual_ledger_head TEXT,
    usual_tds_section TEXT,
    invoice_number_pattern TEXT,  -- regex learned from history
    correction_count INT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- Immutable audit trail
CREATE TABLE audit_events (
    id BIGSERIAL PRIMARY KEY,
    firm_id UUID NOT NULL,
    actor_user_id UUID,
    actor_type TEXT NOT NULL,    -- user | system | ai
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    before_value JSONB,
    after_value JSONB,
    ip_address INET,
    user_agent TEXT,
    occurred_at TIMESTAMPTZ DEFAULT now()
);
-- append-only; no UPDATE or DELETE permission for application role
```

All tables have RLS policies. All have `created_at` / `updated_at` triggers. All sensitive fields (PAN, GSTIN) use column-level encryption via `pgcrypto`.

### 4.4 Document storage: S3 with structured keys

Raw documents go to S3:
```
s3://yukti-docs-prod/<firm_id>/<client_id>/<yyyy-mm>/<document_id>.<ext>
```

This structure allows:
- Per-firm lifecycle policies.
- Per-client data export if needed.
- Predictable cost attribution.
- Simple data-subject deletion for DPDP compliance.

All objects are encrypted with SSE-KMS using a per-firm customer-managed key. Lifecycle: Standard for 90 days, Standard-IA for 2 years, Glacier Flexible for 7 years (statutory minimum), delete after.

### 4.5 Extracted metadata storage: Postgres JSONB

Invoice extraction outputs (the full Sarvam 30B output with per-field confidences and bounding boxes) are stored in Postgres JSONB columns on the `invoices` table (`raw_extraction JSONB`, `field_confidences JSONB`) and a linked `document_extractions` table for historical runs.

Alternative considered: MongoDB for extraction metadata. Rejected because: (a) operational complexity of a second database for a 2–3 person team is unjustified, (b) Postgres JSONB with GIN indexes handles V1 query patterns well, (c) a single ACID-compliant database is safer for financial data consistency, (d) multi-tenancy via RLS applies uniformly — no need for a second tenant-isolation layer. If full-text search across extractions is needed at scale, we add a dedicated search layer (Meilisearch/Typesense) in V2, not a second primary database.

### 4.6 Redis for cache, queue, and pub/sub

- **Cache**: frequently-read firm/client metadata with 60-second TTL. Cuts DB read load by ~80%.
- **Queue**: Celery broker for background jobs (document processing, reconciliation runs, notifications).
- **Pub/sub**: WebSocket fan-out for live dashboard updates.

Single Redis cluster with separate logical databases for each concern.

---

## 5. AI/ML architecture: the Document Intelligence Pipeline

This is the most technically distinctive part of Yukti. The pipeline has 6 stages. Each stage has defined inputs, outputs, latency targets, and fallbacks.
**AI vendor: Sarvam AI.** An India-built AI company with models optimized for Indian documents and languages. Sarvam Vision (3B vision-language model) handles OCR across 22 Indian languages. Sarvam 30B (open-source LLM, self-hosted on AWS Mumbai GPU) handles classification, extraction, and categorization. Claude is retained as emergency fallback only.

### 5.1 Stage 1: Normalize

**Input:** Raw file from any channel.

**Operations:**
- If image: decode (handle JPEG, PNG, WebP, HEIC from iPhones).
- Correct WhatsApp compression artifacts via denoising.
- Deskew using OpenCV Hough transform (invoices get photographed at every angle).
- Detect and crop page boundaries.
- Enhance contrast via CLAHE (adaptive histogram equalization).
- Upscale below 1800px width using Lanczos; downscale above 3000px.
- If PDF: extract each page as a 300 DPI image.

**Output:** Clean PNG(s) in S3, one per page.

**Target latency:** 1-2 seconds per page.

**Libraries:** OpenCV, PIL, pdfplumber / pymupdf.

### 5.2 Stage 2: Classify

**Input:** Cleaned image.

**Operations:** Determine document type from 12 categories:
- purchase_invoice
- sales_invoice
- bank_statement
- payment_receipt
- form_16
- form_26as_ais
- expense_receipt
- credit_note
- debit_note
- challan
- einvoice_json
- tally_xml
- unknown

**V1 approach:** Call Sarvam 30B (self-hosted) with the image description and a classification prompt. Fast, near-zero marginal cost, accurate on Indian document types.

**V2 approach:** Fine-tune Sarvam 30B on accumulated labeled data for even higher accuracy. Sarvam 30B is open-source (Apache 2.0 on HuggingFace), so fine-tuning is straightforward.

**Confidence threshold:** if Sarvam's top-1 confidence < 70%, route to `unknown` and queue for human classification.

**Target latency:** 2-3 seconds.

### 5.3 Stage 3: OCR

**Input:** Cleaned image + document type from Stage 2.

**Tiered approach:**

1. **Sarvam Vision API** (primary): purpose-built for Indian documents, supports 22 Indian languages including Hindi, Gujarati, Tamil, and mixed-language content. ₹0.50/page. Has processed 35M+ pages.

2. **Google Vision API** (fallback): for edge cases where Sarvam Vision confidence is low on English-primary documents.

3. **Surya OCR** (last resort): open-source, self-hosted fallback for edge cases where both above fail.

**Post-processing for Indian formats:**
- GSTIN character disambiguation: `0↔O`, `1↔I↔l`, `5↔S`, `8↔B` — cross-validated with checksum.
- Indian number format: handle `1,00,000` (lakh) and `1,00,00,000` (crore) comma patterns.
- Date formats: `DD/MM/YYYY`, `DD-MM-YY`, `DD Mon YYYY`, `YYYY-MM-DD` all normalized to ISO.
- Rupee symbol variants: `₹`, `Rs.`, `INR`, `/-` suffix.

**Output:** Structured text layout (words + coordinates + confidence).

**Target latency:** 3-5 seconds.

### 5.4 Stage 4: Field extraction (hybrid)

**The critical insight:** different fields need different extraction methods. Regex is free and fast for deterministic patterns. Sarvam 30B is self-hosted and handles context at near-zero marginal cost. Use each for what it's good at.

**Regex-first for deterministic fields:**
- **GSTIN**: `[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]` plus checksum validation.
- **PAN**: `[A-Z]{5}[0-9]{4}[A-Z]`.
- **Invoice number**: search near known label keywords ("Invoice No", "Bill No", "INV").
- **Dates**: multiple format regexes with validation against current-financial-year bounds.
- **HSN codes**: 4-8 digit patterns, cross-checked against HSN master.
- **Amounts**: Indian number format regex with position-aware extraction (near "Total", "Grand Total", "Net Amount").

**Sarvam 30B-powered for contextual fields:**
- Vendor name (cleaned, deduplicated against vendor master)
- Line items (description, HSN, quantity, unit, rate, discount, taxable value, tax rates)
- Subtotal and tax component breakdown
- Place of supply inference
- Reverse charge applicability
- TDS section determination (194C, 194J, 194H, 194I, etc.)

**Sarvam 30B call structure:**
```python
extraction_prompt = f"""
Extract the following fields from this invoice image. The regex-extracted
fields are already provided as anchors — use them to verify your extraction.

Anchors (already extracted by regex):
- GSTIN: {regex_gstin}
- Invoice number: {regex_invoice_num}
- Invoice date: {regex_date}
- Total amount: {regex_total}

Extract and return as JSON:
- vendor_name (clean, canonical form)
- vendor_address
- line_items: array of {{description, hsn, quantity, unit, rate, taxable_value, cgst, sgst, igst, cess}}
- subtotal
- total_tax
- grand_total (must equal anchor total within ±1 rupee)
- place_of_supply
- reverse_charge (true/false)
- notes (any unusual conditions)

For each field, include a `confidence` (0-100) based on clarity in the image.
If a field is not present or unclear, return null with confidence 0.
"""
```

**Cost optimization:**
- For every invoice, check `vendor_patterns` first. If this vendor has been seen ≥3 times and always categorized the same way, skip Sarvam 30B call entirely — use pattern.
- Batch Sarvam 30B calls where possible (multiple small invoices in one call with structured output).

**Target latency:** 4-6 seconds.

**Expected cost per invoice:** ~₹0.20 (₹0.50/page Sarvam Vision for OCR, amortized across multi-page invoices, + near-zero for self-hosted Sarvam 30B extraction). At 100K invoices/month: ~₹20K/month in API costs + ~₹40K/month for GPU instance. Total: ~₹60K/month, well covered by revenue.

### 5.5 Stage 5: Validation

**Hard validation rules (fail-closed):**
- GSTIN checksum (mod-36 Luhn variant).
- GSTIN active status (cached from periodic GSTN master sync).
- PAN-GSTIN linkage: chars 3-12 of GSTIN must equal the vendor's PAN.
- Tax rate validity: CGST+SGST or IGST must equal 0%, 5%, 12%, 18%, or 28% (with 40% for sin goods).
- For intra-state invoices: CGST must equal SGST exactly.
- Math checks: sum of line-item taxable values = subtotal (±₹1 rounding).
- Math checks: subtotal + total tax = grand total (±₹1 rounding).
- Date sanity: invoice date not in future, not older than 18 months.
- Duplicate detection: no existing invoice with same (vendor_gstin, invoice_number, invoice_date).

**Soft validation rules (warn, don't block):**
- Amount sanity (vendor's typical invoice range, client's typical expense pattern).
- Tax rate unusual for HSN (flag for human confirmation).
- Vendor new to this client (flag for first-time verification).

### 5.6 Stage 6: Categorization & confidence scoring

**Categorization logic:**
1. Check `vendor_patterns` for this firm+client+vendor. If found with count ≥3 and stable, use stored values for ledger + TDS section.
2. If not found, ask Sarvam 30B to suggest ledger head based on vendor name + line items + client's chart of accounts.
3. Regardless of source, senior CA sees the suggestion and can override. Each override updates `vendor_patterns`.

**Composite confidence score (0-100):**
- OCR quality: 20%
- GSTIN validity: 15%
- Field completeness: 15%
- Math validation passed: 20%
- Vendor pattern match: 15%
- Categorization confidence: 15%

**Routing based on score:**
- **≥90**: Auto-post to invoices, create Tally voucher entry, no human review required. Silent success.
- **75-89**: Auto-post but flag in review queue as "posted, verify." CA sees it but can skip.
- **<75**: Do not post. Add to review queue as "needs review." CA must process before posting.

**Feedback loop:** When a CA corrects any field, the correction is logged against the vendor_pattern and weighted into future Sarvam 30B prompts and periodic fine-tuning for that vendor.

---

## 6. Reconciliation engine design

### 6.1 The algorithmic core

Three-pass matching, in order. Each pass processes records that didn't match in prior passes.

**Pass 1: Exact match**

```python
def exact_match(purchase_records, gstr2b_records):
    index = defaultdict(list)
    for r in gstr2b_records:
        key = (
            normalize_gstin(r.vendor_gstin),
            normalize_invoice_number(r.invoice_number),
            round_to_paise(r.total)
        )
        index[key].append(r)

    matches = []
    unmatched_purchases = []
    for p in purchase_records:
        key = (
            normalize_gstin(p.vendor_gstin),
            normalize_invoice_number(p.invoice_number),
            round_to_paise(p.total)
        )
        candidates = index.get(key, [])
        if len(candidates) == 1:
            matches.append(('exact', p, candidates[0]))
            index[key].remove(candidates[0])
        else:
            unmatched_purchases.append(p)

    return matches, unmatched_purchases, remaining(index)
```

Expected catch rate: 70-80% of records.

**Pass 2: Fuzzy match**

For records unmatched in Pass 1. Compute a weighted score:

| Signal | Max points | Scoring |
|---|---|---|
| GSTIN match | 25 | 25 if equal, 0 otherwise |
| Amount proximity | 30 | 30 if within ±₹1, scaling down linearly to 0 at ±5% |
| Invoice number similarity | 25 | Levenshtein distance on normalized forms |
| Date proximity | 15 | 15 if same day, 10 within week, 5 within month |
| Tax breakdown match | 5 | 5 if CGST+SGST+IGST within ₹1 |

Greedy assignment: for each unmatched purchase, find the highest-scoring GSTR-2B candidate ≥ threshold (60). Assign. Remove from candidate pool.

Expected catch rate: 15-20% of records.

**Pass 3: Smart match (many-to-one / one-to-many)**

For records surviving Passes 1-2. Handle cases where:
- Vendor consolidated multiple invoices into one GSTR-1 line.
- Client books have one consolidated entry for multiple vendor invoices.

Algorithm: within each (vendor_gstin) group, solve subset-sum with tolerance — find a subset of purchase invoices whose total matches a single GSTR-2B record (or vice versa), within ±₹5 and same month.

Expected catch rate: 3-5% of records.

### 6.2 Invoice number normalization — the most important function in the codebase

```python
def normalize_invoice_number(s: str) -> str:
    if not s:
        return ""
    s = s.upper().strip()
    # Strip common prefixes
    for prefix in ["INV", "BILL", "SI", "PI", "GST", "TAX", "SERV", "NO", "INVOICE"]:
        if s.startswith(prefix):
            s = s[len(prefix):]
    # Remove separators
    for sep in ["/", "\\", "-", ".", "_", " ", "#"]:
        s = s.replace(sep, "")
    # Strip leading zeros
    s = s.lstrip("0")
    # Remove trailing financial-year indicators like "24-25", "FY24-25"
    s = re.sub(r'(FY)?\d{2,4}(-|TO)?\d{2,4}$', '', s)
    return s
```

This one function is responsible for 20-30% of successful fuzzy matches. It deserves its own test suite of 500+ real invoice number examples.

### 6.3 Mismatch classification

Every record lands in exactly one of seven buckets:

| Bucket | Condition | Default action |
|---|---|---|
| Exact | Perfect match | Auto-reconciled, ITC claimable |
| Near | Match with minor diff (rounding, date-shift) | Auto-reconciled with diff logged |
| Amount mismatch | Same (GSTIN, invoice#), different total | Flag: ITC at lower value, senior review |
| Tax rate mismatch | Same (GSTIN, invoice#), different GST rate | Flag: senior review |
| Books only | In purchase register, not in GSTR-2B | Auto-generate vendor follow-up, ITC blocked |
| Portal only | In GSTR-2B, not in purchase register | ALERT: ITC missing, add to books |
| Duplicate | Same invoice appears multiple times | URGENT flag: excess ITC risk |

### 6.4 ITC impact scoring

Every mismatch record carries `itc_impact` — the rupee amount of ITC at risk:

```python
def itc_impact(record, bucket):
    if bucket in ('exact', 'near'):
        return 0  # no risk, fully reconciled
    elif bucket == 'books_only':
        return record.cgst + record.sgst + record.igst  # can't claim
    elif bucket == 'portal_only':
        return record.cgst + record.sgst + record.igst  # missing from books
    elif bucket == 'amount_mismatch':
        return abs(record.books_tax - record.portal_tax)
    elif bucket == 'duplicate':
        return record.cgst + record.sgst + record.igst  # excess claim exposure
    elif bucket == 'tax_rate_mismatch':
        return abs(record.books_tax - record.portal_tax)
```

The senior CA dashboard sorts by `itc_impact` descending. Highest-value issues first. This one design choice turns Yukti from "software that lists mismatches" into "software that recovers money."

### 6.5 Performance targets

- 10,000-record reconciliation: under 30 seconds (tested on Rajnish's largest client).
- 50,000-record reconciliation: under 2 minutes.
- Match accuracy: ≥98% of records that should match, do match.
- False positive rate: <0.1% (a wrong match is worse than no match).

Implementation: Pass 1 and Pass 2 are parallelized via Python multiprocessing over record batches. Pass 3 is per-vendor serial (subset-sum is the bottleneck).

---

## 7. Integration architecture

### 7.1 WhatsApp Business API (via Gupshup)

**Why Gupshup:** largest BSP in India, Indian company, reasonable pricing, good API, fast template approvals.
**Note:** WhatsApp intake is a premium add-on tier, not included in base pricing. Email + web upload are the standard intake channels. This keeps base costs low and avoids passing Meta's per-message costs to all customers.

**Inbound:**
- Webhook `POST /webhooks/whatsapp` receives media messages.
- We download media from Gupshup, save to S3, enter processing pipeline.
- Map `from_number` to `client_id` via `clients.intake_whatsapp_number`.

**Outbound:**
- Pre-approved templates for common messages (acknowledgment, status update, follow-up request, document needed, filing confirmation).
- Business-initiated messages only during 24-hour service window (after client's last inbound).
- Outside service window: requires template message (pre-approved).

**Cost:** Per-message pricing (Meta changed from per-conversation model in July 2025). Costs vary by message category. Estimated ₹25K–₹40K/month at 500 clients on the WhatsApp tier. Passed through to firms as part of premium pricing.

### 7.2 Email (inbound and outbound)

**Inbound (via AWS SES):**
- Configured domain `intake.yuktihq.com` (or similar).
- Each client gets a unique subdomain/mailbox: `<client_slug>@intake.yuktihq.com`.
- SES forwards matching emails to S3 + SNS notification → our API.
- We parse: extract attachments, save to S3, create documents.

**Outbound (via AWS SES):**
- DKIM-signed emails from `firm-name@mail.yuktihq.com`.
- Vendor follow-ups, client notifications, internal alerts.
- Per-firm bounce and complaint tracking.

### 7.3 Tally import (V1) — the deliberate deferral

**V1 approach:** Manual export.
- CA's junior runs "Export Master → Purchase Register" in Tally as Excel.
- Uploads to Yukti via the web.
- Yukti parses and imports.
- Run frequency: weekly during the month, daily near filing deadlines.

**V2 approach:** Live Tally agent.
- Small Python/C# agent installed on the PC running Tally.
- Uses Tally's XML HTTP gateway (port 9000).
- Syncs purchase register, sales register, ledger changes every 15 minutes.
- Deferred because: (a) agent deployment to dozens of CA office PCs is a support burden V1 can't handle, (b) manual export covers the use case at 80% of the value for 10% of the effort.

### 7.4 GSTN integration

**V1: no direct portal integration.**
- CA's junior downloads GSTR-2B Excel from the GSTN portal.
- Uploads to Yukti.
- Yukti parses and reconciles.
- For filing: Yukti generates GSTR-1/3B JSON. CA downloads. CA uploads to portal manually.

**V2+: direct GSTN API via GSP partnership.**
- Parallel track starting week 4 of build.
- Evaluate: Masters India, Cygnet GSP, TCS-GST.
- Requires ASP registration + GSP contract + security audit.
- Target: API-based filing by month 8-10.

### 7.5 Auth & identity

- Email + password (bcrypt, cost factor 12).
- Mandatory MFA (TOTP via authenticator app) for principal and senior roles.
- JWT access tokens (15-min TTL) + refresh tokens (30-day TTL, rotating).
- Session revocation via Redis allowlist.
- SSO deferred to V2.

---

## 8. API design

### 8.1 Principles

- REST (not GraphQL) — simpler, mature tooling, boring in a good way.
- Versioned via URL path: `/api/v1/...`.
- JSON request and response.
- Errors follow RFC 7807 (Problem Details).
- Pagination via cursor (not offset) for all list endpoints.
- Idempotency keys for all POST/PUT that create or modify state.
- OpenAPI 3.1 spec auto-generated from FastAPI type hints.

### 8.2 Key endpoint groups

- `/api/v1/auth/*` — login, logout, MFA, token refresh
- `/api/v1/firms/*` — firm management (principal only)
- `/api/v1/clients/*` — CRUD on clients
- `/api/v1/documents/*` — upload, list, retrieve, reprocess
- `/api/v1/invoices/*` — list, detail, edit, approve, reject
- `/api/v1/reconciliations/*` — run, status, results
- `/api/v1/returns/*` — GSTR-1/3B draft, preview, approve, download JSON
- `/api/v1/followups/*` — list, send, status
- `/api/v1/analytics/*` — firm metrics, client metrics
- `/api/v1/webhooks/*` — inbound from Gupshup, SES
- `/api/v1/health` — system health (internal)

### 8.3 WebSocket

Single endpoint `/ws` for real-time updates:
- Document processing status (live pipeline progress)
- Reconciliation run progress
- Notification delivery
- Live collaborator cursors on review queue (V2)

Authenticated via short-lived token obtained from REST API.

---

## 9. Frontend architecture

### 9.1 Stack

- **Framework:** Next.js 14 (App Router, Server Components where beneficial).
- **Language:** TypeScript, strict mode.
- **Styling:** Tailwind CSS + shadcn/ui for component primitives.
- **State management:** TanStack Query for server state; Zustand for client state.
- **Forms:** React Hook Form + Zod schemas (schemas shared with backend Pydantic via OpenAPI generation).
- **Tables:** TanStack Table (the review queue is a complex table).
- **Charts:** Recharts.
- **Icons:** Lucide.

Rationale: this is the same stack as TheBuzSale. No reason to change what's working. Shipping speed over novelty.

### 9.2 App structure

```
/app
  /(auth)/login, signup, mfa
  /(firm)/dashboard                    — principal's overview
    /clients/[clientId]/
      overview
      documents                        — document list and detail
      reconciliations/[period]         — reconciliation report
      returns/[period]                 — return drafts
      followups                        — vendor follow-up center
    /review-queue                      — THE central dashboard
    /analytics
    /team
    /settings
  /(junior)/my-work                    — junior operator view
```

### 9.3 The review queue — design specifics

This is the single most important screen. Technical requirements:

- Virtualized list (react-window) — must handle 2000+ rows without lag.
- Keyboard navigation: J/K, A/R/E, `?` for help. No modal without keyboard equivalent.
- Filter by: client, issue type, ₹ impact range, age, assignee.
- Sort by: ₹ impact (default desc), age, client.
- Bulk select with shift-click.
- Inline edit for common fields without opening the detail modal.
- Detail modal opens in <200ms (preloaded for visible items).
- Every action emits an optimistic update + background API call + rollback on error.

### 9.4 Rendering strategy

- Principal dashboard: Server Component (data fetched on server, streamed).
- Review queue: Client Component (needs keyboard interaction).
- Document viewer: Client Component with lazy-loaded PDF viewer.

---

## 10. Infrastructure & deployment

### 10.1 Cloud: AWS Mumbai (ap-south-1)

Data residency (DPDP Act, firm client expectations, and our own preference) makes Mumbai non-negotiable.

### 10.2 Services

| Component | AWS Service | Sizing (V1) |
|---|---|---|
| API backend | ECS Fargate | 2 tasks, 1 vCPU, 2GB each |
| Background workers | ECS Fargate | 2 tasks, 2 vCPU, 4GB each |
| Frontend | CloudFront + S3 (static) | N/A |
| Primary DB | RDS PostgreSQL 16 | db.t4g.medium, multi-AZ |
| Cache + queue | ElastiCache Redis | cache.t4g.small, 1 replica |
| GPU instance | EC2 p3/g5 (A10G) | 1× g5.xlarge (on-demand or reserved) |
| Object storage | S3 | pay per use |
| Secrets | AWS Secrets Manager | ~20 secrets |
| Email | SES | pay per use |
| Monitoring | CloudWatch + Sentry | |
| DNS | Route53 | |
| CDN | CloudFront | |

Estimated monthly infra cost V1 with ~25 firms / 500 clients: **₹55,000–70,000 (includes GPU instance for Sarvam 30B)**. Activate credits cover first year.

### 10.3 Environments

- **Development**: each engineer runs locally with docker-compose.
- **Staging**: full AWS stack at reduced sizing (single-AZ, t4g.small). Production-identical code.
- **Production**: described above.

### 10.4 CI/CD

- **GitHub Actions** for every PR: lint → type-check → unit tests → integration tests → security scan.
- Merge to `main` → auto-deploy to staging.
- Manual promotion (approved PR) → production.
- Blue/green deploys via ECS service update.
- Database migrations run pre-deploy with explicit approval.

### 10.5 Observability

- **Application logs:** structured JSON to CloudWatch Logs. Log all user-facing errors with request ID.
- **Errors:** Sentry for exceptions with full stack trace and user context.
- **Metrics:** CloudWatch custom metrics for business KPIs (documents processed, reconciliation runs, auto-post rate).
- **Uptime monitoring:** BetterStack for external endpoint health.
- **Alerting:** PagerDuty for on-call (you and engineer #1 for first 6 months).

---

## 11. Security architecture

### 11.1 Threat model

What we defend against:
- Unauthorized access to one firm's data from another firm (cross-tenant leakage)
- Unauthorized access to a firm's data by people outside the firm
- Tampering with financial data (integrity violation)
- Loss of audit trail (non-repudiation)
- PII exfiltration (regulatory and reputational)
- Account takeover via credential theft

What we don't defend against in V1:
- Sophisticated nation-state actors
- Supply-chain attacks on upstream dependencies (mitigated via Dependabot + periodic audit)

### 11.2 Controls

**Identity:**
- Bcrypt password hashing (cost 12).
- Mandatory MFA for principal and senior.
- Login rate limiting: 5 failures = 15-minute lockout.
- Session revocation on password change.

**Authorization:**
- Firm-level isolation via Postgres RLS (defense-in-depth).
- Role-based access controls enforced at API layer.
- Principle of least privilege for DB users (separate read-only and read-write roles).

**Data:**
- TLS 1.3 everywhere. HSTS with 1-year max-age.
- Encryption at rest: KMS-encrypted RDS, S3, EBS.
- Column-level encryption for PAN and GSTIN using pgcrypto.
- Backups encrypted, stored cross-AZ.

**Network:**
- VPC with private subnets for DB and Redis.
- ALB in public subnet, app tier in private.
- Security groups whitelist minimum necessary ports.
- WAF rules in front of ALB (OWASP Top 10 managed ruleset + rate limiting).

**Application:**
- Input validation via Pydantic on every endpoint.
- SQL injection prevention via parameterized queries (SQLAlchemy ORM).
- XSS prevention via strict content-type headers + React's default escaping.
- CSRF protection via SameSite cookies.
- File upload validation: MIME type, magic bytes, virus scan (ClamAV), size limits.

**Audit:**
- Immutable `audit_events` table.
- Every authentication event logged.
- Every data modification logged with before/after values.
- Audit log retention: 7 years (statutory).

### 11.3 Compliance roadmap

- **V1 (months 1-3):** DPDP Act 2023 compliant from launch. Published privacy policy, data processing agreement for firms.
- **Month 6:** SOC 2 Type I readiness review.
- **Year 1:** SOC 2 Type I audit passed.
- **Year 2:** ISO 27001 certification + SOC 2 Type II.

### 11.4 Incident response

- Documented playbook for common scenarios (data breach, availability outage, payment failure, credential leak).
- On-call rotation from week 1 of launch (you and engineer #1 initially).
- Customer communication templates pre-approved by Rajnish for legal-sensitive scenarios.

---

## 12. Observability & operations

### 12.1 The three golden signals

Per critical endpoint:
- **Latency**: p50, p95, p99 tracked; alert on p95 regression >50%.
- **Error rate**: 5xx rate tracked; alert on >1% for 5+ minutes.
- **Traffic**: request rate tracked; alert on anomalous drops (likely outage upstream).

### 12.2 Business metrics (not just technical)

- Documents processed per hour
- Auto-post rate (target >85%)
- Reconciliation runs completed
- Firms active in last 24h
- Support tickets open

All on a single ops dashboard (Grafana).

### 12.3 Operational runbooks

Documented for:
- Rolling back a failed deployment
- Database migration rollback
- Recovering from a Redis outage
- Responding to a WhatsApp BSP outage
- Handling a GSTN portal outage (degraded mode)

These are written before launch, not after the first incident.

---

## 13. Scalability plan

V1 sizing handles:
- 25 firms × 20 avg clients × 2000 docs/month = 1,000,000 documents/month
- Peak concurrent users: ~50

### 13.1 Where we scale when growth happens

At 100 firms:
- Add Fargate task autoscaling triggered by queue depth.
- Scale RDS vertically (db.r6g.large) or add read replica.
- Partition `document_extractions` table by firm_id if JSONB data grows >500GB.

At 500 firms:
- Move to Aurora Postgres for better scaling + read replicas.
- Consider per-region deployment (if Chennai/Delhi latency matters).
- Extract document intelligence service as a separate deployable (independent scaling).
- Introduce Kafka for event backbone, keep Redis for cache only.

At 1000+ firms: we're a serious company; bring in a staff SRE.

The V1 architecture does not preclude any of these moves. That's the criterion for "good enough."

---

## 14. Tech stack decisions — full table

| Layer | Choice | Alternatives rejected | Rationale |
|---|---|---|---|
| Backend language | Python 3.12 | Node.js, Go | AI ecosystem + Claude SDK. Team fluency. |
| Backend framework | FastAPI | Django, Flask | Async, auto-docs, Pydantic. |
| Frontend framework | Next.js 14 | Remix, pure React | Matches TheBuzSale stack. SSR. |
| UI library | shadcn/ui + Tailwind | MUI, Chakra | Control, not magic. |
| Primary DB | PostgreSQL 16 | MySQL, CockroachDB | ACID + RLS + JSONB. |
| Object storage | S3 (Mumbai) | Self-hosted MinIO | Reliability > cost. |
| Cache/queue | Redis + Celery | RabbitMQ, SQS+Lambda | Familiar, fast, works. |
| AI extraction | Sarvam 30B (self-hosted) | Claude, GPT-4, Gemini | Open-source, India-optimized, fine-tunable, no API cost scaling. |
| AI fallback | Claude (Anthropic) | Gemini | Emergency fallback for extraction failures when Sarvam 30B confidence < 60 on unknown vendors. |
| OCR | Sarvam Vision API | Google Vision, AWS Textract | 22 Indian languages, India-built, 35M+ pages processed. |
| WhatsApp BSP | Gupshup | Wati, Twilio | India-native, biggest. |
| Email in/out | AWS SES | SendGrid, Postmark | AWS-native, cost. |
| Auth | Custom JWT | Auth0, Cognito | Simpler, no vendor lock. |
| CI/CD | GitHub Actions | CircleCI, Jenkins | Already paying for GitHub. |
| Monitoring | CloudWatch + Sentry | Datadog | Cost; Datadog later. |
| IaC | Terraform | CDK, Pulumi | Industry standard. |
| Container runtime | ECS Fargate | EKS, EC2 | No Kubernetes overhead. |
| Infrastructure | AWS Mumbai | GCP, Azure | Data residency + Activate credits. |

Every row has a reason. If an engineer wants to change one, they argue the reason in a decision log.

---

## 15. Build order & technical milestones

### Week 0 — Kickoff (before coding)
- Hire engineer #1 (senior fullstack Python + React).
- Hire engineer #2 (backend/AI focus).
- AWS account, domains, GitHub org set up.
- Rajnish provides 3 anonymized client datasets as golden test set.

### Weeks 1-2 — Foundation
- Multi-tenant schema + RLS implementation.
- Auth + MFA working end-to-end.
- Firm + user + client CRUD.
- CI/CD pipeline green.
- Staging environment up.
- Document upload (web only) + S3 storage.
- **Milestone:** Rajnish can log in, create his firm, add 5 clients, upload 10 documents. They sit in S3 tagged correctly.

### Weeks 3-5 — Document pipeline
- Stages 1-2 (normalize, classify) implemented.
- Stage 3 (OCR) with Google Vision integration.
- Stage 4 (extraction) with Sarvam 30B + regex hybrid.
- Stage 5 (validation) with GSTIN checksum + math checks.
- Stage 6 (confidence + routing) wired up.
- **Milestone:** Upload 100 of Rajnish's real invoices + 100 from 2 other firms for diversity testing. ≥80% score ≥80 confidence. Validate extractions match source by eye.

### Weeks 6-7 — Reconciliation engine
- Purchase register Tally import.
- GSTR-2B Excel parser.
- 3-pass matching algorithm.
- Mismatch classification + ITC impact scoring.
- **Milestone:** Run reconciliation on Rajnish's 3 real clients' last 3 months. 98% match rate. Identify ≥₹1L in aggregate ITC issues that were previously missed.

### Weeks 8-9 — Review dashboard + vendor follow-ups
- Senior review queue UI (THE dashboard).
- Keyboard navigation.
- Bulk actions.
- Per-document review modal.
- Vendor follow-up drafting.
- Email sending via SES.
- **Milestone:** Rajnish processes a month of real work on Yukti in <3 hours vs. his current 2-3 days.

### Weeks 10-11 — Returns + analytics
- GSTR-1 generation from sales data.
- GSTR-3B generation from reconciled data.
- JSON export in GSTN-compliant format.
- Analytics dashboard.
- Junior operator views.
- **Milestone:** Rajnish files one real return for his own firm using a Yukti-generated JSON.

### Weeks 12-13 — Polish + pilot onboarding
- Audit log UI.
- Security review + penetration test.
- Documentation: user guide, admin guide, API docs.
- Onboard 5 pilot firms live.
- **Milestone:** Product launch. 5 paying firms. Monitoring green.

### Week 14 — WhatsApp + buffer
- Gupshup BSP integration (if quote approved).
- WhatsApp inbound + outbound templates.
- Bug fixes from first filing cycle.
- **Milestone:** WhatsApp intake live for premium-tier firms. All critical bugs from weeks 12-13 resolved.

### Post-launch (weeks 15-24)
- Daily standups. Weekly Rajnish review. Fortnightly firm visits.
- Bug fixes, performance tuning, UX polish.
- Begin V2 planning around TDS (Role 2).
- Begin GSP partnership negotiations.
- Hire sales person around week 16-18.

---

## 16. Technical risks & mitigations

**Risk: Sarvam Vision API costs or GPU instance costs exceed projections.**
*Mitigation:* Aggressive caching of extractions by document hash. Per-vendor pattern store eliminates 60-70% of Sarvam 30B calls after month 3. Hard per-firm monthly budget enforced at API layer.

**Risk: Sarvam AI as a company pivots or discontinues the Vision API.**
*Mitigation:* Sarvam 30B is open-source and self-hosted — no dependency. Vision API can be replaced with Google Vision (already tested as fallback) or DocTR (open-source OCR). The extraction layer is fully under our control.

**Risk: OCR accuracy on handwritten/low-quality invoices.**
*Mitigation:* Low-confidence path routes to review queue. Over time, collect real-world failure examples as fine-tuning data for Sarvam 30B. Because the model is open-source, we can fine-tune quarterly on accumulated CA correction data.

**Risk: Reconciliation false positives damage CA credibility.**
*Mitigation:* Threshold tuning on Rajnish's real data before launch. False-positive rate <0.1% is a ship-blocker, not a goal.

**Risk: Tally schema changes break imports.**
*Mitigation:* Tally Prime's XML schema is stable. We validate every import against a schema contract; any deviation surfaces before data is ingested. Tally agent in V2 further reduces coupling.

**Risk: GSTN portal changes break our GSTR-2B parser.**
*Mitigation:* Weekly automated parse test against a known-good sample. Alerts on schema drift.

**Risk: WhatsApp BSP outage during filing week.**
*Mitigation:* Web upload and email intake are always available as fallbacks. Clients are instructed during onboarding that if WhatsApp fails, email or portal upload work.

**Risk: Database corruption or data loss.**
*Mitigation:* Multi-AZ RDS, daily automated backups, quarterly restore drills. 30-day PITR window.

**Risk: Cross-tenant data leak via application bug.**
*Mitigation:* Postgres RLS as defense-in-depth. Every API endpoint has a dedicated multi-tenant test case in CI.

**Risk: Engineer #1 or #2 leaves during the build.**
*Mitigation:* Comprehensive written documentation (this document and the PRD are part of it). Code review discipline so no one owns a module alone. Rajnish is equity-locked, founder-locked, mission-committed — the biggest risk is engineering, and we should treat it that way in contracts.

---

## 17. What this architecture earns us

At the end of 14 weeks we have:

1. A production system that 5 firms pay ₹12K–₹30K/month to use.
2. A codebase that scales to 100 firms without a rewrite.
3. An architecture that lets us add TDS (V2), ITR (V3), and ROC (V4) as new modules, not new products.
4. A security posture that passes a reasonable enterprise review.
5. A team that has built one hard thing together and can build the next.

That's the plan. Let's go build it.

---

*End of Technical Architecture V1. Last reviewed [date]. Next review: end of week 4.*
