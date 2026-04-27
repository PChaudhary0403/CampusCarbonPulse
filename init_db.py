import database
from sqlalchemy.orm import Session

# This will create tables if they don't exist
database.Base.metadata.create_all(bind=database.engine)

db = database.SessionLocal()
try:
    # Check if admin exists
    admin = db.query(database.User).filter(database.User.username == "admin").first()
    if not admin:
        new_user = database.User(username="admin", password="password123")
        db.add(new_user)
        db.commit()
        print("Default user 'admin' with password 'password123' created.")
    else:
        print("User 'admin' already exists.")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
