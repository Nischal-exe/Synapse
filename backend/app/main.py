from fastapi import FastAPI
from .database import engine, Base
from .routers import auth, rooms, users, posts, likes, comments, moderator # , activity
from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError

# Create database tables
Base.metadata.create_all(bind=engine)

# Manual Migration Check (Temporary for Supabase support)
def run_migrations():
    with engine.connect() as connection:
        try:
            # Check if column exists
            connection.execute(text("SELECT supabase_id FROM users LIMIT 1"))
        except ProgrammingError:
            print("Migrating DB: Adding supabase_id column to users table...")
            with engine.begin() as migration_txn:
                 migration_txn.execute(text("ALTER TABLE users ADD COLUMN supabase_id VARCHAR(255) UNIQUE;"))
                 migration_txn.execute(text("CREATE INDEX ix_users_supabase_id ON users (supabase_id);"))
                 migration_txn.execute(text("ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;"))
            print("Migration complete.")

        try:
            connection.execute(text("SELECT date_of_birth FROM users LIMIT 1"))
        except ProgrammingError:
            print("Migrating DB: Adding date_of_birth column to users table...")
            with engine.begin() as migration_txn:
                 migration_txn.execute(text("ALTER TABLE users ADD COLUMN date_of_birth VARCHAR;"))
            print("date_of_birth Migration complete.")

        try:
            connection.execute(text("SELECT attachment_url FROM posts LIMIT 1"))
        except ProgrammingError:
            print("Migrating DB: Adding attachment_url column to posts table...")
            with engine.begin() as migration_txn:
                 migration_txn.execute(text("ALTER TABLE posts ADD COLUMN attachment_url VARCHAR;"))
            print("attachment_url Migration complete.")
            
    # Seed Roles and Permissions (Idempotent Check)
    try:
        print("Verifying roles and permissions...")
        with engine.begin() as seed_txn:
             # 1. Roles
            seed_txn.execute(text("INSERT INTO roles (role_name) VALUES ('admin'), ('normal_user') ON CONFLICT (role_name) DO NOTHING"))
            
            # 2. Permissions
            permissions_list = [
                ('create_post', 'Can create new posts'),
                ('like_post', 'Can like and unlike posts'),
                ('chat', 'Can send messages in chat rooms'),
                ('create_comment', 'Can reply to questions/posts'),
                ('delete_any_post', 'Admin: Can delete any post'),
                ('delete_any_comment', 'Admin: Can delete any comment'),
                ('delete_any_message', 'Admin: Can delete any chat message'),
                ('manage_rooms', 'Admin: Can create/edit/delete rooms'),
                ('manage_users', 'Admin: Can manage user accounts')
            ]
            for name, desc in permissions_list:
                seed_txn.execute(
                    text("INSERT INTO permissions (permission_name, description) VALUES (:name, :desc) ON CONFLICT (permission_name) DO NOTHING"),
                    {"name": name, "desc": desc}
                )
            
            # 3. Get IDs
            roles = seed_txn.execute(text("SELECT id, role_name FROM roles")).fetchall()
            perms = seed_txn.execute(text("SELECT id, permission_name FROM permissions")).fetchall()
            
            role_ids = {r[1]: r[0] for r in roles}
            perm_ids = {p[1]: p[0] for p in perms}
            
            # 4. Assign Permissions (Idempotent)
            def assign_perm(r_name, p_name):
                r_id = role_ids.get(r_name)
                p_id = perm_ids.get(p_name)
                if r_id and p_id:
                     seed_txn.execute(
                        text("INSERT INTO role_permissions (role_id, permission_id) SELECT :r_id, :p_id WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = :r_id AND permission_id = :p_id)"),
                        {"r_id": r_id, "p_id": p_id}
                    )

            # Admin gets ALL
            for p_name in perm_ids.keys():
                assign_perm('admin', p_name)
            
            # Normal User gets specific set
            user_perms = ['create_post', 'like_post', 'chat', 'create_comment']
            for p_name in user_perms:
                 assign_perm('normal_user', p_name)

        print("Roles and permissions verification complete.")
    except Exception as e:
        print(f"Error seeding roles/permissions: {e}")

    # Seed Rooms if empty
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT count(*) FROM rooms"))
            count = result.scalar()
            
        if count == 0:
            print("Seeding default rooms...")
            default_rooms = [
                ("JEE Mains", "Dedicated to JEE Mains preparation and discussion."),
                ("JEE Advance", "Advanced topics and problem solving for JEE Advance."),
                ("CAT", "Crack the CAT with peer support and resources."),
                ("NIMCET", "NIMCET exam preparation community."),
                ("Programming", "Discuss coding, algorithms, and development."),
                ("10th", "Study group for 10th grade students."),
                ("12th", "Study group for 12th grade students.")
            ]
            with engine.begin() as seed_txn:
                for name, desc in default_rooms:
                    seed_txn.execute(
                        text("INSERT INTO rooms (name, description) VALUES (:name, :desc)"),
                        {"name": name, "desc": desc}
                    )
            print("Rooms seeded successfully.")
    except Exception as e:
        print(f"Error seeding rooms: {e}")

run_migrations()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Synapse API")

import os
from dotenv import load_dotenv

load_dotenv()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://synapsepro.online",
    "https://www.synapsepro.online",
    "https://synapsepro.online/",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    for url in frontend_url.split(","):
        clean_url = url.strip().rstrip("/")
        if clean_url:
            origins.append(clean_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(posts.router)
app.include_router(users.router)
app.include_router(likes.router)
app.include_router(comments.router)
app.include_router(moderator.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Synapse API"}
