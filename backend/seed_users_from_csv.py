
import csv
import os
from sqlalchemy import text
from app.database import engine
from dotenv import load_dotenv

load_dotenv()

def seed_users():
    csv_file_path = 'users.csv'
    
    if not os.path.exists(csv_file_path):
        print(f"Error: {csv_file_path} not found.")
        return

    with engine.begin() as conn:
        # Get normal_user role ID
        role_res = conn.execute(text("SELECT id FROM roles WHERE role_name = 'normal_user'")).fetchone()
        if not role_res:
            print("Error: 'normal_user' role not found. Please ensure roles are seeded first.")
            return
        normal_role_id = role_res[0]

        with open(csv_file_path, mode='r', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Check if user already exists by email or username
                existing = conn.execute(
                    text("SELECT id FROM users WHERE email = :email OR username = :username"),
                    {"email": row['email'], "username": row['username']}
                ).fetchone()

                if existing:
                    print(f"User {row['username']} ({row['email']}) already exists. Skipping.")
                    user_id = existing[0]
                else:
                    # Insert new user
                    # We'll let the database handle the ID generation to avoid conflicts with existing sequences
                    try:
                        res = conn.execute(
                            text("""
                                INSERT INTO users (username, email, full_name, date_of_birth, hashed_password, is_verified, supabase_id)
                                VALUES (:username, :email, :full_name, :date_of_birth, :hashed_password, :is_verified, :supabase_id)
                                RETURNING id
                            """),
                            {
                                "username": row['username'],
                                "email": row['email'],
                                "full_name": row['full_name'],
                                "date_of_birth": row['date_of_birth'],
                                "hashed_password": row['hashed_password'],
                                "is_verified": row['is_verified'].lower() == 'true',
                                "supabase_id": row['supabase_id']
                            }
                        )
                        user_id = res.fetchone()[0]
                        print(f"Created user: {row['username']}")
                    except Exception as e:
                        print(f"Error creating user {row['username']}: {e}")
                        continue

                # Ensure user has the normal_user role
                role_exists = conn.execute(
                    text("SELECT 1 FROM user_roles WHERE user_id = :u_id AND role_id = :r_id"),
                    {"u_id": user_id, "r_id": normal_role_id}
                ).fetchone()

                if not role_exists:
                    conn.execute(
                        text("INSERT INTO user_roles (user_id, role_id) VALUES (:u_id, :r_id)"),
                        {"u_id": user_id, "r_id": normal_role_id}
                    )
                    print(f"Assigned 'normal_user' role to {row['username']}")

    print("Seeding completed.")

if __name__ == "__main__":
    seed_users()
