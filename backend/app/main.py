app = FastAPI(
    title="Hospital Patient Navigation System API",
    version="2.0.0",
    lifespan=lifespan
)
from contextlib import asynccontextmanager
from datetime import datetime, time
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .database import Base, engine, get_db
from .models import Connection, Location, Doctor, DoctorSchedule
from .routing import make_graph, bfs, astar, ao_style

def seed(db: Session):
    # Add original demo locations only when the database is empty.
    if db.scalar(select(Location.id).limit(1)) is None:
        base = [
            (1,"Main Entrance",0,40,220,"entrance","QR-ENTRANCE"),
            (2,"Reception",0,150,220,"service","QR-RECEPTION"),
            (3,"Lift Ground",0,260,220,"lift","QR-LIFT-G"),
            (4,"Emergency",0,150,90,"emergency","QR-EMERGENCY"),
            (5,"Cafeteria",0,260,90,"facility","QR-CAFE"),
            (6,"Lift First",1,260,220,"lift","QR-LIFT-1"),
            (7,"Laboratory",1,150,220,"department","QR-LAB"),
            (8,"Pharmacy",1,150,90,"department","QR-PHARMACY"),
            (9,"Outpatient Department",1,40,90,"department","QR-OPD"),
        ]
        db.add_all([Location(id=i,name=n,floor=f,x=x,y=y,kind=k,qr_code=q) for i,n,f,x,y,k,q in base])
        db.flush()
        base_edges=[(1,2,10,1,"corridor"),(2,3,10,1,"corridor"),(2,4,12,1,"corridor"),
          (4,5,10,1,"corridor"),(3,5,12,0,"stairs"),(3,6,8,1,"lift"),(6,7,10,1,"corridor"),
          (7,8,10,1,"corridor"),(8,9,10,1,"corridor"),(6,8,18,1,"corridor"),(2,5,25,1,"corridor"),(3,4,20,1,"corridor")]
        db.add_all([Connection(from_id=a,to_id=b,distance=d,accessible=bool(ac),connection_type=t) for a,b,d,ac,t in base_edges])
        db.flush()

    # Extend existing databases without deleting or replacing user data.
    location_specs = [
      ("Cardiology Department",1,55,55,"department","QR-CARDIOLOGY"),
      ("Neurology Department",1,115,55,"department","QR-NEUROLOGY"),
      ("Gynecology Department",1,205,55,"department","QR-GYNECOLOGY"),
      ("Orthopedics Department",1,55,145,"department","QR-ORTHOPEDICS"),
      ("Pediatrics Department",1,115,145,"department","QR-PEDIATRICS"),
      ("General Medicine Department",1,205,145,"department","QR-GENERAL-MED"),
      ("Cabin C101 - Cardiology",1,55,25,"cabin","QR-C101"),
      ("Cabin N201 - Neurology",1,115,25,"cabin","QR-N201"),
      ("Cabin G102 - Gynecology",1,205,25,"cabin","QR-G102"),
      ("Cabin O103 - Orthopedics",1,55,175,"cabin","QR-O103"),
      ("Cabin P104 - Pediatrics",1,115,175,"cabin","QR-P104"),
      ("Cabin M105 - General Medicine",1,205,175,"cabin","QR-M105"),
      ("Radiology",1,40,255,"department","QR-RADIOLOGY"),
      ("Billing",0,90,255,"service","QR-BILLING"),
    ]
    for name,f,x,y,kind,qr in location_specs:
        if db.scalar(select(Location).where(Location.name==name)) is None:
            db.add(Location(name=name,floor=f,x=x,y=y,kind=kind,qr_code=qr))
    db.flush()
    # Connect each added node to the first-floor lift or reception corridor.
    anchor = db.scalar(select(Location).where(Location.name=="Lift First"))
    for loc in db.scalars(select(Location)).all():
        if loc.id == anchor.id: continue
        exists = db.scalar(select(Connection.id).where(
          ((Connection.from_id==loc.id)&(Connection.to_id==anchor.id)) |
          ((Connection.from_id==anchor.id)&(Connection.to_id==loc.id))).limit(1))
        if not exists and (loc.kind in ("department","cabin") or loc.name=="Billing"):
            db.add(Connection(from_id=anchor.id,to_id=loc.id,distance=12,accessible=True,connection_type="corridor"))
    db.flush()

    doctor_specs=[
      ("Dr. Ananya Rao","Cardiology","Cardiology Department","Cabin C101 - Cardiology", "09:00","13:00"),
      ("Dr. Rahul Varma","Neurology","Neurology Department","Cabin N201 - Neurology","10:00","16:00"),
      ("Dr. Meera Iyer","Gynecology","Gynecology Department","Cabin G102 - Gynecology","09:30","14:30"),
      ("Dr. Arjun Reddy","Orthopedics","Orthopedics Department","Cabin O103 - Orthopedics","11:00","17:00"),
      ("Dr. Kavya Nair","Pediatrics","Pediatrics Department","Cabin P104 - Pediatrics","09:00","15:00"),
      ("Dr. Vivek Shah","General Medicine","General Medicine Department","Cabin M105 - General Medicine","08:00","12:00"),
    ]
    for name,spec,dept,cabin,start,end in doctor_specs:
        doc=db.scalar(select(Doctor).where(Doctor.name==name))
        loc=db.scalar(select(Location).where(Location.name==cabin))
        if doc is None:
            doc=Doctor(name=name,specialization=spec,department=dept,location_id=loc.id)
            db.add(doc); db.flush()
        if db.scalar(select(DoctorSchedule.id).where(DoctorSchedule.doctor_id==doc.id).limit(1)) is None:
            for day in range(5):
                db.add(DoctorSchedule(doctor_id=doc.id,weekday=day,start_time=start,end_time=end,
                    break_start="12:00",break_end="13:00" if day<5 else None))
    db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db: seed(db)
    yield

