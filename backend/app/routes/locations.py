from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Floor, Category, Location, Connection, Doctor

router = APIRouter(prefix="/api", tags=["Locations & Floors"])

@router.get("/floors")
def get_floors(db: Session = Depends(get_db)):
    """Retrieve all hospital floors and their layout metadata."""
    floors = db.query(Floor).order_by(Floor.floor_number).all()
    results = []
    for f in floors:
        loc_count = db.query(Location).filter(Location.floor_number == f.floor_number).count()
        results.append({
            "id": f.id,
            "floor_number": f.floor_number,
            "name": f.name,
            "short_code": f.short_code,
            "description": f.description,
            "viewbox_width": f.viewbox_width,
            "viewbox_height": f.viewbox_height,
            "location_count": loc_count
        })
    return results

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Retrieve all location categories and visual badges."""
    return db.query(Category).all()

@router.get("/locations")
def get_locations(
    floor: Optional[int] = None,
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    is_emergency: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Retrieve list of hospital locations with flexible filters."""
    query = db.query(Location)
    if floor is not None and isinstance(floor, int):
        query = query.filter(Location.floor_number == floor)
    if category_id and isinstance(category_id, str):
        query = query.filter(Location.category_id == category_id)
    if is_emergency is not None and isinstance(is_emergency, bool):
        query = query.filter(Location.is_emergency == is_emergency)
    if search and isinstance(search, str):
        search_filter = f"%{search}%"
        query = query.filter(
            (Location.name.ilike(search_filter)) |
            (Location.department.ilike(search_filter)) |
            (Location.room_number.ilike(search_filter)) |
            (Location.description.ilike(search_filter))
        )
    return query.all()


@router.get("/locations/{location_id}")
def get_location_detail(location_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a specific location including assigned doctors."""
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    
    docs = db.query(Doctor).filter(Doctor.room_id == location_id).all()
    return {
        "location": loc,
        "category": loc.category,
        "floor": loc.floor,
        "doctors": docs
    }

@router.get("/doctors")
def get_doctors(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve hospital doctors list and their assigned room IDs."""
    query = db.query(Doctor)
    if search and isinstance(search, str):
        f = f"%{search}%"
        query = query.filter(
            (Doctor.name.ilike(f)) |
            (Doctor.specialty.ilike(f)) |
            (Doctor.department.ilike(f))
        )
    return query.all()

@router.get("/graph")
def get_hospital_graph(
    floor: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Returns full hospital graph nodes and connection corridors for rendering
    interactive SVG maps.
    """
    loc_query = db.query(Location)
    if floor is not None and isinstance(floor, int):
        loc_query = loc_query.filter(Location.floor_number == floor)
    locations = loc_query.all()


    connections = db.query(Connection).all()

    return {
        "nodes": [
            {
                "id": loc.id,
                "name": loc.name,
                "short_code": loc.short_code,
                "floor": loc.floor_number,
                "x": loc.x,
                "y": loc.y,
                "category_id": loc.category_id,
                "department": loc.department,
                "room_number": loc.room_number,
                "is_accessible": loc.is_accessible,
                "is_emergency": loc.is_emergency,
                "is_checkpoint": loc.is_checkpoint,
                "description": loc.description
            }
            for loc in locations
        ],
        "edges": [
            {
                "id": conn.id,
                "source": conn.source_id,
                "target": conn.target_id,
                "distance": conn.distance_meters,
                "accessible": conn.is_accessible,
                "is_elevator": conn.is_elevator,
                "is_stairs": conn.is_stairs,
                "floor_transition": conn.floor_transition,
                "direction_hint": conn.direction_hint
            }
            for conn in connections
        ]
    }

@router.get("/facilities/summary")
def get_facilities_summary(db: Session = Depends(get_db)):
    """Returns overview statistics for the main hospital dashboard."""
    total_floors = db.query(Floor).count()
    total_locations = db.query(Location).count()
    total_departments = db.query(Location.department).distinct().count()
    total_doctors = db.query(Doctor).count()
    total_elevators = db.query(Location).filter(Location.category_id == "transit", Location.id.ilike("%lift%")).count()
    emergency_units = db.query(Location).filter(Location.is_emergency == True).count()
    
    return {
        "hospital_name": "St. Jude Metro Memorial Hospital",
        "hospital_tagline": "Smart Indoor Navigation & Patient Wayfinding System",
        "total_floors": total_floors,
        "total_locations": total_locations,
        "total_departments": total_departments,
        "total_doctors": total_doctors,
        "total_elevators": total_elevators,
        "emergency_units": emergency_units,
        "accessible_coverage_percent": 100,
        "active_campus": "Central Medical Tower"
    }
