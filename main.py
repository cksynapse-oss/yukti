import os
import uuid
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import engine, Base, init_db, get_async_session, async_session
from models import (
    YuktiFirm,
    YuktiUser,
    YuktiClient,
    YuktiInvoice,
    YuktiVendorPattern,
    YuktiReconciliationRun,
    YuktiComplianceDeadline,
    InvoiceStatus,
    UserRole,
)
from src.auth.security import get_password_hash

# Import Routers
from src.auth.router import router as auth_router
from src.routers.firms import router as firms_router
from src.routers.clients import router as clients_router
from src.routers.documents import router as documents_router
from src.routers.invoices import router as invoices_router
from src.routers.patterns import router as patterns_router
from src.routers.reconciliations import router as reconciliations_router
from src.routers.returns import router as returns_router
from src.routers.followups import router as followups_router
from src.routers.analytics import router as analytics_router
from src.routers.compliance import router as compliance_router
from src.routers.audit import router as audit_router
from src.routers.tally_connector import router as tally_connector_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Initialize all database tables
        await init_db()

        # Seed initial pilot firm and default entities if DB is fresh
        async with async_session() as session:
            # Check if firm exists
            res = await session.execute(select(YuktiFirm).where(YuktiFirm.id == "firm_default"))
            firm = res.scalars().first()
            if not firm:
                firm = YuktiFirm(
                    id="firm_default",
                    name="Rajnish & Associates (Chartered Accountants)",
                    pan="AAACR5055K",
                    gstin="27AAACR5055K1Z2",
                    subscription_tier="pilot",
                    subscription_status="active"
                )
                session.add(firm)

        # Check if principal user exists
        user_res = await session.execute(select(YuktiUser).where(YuktiUser.email == "rajnish@yukti.ai"))
        if not user_res.scalars().first():
            principal = YuktiUser(
                id="user_principal_1",
                firm_id="firm_default",
                email="rajnish@yukti.ai",
                full_name="Rajnish CA",
                role=UserRole.PRINCIPAL.value,
                password_hash=get_password_hash("Rajnish@2026"),
                is_active=True
            )
            session.add(principal)

        # Check if clients exist
        client_res = await session.execute(select(YuktiClient).where(YuktiClient.firm_id == "firm_default"))
        existing_clients = client_res.scalars().all()
        if len(existing_clients) == 0:
            seed_clients = [
                YuktiClient(
                    id="c1",
                    firm_id="firm_default",
                    business_name="Reliance Logistics Pvt Ltd",
                    primary_gstin="27AAACR5055K1Z2",
                    pan="AAACR5055K",
                    industry="Logistics & Transport",
                    turnover="₹12.5 Cr",
                    status="active",
                    gstr1_status="Ready to Review",
                    gstr3b_status="Pending Recon",
                    auto_post_pct=92.4,
                    itc_at_risk=0.0
                ),
                YuktiClient(
                    id="c2",
                    firm_id="firm_default",
                    business_name="Apex Industrial Traders",
                    primary_gstin="27AAACT2727Q1ZW",
                    pan="AAACT2727Q",
                    industry="Wholesale & Distribution",
                    turnover="₹8.2 Cr",
                    status="active",
                    gstr1_status="Filed (July)",
                    gstr3b_status="Reviewing ITC",
                    auto_post_pct=88.1,
                    itc_at_risk=38850.0
                ),
                YuktiClient(
                    id="c3",
                    firm_id="firm_default",
                    business_name="Metro Tech Solutions LLP",
                    primary_gstin="27AAEFM9988C1Z8",
                    pan="AAEFM9988C",
                    industry="Software & IT Services",
                    turnover="₹4.5 Cr",
                    status="active",
                    gstr1_status="Ready to Review",
                    gstr3b_status="Pending Recon",
                    auto_post_pct=95.0,
                    itc_at_risk=0.0
                ),
                YuktiClient(
                    id="c4",
                    firm_id="firm_default",
                    business_name="Sunrise Enterprises",
                    primary_gstin="27AABCS1234F1Z1",
                    pan="AABCS1234F",
                    industry="Manufacturing",
                    turnover="₹18.0 Cr",
                    status="active",
                    gstr1_status="In Progress",
                    gstr3b_status="Rate Mismatch",
                    auto_post_pct=79.2,
                    itc_at_risk=84000.0
                ),
                YuktiClient(
                    id="c5",
                    firm_id="firm_default",
                    business_name="BlueSky Retails Pvt Ltd",
                    primary_gstin="27AABCB5678G1Z9",
                    pan="AABCB5678G",
                    industry="Retail FMCG",
                    turnover="₹6.1 Cr",
                    status="active",
                    gstr1_status="Ready to Review",
                    gstr3b_status="Pending Recon",
                    auto_post_pct=86.3,
                    itc_at_risk=12400.0
                ),
            ]
            for c in seed_clients:
                session.add(c)

        # Check vendor patterns
        pat_res = await session.execute(select(YuktiVendorPattern))
        if len(pat_res.scalars().all()) == 0:
            seed_patterns = [
                YuktiVendorPattern(
                    supplier_gstin="27AAACR5055K1Z2",
                    firm_id="firm_default",
                    supplier_name="Reliance Industries Limited",
                    default_ledger="Logistics & Warehousing Expense",
                    default_gst_rate=18.0,
                    hsn_override="998313",
                    corrections_count=3,
                    last_corrected="Yesterday",
                    notes="Auto-classified from 3 past manual corrections."
                ),
                YuktiVendorPattern(
                    supplier_gstin="27AAACT2727Q1ZW",
                    firm_id="firm_default",
                    supplier_name="Tata Consulting Engineers",
                    default_ledger="Professional & Technical Fees",
                    default_gst_rate=18.0,
                    hsn_override="998314",
                    corrections_count=5,
                    last_corrected="3 days ago",
                    notes="Always 18% GST with SAC 998314."
                ),
                YuktiVendorPattern(
                    supplier_gstin="24AAACV1234A1Z1",
                    firm_id="firm_default",
                    supplier_name="Vardhman Textiles Ltd",
                    default_ledger="Raw Material Purchases - Yarn",
                    default_gst_rate=5.0,
                    hsn_override="5205",
                    corrections_count=8,
                    last_corrected="1 week ago",
                    notes="Special 5% GST rate for cotton yarn products."
                ),
                YuktiVendorPattern(
                    supplier_gstin="27AABCK2389P1ZM",
                    firm_id="firm_default",
                    supplier_name="Kalyani Industrial Gases Ltd",
                    default_ledger="Industrial Gases & Consumables",
                    default_gst_rate=18.0,
                    hsn_override="2804",
                    corrections_count=2,
                    last_corrected="2 weeks ago",
                    notes="Industrial gas supplies."
                )
            ]
            for p in seed_patterns:
                session.add(p)

        # Check review queue invoices
        inv_res = await session.execute(select(YuktiInvoice))
        if len(inv_res.scalars().all()) == 0:
            seed_invoices = [
                YuktiInvoice(
                    id="ri1",
                    firm_id="firm_default",
                    client_id="c1",
                    customer_name="Reliance Logistics Pvt Ltd",
                    supplier_name="Tata Consulting Engineers",
                    supplier_gstin="27AAACT2727Q1ZW",
                    invoice_no="TCE/MUM/2026/0441",
                    invoice_date="2026-07-12",
                    grand_total=590000.0,
                    taxable_value=500000.0,
                    cgst=45000.0,
                    sgst=45000.0,
                    igst=0.0,
                    confidence_score=72.0,
                    routing_decision="REVIEW_QUEUE",
                    status=InvoiceStatus.PENDING,
                    suggested_ledger="Professional & Technical Fees",
                    issue_tag="Math Mismatch: Grand Total",
                    issue_description="Subtotal (₹5,00,000) + CGST (₹45,000) + SGST (₹45,000) = ₹5,90,000, but OCR footer detected ₹5,91,000.",
                    issue_category="Math Mismatch",
                    issue_severity="HIGH",
                    itc_at_risk="₹90,000",
                    gstr2b_match_status="NEAR_MATCH",
                    supply_type="INTRASTATE",
                    hsn_code="998314",
                    validation_checks=[
                        {"check_name": "GSTIN Checksum (Luhn Mod-36)", "passed": True, "message": "GSTIN structure verified."},
                        {"check_name": "Arithmetic Balance Check", "passed": False, "message": "Taxable value + Taxes != Total Amount by ₹1,000."}
                    ]
                ),
                YuktiInvoice(
                    id="ri2",
                    firm_id="firm_default",
                    client_id="c1",
                    customer_name="Reliance Logistics Pvt Ltd",
                    supplier_name="Kalyani Industrial Gases Ltd",
                    supplier_gstin="27AABCK2389P1ZM",
                    invoice_no="EXP/26-27/0881",
                    invoice_date="2026-07-15",
                    grand_total=53100.0,
                    taxable_value=45000.0,
                    cgst=4050.0,
                    sgst=4050.0,
                    igst=0.0,
                    confidence_score=68.0,
                    routing_decision="REVIEW_QUEUE",
                    status=InvoiceStatus.PENDING,
                    suggested_ledger="Industrial Gases & Consumables",
                    issue_tag="Missing in GSTR-2B",
                    issue_description="Supplier has not filed GSTR-1 for July 2026. Claiming ITC creates Section 16(2)(aa) non-compliance risk.",
                    issue_category="Missing in 2B",
                    issue_severity="CRITICAL",
                    itc_at_risk="₹8,100",
                    gstr2b_match_status="NOT_FOUND_IN_PORTAL",
                    supply_type="INTRASTATE",
                    hsn_code="2804",
                    validation_checks=[
                        {"check_name": "GSTIN Checksum (Luhn Mod-36)", "passed": True, "message": "GSTIN valid."},
                        {"check_name": "GSTR-2B Portal Matching", "passed": False, "message": "Record missing from GSTR-2B statement."}
                    ]
                ),
                YuktiInvoice(
                    id="ri3",
                    firm_id="firm_default",
                    client_id="c1",
                    customer_name="Reliance Logistics Pvt Ltd",
                    supplier_name="Vardhman Textiles Ltd",
                    supplier_gstin="24AAACV1234A1Z1",
                    invoice_no="VT/26-27/0991",
                    invoice_date="2026-07-18",
                    grand_total=354000.0,
                    taxable_value=300000.0,
                    cgst=0.0,
                    sgst=0.0,
                    igst=54000.0,
                    confidence_score=81.0,
                    routing_decision="REVIEW_QUEUE",
                    status=InvoiceStatus.PENDING,
                    suggested_ledger="Raw Material Purchases - Yarn",
                    issue_tag="Rate Anomaly: 18% vs Standard 5%",
                    issue_description="HSN 5205 cotton yarn typically taxed at 5% IGST, but invoice applied 18% IGST (₹54,000).",
                    issue_category="Rate Mismatch",
                    issue_severity="MEDIUM",
                    itc_at_risk="₹39,000",
                    gstr2b_match_status="RATE_MISMATCH",
                    supply_type="INTERSTATE",
                    hsn_code="5205",
                    validation_checks=[
                        {"check_name": "HSN Rate Validation", "passed": False, "message": "Tax rate 18% exceeds typical HSN 5% schedule."}
                    ]
                )
            ]
            for inv in seed_invoices:
                session.add(inv)

        await session.commit()
    except Exception as e:
        print(f"[WARN] Database initialization skipped or deferred: {e}")

    yield


