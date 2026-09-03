import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_invoices_and_patterns():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # List invoices
        res = await ac.get("/api/v1/invoices")
        assert res.status_code == 200
        invoices = res.json()
        assert len(invoices) >= 1
        inv_id = invoices[0]["id"]

        # Approve invoice
        app_res = await ac.patch(f"/api/v1/invoices/{inv_id}/approve")
        assert app_res.status_code == 200
        assert app_res.json()["invoice"]["status"] == "approved"

        # Edit invoice and learn pattern
        edit_res = await ac.put(f"/api/v1/invoices/{inv_id}", json={
            "supplier_name": "Tata Consulting Engineers",
            "supplier_gstin": "27AAACT2727Q1ZW",
            "suggested_ledger": "Engineering & Consulting Fees",
            "save_as_pattern": True
        })
        assert edit_res.status_code == 200
        assert edit_res.json()["invoice"]["suggested_ledger"] == "Engineering & Consulting Fees"

        # Check vendor patterns
        pat_res = await ac.get("/api/v1/vendor-patterns")
        assert pat_res.status_code == 200
        patterns = pat_res.json()
        assert len(patterns) >= 1
