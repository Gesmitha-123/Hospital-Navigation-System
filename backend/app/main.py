import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS, DEBUG, HOST, PORT
from app.database import engine, SessionLocal
from app.init_db import init_database
from app.routes import locations, navigation, qr

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("HPNS-Main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and seeds exist
    logger.info("Initializing Hospital Navigation Database...")
    db = SessionLocal()
    try:
        init_database(db=db, force_recreate=False)
    finally:
        db.close()
    yield
    logger.info("Hospital Navigation System backend shutdown.")

app = FastAPI(
    title="Hospital Navigation System (HPNS) API",
    description="Intelligent Indoor Wayfinding, BFS / A* / AO* Multi-Floor Routing, and Simulated AR Guidance API.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development & local IP testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(locations.router)
app.include_router(navigation.router)
app.include_router(qr.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Hospital Navigation System (HPNS) API",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "floors": "/api/floors",
            "locations": "/api/locations",
            "graph": "/api/graph",
            "route": "/api/route",
            "compare": "/api/route/compare",
            "emergency": "/api/route/emergency/nearest",
            "qr": "/api/qr/checkpoints"
        }
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": str(engine.url.database)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=DEBUG)

