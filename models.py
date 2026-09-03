import uuid
import enum
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    Column,
    String,
    Float,
    DateTime,
    JSON,
    Enum as SqlEnum,
    Integer,
    Boolean,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from database import Base


class InvoiceStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    FLAGGED = "flagged"


class UserRole(str, enum.Enum):
    PRINCIPAL = "principal"
    SENIOR = "senior"
    JUNIOR = "junior"
    VIEWER = "viewer"


class YuktiFirm(Base):
    __tablename__ = "firms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    pan = Column(String(10), nullable=True)
    gstin = Column(String(15), nullable=True)
    subscription_tier = Column(String(50), default="pilot")
    subscription_status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "pan": self.pan,
            "gstin": self.gstin,
            "subscription_tier": self.subscription_tier,
            "subscription_status": self.subscription_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class YuktiUser(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    firm_id = Column(String(36), ForeignKey("firms.id"), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.SENIOR.value)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "firm_id": self.firm_id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class YuktiClient(Base):
    __tablename__ = "clients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    firm_id = Column(String(36), ForeignKey("firms.id"), nullable=False)
    business_name = Column(String(255), nullable=False)
    primary_gstin = Column(String(15), nullable=False, index=True)
    pan = Column(String(10), nullable=True)
    industry = Column(String(100), default="Logistics & Transport")
    turnover = Column(String(50), default="₹12.5 Cr")
    assigned_senior_id = Column(String(36), nullable=True)
    assigned_junior_id = Column(String(36), nullable=True)
    status = Column(String(50), default="active")
    gstr1_status = Column(String(50), default="Ready to Review")
    gstr3b_status = Column(String(50), default="Pending Recon")
    auto_post_pct = Column(Float, default=85.0)
    itc_at_risk = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "firm_id": self.firm_id,
            "business_name": self.business_name,
            "primary_gstin": self.primary_gstin,
            "pan": self.pan,
            "industry": self.industry,
            "turnover": self.turnover,
            "assigned_senior_id": self.assigned_senior_id,
            "assigned_junior_id": self.assigned_junior_id,
            "status": self.status,
            "gstr1_status": self.gstr1_status,
            "gstr3b_status": self.gstr3b_status,
            "auto_post_pct": self.auto_post_pct,
            "itc_at_risk": self.itc_at_risk,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class YuktiDocument(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    firm_id = Column(String(36), ForeignKey("firms.id"), nullable=False)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    source_channel = Column(String(50), default="web_upload")
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    file_type = Column(String(50), nullable=True)
    document_type = Column(String(50), default="purchase_invoice")
    processing_status = Column(String(50), default="processed")
    confidence_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "firm_id": self.firm_id,
            "client_id": self.client_id,
            "filename": self.filename,
            "source_channel": self.source_channel,
            "file_path": self.file_path,
            "file_size_bytes": self.file_size_bytes,
            "file_type": self.file_type,
            "document_type": self.document_type,
            "processing_status": self.processing_status,
            "confidence_score": self.confidence_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class YuktiInvoice(Base):
    __tablename__ = "yukti_invoices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    firm_id = Column(String(36), default="firm_default", index=True)
    client_id = Column(String(36), default="c1", index=True)
    document_id = Column(String(36), nullable=True)
    direction = Column(String(20), default="purchase")  # 'purchase' or 'sale'
    customer_name = Column(String(255), default="Reliance Logistics Pvt Ltd")
    supplier_name = Column(String(255), nullable=False)
    supplier_gstin = Column(String(15), nullable=False, index=True)
    invoice_no = Column(String(100), nullable=False)
    invoice_date = Column(String(50), nullable=False)
    grand_total = Column(Float, nullable=False)
    taxable_value = Column(Float, nullable=False)
    cgst = Column(Float, default=0.0)
    sgst = Column(Float, default=0.0)
    igst = Column(Float, default=0.0)
    confidence_score = Column(Float, default=85.0)
    routing_decision = Column(String(50), default="REVIEW_QUEUE")
    status = Column(SqlEnum(InvoiceStatus), default=InvoiceStatus.PENDING)
    suggested_ledger = Column(String(255), default="Purchase Account - General")
    issue_tag = Column(String(100), nullable=True)
    issue_description = Column(String(500), nullable=True)
    issue_category = Column(String(100), nullable=True)
    issue_severity = Column(String(20), default="MEDIUM")
    itc_at_risk = Column(String(50), nullable=True)
    gstr2b_match_status = Column(String(50), default="UNMATCHED")
    supply_type = Column(String(50), default="INTRASTATE")
    hsn_code = Column(String(20), default="998313")
    raw_json = Column(JSON, nullable=True)
    validation_checks = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "firm_id": self.firm_id,
            "client_id": self.client_id,
            "document_id": self.document_id,
            "direction": self.direction,
            "customer_name": self.customer_name or "Client Company",
            "supplier_name": self.supplier_name or "Unknown Vendor",
            "supplier_gstin": self.supplier_gstin or "",
            "invoice_no": self.invoice_no or "",
            "invoice_date": self.invoice_date or "",
            "grand_total": float(self.grand_total or 0.0),
            "taxable_value": float(self.taxable_value or 0.0),
            "cgst": float(self.cgst or 0.0),
            "sgst": float(self.sgst or 0.0),
            "igst": float(self.igst or 0.0),
            "confidence_score": float(self.confidence_score or 0.0),
            "routing_decision": self.routing_decision,
            "status": self.status.value if isinstance(self.status, InvoiceStatus) else str(self.status),
            "suggested_ledger": self.suggested_ledger or "General Purchase Account",
            "issue_tag": self.issue_tag or "Inspection Needed",
            "issue_description": self.issue_description or "",
            "issue_category": self.issue_category or "Review",
            "issue_severity": self.issue_severity or "MEDIUM",
            "itc_at_risk": self.itc_at_risk or f"₹{int(self.cgst + self.sgst + self.igst):,}",
            "gstr2b_match_status": self.gstr2b_match_status,
            "supply_type": self.supply_type or "INTRASTATE",
            "hsn_code": self.hsn_code or "998313",
            "validation_checks": self.validation_checks or [],
            "raw_json": self.raw_json or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class YuktiInvoiceLineItem(Base):
    __tablename__ = "invoice_line_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_id = Column(String(36), ForeignKey("yukti_invoices.id"), nullable=False)
    item_description = Column(String(500), nullable=True)
    hsn_code = Column(String(20), nullable=True)
    quantity = Column(Float, default=1.0)
    unit_price = Column(Float, default=0.0)
    taxable_amount = Column(Float, nullable=False)
    gst_rate = Column(Float, default=18.0)
    cgst_amount = Column(Float, default=0.0)
    sgst_amount = Column(Float, default=0.0)
    igst_amount = Column(Float, default=0.0)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "invoice_id": self.invoice_id,
            "item_description": self.item_description,
            "hsn_code": self.hsn_code,
            "quantity": self.quantity,
            "unit_price": self.unit_price,
            "taxable_amount": self.taxable_amount,
            "gst_rate": self.gst_rate,
            "cgst_amount": self.cgst_amount,
            "sgst_amount": self.sgst_amount,
            "igst_amount": self.igst_amount,
        }


class YuktiGstr2bRecord(Base):
    __tablename__ = "gstr2b_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    firm_id = Column(String(36), default="firm_default", index=True)
    client_id = Column(String(36), default="c1", index=True)
    filing_period = Column(String(20), nullable=False)
    vendor_gstin = Column(String(15), nullable=False, index=True)
    vendor_name = Column(String(255), nullable=True)
    invoice_number = Column(String(100), nullable=False)
    invoice_number_normalized = Column(String(100), nullable=True)
    invoice_date = Column(String(50), nullable=True)
    taxable_value = Column(Float, default=0.0)
    cgst = Column(Float, default=0.0)
    sgst = Column(Float, default=0.0)
    igst = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    itc_available = Column(Boolean, default=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "firm_id": self.firm_id,
            "client_id": self.client_id,
            "filing_period": self.filing_period,
            "vendor_gstin": self.vendor_gstin,
            "vendor_name": self.vendor_name,
            "invoice_number": self.invoice_number,
            "invoice_date": self.invoice_date,
            "taxable_value": self.taxable_value,
            "cgst": self.cgst,
            "sgst": self.sgst,
            "igst": self.igst,
            "total_amount": self.total_amount,
            "itc_available": self.itc_available,
        }


class YuktiVendorPattern(Base):
    __tablename__ = "yukti_vendor_patterns"

    supplier_gstin = Column(String(15), primary_key=True)
    firm_id = Column(String(36), default="firm_default", index=True)
    supplier_name = Column(String(255), nullable=False)
    default_ledger = Column(String(255), default="General Purchase Account")
    default_gst_rate = Column(Float, default=18.0)
    hsn_override = Column(String(20), nullable=True)
    date_format_hint = Column(String(50), default="YYYY-MM-DD")
    invoice_regex = Column(String(255), nullable=True)
    corrections_count = Column(Integer, default=1)
    last_corrected = Column(String(50), nullable=True)
    notes = Column(String(500), nullable=True)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "supplierGstin": self.supplier_gstin,
            "supplierName": self.supplier_name,
            "defaultLedger": self.default_ledger,
            "defaultGstRate": self.default_gst_rate,
            "hsnOverride": self.hsn_override,
            "dateFormatHint": self.date_format_hint,
            "invoiceRegex": self.invoice_regex,
            "correctionsCount": self.corrections_count,
            "lastCorrected": self.last_corrected,
            "notes": self.notes,
        }


