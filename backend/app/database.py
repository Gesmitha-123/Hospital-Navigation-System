import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import DATABASE_URL, FALLBACK_SQLITE, SQLITE_DB_PATH, IS_VERCEL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("HPNS-DB")

Base = declarative_base()

def get_engine():
    # On Vercel, skip attempting localhost PostgreSQL if no external DATABASE_URL is configured
    if IS_VERCEL and "localhost:5432" in DATABASE_URL and FALLBACK_SQLITE:
        logger.info(f"Vercel environment detected with no external PostgreSQL; using SQLite: {SQLITE_DB_PATH}")
        return create_engine(f"sqlite:///{SQLITE_DB_PATH}", connect_args={"check_same_thread": False})

    # Attempt connecting to PostgreSQL
    if DATABASE_URL.startswith("postgresql"):
        try:
            pg_engine = create_engine(
                DATABASE_URL,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 3}
            )
            # Test connection
            with pg_engine.connect() as conn:
                logger.info("Successfully connected to PostgreSQL database.")
                return pg_engine
        except Exception as e:
            logger.warning(f"Could not connect to PostgreSQL: {e}")
            if FALLBACK_SQLITE:
                logger.info(f"Using SQLite fallback database: {SQLITE_DB_PATH}")
                sqlite_url = f"sqlite:///{SQLITE_DB_PATH}"
                return create_engine(sqlite_url, connect_args={"check_same_thread": False})
            raise e
    else:
        # Default SQLite or other scheme
        return create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

