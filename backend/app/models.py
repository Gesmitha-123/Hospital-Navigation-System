from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class Floor(Base):
    __tablename__ = "floors"

    id = Column(Integer, primary_key=True, index=True)
    floor_number = Column(Integer, unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    short_code = Column(String(20), nullable=False)
    description = Column(Text, nullable=True)
    viewbox_width = Column(Integer, default=1200)
    viewbox_height = Column(Integer, default=800)

    locations = relationship("Location", back_populates="floor", cascade="all, delete-orphan")

class Category(Base):
    __tablename__ = "categories"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(50), nullable=False)
    color_hex = Column(String(20), nullable=False)
    badge_label = Column(String(50), nullable=True)

    locations = relationship("Location", back_populates="category")

class Location(Base):
    __tablename__ = "locations"

    id = Column(String(50), primary_key=True)
    name = Column(String(150), nullable=False, index=True)
    short_code = Column(String(30), nullable=True)
    floor_number = Column(Integer, ForeignKey("floors.floor_number", ondelete="CASCADE"), nullable=False, index=True)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    category_id = Column(String(50), ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    department = Column(String(100), nullable=True, index=True)
    room_number = Column(String(30), nullable=True)
    description = Column(Text, nullable=True)
    is_accessible = Column(Boolean, default=True)
    is_emergency = Column(Boolean, default=False, index=True)
    is_checkpoint = Column(Boolean, default=False)
    waiting_time_mins = Column(Integer, default=5)
    operating_hours = Column(String(100), default="24/7")

    floor = relationship("Floor", back_populates="locations")
    category = relationship("Category", back_populates="locations")
    doctors = relationship("Doctor", back_populates="room")
    qr_checkpoint = relationship("QRCodeCheckpoint", back_populates="location", uselist=False, cascade="all, delete-orphan")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    specialty = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    room_id = Column(String(50), ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    qualification = Column(String(100), nullable=True)
    schedule = Column(String(100), default="Mon-Fri 09:00 - 16:00")
    available = Column(Boolean, default=True)

    room = relationship("Location", back_populates="doctors")

class Connection(Base):
    __tablename__ = "connections"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(String(50), ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True)
    target_id = Column(String(50), ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True)
    distance_meters = Column(Float, nullable=False)
    is_accessible = Column(Boolean, default=True)
    is_elevator = Column(Boolean, default=False)
    is_stairs = Column(Boolean, default=False)
    floor_transition = Column(Boolean, default=False)
    direction_hint = Column(String(50), default="straight")
    bidirectional = Column(Boolean, default=True)

class QRCodeCheckpoint(Base):
    __tablename__ = "qr_checkpoints"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), unique=True, nullable=False, index=True)
    location_id = Column(String(50), ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    label = Column(String(120), nullable=False)
    instruction_tip = Column(Text, nullable=True)

    location = relationship("Location", back_populates="qr_checkpoint")