class YuktiReconciliationRun(Base):
    __tablename__ = "yukti_reconciliation_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    firm_id = Column(String(36), default="firm_default", index=True)
    client_id = Column(String(36), default="c1", index=True)
    filing_period = Column(String(20), default="072026")
    run_date = Column(DateTime, default=datetime.utcnow)
    result_json = Column(JSON, nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "firm_id": self.firm_id,
            "client_id": self.client_id,
            "filing_period": self.filing_period,
            "run_date": self.run_date.isoformat() if self.run_date else None,
            "result_json": self.result_json,
        }


class YuktiReturn(Base):
    __tablename__ = "returns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    firm_id = Column(String(36), default="firm_default", index=True)
    client_id = Column(String(36), default="c1", index=True)
    return_type = Column(String(20), nullable=False)  # 'gstr1', 'gstr3b'
    filing_period = Column(String(20), nullable=False)  # e.g. '072026'
    status = Column(String(50), default="draft")  # 'draft', 'approved', 'filed'
    generated_json = Column(JSON, nullable=False)
    validation_report = Column(JSON, nullable=True)
    approved_by = Column(String(255), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    filed_at = Column(DateTime, nullable=True)
    filing_acknowledgment = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "firm_id": self.firm_id,
            "client_id": self.client_id,
            "return_type": self.return_type,
            "filing_period": self.filing_period,
            "status": self.status,
            "generated_json": self.generated_json,
            "validation_report": self.validation_report,
            "approved_by": self.approved_by,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "filed_at": self.filed_at.isoformat() if self.filed_at else None,
            "filing_acknowledgment": self.filing_acknowledgment,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class YuktiVendorFollowup(Base):
    __tablename__ = "vendor_followups"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    firm_id = Column(String(36), default="firm_default", index=True)
    client_id = Column(String(36), default="c1", index=True)
    vendor_gstin = Column(String(15), nullable=False)
    vendor_name = Column(String(255), nullable=False)
    vendor_email = Column(String(255), nullable=True)
    vendor_phone = Column(String(50), nullable=True)
    invoice_no = Column(String(100), nullable=False)
    tax_amount = Column(Float, default=0.0)
    discrepancy_type = Column(String(100), default="MISSING_IN_2B")
    drafted_message = Column(Text, nullable=False)
    channel = Column(String(50), default="email")  # 'email', 'whatsapp'
    status = Column(String(50), default="drafted")  # 'drafted', 'sent', 'resolved'
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "firm_id": self.firm_id,
            "client_id": self.client_id,
            "vendor_gstin": self.vendor_gstin,
            "vendor_name": self.vendor_name,
            "vendor_email": self.vendor_email,
            "vendor_phone": self.vendor_phone,
            "invoice_no": self.invoice_no,
            "tax_amount": self.tax_amount,
            "discrepancy_type": self.discrepancy_type,
            "drafted_message": self.drafted_message,
            "channel": self.channel,
            "status": self.status,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class YuktiAuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    firm_id = Column(String(36), nullable=False, index=True)
    actor_user_id = Column(String(36), nullable=True)
    actor_type = Column(String(50), default="user")  # 'user', 'system', 'ai'
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "firm_id": self.firm_id,
            "actor_user_id": self.actor_user_id,
            "actor_type": self.actor_type,
            "action": self.action,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "details": self.details,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class YuktiComplianceDeadline(Base):
    __tablename__ = "compliance_deadlines"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    firm_id = Column(String(36), nullable=False, index=True)
    client_id = Column(String(36), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    return_type = Column(String(50), nullable=False)  # "GSTR-1", "GSTR-3B"
    period = Column(String(50), nullable=False)  # "July 2026"
    due_date = Column(String(50), nullable=False)  # "2026-08-11"
    status = Column(String(50), default="pending")  # "pending", "completed", "overdue"
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "firm_id": self.firm_id,
            "client_id": self.client_id,
            "title": self.title,
            "return_type": self.return_type,
            "period": self.period,
            "due_date": self.due_date,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