app = FastAPI(
    title="Yukti CA Intelligence OS API",
    description="Multi-tenant GST Compliance Capacity Engine for CA Firms",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Yukti CA Intelligence OS API",
        "version": "2026.07",
        "health": "/api/v1/health"
    }

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all Version 1 API routers
app.include_router(auth_router)
app.include_router(firms_router)
app.include_router(clients_router)
app.include_router(documents_router)
app.include_router(invoices_router)
app.include_router(patterns_router)
app.include_router(reconciliations_router)
app.include_router(returns_router)
app.include_router(followups_router)
app.include_router(analytics_router)
app.include_router(compliance_router)
app.include_router(audit_router)
app.include_router(tally_connector_router, prefix="/api/v1/tally/connector")


# Health Check
@app.get("/api/health")
@app.get("/api/v1/health")
async def health_check(session: AsyncSession = Depends(get_async_session)):
    try:
        inv_count_res = await session.execute(select(func.count(YuktiInvoice.id)))
        pat_count_res = await session.execute(select(func.count(YuktiVendorPattern.supplier_gstin)))
        client_count_res = await session.execute(select(func.count(YuktiClient.id)))
        
        return {
            "status": "healthy",
            "version": "1.0.0",
            "database": "connected",
            "total_invoices": inv_count_res.scalar() or 0,
            "total_patterns": pat_count_res.scalar() or 0,
            "total_clients": client_count_res.scalar() or 0,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


# Backwards-compatible routes for existing React client
@app.post("/api/invoices/upload")
async def legacy_upload(
    file: UploadFile = File(...),
    client_id: str = Form("c1"),
    customer_name: Optional[str] = Form("Reliance Logistics Pvt Ltd"),
    session: AsyncSession = Depends(get_async_session)
):
    # Call documents upload logic
    from src.routers.documents import upload_document
    # Mock default principal user for legacy unauthenticated calls
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await upload_document(file=file, client_id=client_id, customer_name=customer_name, current_user=mock_user, session=session)


@app.get("/api/invoices")
async def legacy_list_invoices(
    status: Optional[str] = None,
    client_id: Optional[str] = None,
    session: AsyncSession = Depends(get_async_session)
):
    from src.routers.invoices import list_invoices
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await list_invoices(status=status, client_id=client_id, current_user=mock_user, session=session)


@app.patch("/api/invoices/{invoice_id}/approve")
async def legacy_approve(invoice_id: str, session: AsyncSession = Depends(get_async_session)):
    from src.routers.invoices import approve_invoice
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await approve_invoice(invoice_id=invoice_id, current_user=mock_user, session=session)


@app.patch("/api/invoices/{invoice_id}/reject")
async def legacy_reject(invoice_id: str, session: AsyncSession = Depends(get_async_session)):
    from src.routers.invoices import reject_invoice
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await reject_invoice(invoice_id=invoice_id, current_user=mock_user, session=session)


@app.put("/api/invoices/{invoice_id}")
async def legacy_update(invoice_id: str, req: Dict[str, Any], session: AsyncSession = Depends(get_async_session)):
    from src.routers.invoices import update_invoice, InvoiceUpdateRequest
    update_req = InvoiceUpdateRequest(**req)
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await update_invoice(invoice_id=invoice_id, req=update_req, current_user=mock_user, session=session)


@app.get("/api/vendor-patterns")
async def legacy_get_patterns(session: AsyncSession = Depends(get_async_session)):
    from src.routers.patterns import list_vendor_patterns
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await list_vendor_patterns(current_user=mock_user, session=session)


@app.post("/api/vendor-patterns")
async def legacy_create_pattern(req: Dict[str, Any], session: AsyncSession = Depends(get_async_session)):
    from src.routers.patterns import create_or_update_vendor_pattern, VendorPatternCreateRequest
    pat_req = VendorPatternCreateRequest(**req)
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await create_or_update_vendor_pattern(req=pat_req, current_user=mock_user, session=session)


@app.delete("/api/vendor-patterns/{supplier_gstin}")
async def legacy_delete_pattern(supplier_gstin: str, session: AsyncSession = Depends(get_async_session)):
    from src.routers.patterns import delete_vendor_pattern
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await delete_vendor_pattern(supplier_gstin=supplier_gstin, current_user=mock_user, session=session)


@app.post("/api/reconcile/run")
async def legacy_run_reconcile(
    client_id: str = Form("c1"),
    filing_period: str = Form("072026"),
    use_database_books: bool = Form(True),
    gstr2b_file: Optional[UploadFile] = File(None),
    tally_file: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_async_session)
):
    from src.routers.reconciliations import run_reconciliation_endpoint
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await run_reconciliation_endpoint(
        client_id=client_id,
        filing_period=filing_period,
        use_database_books=use_database_books,
        gstr2b_file=gstr2b_file,
        tally_file=tally_file,
        current_user=mock_user,
        session=session
    )


