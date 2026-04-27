import database
from datetime import datetime, timedelta
import random

def seed_campus_data():
    db = database.SessionLocal()
    try:
        # Clear existing records for a clean demo if needed
        # db.query(database.EmissionRecord).delete()
        
        # TCET Realistic Data Points (Monthly/Weekly estimates)
        # Factors: Elec (0.82), Transport (0.21), Waste (0.5)
        
        start_date = datetime.now() - timedelta(days=30)
        
        sample_data = [
            {"elec": 4500, "trans": 1200, "waste": 450}, # Month 1 - Week 1
            {"elec": 4200, "trans": 1150, "waste": 420}, # Week 2
            {"elec": 4800, "trans": 1300, "waste": 500}, # Week 3
            {"elec": 4600, "trans": 1250, "waste": 480}, # Week 4
            {"elec": 5100, "trans": 1400, "waste": 550}, # Peak Event
            {"elec": 3800, "trans": 900,  "waste": 300}, # Holiday Week
            {"elec": 4400, "trans": 1100, "waste": 410}, 
            {"elec": 4700, "trans": 1280, "waste": 490},
            {"elec": 4900, "trans": 1350, "waste": 520},
            {"elec": 4550, "trans": 1220, "waste": 460},
        ]

        for i, entry in enumerate(sample_data):
            # Spread dates over the last month
            record_date = start_date + timedelta(days=i*3)
            
            total_co2 = (entry["elec"] * 0.82) + (entry["trans"] * 0.21) + (entry["waste"] * 0.5)
            
            record = database.EmissionRecord(
                date=record_date,
                electricity=entry["elec"],
                transport=entry["trans"],
                waste=entry["waste"],
                total_co2=round(total_co2, 2)
            )
            db.add(record)
        
        db.commit()
        print(f"✅ Successfully seeded {len(sample_data)} TCET campus records!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_campus_data()
