from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

class Location(Base):
    __tablename__ = "locations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    floor: Mapped[int] = mapped_column(Integer, nullable=False)
    x: Mapped[float] = mapped_column(Float, nullable=False)
    y: Mapped[float] = mapped_column(Float, nullable=False)
    kind: Mapped[str] = mapped_column(String(40), default="facility")
    qr_code: Mapped[str | None] = mapped_column(String(80), unique=True, nullable=True)

class Connection(Base):
    __tablename__ = "connections"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    from_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=False)
    to_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=False)
    distance: Mapped[float] = mapped_column(Float, nullable=False)
    accessible: Mapped[bool] = mapped_column(Boolean, default=True)
    connection_type: Mapped[str] = mapped_column(String(30), default="corridor")

class Doctor(Base):
    __tablename__ = "doctors"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    specialization: Mapped[str] = mapped_column(String(100), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=False)

class DoctorSchedule(Base):
    __tablename__ = "doctor_schedules"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"), nullable=False)
    weekday: Mapped[int] = mapped_column(Integer, nullable=False) # Monday=0
    start_time: Mapped[str] = mapped_column(String(5), nullable=False)
    end_time: Mapped[str] = mapped_column(String(5), nullable=False)
    break_start: Mapped[str | None] = mapped_column(String(5), nullable=True)
    break_end: Mapped[str | None] = mapped_column(String(5), nullable=True)