@app.get("/api/reconcile/latest")
async def legacy_get_latest_reconcile(client_id: str = "c1", session: AsyncSession = Depends(get_async_session)):
    from src.routers.reconciliations import get_latest_reconciliation
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await get_latest_reconciliation(client_id=client_id, current_user=mock_user, session=session)


@app.get("/api/reconcile/export-excel")
async def legacy_export_excel(client_id: str = "c1", session: AsyncSession = Depends(get_async_session)):
    from src.routers.reconciliations import export_reconciliation_excel
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await export_reconciliation_excel(client_id=client_id, current_user=mock_user, session=session)


@app.get("/api/returns/summary")
async def legacy_returns_summary(period: str = "072026", client_id: str = "c1", session: AsyncSession = Depends(get_async_session)):
    from src.routers.returns import get_return_summary
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await get_return_summary(client_id=client_id, period=period, current_user=mock_user, session=session)


@app.get("/api/returns/gstr1/download-json")
async def legacy_download_gstr1(period: str = "072026", client_id: str = "c1", session: AsyncSession = Depends(get_async_session)):
    from src.routers.returns import download_gstr1_json
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await download_gstr1_json(client_id=client_id, period=period, current_user=mock_user, session=session)


@app.get("/api/returns/gstr3b/download-json")
async def legacy_download_gstr3b(period: str = "072026", client_id: str = "c1", session: AsyncSession = Depends(get_async_session)):
    from src.routers.returns import download_gstr3b_json
    mock_user = YuktiUser(id="user_principal_1", firm_id="firm_default", email="rajnish@yukti.ai", full_name="Rajnish CA", role="principal", password_hash="")
    return await download_gstr3b_json(client_id=client_id, period=period, current_user=mock_user, session=session)


