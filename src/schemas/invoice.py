from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class SupplyType(str, Enum):
    INTRASTATE = "INTRASTATE"   # CGST + SGST
    INTERSTATE = "INTERSTATE"   # IGST
    EXPORT = "EXPORT"
    UNKNOWN = "UNKNOWN"


class InvoiceLineItem(BaseModel):
    item_number: int = Field(default=1, description="Line item index")
    description: str = Field(default="", description="Product or service description")
    hsn_sac: Optional[str] = Field(default=None, description="HSN or SAC code")
    quantity: Optional[float] = Field(default=None, description="Quantity")
    unit_price: Optional[float] = Field(default=None, description="Unit price per item")
    discount: Optional[float] = Field(default=0.0, description="Discount amount")
    taxable_value: float = Field(default=0.0, description="Taxable value before tax")
    gst_rate: Optional[float] = Field(default=None, description="GST rate percentage e.g. 18.0")
    cgst_amount: Optional[float] = Field(default=0.0, description="CGST amount")
    sgst_amount: Optional[float] = Field(default=0.0, description="SGST amount")
    igst_amount: Optional[float] = Field(default=0.0, description="IGST amount")
    total_amount: float = Field(default=0.0, description="Line item total including taxes")


class InvoiceExtraction(BaseModel):
    # Parties
    supplier_name: str = Field(default="", description="Supplier / Vendor legal or trade name")
    supplier_gstin: Optional[str] = Field(default=None, description="15-character Supplier GSTIN")
    supplier_address: Optional[str] = Field(default=None, description="Supplier address")
    customer_name: Optional[str] = Field(default=None, description="Customer / Buyer name")
    customer_gstin: Optional[str] = Field(default=None, description="15-character Customer GSTIN")

    # Document details
    invoice_number: str = Field(default="", description="Invoice / Bill number")
    invoice_date: Optional[str] = Field(default=None, description="Invoice date in YYYY-MM-DD or DD/MM/YYYY format")
    place_of_supply: Optional[str] = Field(default=None, description="State / Place of supply")
    supply_type: SupplyType = Field(default=SupplyType.UNKNOWN, description="Intrastate vs Interstate")
    is_reverse_charge: bool = Field(default=False, description="Whether Reverse Charge Mechanism (RCM) applies")

    # Line items & Financial Summary
    line_items: List[InvoiceLineItem] = Field(default_factory=list, description="Extracted line items")
    total_taxable_value: float = Field(default=0.0, description="Sum of taxable values")
    total_cgst: float = Field(default=0.0, description="Total CGST amount")
    total_sgst: float = Field(default=0.0, description="Total SGST amount")
    total_igst: float = Field(default=0.0, description="Total IGST amount")
    total_tax_amount: float = Field(default=0.0, description="Sum of CGST + SGST + IGST")
    round_off: float = Field(default=0.0, description="Rounding adjustment")
    grand_total: float = Field(default=0.0, description="Final invoice amount payable")


class ValidationIssueSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ValidationCheckResult(BaseModel):
    check_name: str
    passed: bool
    message: str
    severity: ValidationIssueSeverity = ValidationIssueSeverity.LOW


class InvoicePipelineResult(BaseModel):
    extraction: InvoiceExtraction
    validation_checks: List[ValidationCheckResult]
    composite_confidence_score: float = Field(..., description="Overall confidence 0.0 to 100.0")
    routing_decision: str = Field(..., description="AUTO_POST, POST_AND_FLAG, or REVIEW_QUEUE")
    suggested_tally_ledger: Optional[str] = Field(default=None, description="Suggested Tally ledger head")
    processing_time_seconds: float = Field(default=0.0)
