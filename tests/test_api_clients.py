import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_clients_crud():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # List seeded clients
        res = await ac.get("/api/v1/clients")
        assert res.status_code == 200
        clients = res.json()
        assert len(clients) >= 1
        assert any(c["business_name"] == "Reliance Logistics Pvt Ltd" for c in clients)

        # Create new client
        create_res = await ac.post("/api/v1/clients", json={
            "business_name": "Bharat Agro Foods Ltd",
            "primary_gstin": "27AAACB9999P1Z3",
            "pan": "AAACB9999P",
            "industry": "Agro & Food Processing",
            "turnover": "₹15 Cr"
        })
        assert create_res.status_code == 201
        new_client = create_res.json()
        assert new_client["business_name"] == "Bharat Agro Foods Ltd"
        cid = new_client["id"]

        # Get client detail
        get_res = await ac.get(f"/api/v1/clients/{cid}")
        assert get_res.status_code == 200
        assert get_res.json()["primary_gstin"] == "27AAACB9999P1Z3"
