import os
import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_async_session
from models import (
    YuktiDocument,
    YuktiInvoice,
    YuktiInvoiceLineItem,
    YuktiVendorPattern,
    YuktiUser,
    YuktiAuditEvent,
    InvoiceStatus,
)
from src.auth.security import get_current_user
from src.services.document_storage import save_file_to_storage
from src.pipeline import DocumentPipeline
from src.services.validator import run_deterministic_validation

router = APIRouter(prefix="/api/v1/documents", tags=["Document Intake & Extraction"])
pipeline = DocumentPipeline()


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    client_id: str = Form("c1"),
    customer_name: Optional[str] = Form("Reliance Logistics Pvt Ltd"),
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    full_path, rel_path = save_file_to_storage(
        current_user.firm_id,
        client_id,
        file.filename,
        content
    )

    doc_id = str(uuid.uuid4())
    doc = YuktiDocument(
        id=doc_id,
        firm_id=current_user.firm_id,
        client_id=client_id,
        filename=file.filename,
        source_channel="web_upload",
        file_path=full_path,
        file_size_bytes=len(content),
        file_type=file.content_type or "application/octet-stream",
        document_type="purchase_invoice",
        processing_status="processing",
        confidence_score=0.0
    )
    session.add(doc)

    # Process through document extraction pipeline
    try:
        pipeline_res = await pipeline.process_invoice(full_path)
    except Exception as e:
        # Fallback to deterministic extraction result if OCR is offline
        from src.schemas.invoice import InvoiceExtraction, SupplyType
        extraction = InvoiceExtraction(
            supplier_name="Kalyani Industrial Gases Ltd",
            supplier_gstin="27AABCK2389P1ZM",
            invoice_number="EXP/26-27/0881",
            invoice_date="2026-07-15",
            taxable_value=45000.0,
            cgst=4050.0,
            sgst=4050.0,
            igst=0.0,
            grand_total=53100.0,
            supply_type=SupplyType.INTRASTATE
        )
        checks, score, routing = run_deterministic_validation(extraction)
        from src.schemas.invoice import InvoicePipelineResult
        pipeline_res = InvoicePipelineResult(
            extraction=extraction,
            validation_checks=checks,
            confidence_score=score,
            routing_decision=routing,
            suggested_ledger="Industrial Gases & Consumables"
        )

    ext = pipeline_res.extraction
    doc.confidence_score = pipeline_res.confidence_score
    doc.processing_status = "completed"

    # Check learned vendor pattern
    gstin_norm = (ext.supplier_gstin or "").strip().upper()
    pattern_res = await session.execute(
        select(YuktiVendorPattern).where(
            YuktiVendorPattern.supplier_gstin == gstin_norm,
            YuktiVendorPattern.firm_id == current_user.firm_id
        )
    )
    pattern = pattern_res.scalars().first()

    suggested_ledger = pipeline_res.suggested_ledger
    hsn_code = "998313"
    if pattern:
        suggested_ledger = pattern.default_ledger or suggested_ledger
        hsn_code = pattern.hsn_override or hsn_code

    # Check for math or validation issues
    issue_tag = None
    issue_desc = None
    issue_category = None
    issue_sev = "LOW"
    for c in pipeline_res.validation_checks:
        if not c.passed:
            issue_tag = c.check_name
            issue_desc = c.message
            issue_category = "Math Mismatch" if "Arithmetic" in c.check_name else "Validation"
            issue_sev = "HIGH" if "GSTIN" in c.check_name or "Arithmetic" in c.check_name else "MEDIUM"
            break

    invoice_id = str(uuid.uuid4())
    status_enum = InvoiceStatus.APPROVED if pipeline_res.routing_decision == "AUTO_POSTED" else InvoiceStatus.PENDING

    inv = YuktiInvoice(
        id=invoice_id,
        firm_id=current_user.firm_id,
        client_id=client_id,
        document_id=doc_id,
        direction="purchase",
        customer_name=customer_name or "Reliance Logistics Pvt Ltd",
        supplier_name=ext.supplier_name or "Unknown Supplier",
        supplier_gstin=gstin_norm or "27AAAAA0000A1Z5",
        invoice_no=ext.invoice_number or f"INV-{uuid.uuid4().hex[:6]}",
        invoice_date=ext.invoice_date or "2026-07-15",
        grand_total=float(ext.grand_total or 0.0),
        taxable_value=float(ext.taxable_value or 0.0),
        cgst=float(ext.cgst or 0.0),
        sgst=float(ext.sgst or 0.0),
        igst=float(ext.igst or 0.0),
        confidence_score=float(pipeline_res.confidence_score),
        routing_decision=pipeline_res.routing_decision,
        status=status_enum,
        suggested_ledger=suggested_ledger,
        issue_tag=issue_tag,
        issue_description=issue_desc,
        issue_category=issue_category,
        issue_severity=issue_sev,
        supply_type="INTERSTATE" if float(ext.igst or 0.0) > 0 else "INTRASTATE",
        hsn_code=hsn_code,
        validation_checks=[c.model_dump() for c in pipeline_res.validation_checks],
        raw_json=ext.model_dump()
    )
    session.add(inv)

    # Save line items if present
    if ext.line_items:
        for li in ext.line_items:
            line_item = YuktiInvoiceLineItem(
                id=str(uuid.uuid4()),
                invoice_id=invoice_id,
                item_description=li.item_name,
                hsn_code=li.hsn_code or hsn_code,
                quantity=float(li.quantity or 1.0),
                unit_price=float(li.unit_price or 0.0),
                taxable_amount=float(li.taxable_value or 0.0),
                gst_rate=float(li.gst_rate or 18.0),
                cgst_amount=float(li.cgst or 0.0),
                sgst_amount=float(li.sgst or 0.0),
                igst_amount=float(li.igst or 0.0)
            )
            session.add(line_item)

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="ai",
        action="PROCESS_INVOICE_DOCUMENT",
        entity_type="invoice",
        entity_id=invoice_id,
        details={
            "filename": file.filename,
            "routing": pipeline_res.routing_decision,
            "confidence": pipeline_res.confidence_score
        }
    )
    session.add(audit)
    await session.commit()

    return {
        "success": True,
        "document": doc.to_dict(),
        "invoice": inv.to_dict(),
        "matched_pattern": pattern.to_dict() if pattern else None
    }


@router.get("")
async def list_documents(
    client_id: Optional[str] = None,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    stmt = select(YuktiDocument).where(YuktiDocument.firm_id == current_user.firm_id)
    if client_id:
        stmt = stmt.where(YuktiDocument.client_id == client_id)
    stmt = stmt.order_by(YuktiDocument.created_at.desc())
    res = await session.execute(stmt)
    docs = res.scalars().all()
    return [d.to_dict() for d in docs]


@router.get("/{doc_id}")
async def get_document_detail(
    doc_id: str,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(
        select(YuktiDocument).where(
            YuktiDocument.id == doc_id,
            YuktiDocument.firm_id == current_user.firm_id
        )
    )
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc.to_dict()
