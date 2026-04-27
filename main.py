from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
import database
import pydantic
from datetime import datetime

app = FastAPI(title="TCET Campus Carbon Pulse API")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API validation
class EmissionCreate(pydantic.BaseModel):
    dept_electricity: float
    student_commute: float
    canteen_waste: float

class EmissionResponse(pydantic.BaseModel):
    id: int
    date: datetime
    electricity: float
    transport: float
    waste: float
    total_co2: float

    class Config:
        from_attributes = True

class UserCreate(pydantic.BaseModel):
    username: str
    password: str

class UserLogin(pydantic.BaseModel):
    username: str
    password: str

# Auth Endpoints
@app.post("/api/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(database.User).filter(database.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    new_user = database.User(username=user.username, password=user.password)
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

@app.post("/api/login")
def login(user: UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(database.User).filter(database.User.username == user.username, database.User.password == user.password).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "username": db_user.username}

# Campus Emission Logic
def calculate_co2(electricity: float, transport: float, waste: float) -> float:
    # Standard factors: Electricity (0.82 kg/kWh), Transport (0.21 kg/km), Waste (0.5 kg/kg)
    return (electricity * 0.82) + (transport * 0.21) + (waste * 0.5)

@app.post("/api/emissions", response_model=EmissionResponse)
def create_emission(record: EmissionCreate, db: Session = Depends(database.get_db)):
    try:
        total = calculate_co2(record.dept_electricity, record.student_commute, record.canteen_waste)
        db_record = database.EmissionRecord(
            electricity=record.dept_electricity,
            transport=record.student_commute,
            waste=record.canteen_waste,
            total_co2=round(total, 2)
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        return db_record
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/emissions", response_model=List[EmissionResponse])
def get_emissions(db: Session = Depends(database.get_db)):
    return db.query(database.EmissionRecord).order_by(database.EmissionRecord.date.asc()).all()

@app.delete("/api/emissions/{record_id}")
def delete_emission(record_id: int, db: Session = Depends(database.get_db)):
    record = db.query(database.EmissionRecord).filter(database.EmissionRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"message": "Record deleted successfully"}

@app.get("/api/stats")
def get_stats(db: Session = Depends(database.get_db)):
    records = db.query(database.EmissionRecord).all()
    if not records:
        return {"total_co2": 0, "avg_co2": 0, "count": 0}
    
    total = sum(r.total_co2 for r in records)
    return {
        "total_co2": round(total, 2),
        "avg_co2": round(total / len(records), 2),
        "count": len(records)
    }

# Serve static files (The Dashboard)
app.mount("/", StaticFiles(directory="static", html=True), name="static")

@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    try:
        # Check if database is empty
        if db.query(database.EmissionRecord).count() == 0:
            print("🌱 Database is empty. Seeding realistic TCET campus data...")
            import seed_data
            seed_data.seed_campus_data()
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    print("🚀 TCET Campus Carbon Pulse is starting...")
    uvicorn.run(app, host="0.0.0.0", port=8000)