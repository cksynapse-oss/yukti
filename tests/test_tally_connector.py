import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_tally_connector_status():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/tally/connector/status")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] in ["CONNECTED", "DISCONNECTED"]
        assert data["port"] == 9000
        assert "tally_version" in data
        assert "activity_log" in data
        assert len(data["activity_log"]) > 0


@pytest.mark.asyncio
async def test_tally_connector_heartbeat():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "tally_version": "TallyPrime 4.1 Enterprise",
            "active_company": "Reliance Logistics Pvt Ltd",
            "port": 9000,
            "gateway_url": "http://127.0.0.1:9000",
            "is_mock": True
        }
        res = await ac.post("/api/v1/tally/connector/heartbeat", json=payload)
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

        # Check status reflects update
        res_status = await ac.get("/api/v1/tally/connector/status")
        status_data = res_status.json()
        assert status_data["tally_version"] == "TallyPrime 4.1 Enterprise"
        assert status_data["is_mock"] is True


@pytest.mark.asyncio
async def test_tally_queue_and_ack_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Add voucher to queue
        queue_payload = {
            "invoice_no": "EXP/TEST/0991",
            "voucher_type": "Purchase",
            "amount": 48500.0,
            "party": "Bharat Petroleum Corporation Ltd"
        }
        add_res = await ac.post("/api/v1/tally/connector/queue/add", json=queue_payload)
        assert add_res.status_code == 200
        queued_item = add_res.json()["entry"]
        vch_id = queued_item["id"]

        # 2. Poll queue
        q_res = await ac.get("/api/v1/tally/connector/queue")
        assert q_res.status_code == 200
        vouchers = q_res.json()["vouchers"]
        assert any(v["id"] == vch_id for v in vouchers)

        # 3. Acknowledge voucher creation
        ack_payload = {
            "voucher_id": vch_id,
            "invoice_no": "EXP/TEST/0991",
            "tally_master_id": "40999",
            "voucher_type": "Purchase",
            "amount": 48500.0,
            "party": "Bharat Petroleum Corporation Ltd"
        }
        ack_res = await ac.post("/api/v1/tally/connector/ack", json=ack_payload)
        assert ack_res.status_code == 200
        assert ack_res.json()["tally_master_id"] == "40999"

        # 4. Verify removed from queue
        q_res_after = await ac.get("/api/v1/tally/connector/queue")
        vouchers_after = q_res_after.json()["vouchers"]
        assert not any(v["id"] == vch_id for v in vouchers_after)


@pytest.mark.asyncio
async def test_tally_sync_ledgers_and_trigger():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Sync ledgers
        push_payload = {
            "company_name": "Reliance Logistics Pvt Ltd",
            "ledgers": ["Raw Material Purchases", "Freight Inward Expense"]
        }
        res = await ac.post("/api/v1/tally/connector/sync-ledgers", json=push_payload)
        assert res.status_code == 200
        assert res.json()["status"] == "synced"

        # Trigger instant sync
        sync_res = await ac.post("/api/v1/tally/connector/trigger-sync")
        assert sync_res.status_code == 200
        assert sync_res.json()["status"] == "success"
