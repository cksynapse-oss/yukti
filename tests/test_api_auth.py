import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_auth_flow():
    unique_email = f"anil_{uuid.uuid4().hex[:6]}@sharma-ca.in"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Signup
        signup_res = await ac.post("/api/v1/auth/signup", json={
            "firm_name": "Sharma & Associates",
            "full_name": "Anil Sharma",
            "email": unique_email,
            "password": "Password@123",
            "pan": "AAACS1234F",
            "gstin": "27AAACS1234F1Z1"
        })
        assert signup_res.status_code == 200
        data = signup_res.json()
        assert "access_token" in data
        assert data["user"]["email"] == unique_email
        assert data["firm"]["name"] == "Sharma & Associates"
        token = data["access_token"]

        # /me
        me_res = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["user"]["full_name"] == "Anil Sharma"

        # Login
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": unique_email,
            "password": "Password@123"
        })
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()

        # Invalid password
        bad_login = await ac.post("/api/v1/auth/login", json={
            "email": unique_email,
            "password": "WrongPassword"
        })
        assert bad_login.status_code == 401
