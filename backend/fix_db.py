from app.database import engine, Base
from app import models
from sqlalchemy import text

def reset_db():
    print("Dropping all tables...")
    # Dropping tables reflects the current models, or we can use raw SQL to be sure.
    # Base.metadata.drop_all(bind=engine) 
    # But drop_all only drops tables it knows about in Base. 
    # If there are other tables or strict fks, it might be tricky.
    # For now, let's just drop the 'users' table specifically since that's where the error is.
    
    with engine.connect() as connection:
        try:
            connection.execute(text("DROP TABLE IF EXISTS users CASCADE"))
            print("Dropped users table.")
            connection.commit()
        except Exception as e:
            print(f"Error dropping table: {e}")

    print("Recreating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables recreated.")

if __name__ == "__main__":
    reset_db()
