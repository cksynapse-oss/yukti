import pytest
import xml.etree.ElementTree as ET
from tally import bank_transactions_to_tally_xml

def test_bank_transactions_to_tally_xml():
    test_txns = [
        {
            "id": "bnk_01",
            "date": "2026-07-16",
            "narration": "NEFT-AXIS-RELIANCE INDUSTRIES LTD-RIL20260892",
            "chq_ref": "AXISN009821034",
            "withdrawal": 23600.0,
            "deposit": 0.0,
            "voucher_type": "Payment",
            "suggested_ledger": "Reliance Industries Limited",
            "matched_invoice_no": "RIL/2026/0892"
        },
        {
            "id": "bnk_02",
            "date": "2026-07-18",
            "narration": "RTGS-HDFC-TATA CONSULTANCY SERVICES-EXP881",
            "chq_ref": "HDFCR2026071801",
            "withdrawal": 0.0,
            "deposit": 283200.0,
            "voucher_type": "Receipt",
            "suggested_ledger": "Tata Consultancy Services Ltd",
            "matched_invoice_no": None
        },
        {
            "id": "bnk_03",
            "date": "2026-07-19",
            "narration": "ATM CASH WDL-MUMBAI FORT BR-SELF PETTY CASH",
            "chq_ref": "ATM9021992",
            "withdrawal": 45000.0,
            "deposit": 0.0,
            "voucher_type": "Contra",
            "suggested_ledger": "Cash in Hand",
            "matched_invoice_no": None
        }
    ]

    xml_str = bank_transactions_to_tally_xml(test_txns, bank_ledger_name="HDFC Bank Current Account #9812")
    assert xml_str is not None
    assert "<ENVELOPE>" in xml_str

    # Parse with standard XML parser to verify syntax
    root = ET.fromstring(xml_str)
    assert root.tag == "ENVELOPE"

    vouchers = root.findall(".//VOUCHER")
    assert len(vouchers) == 3

    # Check Voucher 1: Payment
    v1 = vouchers[0]
    assert v1.attrib.get("VCHTYPE") == "Payment"
    # Check BillAllocations for Rule 37
    bill_alloc = v1.find(".//BILLALLOCATIONS.LIST")
    assert bill_alloc is not None
    assert bill_alloc.find("NAME").text == "RIL/2026/0892"
    assert bill_alloc.find("BILLTYPE").text == "Agst Ref"

    # Check Voucher 2: Receipt
    v2 = vouchers[1]
    assert v2.attrib.get("VCHTYPE") == "Receipt"

    # Check Voucher 3: Contra
    v3 = vouchers[2]
    assert v3.attrib.get("VCHTYPE") == "Contra"


from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_bank_statement_sample_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/bank-statements/sample")
        assert response.status_code == 200
        data = response.json()
        assert "transactions" in data
        assert len(data["transactions"]) >= 5
        assert data["total_itc_protected"] > 0
        assert data["bank_name"] == "HDFC Bank Ltd"

