from app.database import SessionLocal, engine
from app import crud, schemas, models
from sqlalchemy.orm import Session
import sys

def test_create_user():
    db = SessionLocal()
    try:
        # Check if user already exists to avoid unique constraint error
        user = crud.get_user(db, "testuser_logic")
        if user:
            print("User already exists, deleting...")
            db.delete(user)
            db.commit()
            
        new_user = schemas.UserCreate(
            username="testuser_logic",
            email="logic@example.com",
            full_name="Logic Tester",
            date_of_birth="1990-01-01",
            password="password123"
        )
        print("Creating user...")
        created_user = crud.create_user(db, new_user)
        print(f"User created successfully: {created_user.id} - {created_user.username}")
    except Exception as e:
        print(f"Error creating user: {e}")
        import traceback
        with open("error.log", "w") as f:
            f.write(str(e))
            f.write("\n")
            traceback.print_exc(file=f)
        print("Detailed error written to error.log")
    finally:
        db.close()

if __name__ == "__main__":
    test_create_user()
