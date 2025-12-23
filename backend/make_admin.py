
import sys
from app.database import engine
from sqlalchemy import text

def make_admin(username):
    with engine.begin() as conn:
        # 1. Get User ID
        user = conn.execute(
            text("SELECT id FROM users WHERE username = :username"),
            {"username": username}
        ).fetchone()
        
        if not user:
            print(f"Error: User '{username}' not found.")
            return

        user_id = user[0]

        # 2. Get Admin Role ID
        role = conn.execute(
            text("SELECT id FROM roles WHERE role_name = 'admin'")
        ).fetchone()
        
        if not role:
            print("Error: 'admin' role not found. Have you seeded the database?")
            return
            
        role_id = role[0]

        # 3. Check if already admin
        exists = conn.execute(
            text("SELECT 1 FROM user_roles WHERE user_id = :u_id AND role_id = :r_id"),
            {"u_id": user_id, "r_id": role_id}
        ).fetchone()

        if exists:
            print(f"User '{username}' is already an admin.")
            return

        # 4. Assign Role
        conn.execute(
            text("INSERT INTO user_roles (user_id, role_id) VALUES (:u_id, :r_id)"),
            {"u_id": user_id, "r_id": role_id}
        )
        print(f"Success: User '{username}' has been promoted to admin.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <username>")
    else:
        make_admin(sys.argv[1])
