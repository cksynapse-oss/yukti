import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# Check if running in a serverless or read-only filesystem (e.g. Vercel, AWS Lambda)
is_serverless = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
default_sqlite_path = "/tmp/yukti.db" if is_serverless else "./yukti.db"

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite+aiosqlite:///{default_sqlite_path}"
)

# If it's a relative SQLite path in a read-only environment, fallback to /tmp
if "sqlite" in DATABASE_URL and (is_serverless or not os.access(".", os.W_OK)):
    DATABASE_URL = "sqlite+aiosqlite:////tmp/yukti.db"

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

try:
    engine = create_async_engine(
        DATABASE_URL, 
        echo=False, 
        connect_args=connect_args
    )
    async_session = sessionmaker(
        engine, 
        class_=AsyncSession, 
        expire_on_commit=False
    )
except Exception as e:
    # Memory fallback
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False, connect_args={"check_same_thread": False})
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def get_async_session():
    async with async_session() as session:
        yield session


async def init_db():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"[WARN] Database initialization warning (non-fatal): {e}")
