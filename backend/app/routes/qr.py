import io
import qrcode
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import QRCodeCheckpoint, Location

router = APIRouter(prefix="/api/qr", tags=["QR Indoor Positioning"])

@router.get("/checkpoints")
def list_qr_checkpoints(db: Session = Depends(get_db)):
    """List all registered physical QR code checkpoints in the hospital."""
    checkpoints = db.query(QRCodeCheckpoint).all()
    results = []
    for cp in checkpoints:
        loc = cp.location
        results.append({
            "code": cp.code,
            "label": cp.label,
            "instruction_tip": cp.instruction_tip,
            "location_id": cp.location_id,
            "location_name": loc.name if loc else "Unknown",
            "floor": loc.floor_number if loc else 0,
            "department": loc.department if loc else "",
            "coordinates": {"x": loc.x, "y": loc.y} if loc else {"x": 0, "y": 0}
        })
    return results

@router.get("/scan/{code}")
def scan_qr_code(code: str, db: Session = Depends(get_db)):
    """
    Simulates or processes scanning a physical QR code.
    Identifies the exact hospital location, floor, and provides nearby quick navigation targets.
    """
    # Lookup by exact code or location ID
    cp = db.query(QRCodeCheckpoint).filter(
        (QRCodeCheckpoint.code == code) | (QRCodeCheckpoint.location_id == code)
    ).first()

    if not cp:
        # Check if direct location exists with this ID
        loc = db.query(Location).filter(Location.id == code).first()
        if not loc:
            raise HTTPException(status_code=404, detail=f"Invalid QR Code '{code}'. No matching hospital location found.")
        label = f"{loc.name} Point"
        instruction = "You are at this location."
    else:
        loc = cp.location
        label = cp.label
        instruction = cp.instruction_tip

    # Suggest nearby facilities on the same floor
    nearby = db.query(Location).filter(
        Location.floor_number == loc.floor_number,
        Location.id != loc.id
    ).limit(4).all()

    return {
        "success": True,
        "scanned_code": code,
        "checkpoint_label": label,
        "instruction_tip": instruction,
        "current_location": {
            "id": loc.id,
            "name": loc.name,
            "short_code": loc.short_code,
            "floor": loc.floor_number,
            "x": loc.x,
            "y": loc.y,
            "department": loc.department,
            "category": loc.category_id,
            "room_number": loc.room_number,
            "is_emergency": loc.is_emergency
        },
        "suggested_destinations": [
            {
                "id": n.id,
                "name": n.name,
                "department": n.department,
                "category": n.category_id
            }
            for n in nearby
        ]
    }

@router.get("/image/{code}")
def get_qr_image(code: str):
    """
    Dynamically generates a printable high-res QR code PNG image
    containing the checkpoint URL/code.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(f"HPNS-CHECKPOINT:{code}")
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0f2b48", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return Response(content=buf.getvalue(), media_type="image/png")