app=FastAPI(title="Hospital Patient Navigation System API",version="2.0.0",lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=["http://localhost:5173","http://127.0.0.1:5173","hospital-navigation-system-5zai.vercel.app"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])

def location_json(loc):
    return {"id":loc.id,"name":loc.name,"floor":loc.floor,"x":loc.x,"y":loc.y,"kind":loc.kind,"qr_code":loc.qr_code}
def doctor_json(doc,db):
    loc=db.get(Location,doc.location_id)
    schedules=db.scalars(select(DoctorSchedule).where(DoctorSchedule.doctor_id==doc.id).order_by(DoctorSchedule.weekday)).all()
    now=datetime.now()
    today=[s for s in schedules if s.weekday==now.weekday()]
    current=now.strftime("%H:%M")
    available=any(s.start_time<=current<s.end_time and not (s.break_start and s.break_end and s.break_start<=current<s.break_end) for s in today)
    next_slot=next((s.start_time for s in today if s.start_time>current),None)
    return {"id":doc.id,"name":doc.name,"specialization":doc.specialization,"department":doc.department,
      "location_id":doc.location_id,"cabin":loc.name if loc else "Not assigned","floor":loc.floor if loc else None,
      "available_now":available,"availability_label":"Available now" if available else ("Next today: "+next_slot if next_slot else "Not available now"),
      "schedules":[{"weekday":s.weekday,"day":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][s.weekday],
      "start":s.start_time,"end":s.end_time,"break_start":s.break_start,"break_end":s.break_end} for s in schedules]}

@app.get("/")
def root(): return {"message":"Hospital Patient Navigation API is running","version":"2.0.0","docs":"/docs"}
@app.get("/api/locations")
def get_locations(db:Session=Depends(get_db)):
    return [location_json(x) for x in db.scalars(select(Location).order_by(Location.floor,Location.id)).all()]
@app.get("/api/departments")
def departments(db:Session=Depends(get_db)):
    rows=db.scalars(select(Location).where(Location.kind=="department").order_by(Location.name)).all()
    return [location_json(x) for x in rows]
@app.get("/api/doctors")
def get_doctors(search:str="",db:Session=Depends(get_db)):
    docs=db.scalars(select(Doctor).order_by(Doctor.specialization,Doctor.name)).all()
    if search:
        q=search.lower()
        docs=[d for d in docs if q in d.name.lower() or q in d.specialization.lower() or q in d.department.lower()]
    return [doctor_json(d,db) for d in docs]
@app.get("/api/qr/{code}")
def get_qr_location(code:str,db:Session=Depends(get_db)):
    loc=db.scalar(select(Location).where(Location.qr_code==code))
    if not loc: raise HTTPException(404,"QR code is not registered in this demo.")
    return location_json(loc)
