import os
import shutil
from pathlib import Path
from dotenv import load_dotenv

# Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
load_dotenv(BASE_DIR / ".env")

IS_VERCEL = bool(os.getenv("VERCEL"))

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/hospital_nav")
# Ensure psycopg2 driver is used when postgresql scheme is provided
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

FALLBACK_SQLITE = os.getenv("FALLBACK_SQLITE", "true").lower() in ("true", "1", "yes")

default_sqlite_path = BASE_DIR / "hospital_nav.db"
if IS_VERCEL:
    tmp_sqlite_path = Path("/tmp/hospital_nav.db")
    if default_sqlite_path.exists() and not tmp_sqlite_path.exists():
        try:
            shutil.copy2(default_sqlite_path, tmp_sqlite_path)
        except OSError:
            pass
    SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", str(tmp_sqlite_path))
else:
    SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", str(default_sqlite_path))

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:8000").split(",")
    if origin.strip()
]
