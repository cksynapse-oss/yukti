import pytest
from src.schemas.invoice import InvoiceExtraction, SupplyType, InvoiceLineItem
from src.services.validator import validate_gstin, run_deterministic_validation


def test_validate_gstin_valid():
    assert validate_gstin("27AAACR5055K1Z2") is True
    assert validate_gstin("07AAAAA0000A1Z5") is True


def test_validate_gstin_invalid():
    assert validate_gstin("INVALID_GSTIN") is False
    assert validate_gstin("12345") is False
    assert validate_gstin("") is False


def test_perfect_invoice_auto_post():
    extraction = InvoiceExtraction(
        supplier_name="Tata Consultancy Services",
        supplier_gstin="27AAACT2727Q1ZW",
        invoice_number="TCS/2026/001",
        invoice_date="2026-07-20",
        supply_type=SupplyType.INTRASTATE,
        total_taxable_value=10000.0,
        total_cgst=900.0,
        total_sgst=900.0,
        total_igst=0.0,
        total_tax_amount=1800.0,
        grand_total=11800.0,
    )
    checks, score, decision = run_deterministic_validation(extraction)
    assert score >= 90.0
    assert decision == "AUTO_POST"


def test_mismatched_math_review_queue():
    extraction = InvoiceExtraction(
        supplier_name="Vendor XYZ",
        supplier_gstin="27AAAAA0000A1Z5",
        invoice_number="INV-999",
        invoice_date="2026-07-20",
        supply_type=SupplyType.INTRASTATE,
        total_taxable_value=10000.0,
        total_cgst=900.0,
        total_sgst=900.0,
        total_igst=0.0,
        total_tax_amount=1800.0,
        grand_total=15000.0,  # Intentional math mismatch!
    )
    checks, score, decision = run_deterministic_validation(extraction)
    assert score < 90.0
    math_check = next(c for c in checks if c.check_name == "math_totals_match")
    assert math_check.passed is False