@app.get("/api/route")
def get_route(start:int,goal:int,algorithm:str="astar",accessible:bool=False,db:Session=Depends(get_db)):
    locations=db.scalars(select(Location)).all(); edges=db.scalars(select(Connection)).all(); by_id={x.id:x for x in locations}
    if start not in by_id or goal not in by_id: raise HTTPException(404,"Start or destination not found.")
    graph,coords=make_graph(locations,edges,accessible_only=accessible)
    if algorithm=="bfs": path,cost=bfs(graph,start,goal); alternatives=[]
    elif algorithm=="astar": path,cost=astar(graph,start,goal,coords); alternatives=[]
    elif algorithm=="ao": path,cost,alternatives=ao_style(graph,start,goal)
    else: raise HTTPException(400,"algorithm must be bfs, astar, or ao")
    if not path: raise HTTPException(404,"No route found with selected options.")
    return {"algorithm":algorithm,"path":[location_json(by_id[n]) for n in path],"distance":round(cost,1),
      "alternatives":[{"path":[location_json(by_id[n]) for n in a["path"]],"cost":a["cost"]} for a in alternatives]}
@app.get("/api/recommend")
def recommend_destination(need:str,db:Session=Depends(get_db)):
    text=need.lower().strip()
    rules=[
      (("emergency","chest pain","breathing","accident","severe bleeding"),"Emergency","Emergency-related words detected. Contact hospital staff immediately."),
      (("heart","cardio"),"Cardiology Department","Heart-specialist request matched Cardiology."),
      (("brain","nerve","neuro"),"Neurology Department","Neurology-related request matched Neurology."),
      (("pregnan","women","gyne"),"Gynecology Department","Gynecology-related request matched this department."),
      (("bone","joint","ortho"),"Orthopedics Department","Orthopedics-related request matched this department."),
      (("child","baby","pediatric"),"Pediatrics Department","Child-specialist request matched Pediatrics."),
      (("blood test","sample","test","laboratory","lab"),"Laboratory","Test or sample request matched Laboratory."),
      (("medicine","medication","tablet","prescription","pharmacy"),"Pharmacy","Medicine request matched Pharmacy."),
      (("doctor","consultation","checkup","specialist","appointment"),"Outpatient Department","Consultation request matched Outpatient Department.")]
    target="Reception"; explanation="No rule matched; Reception is the default help point."
    for words,dest,why in rules:
        if any(w in text for w in words): target,explanation=dest,why; break
    loc=db.scalar(select(Location).where(Location.name==target))
    if not loc: loc=db.scalar(select(Location).where(Location.name=="Reception"))
    matching=db.scalars(select(Doctor)).all()
    if target not in ("Outpatient Department","Reception","Emergency","Laboratory","Pharmacy"):
        matching=[d for d in matching if d.specialization.lower() in target.lower()]
    else: matching=[]
    return {"destination":location_json(loc),"explanation":explanation,"doctors":[doctor_json(d,db) for d in matching],
      "notice":"Demonstration rules only; not diagnosis or triage. For urgent symptoms, seek emergency staff immediately."}
class AppointmentRequest(BaseModel):
    doctor_id:int
    patient_name:str
    preferred_date:str
    preferred_time:str
@app.post("/api/appointments")
def book_demo_appointment(payload:AppointmentRequest,db:Session=Depends(get_db)):
    doc=db.get(Doctor,payload.doctor_id)
    if not doc: raise HTTPException(404,"Doctor not found.")
    # Demo request only: does not reserve a real clinical slot.
    return {"status":"demo_request_received","message":f"Demo appointment request recorded for {doc.name}. No real appointment has been booked.","doctor":doc.name,"patient_name":payload.patient_name,"date":payload.preferred_date,"time":payload.preferred_time}
@app.get("/api/analytics")
def analytics(db:Session=Depends(get_db)):
    locs=db.scalars(select(Location)).all(); docs=db.scalars(select(Doctor)).all(); edges=db.scalars(select(Connection)).all()
    return {"locations":len(locs),"departments":sum(x.kind=="department" for x in locs),"cabins":sum(x.kind=="cabin" for x in locs),
      "doctors":len(docs),"connections":len(edges),"floors":len(set(x.floor for x in locs))}
