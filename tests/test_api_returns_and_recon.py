import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_reconciliation_and_returns():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Run reconciliation
        recon_res = await ac.post("/api/v1/reconciliations/run", data={
            "client_id": "c1",
            "filing_period": "072026",
            "use_database_books": "true"
        })
        assert recon_res.status_code == 200
        recon_data = recon_res.json()
        assert recon_data["success"] is True
        assert "summary" in recon_data

        # Fetch returns summary
        ret_res = await ac.get("/api/v1/returns/summary?client_id=c1&period=072026")
        assert ret_res.status_code == 200
        ret_data = ret_res.json()
        assert "gstr1" in ret_data
        assert "gstr3b" in ret_data
        assert ret_data["crossValidation"]["status"] == "PASSED"

        # Approve returns
        app_res = await ac.post("/api/v1/returns/approve", json={
            "client_id": "c1",
            "filing_period": "072026"
        })
        assert app_res.status_code == 200
        assert app_res.json()["status"] == "approved"

        # Mark return filed
        filed_res = await ac.post("/api/v1/returns/mark-filed", json={
            "client_id": "c1",
            "filing_period": "072026",
            "acknowledgment_number": "AA2707261234567"
        })
        assert filed_res.status_code == 200
        assert filed_res.json()["status"] == "filed"
