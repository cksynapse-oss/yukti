import pytest
from src.services.gstn_generator import (
    generate_gstr1_json,
    generate_gstr3b_json,
    run_return_cross_validation
)


def test_generate_gstr1_json_structure():
    gstr1 = generate_gstr1_json(gstin="27AAACR5055K1Z2", fp="072026")
    assert gstr1["gstin"] == "27AAACR5055K1Z2"
    assert gstr1["fp"] == "072026"
    assert "b2b" in gstr1
    assert len(gstr1["b2b"]) > 0
    assert "hsn" in gstr1
    assert "doc_issue" in gstr1


def test_generate_gstr3b_json_structure():
    gstr3b = generate_gstr3b_json(
        gstin="27AAACR5055K1Z2",
        fp="072026",
        reconciled_eligible_itc=4256000.0,
        rule_37_reversal_itc=38850.0
    )
    assert gstr3b["gstin"] == "27AAACR5055K1Z2"
    assert gstr3b["ret_period"] == "072026"
    assert "sup_details" in gstr3b
    assert "itc_elg" in gstr3b
    assert gstr3b["itc_elg"]["itc_avl"][0]["ty"] == "OTH"
    assert gstr3b["itc_elg"]["itc_rev"][0]["ty"] == "RUL"


def test_cross_validation_engine():
    gstr1 = generate_gstr1_json(gstin="27AAACR5055K1Z2", fp="072026")
    gstr3b = generate_gstr3b_json(
        gstin="27AAACR5055K1Z2",
        fp="072026",
        reconciled_eligible_itc=4256000.0
    )
    validation = run_return_cross_validation(gstr1, gstr3b, 4256000.0)
    assert validation["status"] == "PASSED"
    assert validation["pass_count"] == validation["total_checks"] == 6
