import re
from typing import List, Tuple
from src.config import settings
from src.schemas.invoice import (
    InvoiceExtraction,
    ValidationCheckResult,
    ValidationIssueSeverity,
    SupplyType,
)

# Indian GSTIN Regex Pattern
GSTIN_REGEX = re.compile(r"^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")


def validate_gstin(gstin: str) -> bool:
    """Validate 15-character Indian GSTIN format."""
    if not gstin:
        return False
    clean_gstin = gstin.strip().upper()
    return bool(GSTIN_REGEX.match(clean_gstin))


def run_deterministic_validation(
    extraction: InvoiceExtraction,
) -> Tuple[List[ValidationCheckResult], float, str]:
    """
    Runs deterministic business logic checks on the extracted invoice.
    Returns:
        - List of ValidationCheckResults
        - Composite Confidence Score (0.0 to 100.0)
        - Routing Decision ('AUTO_POST', 'POST_AND_FLAG', 'REVIEW_QUEUE')
    """
    checks: List[ValidationCheckResult] = []
    base_score = 100.0

    # 1. Supplier Name check
    if extraction.supplier_name and len(extraction.supplier_name.strip()) >= 3:
        checks.append(ValidationCheckResult(
            check_name="supplier_name_present",
            passed=True,
            message="Supplier name extracted cleanly.",
            severity=ValidationIssueSeverity.LOW
        ))
    else:
        base_score -= 15.0
        checks.append(ValidationCheckResult(
            check_name="supplier_name_present",
            passed=False,
            message="Supplier name is missing or too short.",
            severity=ValidationIssueSeverity.HIGH
        ))

    # 2. Supplier GSTIN check
    if extraction.supplier_gstin and validate_gstin(extraction.supplier_gstin):
        checks.append(ValidationCheckResult(
            check_name="supplier_gstin_valid",
            passed=True,
            message=f"Valid Supplier GSTIN format: {extraction.supplier_gstin}",
            severity=ValidationIssueSeverity.LOW
        ))
    else:
        penalty = 15.0 if extraction.supplier_gstin else 10.0
        base_score -= penalty
        checks.append(ValidationCheckResult(
            check_name="supplier_gstin_valid",
            passed=False,
            message=f"Supplier GSTIN invalid or unextracted: '{extraction.supplier_gstin}'",
            severity=ValidationIssueSeverity.HIGH
        ))

    # 3. Invoice Number & Date
    if extraction.invoice_number and len(extraction.invoice_number.strip()) > 0:
        checks.append(ValidationCheckResult(
            check_name="invoice_number_present",
            passed=True,
            message=f"Invoice number: {extraction.invoice_number}",
            severity=ValidationIssueSeverity.LOW
        ))
    else:
        base_score -= 15.0
        checks.append(ValidationCheckResult(
            check_name="invoice_number_present",
            passed=False,
            message="Invoice number missing.",
            severity=ValidationIssueSeverity.CRITICAL
        ))

    if extraction.invoice_date:
        checks.append(ValidationCheckResult(
            check_name="invoice_date_present",
            passed=True,
            message=f"Invoice date: {extraction.invoice_date}",
            severity=ValidationIssueSeverity.LOW
        ))
    else:
        base_score -= 10.0
        checks.append(ValidationCheckResult(
            check_name="invoice_date_present",
            passed=False,
            message="Invoice date missing.",
            severity=ValidationIssueSeverity.MEDIUM
        ))

    # 4. Mathematical Totals Validation
    calculated_total = (
        extraction.total_taxable_value
        + extraction.total_cgst
        + extraction.total_sgst
        + extraction.total_igst
        + extraction.round_off
    )
    
    diff = abs(calculated_total - extraction.grand_total)
    if diff <= 1.0:  # Allow 1 Rupee rounding variance
        checks.append(ValidationCheckResult(
            check_name="math_totals_match",
            passed=True,
            message=f"Math matches: Taxable ({extraction.total_taxable_value:.2f}) + Taxes ({extraction.total_tax_amount:.2f}) == Grand Total ({extraction.grand_total:.2f})",
            severity=ValidationIssueSeverity.LOW
        ))
    else:
        base_score -= 25.0
        checks.append(ValidationCheckResult(
            check_name="math_totals_match",
            passed=False,
            message=f"Math mismatch! Calculated ({calculated_total:.2f}) vs Stated Grand Total ({extraction.grand_total:.2f}). Difference: ₹{diff:.2f}",
            severity=ValidationIssueSeverity.CRITICAL
        ))

    # 5. GST Tax Type Coherence (Intrastate CGST==SGST vs Interstate IGST)
    if extraction.supply_type == SupplyType.INTRASTATE:
        cgst_sgst_diff = abs(extraction.total_cgst - extraction.total_sgst)
        if cgst_sgst_diff <= 0.5 and extraction.total_igst == 0:
            checks.append(ValidationCheckResult(
                check_name="tax_type_coherence",
                passed=True,
                message="Intrastate supply: CGST equals SGST and IGST is 0.",
                severity=ValidationIssueSeverity.LOW
            ))
        else:
            base_score -= 15.0
            checks.append(ValidationCheckResult(
                check_name="tax_type_coherence",
                passed=False,
                message=f"Intrastate tax anomaly: CGST={extraction.total_cgst}, SGST={extraction.total_sgst}, IGST={extraction.total_igst}",
                severity=ValidationIssueSeverity.HIGH
            ))
    elif extraction.supply_type == SupplyType.INTERSTATE:
        if extraction.total_igst > 0 and extraction.total_cgst == 0 and extraction.total_sgst == 0:
            checks.append(ValidationCheckResult(
                check_name="tax_type_coherence",
                passed=True,
                message="Interstate supply: IGST applied, CGST/SGST are 0.",
                severity=ValidationIssueSeverity.LOW
            ))
        else:
            base_score -= 15.0
            checks.append(ValidationCheckResult(
                check_name="tax_type_coherence",
                passed=False,
                message=f"Interstate tax anomaly: IGST={extraction.total_igst}, CGST={extraction.total_cgst}, SGST={extraction.total_sgst}",
                severity=ValidationIssueSeverity.HIGH
            ))

    # Clamp confidence score to [0.0, 100.0]
    final_score = max(0.0, min(100.0, base_score))

    # Determine Routing Decision
    if final_score >= settings.auto_post_threshold:
        routing_decision = "AUTO_POST"
    elif final_score >= settings.flagged_threshold:
        routing_decision = "POST_AND_FLAG"
    else:
        routing_decision = "REVIEW_QUEUE"

    return checks, final_score, routing_decision
