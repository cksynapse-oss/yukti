import pytest
import pytest_asyncio
from database import init_db, get_async_session
from main import app, lifespan


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    async with lifespan(app):
        yield
