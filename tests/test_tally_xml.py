import xml.etree.ElementTree as ET
from tally import invoice_to_tally_xml


def test_invoice_to_tally_xml_basic():
    mock_inv = {
        "supplier_name": "Tata Consulting Engineers",
        "supplier_gstin": "27AAACT2727Q1ZW",
        "invoice_no": "TCE/2026/0441",
        "invoice_date": "2026-07-12",
        "taxable_value": 500000.0,
        "cgst": 45000.0,
        "sgst": 45000.0,
        "igst": 0.0,
        "grand_total": 590000.0,
        "suggested_ledger": "Professional & Technical Fees",
        "hsn_code": "998314"
    }
    xml_str = invoice_to_tally_xml(mock_inv)
    assert "<ENVELOPE>" in xml_str
    assert "Tata Consulting Engineers" in xml_str
    assert "TCE/2026/0441" in xml_str
    assert "-590000.00" in xml_str
    
    # Parse as valid XML
    root = ET.fromstring(xml_str)
    assert root.tag == "ENVELOPE"
