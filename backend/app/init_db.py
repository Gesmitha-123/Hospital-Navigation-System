import logging
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import Floor, Category, Location, Connection, Doctor, QRCodeCheckpoint
from app.seed_data import (
    FLOORS_DATA,
    CATEGORIES_DATA,
    LOCATIONS_DATA,
    CONNECTIONS_DATA,
    DOCTORS_DATA,
    QR_CHECKPOINTS_DATA
)

logger = logging.getLogger("HPNS-InitDB")

def init_database(db: Session = None, force_recreate: bool = False):
    """
    Initializes database tables and seeds comprehensive hospital data.
    """
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        if force_recreate:
            logger.info("Dropping existing tables...")
            Base.metadata.drop_all(bind=engine)

        logger.info("Creating tables...")
        Base.metadata.create_all(bind=engine)

        # Check if already seeded
        existing_floors = db.query(Floor).count()
        if existing_floors > 0 and not force_recreate:
            logger.info(f"Database already contains {existing_floors} floors. Skipping seeding.")
            return

        logger.info("Seeding Floors...")
        for f_data in FLOORS_DATA:
            floor = Floor(**f_data)
            db.add(floor)
        db.commit()

        logger.info("Seeding Categories...")
        for c_data in CATEGORIES_DATA:
            cat = Category(**c_data)
            db.add(cat)
        db.commit()

        logger.info("Seeding Locations...")
        for loc_data in LOCATIONS_DATA:
            loc = Location(**loc_data)
            db.add(loc)
        db.commit()

        logger.info("Seeding Connections (Corridors & Vertical Links)...")
        for conn_data in CONNECTIONS_DATA:
            conn = Connection(**conn_data)
            db.add(conn)
        db.commit()

        logger.info("Seeding Doctors...")
        for doc_data in DOCTORS_DATA:
            doc = Doctor(**doc_data)
            db.add(doc)
        db.commit()

        logger.info("Seeding QR Checkpoints...")
        for qr_data in QR_CHECKPOINTS_DATA:
            qr = QRCodeCheckpoint(**qr_data)
            db.add(qr)
        db.commit()

        logger.info("Hospital Database successfully initialized and seeded with complete floor maps!")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise e
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_database(force_recreate=True)