@app.get("/api/tally/export/{invoice_id}")
async def export_tally(invoice_id: str, session: AsyncSession = Depends(get_async_session)):
    from tally import invoice_to_tally_xml
    res = await session.execute(select(YuktiInvoice).where(YuktiInvoice.id == invoice_id))
    inv = res.scalars().first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    xml_data = invoice_to_tally_xml(inv.to_dict())
    headers = {"Content-Disposition": f"attachment; filename=tally_voucher_{invoice_id[:8]}.xml"}
    return Response(content=xml_data, media_type="application/xml", headers=headers)


# ===== BANK STATEMENT AUTOMATION & RULE 37 ENDPOINTS =====

@app.get("/api/v1/bank-statements/sample")
async def get_bank_statement_sample(session: AsyncSession = Depends(get_async_session)):
    """
    Returns realistic pre-parsed bank statement transactions with automatic Rule 37 linkage
    against client purchase invoices.
    """
    # Fetch active unpaid invoices for Reliance Logistics to cross-reference
    res = await session.execute(select(YuktiInvoice).where(YuktiInvoice.client_id == "c1"))
    invoices = res.scalars().all()
    inv_map = {inv.invoice_no: inv for inv in invoices}

    sample_txns = [
        {
            "id": "bnk_01",
            "date": "2026-07-16",
            "narration": "NEFT-AXIS-RELIANCE INDUSTRIES LTD-RIL20260892-IT INFRA",
            "chq_ref": "AXISN009821034",
            "withdrawal": 23600.0,
            "deposit": 0.0,
            "balance": 4281400.0,
            "counterparty": "Reliance Industries Limited",
            "voucher_type": "Payment",
            "suggested_ledger": "Reliance Industries Limited",
            "confidence": 99.2,
            "rule37_settled": True,
            "matched_invoice_no": "RIL/2026/0892",
            "itc_protected": 3600.0
        },
        {
            "id": "bnk_02",
            "date": "2026-07-17",
            "narration": "NEFT-KKBK-KALYANI INDUSTRIAL GASES-KIG2610492-GAS SUPPLY",
            "chq_ref": "KKBKN081290331",
            "withdrawal": 230082.0,
            "deposit": 0.0,
            "balance": 4051318.0,
            "counterparty": "Kalyani Industrial Gases Ltd",
            "voucher_type": "Payment",
            "suggested_ledger": "Kalyani Industrial Gases Ltd",
            "confidence": 98.6,
            "rule37_settled": True,
            "matched_invoice_no": "KIG/26/10492",
            "itc_protected": 35082.0
        },
        {
            "id": "bnk_03",
            "date": "2026-07-18",
            "narration": "RTGS-HDFC-TATA CONSULTANCY SERVICES-EXP881-LOGISTICS",
            "chq_ref": "HDFCR2026071801",
            "withdrawal": 0.0,
            "deposit": 283200.0,
            "balance": 4334518.0,
            "counterparty": "Tata Consultancy Services Ltd",
            "voucher_type": "Receipt",
            "suggested_ledger": "Tata Consultancy Services Ltd",
            "confidence": 99.0,
            "rule37_settled": False,
            "matched_invoice_no": None,
            "itc_protected": 0.0
        },
        {
            "id": "bnk_04",
            "date": "2026-07-19",
            "narration": "ATM CASH WDL-MUMBAI FORT BR-SELF PETTY CASH",
            "chq_ref": "ATM9021992",
            "withdrawal": 45000.0,
            "deposit": 0.0,
            "balance": 4289518.0,
            "counterparty": "Self / Petty Cash",
            "voucher_type": "Contra",
            "suggested_ledger": "Cash in Hand",
            "confidence": 100.0,
            "rule37_settled": False,
            "matched_invoice_no": None,
            "itc_protected": 0.0
        },
        {
            "id": "bnk_05",
            "date": "2026-07-21",
            "narration": "NEFT-ICIC-MAHALAXMI PACKAGING MATERIAL-MPM26302",
            "chq_ref": "ICICN029910245",
            "withdrawal": 69440.0,
            "deposit": 0.0,
            "balance": 4220078.0,
            "counterparty": "Mahalaxmi Packaging Material",
            "voucher_type": "Payment",
            "suggested_ledger": "Mahalaxmi Packaging Material",
            "confidence": 97.8,
            "rule37_settled": True,
            "matched_invoice_no": "MPM/26-27/302",
            "itc_protected": 7440.0
        }
    ]

    return {
        "bank_name": "HDFC Bank Ltd",
        "account_number": "50200089124401",
        "account_holder": "Reliance Logistics Pvt Ltd",
        "statement_period": "01-07-2026 to 31-07-2026",
        "total_transactions": len(sample_txns),
        "total_itc_protected": sum(t["itc_protected"] for t in sample_txns),
        "transactions": sample_txns
    }


@app.post("/api/v1/bank-statements/export-tally")
async def export_bank_tally_xml(payload: dict):
    """
    Generates balanced Tally Prime XML for bank vouchers with Rule 37 BillAllocations.
    """
    from tally import bank_transactions_to_tally_xml
    txns = payload.get("transactions") or []
    bank_ledger = payload.get("bank_ledger") or "HDFC Bank Current Account #9812"
    
    xml_data = bank_transactions_to_tally_xml(txns, bank_ledger_name=bank_ledger)
    headers = {"Content-Disposition": "attachment; filename=Yukti_Tally_Bank_Vouchers.xml"}
    return Response(content=xml_data, media_type="application/xml", headers=headers)

